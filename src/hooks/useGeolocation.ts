'use client';

import { useEffect, useState } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState((current) => ({
        ...current,
        error: 'เบราว์เซอร์นี้ไม่รองรับ Geolocation API',
        isLoading: false,
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) =>
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          isLoading: false,
        }),
      (error) => setState((current) => ({ ...current, error: error.message, isLoading: false })),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
