
'use client';

import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Card } from './ui/card';

// Declare Leaflet type for TypeScript
declare const L: any;

interface ShipmentRouteMapProps {
  origin: string;
  destination: string;
}

// Placeholder coordinates for cities as we don't have a geocoding service
const cityCoordinates: { [key: string]: [number, number] } = {
  'تهران': [35.6892, 51.3890],
  'اصفهان': [32.6539, 51.6660],
  'شیراز': [29.5918, 52.5837],
  'تبریز': [38.08, 46.29],
  'مشهد': [36.2605, 59.6168],
  'کرج': [35.8327, 50.9915],
  'اهواز': [31.3183, 48.6909],
  'یزد': [31.8974, 54.3675],
  'کرمان': [30.2832, 57.0788],
};

export function ShipmentRouteMap({ origin, destination }: ShipmentRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    // Ensure code runs only on the client and that the map container is available
    if (typeof window === 'undefined' || !mapRef.current || leafletMapRef.current) return;
    
    // Get coordinates, default to Tehran/Isfahan if not found
    const originCoords = cityCoordinates[origin] || cityCoordinates['تهران'];
    const destCoords = cityCoordinates[destination] || cityCoordinates['اصفهان'];

    try {
      // Initialize the map
      const map = L.map(mapRef.current);
      leafletMapRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Create custom icons
      const createIcon = (color: string) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin drop-shadow-lg"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });
      }
      
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      const primaryIcon = createIcon(`hsl(${primaryColor})`);

      // Add markers for origin and destination
      const originMarker = L.marker(originCoords, { icon: primaryIcon }).addTo(map).bindPopup(origin);
      const destMarker = L.marker(destCoords, { icon: primaryIcon }).addTo(map).bindPopup(destination);
      
      // Draw a line between the two points
      const latlngs = [originCoords, destCoords];
      const polyline = L.polyline(latlngs, { color: `hsl(${primaryColor})`, weight: 4, dashArray: '10, 10' }).addTo(map);

      // Fit map to show both markers
      map.fitBounds(polyline.getBounds().pad(0.3));

    } catch (error) {
      console.error('Error initializing Leaflet map:', error);
    }

    // Cleanup on unmount
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [origin, destination]);

  return (
    <Card className="overflow-hidden border-2 shadow-md">
        <div ref={mapRef} className="w-full h-64 md:h-80 bg-muted z-0" />
    </Card>
  );
}
