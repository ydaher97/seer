import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const { mutate: createLocationGroup } = useMutatoinState(api.locations.createLocationGroup);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the location group creation
  const handleLocationGroup = useCallback((locationId: string, name: string) => {
    createLocationGroup({ locationId, name });
  }, [createLocationGroup]);

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
          disableDefaultUI: false,
          mapId: "1f9f7b5e8a0f7f7d",
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true,
        };

        const map = new Map(mapRef.current!, mapOptions);
        mapInstance.current = map;

        // Clear existing markers and polygons
        markersRef.current.forEach(marker => marker.map = null);
        polygonsRef.current.forEach(polygon => polygon.setMap(null));
        markersRef.current = [];
        polygonsRef.current = [];

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
          
          if (userLocation) {
            const isInside = poly.containsLocation(userLocation, polygon);
            if (isInside) {
              polygon.setOptions({ fillColor: "#00FF00" });
              marker.addListener("gmp-click", () => {
                onMarkerClick(location);
              });
              // handleLocationGroup(location._id, location.name);
            }
          }

          polygon.setMap(map);
          polygonsRef.current.push(polygon);
          markersRef.current.push(marker);

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

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => marker.map = null);
      polygonsRef.current.forEach(polygon => polygon.setMap(null));
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, [locations, userLocation, onMarkerClick, handleLocationGroup]);

  // if (isLoading) return <div>Loading map...</div>;
  if (error) return <div>Error loading map: {error}</div>;

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