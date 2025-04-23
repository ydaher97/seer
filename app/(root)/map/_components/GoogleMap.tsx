import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useMutatoinState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { Location } from "@/app/types/types";
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { SuperClusterAlgorithm } from '@googlemaps/markerclusterer';

interface GoogleMapProps {
  locations: Location[];
  userLocation: { lat: number; lng: number } | null;
  onMarkerClick: (location: Location) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ locations, userLocation, onMarkerClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { mutate: createLocationGroup } = useMutatoinState(api.locations.createLocationGroup);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
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
          center: userLocation || { lat: 32.794, lng: 35.5312},
          zoom: 10,
          disableDefaultUI: false, // Enable UI controls
          mapId: "1f9f7b5e8a0f7f7d",
          // Add these controls
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true,
          // Customize the map style
          styles: [
            // Add custom map styles here
          ]
        };

        const map = new Map(mapRef.current!, mapOptions);

        const markers = locations.map((location) => {
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
          
          const isInside = poly.containsLocation(userLocation!, polygon);
          createLocationGroup({ locationId: location._id, name: location.name });

          if (isInside) {
            polygon.setOptions({ fillColor: "#00FF00" });
            marker.addListener("click", () => {
              onMarkerClick(location);
            });
          }

          polygon.setMap(map);

          return marker;
        });

        new MarkerClusterer({ 
          map,
          markers,
          algorithm: new SuperClusterAlgorithm({
            radius: 100,
          })
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map');
      } finally {
        setIsLoading(false);
      }
    };

    initMap();
  }, [locations, userLocation, onMarkerClick, createLocationGroup]);

  if (isLoading) return <div>Loading map...</div>;
  // if (error) return <div>Error loading map: {error}</div>;

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