import { useState, useEffect, useCallback } from 'react';

// Key for storing data in localStorage
const STORAGE_KEY = 'user_location_cache';

// Default maximum age for cached location data (e.g., 30 minutes)
const DEFAULT_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

// --- Helper Functions for localStorage ---

// Tries to load fresh location data from localStorage
const loadFromCache = (maxAge: number) => {
  try {
    const cachedDataString = localStorage.getItem(STORAGE_KEY);
    if (!cachedDataString) {
      return null; // No cache found
    }

    const cachedData = JSON.parse(cachedDataString);
    const { coords, timestamp } = cachedData;

    if (!coords || typeof timestamp !== 'number') {
      console.warn('Invalid location cache format.');
      localStorage.removeItem(STORAGE_KEY); // Clear invalid data
      return null;
    }

    const isStale = Date.now() - timestamp > maxAge;
    if (isStale) {
      // console.log('Location cache is stale.');
      localStorage.removeItem(STORAGE_KEY); // Clear stale data
      return null;
    }

    // console.log('Loaded fresh location from cache.');
    return coords; // Return fresh coordinates
  } catch (error) {
    console.error('Error reading location from localStorage:', error);
    // Attempt to clear potentially corrupted data
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    return null; // Treat errors as a cache miss
  }
};

// Saves location data and current timestamp to localStorage
const saveToCache = (coords: GeolocationCoordinates) => {
  try {
    const dataToStore = JSON.stringify({
      coords: coords,
      timestamp: Date.now(),
    });
    localStorage.setItem(STORAGE_KEY, dataToStore);
    // console.log('Saved location to cache.');
  } catch (error) {
    console.error('Error saving location to localStorage:', error);
    // Handle potential storage full errors (though unlikely for small data)
  }
};

// --- The Custom Hook ---

interface PersistenceOptions {
  maxAge?: number;
}

/**
 * Custom React hook to get the user's current geolocation,
 * with persistence using localStorage.
 *
 * @param {PositionOptions} geolocationOptions - Optional configuration for the geolocation request
 * (e.g., { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }).
 * @param {object} persistenceOptions - Optional configuration for persistence.
 * @param {number} persistenceOptions.maxAge - How long to consider cached data fresh (milliseconds). Defaults to 30 minutes.
 * @returns {object} An object containing:
 * - location: The GeolocationCoordinates object or null.
 * - loading: Boolean indicating if fetching is in progress.
 * - error: Error object or null.
 * - refetch: Function to force a new fetch, bypassing the cache check.
 */
function usePersistentLocation(
  geolocationOptions = {},
  persistenceOptions: PersistenceOptions = {}
) {
  const { maxAge = DEFAULT_MAX_AGE_MS } = persistenceOptions;
  // Use state to stabilize options object passed potentially as literal
  const [currentGeolocationOptions] = useState(geolocationOptions);

  // --- State Initialization ---
  // Initialize state by trying to load from cache first
  const [location, setLocation] = useState(() => loadFromCache(maxAge));
  // Start loading only if cache wasn't hit (location is initially null)
  const [loading, setLoading] = useState(!location);
  const [error, setError] = useState<Error | GeolocationPositionError | null>(null);

  // --- Geolocation Fetch Logic ---
  const performFetch = useCallback(() => {
    // Check browser support
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by this browser.'));
      setLoading(false);
      return;
    }

    // Set loading state *before* the async operation
    setLoading(true);
    setError(null); // Clear previous errors

    navigator.geolocation.getCurrentPosition(
      // Success Callback
      (position) => {
        const fetchedCoords = position.coords;
        setLocation(fetchedCoords);
        setError(null);
        setLoading(false);
        saveToCache(fetchedCoords); // Save the newly fetched location
      },
      // Error Callback
      (err) => {
        console.error(`Geolocation Error: ${err.message} (Code: ${err.code})`);
        setError(err);
        // Decide if we clear location state on error, or keep showing potentially stale cache?
        // Let's clear it for consistency with non-persistent version.
        setLocation(null);
        setLoading(false);
        // Optional: Clear cache specifically on permission denied?
        if (err.code === err.PERMISSION_DENIED) {
           try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        }
      },
      // Geolocation Options
      currentGeolocationOptions
    );
  }, [currentGeolocationOptions]); // Recreate fetcher only if geo options change

  // --- Effect for Initial Fetch (if needed) ---
  useEffect(() => {
    // If loading is true (meaning cache was missed or stale during init),
    // then perform the fetch.
    if (loading) {
      performFetch();
    }
    // This effect should run primarily based on the initial loading state
    // or if the fetch function itself changes (due to options changing).
  }, [loading, performFetch]);

  // --- Manual Refetch Function ---
  // This function will always trigger a fetch, ignoring cache state.
  const refetch = useCallback(() => {
    // console.log('Manual refetch requested.');
    performFetch();
  }, [performFetch]);

  // --- Return Hook State and Refetch Function ---
  return { location, loading, error, refetch };
}

export default usePersistentLocation;