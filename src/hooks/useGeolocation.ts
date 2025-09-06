'use client';

import { useState, useEffect } from 'react';
import { BYRON_BAY_COORDS } from '@/lib/utils';

interface GeolocationState {
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  loading: boolean;
  error: string | null;
  permission: PermissionState | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
    permission: null,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState(prev => ({
          ...prev,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          loading: false,
          error: null,
        }));
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
          // Fallback to Byron Bay coordinates
          coordinates: BYRON_BAY_COORDS,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const checkPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permission: permission.state }));
        
        permission.onchange = () => {
          setState(prev => ({ ...prev, permission: permission.state }));
        };
      } catch (error) {
        console.error('Error checking geolocation permission:', error);
      }
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    ...state,
    requestLocation,
    hasLocation: !!state.coordinates,
  };
}

