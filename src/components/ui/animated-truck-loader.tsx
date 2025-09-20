
'use client';

import { Truck } from 'lucide-react';

export function AnimatedTruckLoader({ slogan, sloganKey }: { slogan?: string; sloganKey?: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center w-full text-center px-4">
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4 animate-in fade-in-0 slide-in-from-top-10 duration-1000">
          باربر ایرانی
        </h2>
        <p 
          key={sloganKey}
          className="text-muted-foreground text-lg mb-8 min-h-[2rem] animate-in fade-in-0 duration-1000"
        >
          {slogan ? `"${slogan}"` : ''}
        </p>
        <div className="relative w-full max-w-lg h-32 overflow-hidden">
          <div className="absolute inset-x-0 bottom-8 h-1 road-lines animate-[move-road_1s_linear_infinite]"></div>
          <div className="absolute inset-0 flex items-center justify-center animate-[move-truck_4s_ease-in-out_infinite]">
            <div className="text-primary">
                <Truck className="w-20 h-20 -scale-x-100" stroke="currentColor" />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full text-center pb-8 px-4 h-8">
        {/* Placeholder for footer content if needed in the future */}
      </div>
    </div>
  );
}
