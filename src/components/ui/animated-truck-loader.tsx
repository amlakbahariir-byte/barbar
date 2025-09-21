
'use client';

import { Truck } from 'lucide-react';

export function AnimatedTruckLoader() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full text-center px-4">
      <div className="relative w-48 h-32 flex items-center justify-center overflow-hidden">
        {/* Road */}
        <div className="absolute bottom-8 w-full h-10 bg-muted rounded-full" />
        <div className="absolute bottom-12 w-full h-2 road-lines animate-[move-road_1s_linear_infinite]" />

        {/* Truck */}
        <div className="absolute bottom-10 animate-[move-truck_4s_ease-in-out_infinite]">
            <Truck className="w-20 h-20 text-primary -scale-x-100" />
        </div>
      </div>
       <h1 className="text-5xl font-headline tracking-tight text-foreground mt-2 animate-in fade-in-0 slide-in-from-top-4 duration-700">
            باربر ایرانی
        </h1>
    </div>
  );
}
