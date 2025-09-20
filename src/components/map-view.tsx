
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NeshanMap from 'react-neshan-map-leaflet';

export type LngLat = { lng: number; lat: number };

export function MapView() {
  const { toast } = useToast();
  const [location, setLocation] = useState<LngLat>({ lng: 51.3890, lat: 35.6892 });
  const [searchQuery, setSearchQuery] = useState('تهران، ایران');
  const [map, setMap] = useState<any>(null);

  const handleConfirmLocation = () => {
     if (map) {
      const center = map.getCenter();
      setLocation({ lat: center.lat, lng: center.lng });
      toast({
        title: 'مکان انتخاب شد',
        description: `مکان انتخابی شما: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`,
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would use a geocoding API here.
    // For this demo, we'll just recenter to a predefined location for "Mashhad".
    if (searchQuery.includes('مشهد')) {
        const newLoc = { lng: 59.567, lat: 36.315 };
        setLocation(newLoc);
        if(map) map.flyTo([newLoc.lat, newLoc.lng], 12);
        toast({ title: 'جستجو', description: 'نقشه به مشهد منتقل شد.' });
    } else {
        const newLoc = { lng: 51.3890, lat: 35.6892 };
        setLocation(newLoc);
        if(map) map.flyTo([newLoc.lat, newLoc.lng], 12);
        toast({ title: 'جستجو', description: 'مکان پیش‌فرض (تهران) نمایش داده شد.' });
    }
  }

  const handleFindMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLoc = { lat: latitude, lng: longitude };
          setLocation(newLoc);
          if(map) map.flyTo([newLoc.lat, newLoc.lng], 14);
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
        <NeshanMap
          mapKey="web.83f98a280c4149e0a6493b8095d33a75"
          center={{ latitude: location.lat, longitude: location.lng }}
          zoom={13}
          onInit={setMap}
          style={{ width: '100%', height: '100%' }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />

        <div className="absolute top-4 right-4 left-4 z-[1000] space-y-2">
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
           {map && <Card className="shadow-lg max-w-sm mx-auto">
             <CardContent className="p-2 text-center">
                <p className="text-xs text-muted-foreground">مختصات مرکز نقشه</p>
                <p className="text-sm font-mono tracking-wider">{map.getCenter().lat.toFixed(4)}, {map.getCenter().lng.toFixed(4)}</p>
             </CardContent>
           </Card>}
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+24px)] z-[1000] text-center pointer-events-none">
           <MapPin className="h-12 w-12 text-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
        </div>
        
        <div className="absolute bottom-4 right-4 left-4 z-[1000]">
            <Button size="lg" className="w-full text-lg" onClick={handleConfirmLocation}>
                تایید مکان
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
