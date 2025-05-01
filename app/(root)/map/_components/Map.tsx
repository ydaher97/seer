"use client";
import { Card } from "@/components/ui/card";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserLocation  } from "@/hooks/useUserLocation";
import  useLocation   from "@/hooks/useLocation";

import GoogleMap from "./GoogleMap";
import { Loader } from "lucide-react";
import { useLocationGroupUpdate } from "../../../hooks/useLocationGroupUpdate";
import { useRouter } from "next/navigation";
const locationOptions = { enableHighAccuracy: true };

const Map = () => {
  const locationsQuery = useQuery(api.locations.getLocations) || [];
  const { location, loading, error, refetch } = useLocation(locationOptions);
  const userLocation = location ? { lat: location.latitude, lng: location.longitude } : null;
  // const { pending } = useLocationGroupUpdate(locationsQuery, userLocation);
  const router  = useRouter()
  if (loading) {
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


// "use client";
// import { Card } from "@/components/ui/card";
// import React, { useEffect, useState } from "react";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useUpdateLocation } from "@/hooks/useUserLocation";
// import GoogleMap from "./GoogleMap";
// import { Loader } from "lucide-react";
// import { useLocationGroupUpdate } from "../../../hooks/useLocationGroupUpdate";
// import { useRouter } from "next/navigation";

// interface Location {
//   lat: number;
//   lng: number;
// }

// const Map = () => {
//   const locationsQuery = useQuery(api.locations.getLocations) || [];
//   const { getAndUpdateLocation, error, loading } = useUpdateLocation();
//   const [userLocation, setUserLocation] = useState<Location | null>(null);
//   const { pending } = useLocationGroupUpdate(locationsQuery, userLocation);
//   const router = useRouter();

//   useEffect(() => {
//     const updateLocation = () => {
//       if (!navigator.geolocation) {
//         console.error("Geolocation is not supported by this browser.");
//         return;
//       }

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           const location: Location = { lat: latitude, lng: longitude };
//           setUserLocation(location);
//           getAndUpdateLocation(); // Update in database
//         },
//         (err) => {
//           console.error("Geolocation error:", err);
//         }
//       );
//     };

//     updateLocation();
//   }, [getAndUpdateLocation]);

//   if (loading || pending) {
//     return (
//       <div className="flex items-center justify-center h-full w-full">
//         <Loader className="animate-spin" />
//       </div>
//     );
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!locationsQuery) {
//     return 'failed to load locations';
//   }

//   return (
//     <Card className="flex flex-col lg:flex-row h-full w-full p-2 items-center justify-center bg-secondary text-secondary-foreground">
//       <GoogleMap
//         locations={locationsQuery}
//         userLocation={userLocation}
//         onMarkerClick={() => {router.push(`/conversations`);}}
//       />
//     </Card>
//   );
// };

// export default Map;