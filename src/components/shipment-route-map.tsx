
'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

interface ShipmentRouteMapProps {
  origin: string;
  destination: string;
}

export function ShipmentRouteMap({ origin, destination }: ShipmentRouteMapProps) {
  const mapImage = PlaceHolderImages.find((p) => p.id === 'map-view-interactive');

  if (!mapImage) {
    return null;
  }

  return (
    <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden border bg-muted">
      <Image
        src={mapImage.imageUrl}
        alt={mapImage.description}
        data-ai-hint={mapImage.imageHint}
        layout="fill"
        objectFit="cover"
        className="opacity-50"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Origin Pin */}
          <div className="absolute top-[30%] left-[20%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="bg-background border-2 border-primary text-primary font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
              {origin}
            </div>
            <MapPin className="w-10 h-10 text-primary mt-1 drop-shadow-lg" fill="hsl(var(--primary))" stroke="hsl(var(--background))" />
          </div>

          {/* Destination Pin */}
          <div className="absolute top-[60%] right-[15%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className="bg-background border-2 border-primary text-primary font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
              {destination}
            </div>
            <MapPin className="w-10 h-10 text-primary mt-1 drop-shadow-lg" fill="hsl(var(--primary))" stroke="hsl(var(--background))" />
          </div>
          
          {/* Dashed line */}
          <svg className="absolute inset-0 w-full h-full" width="100%" height="100%">
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
                </marker>
            </defs>
            <path 
                d="M 22% 35% C 40% 50%, 60% 70%, 83% 65%" 
                stroke="hsl(var(--primary))" 
                strokeWidth="4" 
                fill="none" 
                strokeDasharray="10, 10" 
                className="animate-[dash_2s_linear_infinite]"
                markerEnd="url(#arrow)"
            />
          </svg>
        </div>
      </div>
       <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
      `}</style>
    </div>
  );
}
