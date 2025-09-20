
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';


export function MapView() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('تهران، ایران');
  const mapImage = PlaceHolderImages.find((p) => p.id === 'map-view-interactive');

  const handleConfirmLocation = () => {
      toast({
        title: 'مکان انتخاب شد',
        description: `مکان انتخابی شما در مرکز نقشه تایید شد.`,
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'جستجو', description: `جستجو برای: ${searchQuery}` });
  }

  const handleFindMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          toast({
            title: 'موقعیت شما پیدا شد',
            description: 'نقشه بر روی مکان فعلی شما متمرکز شد (شبیه‌سازی شده).',
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
  
  if (!mapImage) return <div>در حال بارگذاری نقشه...</div>

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative h-[60vh] md:h-[70vh]">
        <Image
          src={mapImage.imageUrl}
          alt={mapImage.description}
          data-ai-hint={mapImage.imageHint}
          fill
          style={{ objectFit: 'cover' }}
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
