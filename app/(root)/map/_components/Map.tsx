"use client";
import { Card } from "@/components/ui/card";
import React, { useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import GroupConversation from "../../conversations/_components/GroupConversation";
import { Id } from "@/convex/_generated/dataModel";
import { useMutatoinState } from "@/hooks/useMutationState";
import { useUserLocation } from "@/hooks/useUserLocation";
import GoogleMap from "./GoogleMap";
import { useRouter } from 'next/navigation'
import { Loader } from "lucide-react";
// import LoadingSpinner from "@/components/ui/LoadingSpinner";
// import ErrorMessage from "@/components/ui/ErrorMessage";

// Define the type for Location
type Location = {
  _id: Id<"locations">;
  _creationTime: number;
  radius?: number;
  name: string;
  coordinates: { lat: number; lng: number };
  border: { lat: number; lng: number }[];
};

const Map = () => {
  const router = useRouter()

  const locationsQuery = useQuery(api.locations.getLocations);
  const userLocation = useUserLocation();
  const [selectedLocationId, setSelectedLocationId] = React.useState<Id<"locations"> | null>(null);

  const { mutate: updateconvesationMember, pending } = useMutatoinState(api.locations.updateConversationMembers);

  // Fetch the conversation for the selected location
  const conversation = useQuery(
    api.locations.getConversationByLocationId,
    selectedLocationId ? { locationId: selectedLocationId } : "skip"
  );

  React.useEffect(() => {
    if (conversation && selectedLocationId) {
      updateconvesationMember({ conversationId: conversation._id, locationId: selectedLocationId });
      router.push(`/conversations`)
    }
  }, [conversation, selectedLocationId, updateconvesationMember, router]);

  const memoizedHandleMarkerClick = useCallback((location: Location) => {
    setSelectedLocationId(location._id);
  }, []);

  if (pending) {
    return <div className="flex items-center justify-center h-full w-full">
      <Loader className="animate-spin" />
    </div>;
  }

  if (!locationsQuery) {
    return 'failed to load locations';
  }

  // if(conversation && !pending) {
  //  return (<GroupConversation
  //   key={conversation._id}
  //   id={conversation._id}
  //   name={conversation.name || ""}
  // />)
  // }

  return (
    <Card className="flex flex-col lg:flex-row h-full w-full p-2 items-center justify-center bg-secondary text-secondary-foreground">
      {/* {conversation && !pending ? (
        <GroupConversation
          key={conversation._id}
          id={conversation._id}
          name={conversation.name || ""}
        />
      ) : ( */}
       {!conversation && !pending && <GoogleMap
          locations={locationsQuery as Location[]}
          userLocation={userLocation}
          onMarkerClick={memoizedHandleMarkerClick}
        />}
      {/* )} */}
    </Card>
  );
};

export default Map;