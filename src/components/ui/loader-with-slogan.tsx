
'use client';

import { useEffect, useState } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';
import { applyTheme } from '../theme-switcher';
import { cn } from '@/lib/utils';

export function LoaderWithSlogan() {
  const [slogan, setSlogan] = useState('');

  useEffect(() => {
    // Apply theme from localStorage on initial client load
    const savedThemeName = localStorage.getItem('app-theme') || 'Violet';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    applyTheme(savedThemeName, savedSaturation);

    // Select a random slogan on component mount
    setSlogan(slogans[Math.floor(Math.random() * slogans.length)]);
  }, []);

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden p-4">
        <div className="flex-grow flex flex-col items-center justify-center w-full">
            <AnimatedTruckLoader />
            <div className="mt-8 h-16 flex items-center justify-center">
                 <p className={cn(
                    "text-muted-foreground text-lg text-center transition-all duration-500 animate-in fade-in"
                 )}>
                    {slogan ? `"${slogan}"` : ''}
                 </p>
            </div>
        </div>
         <div className="w-full text-center pb-8 px-4 h-8">
            {/* Placeholder for footer content if needed in the future */}
        </div>
      </div>
  );
}
