
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Declare Leaflet types for TypeScript
declare const L: any;

export function MapView() {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('تهران، ایران');
  
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || leafletMapRef.current) return;

    try {
      // Initialize the map
      const map = L.map(mapRef.current).setView([35.7152, 51.4043], 13); // Centered on Tehran
      leafletMapRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add a draggable marker
      const marker = L.marker(map.getCenter(), {
        draggable: true,
        icon: L.divIcon({
            className: 'custom-marker',
            html: `<div class="relative flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin drop-shadow-lg"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                   </div>`,
            iconSize: [48, 48],
            iconAnchor: [24, 48]
        })
      }).addTo(map);

      markerRef.current = marker;

      // Update marker on map move
      map.on('move', function() {
        marker.setLatLng(map.getCenter());
      });

    } catch (error) {
      console.error('Error initializing Leaflet map:', error);
      toast({
        variant: 'destructive',
        title: 'خطا در بارگذاری نقشه',
        description: 'متاسفانه در اتصال به سرویس نقشه مشکلی پیش آمده است.',
      });
    }

    // Cleanup on unmount
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [toast]);

  const handleConfirmLocation = () => {
    if (leafletMapRef.current) {
      const center = leafletMapRef.current.getCenter();
      toast({
        title: 'مکان انتخاب شد',
        description: `مکان انتخابی: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`,
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'جستجو', description: `جستجو برای: ${searchQuery}` });
    // In a real app, you would use a geocoding service here to convert address to lat/lng
  };

  const handleFindMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([latitude, longitude], 15);
          }
          toast({
            title: 'موقعیت شما پیدا شد',
            description: 'نقشه بر روی مکان فعلی شما متمرکز شد.',
          });
        },
        () => {
          toast({
            variant: 'destructive',
            title: 'خطا در موقعیت‌یابی',
            description: 'امکان دسترسی به موقعیت مکانی شما وجود ندارد.',
          });
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'عدم پشتیبانی',
        description: 'مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.',
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative h-[60vh] md:h-[70vh]">
        <div ref={mapRef} className="w-full h-full bg-muted z-0" />
        
        <div className="absolute top-4 right-4 left-4 z-[401] space-y-2">
            <Card className="shadow-lg">
            <CardContent className="p-2">
                <form onSubmit={handleSearch}>
                <div className="relative flex gap-2">
                    <Button type="button" size="icon" variant="ghost" className="h-11 w-11 flex-shrink-0 bg-background hover:bg-muted" onClick={handleFindMyLocation}>
                    <LocateFixed className="h-6 w-6 text-muted-foreground" />
                    </Button>
                    <div className="relative flex-grow">
                    <Button type="submit" size="icon" variant="ghost" className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent">
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Input
                        placeholder="جستجوی مبدا یا مقصد..."
                        className="pl-10 h-11 text-base bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    </div>
                </div>
                </form>
            </CardContent>
            </Card>
        </div>

        <div className="absolute bottom-4 right-4 left-4 z-[401]">
            <Button size="lg" className="w-full text-lg" onClick={handleConfirmLocation}>
            تایید مکان
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
