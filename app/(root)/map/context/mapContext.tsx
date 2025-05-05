"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Location } from '@/app/types/types';

interface MapContextType {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  isMapLoaded: boolean;
  setIsMapLoaded: (loaded: boolean) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  return (
    <MapContext.Provider value={{ 
      selectedLocation, 
      setSelectedLocation,
      isMapLoaded,
      setIsMapLoaded
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};