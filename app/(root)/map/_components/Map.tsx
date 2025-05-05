// "use client";
// import { Card } from "@/components/ui/card";
// import React from "react";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useUserLocation  } from "@/hooks/useUserLocation";
// import  useLocation   from "@/hooks/useLocation";

// import GoogleMap from "./GoogleMap";
// import { Loader } from "lucide-react";
// import { useLocationGroupUpdate } from "../../../hooks/useLocationGroupUpdate";
// import { useRouter } from "next/navigation";
// const locationOptions = { enableHighAccuracy: true };

// const Map = () => {
//   const locationsQuery = useQuery(api.locations.getLocations) || [];
//   const { location, loading, error, refetch } = useLocation(locationOptions);
//   const userLocation = location ? { lat: location.latitude, lng: location.longitude } : null;
//   // const { pending } = useLocationGroupUpdate(locationsQuery, userLocation);
//   const router  = useRouter()
//   if (loading) {
//     return <div className="flex items-center justify-center h-full w-full">
//       <Loader className="animate-spin" />
//     </div>;
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

"use client";
import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import useLocation from "@/hooks/useLocation";
import { useRouter } from "next/navigation";
import GoogleMap from "./GoogleMap";
import { Loader2, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapProvider } from "../context/mapContext";
import MapSkeleton from "./MapSkeleton";

const locationOptions = { enableHighAccuracy: true };

const Map = () => {
  const router = useRouter();
  const locationsQuery = useQuery(api.locations.getLocations) || [];
  const { location, loading: locationLoading, error: locationError, refetch } = useLocation(locationOptions);
  const userLocation = location ? { lat: location.latitude, lng: location.longitude } : null;
  const [mapError, setMapError] = useState<string | null>(null);

  const handleMarkerClick = (location: any) => {
    // You can add custom logic here before navigation
    router.push(`/conversations`);
  };

  const handleMapError = (error: string) => {
    setMapError(error);
  };

  const handleRetry = () => {
    setMapError(null);
    refetch();
  };

  if (locationLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-lg font-medium">Locating you on the map...</p>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>
            {locationError}. Please enable location services and try again.
          </AlertDescription>
        </Alert>
        <Button onClick={refetch} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!locationsQuery) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Data Error</AlertTitle>
        <AlertDescription>
          Failed to load locations. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <MapProvider>
      <Card className="flex flex-col h-full w-full overflow-hidden border rounded-lg shadow-md">
        {mapError ? (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 gap-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Map Error</AlertTitle>
              <AlertDescription>{mapError}</AlertDescription>
            </Alert>
            <Button onClick={handleRetry} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Loading Map
            </Button>
          </div>
        ) : (
          <>
            {userLocation && (
              <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              </div>
            )}
            <div className="flex-grow relative w-full">
              <GoogleMap
                locations={locationsQuery}
                userLocation={userLocation}
                onMarkerClick={handleMarkerClick}
                onMapError={handleMapError}
              />
            </div>
          </>
        )}
      </Card>
    </MapProvider>
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