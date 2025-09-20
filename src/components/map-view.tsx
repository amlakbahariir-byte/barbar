
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

export function MapView() {
  const { toast } = useToast();
  const mapImage = PlaceHolderImages.find((p) => p.id === 'map-view-interactive');
  const [selectedLocation, setSelectedLocation] = useState('تهران، میدان آزادی');

  const handleConfirmLocation = () => {
    toast({
      title: 'مکان انتخاب شد',
      description: `مکان انتخابی شما: ${selectedLocation}`,
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative h-[60vh] md:h-[70vh]">
        {mapImage && (
          <Image
            src={mapImage.imageUrl}
            alt={mapImage.description}
            data-ai-hint={mapImage.imageHint}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />

        <div className="absolute top-4 right-4 left-4 z-10">
          <Card className="shadow-lg">
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="جستجوی مبدا یا مقصد..."
                  className="pl-10 h-11 text-base"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                />
              </div>
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
