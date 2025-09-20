
'use client';

import { Truck } from 'lucide-react';

export function AnimatedTruckLoader() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full text-center px-4">
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Pulsing background circles */}
        <div className="absolute w-full h-full rounded-full bg-primary/10 animate-pulse delay-200"></div>
        <div className="absolute w-3/4 h-3/4 rounded-full bg-primary/20 animate-pulse"></div>
        
        {/* Truck Icon */}
        <div className="relative z-10 p-5 bg-background rounded-full shadow-2xl">
          <Truck className="w-16 h-16 text-primary" />
        </div>

        {/* Orbiting dots */}
        <div className="absolute w-full h-full animate-spin [animation-duration:8s] [animation-timing-function:linear]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/50 rounded-full"></div>
            <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-2 h-2 bg-primary/30 rounded-full"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary/40 rounded-full"></div>
        </div>
      </div>
       <h1 className="text-5xl font-headline tracking-tight text-foreground mt-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
            باربر ایرانی
        </h1>
    </div>
  );
}
