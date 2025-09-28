
'use client';

import { Truck } from 'lucide-react';

export function AnimatedTruckLoader() {
  return (
    <div className="relative w-full h-40 overflow-hidden">
      {/* Truck */}
      <div className="absolute bottom-10 left-0 animate-move-truck" style={{ animationDuration: '10s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' }}>
        <Truck className="w-24 h-24 text-foreground -scale-x-100" />
      </div>
      
      {/* Road */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-foreground/80" />
      
      {/* Road lines */}
      <div className="absolute bottom-6 left-0 w-[200%] h-2 overflow-hidden">
        <div className="w-full h-full animate-move-lines" style={{ animationDuration: '2s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' }}>
           <div 
             className="w-full h-full"
             style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 100px, white 100px, white 200px)'
             }}
           />
        </div>
      </div>
    </div>
  );
}
