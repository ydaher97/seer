import { useState, useEffect } from 'react';
import { useMutatoinState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { mutate: updateLocation } = useMutatoinState(api.locations.updateLocation);

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userCoords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            if (userLocation?.lat !== userCoords.lat || userLocation?.lng !== userCoords.lng) {
              updateLocation({ coordinates: userCoords })
                .then(() => setUserLocation(userCoords))
                .catch((error) => {
                  toast.error(error);
                });
            }
          },
          (error) => {
            console.error("Error getting user's location:", error);
            toast.error("Failed to get user location");
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        toast.error("Geolocation is not supported by this browser");
      }
    };

    getUserLocation();
    const intervalId = setInterval(getUserLocation, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [updateLocation, userLocation?.lat, userLocation?.lng]);

  return userLocation;
};