
'use client';

import { useEffect, useRef, useState } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';
import { applyTheme } from '../theme-switcher';
import { cn } from '@/lib/utils';

export function LoaderWithSlogan() {
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Apply theme from localStorage on initial client load
    const savedThemeName = localStorage.getItem('app-theme') || 'Violet';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    applyTheme(savedThemeName, savedSaturation);

    // Set up the slogan animation interval
    const intervalId = setInterval(() => {
      setIsFading(true); // Start fading out
      setTimeout(() => {
        setCurrentSloganIndex((prevIndex) => (prevIndex + 1) % slogans.length);
        setIsFading(false); // Start fading in
      }, 500); // Wait for fade-out to complete
    }, 4000); // Change slogan every 4 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden p-4">
        <div className="flex-grow flex flex-col items-center justify-center w-full">
            <AnimatedTruckLoader />
            <div className="mt-8 h-16 flex items-center justify-center">
                 <p className={cn(
                    "text-muted-foreground text-lg text-center transition-all duration-500",
                    isFading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                 )}>
                    "{slogans[currentSloganIndex]}"
                 </p>
            </div>
        </div>
         <div className="w-full text-center pb-8 px-4 h-8">
            {/* Placeholder for footer content if needed in the future */}
        </div>
      </div>
  );
}
