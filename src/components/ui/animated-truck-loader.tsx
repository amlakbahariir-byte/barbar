
'use client';

import { Truck } from 'lucide-react';

export function AnimatedTruckLoader() {
  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      {/* Pulsing background circles */}
      <div className="absolute w-full h-full rounded-full bg-primary/20 animate-ping opacity-75"></div>
      <div className="absolute w-3/4 h-3/4 rounded-full bg-primary/20 animate-ping [animation-delay:0.5s]"></div>

      {/* Main icon container */}
      <div className="relative flex items-center justify-center w-24 h-24 bg-background rounded-full shadow-lg">
        <Truck className="w-12 h-12 text-primary animate-pulse" />
      </div>
    </div>
  );
}
