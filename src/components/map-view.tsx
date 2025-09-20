
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Declare Leaflet types for TypeScript
declare const L: any;

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
  'ارومیه': [37.5527, 45.0756],
  'اردبیل': [38.2464, 48.2951],
  'بجنورد': [37.4746, 57.3292],
  'بیرجند': [32.8654, 59.2211],
  'بوشهر': [28.9189, 50.8384],
  'شهرکرد': [32.3295, 50.8546],
  'گرگان': [36.8394, 54.4386],
  'همدان': [34.7983, 48.5146],
  'ایلام': [33.6377, 46.4226],
  'کرمانشاه': [34.3142, 47.0650],
  'خرم‌آباد': [33.4878, 48.3558],
  'رشت': [37.2808, 49.5832],
  'بندرعباس': [27.1865, 56.2808],
  'قزوین': [36.2796, 50.0049],
  'قم': [34.6401, 50.8764],
  'سنندج': [35.3144, 46.9996],
  'ساری': [36.5659, 53.0599],
  'سمنان': [35.5786, 53.3952],
  'اراک': [34.0917, 49.6891],
  'زاهدان': [29.4963, 60.8629],
  'زنجان': [36.6769, 48.4851],
  'یاسوج': [30.6690, 51.5861],
};


export function MapView({ onConfirm }: { onConfirm?: () => void }) {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || leafletMapRef.current) return;

    try {
      // Initialize the map
      const map = L.map(mapRef.current, {
        zoomControl: false, // Disable default zoom control
      }).setView([35.7152, 51.4043], 13); // Centered on Tehran
      leafletMapRef.current = map;
      
      // Add new zoom control at a different position
      L.control.zoom({ position: 'bottomleft' }).addTo(map);


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

  const handleConfirmLocation = async () => {
    if (leafletMapRef.current) {
      const center = leafletMapRef.current.getCenter();
      const { lat, lng } = center;
      
      let finalAddress = `موقعیت سفارشی (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
      
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa`);
          const data = await response.json();
          if (data && data.display_name) {
              // Extracting more readable parts of the address
              const { road, suburb, city, state } = data.address;
              let addressParts = [road, suburb, city, state].filter(Boolean); // Filter out undefined parts
              finalAddress = addressParts.join(', ');
              if (!finalAddress) {
                  finalAddress = data.display_name.split(',').slice(0,3).join(',');
              }
          }
      } catch (e) {
          console.error("Reverse geocoding failed", e);
          toast({
            variant: 'destructive',
            title: 'خطا در تبدیل موقعیت به آدرس',
            description: 'از آدرس پیش‌فرض استفاده خواهد شد.',
          });
      }


      localStorage.setItem('driverLocation', finalAddress);

      toast({
        title: 'موقعیت شما ثبت شد',
        description: `موقعیت جدید شما (${finalAddress}) برای نمایش به صاحبان بار ذخیره شد.`,
      });
      // If a callback is provided, call it.
      if (onConfirm) {
        onConfirm();
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    const query = searchQuery.trim();
    const coordinates = cityCoordinates[query];

    if (coordinates && leafletMapRef.current) {
        leafletMapRef.current.flyTo(coordinates, 13); // Zoom level 13
        toast({
            title: 'مکان پیدا شد',
            description: `نمایش ${query} روی نقشه.`,
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'مکان یافت نشد',
            description: `مکان "${searchQuery}" پیدا نشد. لطفا نام یک مرکز استان را امتحان کنید.`,
        });
    }
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
        
        <div className="absolute top-4 right-4 left-4 z-[1000]">
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
                        placeholder="جستجوی نام شهر (مثال: شیراز)"
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

        <div className="absolute bottom-4 right-4 left-4 z-[1000]">
            <Button size="lg" className="w-full text-lg" onClick={handleConfirmLocation}>
            تایید و ثبت نهایی موقعیت
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

    