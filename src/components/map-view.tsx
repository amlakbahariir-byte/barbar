
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function MapView() {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const neshanMapRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('تهران، ایران');
  const [isMapReady, setIsMapReady] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_NESHAN_API_KEY) {
      setApiKeyMissing(true);
      toast({
        variant: 'destructive',
        title: 'کلید API نقشه موجود نیست',
        description: 'لطفا کلید API نشان را در فایل .env با نام NEXT_PUBLIC_NESHAN_API_KEY قرار دهید.',
        duration: Infinity,
      });
      return;
    }

    if (window.neshan && mapRef.current && !neshanMapRef.current) {
      try {
        const map = new window.neshan.Map({
          key: process.env.NEXT_PUBLIC_NESHAN_API_KEY,
          maptype: 'dreamy',
          poi: true,
          traffic: false,
          element: mapRef.current,
          center: [35.7152, 51.4043], // Tehran coordinates
          zoom: 13,
        });
        neshanMapRef.current = map;
        setIsMapReady(true);
      } catch (error) {
        console.error('Error initializing Neshan map:', error);
        toast({
          variant: 'destructive',
          title: 'خطا در بارگذاری نقشه',
          description: 'متاسفانه در اتصال به سرویس نقشه مشکلی پیش آمده است.',
        });
      }
    }

    return () => {
      if (neshanMapRef.current) {
        neshanMapRef.current.destroy();
        neshanMapRef.current = null;
      }
    };
  }, [toast]);

  const handleConfirmLocation = () => {
    if (neshanMapRef.current) {
      const center = neshanMapRef.current.getCenter();
      toast({
        title: 'مکان انتخاب شد',
        description: `مکان انتخابی: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`,
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'جستجو', description: `جستجو برای: ${searchQuery}` });
    // In a real app, you would use Neshan's Search API here
  };

  const handleFindMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (neshanMapRef.current) {
            neshanMapRef.current.setCenter([latitude, longitude], 15);
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
        <div ref={mapRef} className="w-full h-full bg-muted" />

        {apiKeyMissing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1001]">
            <div className="text-center p-4 max-w-md mx-auto">
              <MapPin className="mx-auto h-12 w-12 text-destructive" />
              <h3 className="mt-4 text-lg font-semibold">کلید API نقشه یافت نشد</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                برای استفاده از نقشه، لطفاً کلید API خود را از وب‌سایت نشان دریافت کرده و در فایل `.env` با نام `NEXT_PUBLIC_NESHAN_API_KEY` قرار دهید. سپس برنامه را مجددا راه‌اندازی کنید.
              </p>
            </div>
          </div>
        )}

        {!apiKeyMissing && (
          <>
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
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%_+_24px)] z-[1000] text-center pointer-events-none">
              <MapPin className="h-12 w-12 text-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" style={{ transform: 'translateY(-50%)' }}/>
            </div>

            <div className="absolute bottom-4 right-4 left-4 z-[1000]">
              <Button size="lg" className="w-full text-lg" onClick={handleConfirmLocation}>
                تایید مکان
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
