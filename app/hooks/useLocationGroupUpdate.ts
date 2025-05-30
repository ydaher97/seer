import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutatoinState } from "@/hooks/useMutationState";
import { Loader } from "@googlemaps/js-api-loader";

type Location = {
  _id: Id<"locations">;
  _creationTime: number;
  radius?: number;
  name: string;
  coordinates: { lat: number; lng: number };
  border: { lat: number; lng: number }[];
};

export const useLocationGroupUpdate = (
  locations: Location[] | undefined,
  userLocation: { lat: number; lng: number } | null
) => {
  const [containingLocationId, setContainingLocationId] = useState<Id<"locations"> | null>(null);
  const { mutate: updateconvesationMember, pending } = useMutatoinState(api.locations.updateConversationMembers);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Get conversation for the containing location
  const conversation = useQuery(
    api.locations.getConversationByLocationId,
    containingLocationId ? { locationId: containingLocationId } : "skip"
  );

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY!,
          version: "weekly",
          libraries: ["geometry"],
        });
        await loader.load();
        setIsGoogleMapsLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    };

    loadGoogleMaps();
  }, []);

  // Check user location against all locations
  useEffect(() => {
    if (!userLocation || !locations || !isGoogleMapsLoaded) return;

    const userLocationPoint = new google.maps.LatLng(userLocation.lat, userLocation.lng);
    const containingLocation = locations.find(location => {
      const polygon = new google.maps.Polygon({
        paths: location.border.map(coord => new google.maps.LatLng(coord.lat, coord.lng))
      });
      return google.maps.geometry.poly.containsLocation(userLocationPoint, polygon);
    });

    if (containingLocation) {
      setContainingLocationId(containingLocation._id);
    }
  }, [userLocation, locations, isGoogleMapsLoaded]);

  // Handle conversation update
  useEffect(() => {
    if (conversation && containingLocationId) {
      updateconvesationMember({ 
        conversationId: conversation._id, 
        locationId: containingLocationId 
      });
    }
  }, [conversation, containingLocationId, updateconvesationMember]);

  return { pending };
};
