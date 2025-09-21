
'use client';

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { slogans } from '@/lib/slogans';
import { applyTheme } from '../theme-switcher';
import { cn } from '@/lib/utils';

export function LoaderWithSlogan() {
  const [slogan, setSlogan] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Apply theme from localStorage once on initial client load
  useEffect(() => {
    const savedThemeName = localStorage.getItem('app-theme') || 'Violet';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    applyTheme(savedThemeName, savedSaturation);
  }, []);

  // Effect to cycle through slogans
  useEffect(() => {
    const pickSlogan = () => {
      setIsVisible(false);
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * slogans.length);
        setSlogan(slogans[randomIndex]);
        setIsVisible(true);
      }, 500); // Wait for fade-out
    };

    pickSlogan(); // Initial slogan
    const intervalId = setInterval(pickSlogan, 4000); // Change slogan every 4 seconds

    return () => clearInterval(intervalId);
  }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden p-4">
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <div className="mt-12 h-16 flex items-center justify-center w-full max-w-2xl text-center">
            <p className={cn(
                "text-muted-foreground text-lg transition-opacity duration-500",
                isVisible ? "opacity-100" : "opacity-0"
            )}>
              &quot;{slogan}&quot;
            </p>
        </div>
      </div>
       <div className="w-full text-center pb-8 px-4 h-8">
        {/* Placeholder for footer content if needed in the future */}
      </div>
    </div>
  );
}
