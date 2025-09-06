'use client';

import { useEffect, useRef, useState } from 'react';
import { MapboxService } from '@/lib/mapbox';
import type { ProductWithMerchant, MapPin } from '@/lib/types';

interface MapViewProps {
  products: ProductWithMerchant[];
  userLocation?: { latitude: number; longitude: number };
  onStoreClick?: (storeId: string) => void;
  className?: string;
  height?: string;
}

export function MapView({ 
  products, 
  userLocation, 
  onStoreClick, 
  className = "",
  height = "400px" 
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapService = useRef<MapboxService | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapService.current) return;

    try {
      mapService.current = new MapboxService();
      const map = mapService.current.initializeMap(mapContainer.current);

      map.on('load', () => {
        setMapLoaded(true);
      });

      map.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map');
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Map is not available');
    }

    return () => {
      if (mapService.current) {
        mapService.current.destroy();
        mapService.current = null;
      }
    };
  }, []);

  // Update markers when products change
  useEffect(() => {
    if (!mapService.current || !mapLoaded) return;

    // Group products by merchant to create map pins
    const merchantGroups = products.reduce((groups, product) => {
      const merchantId = product.merchant.id;
      if (!groups[merchantId]) {
        groups[merchantId] = {
          merchant: product.merchant,
          products: [],
        };
      }
      groups[merchantId].products.push(product);
      return groups;
    }, {} as Record<string, { merchant: ProductWithMerchant['merchant']; products: ProductWithMerchant[] }>);

    // Create map pins from merchant groups
    const pins: MapPin[] = Object.values(merchantGroups).map(group => ({
      id: group.merchant.id,
      name: group.merchant.name,
      latitude: group.merchant.latitude,
      longitude: group.merchant.longitude,
      productCount: group.products.length,
    }));

    // Add markers to map
    mapService.current.addMarkers(pins, (pin) => {
      if (onStoreClick) {
        onStoreClick(pin.id);
      }
    });
  }, [products, mapLoaded, onStoreClick]);

  // Update user location marker
  useEffect(() => {
    if (!mapService.current || !mapLoaded || !userLocation) return;

    mapService.current.addUserLocationMarker(
      userLocation.latitude,
      userLocation.longitude
    );
  }, [userLocation, mapLoaded]);

  if (mapError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapContainer} 
        className="w-full rounded-lg overflow-hidden"
        style={{ height }}
      />
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map legend */}
      {mapLoaded && products.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 text-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">3</span>
            </div>
            <span className="text-gray-700">Store with products</span>
          </div>
          {userLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border border-white"></div>
              <span className="text-gray-700">Your location</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

