import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export const useGoogleMaps = () => {
  const [loader, setLoader] = useState<Loader | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mapLoader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['geometry', 'marker']
    });

    setLoader(mapLoader);

    mapLoader.load()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps API');
      });

    return () => {
      // Cleanup if needed
    };
  }, []);

  return { loader, isLoaded, error };
};