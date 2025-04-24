"use client";
import { Card } from "@/components/ui/card";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import GoogleMap from "./GoogleMap";
import { Loader } from "lucide-react";
import { useLocationGroupUpdate } from "../../../hooks/useLocationGroupUpdate";
import { useRouter } from "next/navigation";

const Map = () => {
  const locationsQuery = useQuery(api.locations.getLocations) || [];
  const userLocation = useUserLocation();
  const { pending } = useLocationGroupUpdate(locationsQuery, { lat: 32.794, lng: 35.5312});
  const router  = useRouter()
  if (pending) {
    return <div className="flex items-center justify-center h-full w-full">
      <Loader className="animate-spin" />
    </div>;
  }

  if (!locationsQuery) {
    return 'failed to load locations';
  }

  return (
    <Card className="flex flex-col lg:flex-row h-full w-full p-2 items-center justify-center bg-secondary text-secondary-foreground">
      <GoogleMap
        locations={locationsQuery}
        userLocation={userLocation}
        onMarkerClick={() => {router.push(`/conversations`);}}
      />
    </Card>
  );
};

export default Map;