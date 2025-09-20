
'use client';

import { Truck } from 'lucide-react';

export function AnimatedTruckLoader() {
  return (
    <div className="flex flex-col items-center justify-center w-full text-center px-4">
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4 animate-in fade-in-0 slide-in-from-top-10 duration-1000">
          باربر ایرانی
        </h2>
        <div className="relative w-full max-w-lg h-32 overflow-hidden">
          <div className="absolute inset-x-0 bottom-8 h-1 road-lines animate-[move-road_1s_linear_infinite]"></div>
          <div className="absolute inset-0 flex items-center justify-center animate-[move-truck_4s_ease-in-out_infinite]">
            <div className="text-primary">
                <Truck className="w-20 h-20 -scale-x-100" stroke="currentColor" />
            </div>
          </div>
        </div>
    </div>
  );
}
