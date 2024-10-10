import React, { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useMutatoinState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { Location } from "@/app/types/types";

interface GoogleMapProps {
  locations: Location[];
  userLocation: { lat: number; lng: number } | null;
  onMarkerClick: (location: Location) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ locations, userLocation, onMarkerClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { mutate: createLocationGroup } = useMutatoinState(api.locations.createLocationGroup);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY!,
        version: "weekly",
        libraries: ["geometry"],
      });

      const { AdvancedMarkerElement } = await loader.importLibrary("marker") as google.maps.MarkerLibrary;
      const { Map, Polygon } = await loader.importLibrary("maps");
      const { poly } = await loader.importLibrary("geometry") as google.maps.GeometryLibrary;

      const mapOptions: google.maps.MapOptions = {
        center: userLocation || { lat: 29.55805, lng: 34.94821 },
        zoom: 15,
        disableDefaultUI: true,
        mapId: "1f9f7b5e8a0f7f7d",
      };

      const map = new Map(mapRef.current!, mapOptions);

      locations.forEach((location) => {
        const marker = new AdvancedMarkerElement({
          map: map,
          position: location.coordinates,
          title: location.name,
        });

        const polygon = new Polygon({
          paths: location.border,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
        });
        
        const isInside = poly.containsLocation({ lat: 32.926692, lng: 35.075890 }, polygon);
        createLocationGroup({ locationId: location._id, name: location.name });

        if (isInside) {
          polygon.setOptions({ fillColor: "#00FF00" });
          marker.addListener("click", () => {
            onMarkerClick(location);
          });
        }

        polygon.setMap(map);
      });
    };

    initMap();
  }, [locations, userLocation, onMarkerClick, createLocationGroup]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height: '100%' }} 
      role="application" 
      aria-label="Google Map showing locations"
    />
  );
};

export default GoogleMap;