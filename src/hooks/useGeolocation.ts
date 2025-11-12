import { useState, useEffect, useRef } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';

interface GeolocationHook {
  position: Position | null;
  error: string | null;
  startTracking: (callback: (pos: Position) => void) => Promise<void>;
  stopTracking: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

const useGeolocation = (): GeolocationHook => {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<string | null>(null);
  const intervalId = useRef<NodeJS.Timeout | null>(null); // For mock location interval
  const positionCallbackRef = useRef<(pos: Position) => void>();

  // Check for mock location query parameter
  const useMockLocation = new URLSearchParams(window.location.search).get('mock_location') === 'true';

  const requestPermissions = async (): Promise<boolean> => {
    if (useMockLocation) return true; // No permissions needed for mock location
    try {
      const permissionStatus = await Geolocation.requestPermissions();
      if (permissionStatus.location === 'granted') {
        return true;
      } else {
        setError('Geolocation permission denied.');
        return false;
      }
    } catch (err) {
      const message = (err instanceof Error) ? err.message : String(err);
      setError('Error requesting geolocation permissions: ' + message);
      return false;
    }
  };

  const startTracking = async (callback: (pos: Position) => void) => {
    positionCallbackRef.current = callback;
    setError(null);

    if (useMockLocation) {
      console.log("USING MOCK GEOLOCATION FOR DEVELOPMENT");
      const mockPosition: Position = {
        timestamp: Date.now(),
        coords: {
          latitude: 12.94336,
          longitude: 77.594624,
          accuracy: 1,
          altitudeAccuracy: 1,
          altitude: 0,
          speed: 10,
          heading: 0,
        },
      };
      setPosition(mockPosition);
      if (positionCallbackRef.current) {
        positionCallbackRef.current(mockPosition);
      }

      // Simulate movement
      if (intervalId.current) clearInterval(intervalId.current); // Clear previous interval
      intervalId.current = setInterval(() => {
        setPosition(prevPosition => {
          if (!prevPosition) return null;
          const newCoords = {
            ...prevPosition.coords,
            latitude: prevPosition.coords.latitude + 0.0005,
            longitude: prevPosition.coords.longitude + 0.0005,
          };
          const newPos = { ...prevPosition, timestamp: Date.now(), coords: newCoords };
          if (positionCallbackRef.current) {
            positionCallbackRef.current(newPos);
          }
          console.log("Mock location updated:", newPos.coords);
          return newPos;
        });
      }, 5000); // Update every 5 seconds

      return;
    }

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      if (watchId.current) await Geolocation.clearWatch({ id: watchId.current });

      watchId.current = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        },
        (newPosition, err) => {
          if (err) {
            const message = (err instanceof Error) ? err.message : String(err);
            setError('Error watching position: ' + message);
            return;
          }
          if (newPosition) {
            setPosition(newPosition);
            if (positionCallbackRef.current) {
              positionCallbackRef.current(newPosition);
            }
          }
        }
      );
    } catch (err) {
      const message = (err instanceof Error) ? err.message : String(err);
      setError('Error starting geolocation watch: ' + message);
    }
  };

  const stopTracking = async () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
      console.log('Mock geolocation tracking stopped.');
    }
    if (watchId.current !== null) {
      try {
        await Geolocation.clearWatch({ id: watchId.current });
        watchId.current = null;
        console.log('Geolocation tracking stopped.');
      } catch (err) {
        // May fail if watch was already cleared or invalid, not critical
        console.warn('Could not clear geolocation watch:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return { position, error, startTracking, stopTracking, requestPermissions };
};

export default useGeolocation;
