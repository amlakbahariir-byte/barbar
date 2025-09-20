
'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FakeMap, LngLat } from './fake-map';


export function MapView() {
  const { toast } = useToast();
  const [location, setLocation] = useState<LngLat>({ lng: 51.3890, lat: 35.6892 });
  const [searchQuery, setSearchQuery] = useState('تهران، ایران');

  const handleCenterChange = useCallback((newCenter: LngLat) => {
    setLocation(newCenter);
  }, []);

  const handleConfirmLocation = () => {
    toast({
      title: 'مکان انتخاب شد',
      description: `مکان انتخابی شما: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would use a geocoding API here.
    // For this demo, we'll just recenter to a predefined location for "Mashhad".
    if (searchQuery.includes('مشهد')) {
        setLocation({ lng: 59.567, lat: 36.315 });
        toast({ title: 'جستجو', description: 'نقشه به مشهد منتقل شد.' });
    } else {
        toast({ title: 'جستجو', description: 'مکان پیش‌فرض (تهران) نمایش داده شد.' });
        setLocation({ lng: 51.3890, lat: 35.6892 });
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative h-[60vh] md:h-[70vh]">
        <FakeMap center={location} onCenterChange={handleCenterChange} />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />

        <div className="absolute top-4 right-4 left-4 z-10 space-y-2">
          <Card className="shadow-lg">
            <CardContent className="p-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Button type="submit" size="icon" variant="ghost" className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Input
                    placeholder="جستجوی مبدا یا مقصد..."
                    className="pl-10 h-11 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
           <Card className="shadow-lg max-w-sm mx-auto">
             <CardContent className="p-2 text-center">
                <p className="text-xs text-muted-foreground">مختصات مرکز نقشه</p>
                <p className="text-sm font-mono tracking-wider">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
             </CardContent>
           </Card>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
           <MapPin className="h-12 w-12 text-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] -translate-y-6" />
        </div>
        
        <div className="absolute bottom-4 right-4 left-4 z-10">
            <Button size="lg" className="w-full text-lg" onClick={handleConfirmLocation}>
                تایید مکان
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
