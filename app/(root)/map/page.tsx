
import React from 'react';
import dynamic from 'next/dynamic';
import { MapProvider } from './context/mapContext';

// Use dynamic import to avoid SSR issues with geolocation
const MapComponent = dynamic(
  () => import('./_components/Map'),
  { ssr: false, loading: () => (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="animate-pulse text-lg font-medium">Loading Map...</div>
    </div>
  )}
);

const MapPage = () => {
  return (
    <MapProvider>
      <div className="h-screen w-full p-4">
        <MapComponent />
      </div>
    </MapProvider>
  );
};

export default MapPage;