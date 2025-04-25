import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutatoinState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const LOCATION_UPDATE_INTERVAL = 60000; // 1 min
const TOAST_COOLDOWN = 30000; // 30 sec

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateLocation, pending } = useMutatoinState(api.locations.updateLocation);

  const lastUpdateTimeRef = useRef<number>(0);
  const lastErrorToastRef = useRef<number>(0);
  const lastSuccessToastRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  // Function to handle position updates
  const handlePositionUpdate = useCallback(async (position: GeolocationPosition) => {
    const now = Date.now();
    const coords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    const hasMoved =
      !userLocation ||
      Math.abs(userLocation.lat - coords.lat) > 0.0001 ||
      Math.abs(userLocation.lng - coords.lng) > 0.0001;

    // Only update if significant movement or first update
    if (hasMoved && now - lastUpdateTimeRef.current > LOCATION_UPDATE_INTERVAL) {
      try {
        await updateLocation({ coordinates: coords });
        setUserLocation(coords);
        setError(null);
        lastUpdateTimeRef.current = now;

        if (now - lastSuccessToastRef.current > TOAST_COOLDOWN) {
          toast.success("Location updated");
          lastSuccessToastRef.current = now;
        }
      } catch (err) {
        if (now - lastErrorToastRef.current > TOAST_COOLDOWN) {
          toast.error("Failed to update location");
          lastErrorToastRef.current = now;
        }
      }
    } else if (!userLocation) {
      // Just update local state without API call if it's the first update
      setUserLocation(coords);
    }
  }, [updateLocation, userLocation]);

  // Handle geolocation errors
  const handleError = useCallback((error: GeolocationPositionError) => {
    const now = Date.now();
    const errorMessage =
      error.code === error.PERMISSION_DENIED
        ? "Please enable location access in your browser settings"
        : "Failed to get your location";

    setError(errorMessage);

    if (now - lastErrorToastRef.current > TOAST_COOLDOWN) {
      toast.error(errorMessage);
      lastErrorToastRef.current = now;
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      const now = Date.now();
      if (now - lastErrorToastRef.current > TOAST_COOLDOWN) {
        toast.error("Geolocation is not supported by this browser");
        lastErrorToastRef.current = now;
      }
      return;
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    // Set up watchPosition for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [handlePositionUpdate, handleError]);

  return userLocation;
};