'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BYRON_BAY_COORDS } from './utils';
import type { MapPin } from './types';

// Set Mapbox access token
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
}

export class MapboxService {
  private map: mapboxgl.Map | null = null;
  private markers: mapboxgl.Marker[] = [];

  initializeMap(container: string | HTMLElement, options: Partial<mapboxgl.MapboxOptions> = {}) {
    if (!mapboxgl.accessToken) {
      throw new Error('Mapbox access token is required');
    }

    this.map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [BYRON_BAY_COORDS.longitude, BYRON_BAY_COORDS.latitude],
      zoom: 13,
      ...options,
    });

    // Add navigation controls
    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    return this.map;
  }

  addMarkers(pins: MapPin[], onMarkerClick?: (pin: MapPin) => void) {
    if (!this.map) return;

    // Clear existing markers
    this.clearMarkers();

    pins.forEach((pin) => {
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'mapbox-marker';
      markerEl.innerHTML = `
        <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-700 transition-colors">
          <span class="text-white text-xs font-bold">${pin.productCount}</span>
        </div>
      `;

      // Create marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(this.map!);

      // Add popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${pin.name}</h3>
          <p class="text-xs text-gray-600">${pin.productCount} product${pin.productCount === 1 ? '' : 's'} available</p>
        </div>
      `);

      // Show popup on hover
      markerEl.addEventListener('mouseenter', () => {
        popup.addTo(this.map!);
        marker.setPopup(popup);
      });

      markerEl.addEventListener('mouseleave', () => {
        popup.remove();
      });

      // Handle click
      if (onMarkerClick) {
        markerEl.addEventListener('click', () => {
          onMarkerClick(pin);
        });
      }

      this.markers.push(marker);
    });

    // Fit map to markers if there are any
    if (pins.length > 0) {
      this.fitToMarkers(pins);
    }
  }

  fitToMarkers(pins: MapPin[], padding = 50) {
    if (!this.map || pins.length === 0) return;

    if (pins.length === 1) {
      // Center on single marker
      this.map.flyTo({
        center: [pins[0].longitude, pins[0].latitude],
        zoom: 15,
      });
    } else {
      // Fit to all markers
      const bounds = new mapboxgl.LngLatBounds();
      pins.forEach((pin) => {
        bounds.extend([pin.longitude, pin.latitude]);
      });

      this.map.fitBounds(bounds, {
        padding,
        maxZoom: 16,
      });
    }
  }

  clearMarkers() {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  centerOnLocation(latitude: number, longitude: number, zoom = 14) {
    if (!this.map) return;

    this.map.flyTo({
      center: [longitude, latitude],
      zoom,
    });
  }

  addUserLocationMarker(latitude: number, longitude: number) {
    if (!this.map) return;

    // Remove existing user marker
    const existingUserMarker = this.markers.find(m => 
      m.getElement().classList.contains('user-location-marker')
    );
    if (existingUserMarker) {
      existingUserMarker.remove();
      this.markers = this.markers.filter(m => m !== existingUserMarker);
    }

    // Create user location marker
    const userMarkerEl = document.createElement('div');
    userMarkerEl.className = 'user-location-marker';
    userMarkerEl.innerHTML = `
      <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg">
        <div class="w-full h-full bg-blue-500 rounded-full animate-ping opacity-75"></div>
      </div>
    `;

    const userMarker = new mapboxgl.Marker(userMarkerEl)
      .setLngLat([longitude, latitude])
      .addTo(this.map);

    this.markers.push(userMarker);

    return userMarker;
  }

  async geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&country=AU&proximity=${BYRON_BAY_COORDS.longitude},${BYRON_BAY_COORDS.latitude}`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  calculateDistance(point1: [number, number], point2: [number, number]): number {
    // Using turf.js would be better, but implementing simple haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2[1] - point1[1]);
    const dLon = this.toRadians(point2[0] - point1[0]);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1[1])) *
        Math.cos(this.toRadians(point2[1])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  destroy() {
    if (this.map) {
      this.clearMarkers();
      this.map.remove();
      this.map = null;
    }
  }

  getMap() {
    return this.map;
  }
}

