import { useState, useEffect, useRef } from 'react';
import { useMutatoinState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateLocation } = useMutatoinState(api.locations.updateLocation);
  const errorShownRef = useRef(false);

  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        if (!errorShownRef.current) {
          toast.error("Geolocation is not supported by this browser");
          errorShownRef.current = true;
        }
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Only update if coordinates have changed significantly
          if (!userLocation || 
              Math.abs(userLocation.lat - userCoords.lat) > 0.0001 || 
              Math.abs(userLocation.lng - userCoords.lng) > 0.0001) {
            updateLocation({ coordinates: userCoords })
              .then(() => {
                setUserLocation(userCoords);
                setError(null);
                errorShownRef.current = false;
              })
              .catch((error) => {
                if (!errorShownRef.current) {
                  toast.error("Failed to update location");
                  errorShownRef.current = true;
                }
              });
          }
        },
        (error) => {
          const errorMessage = error.code === error.PERMISSION_DENIED 
            ? "Please enable location access in your browser settings"
            : "Failed to get your location";
          
          if (!errorShownRef.current) {
            toast.error(errorMessage);
            errorShownRef.current = true;
          }
          setError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    };

    getUserLocation();
    const intervalId = setInterval(getUserLocation, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [updateLocation, userLocation]);

  return userLocation;
};