
'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';
import { applyTheme } from '../theme-switcher';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export function LoaderWithSlogan() {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useEffect(() => {
    // Apply theme from localStorage on initial client load.
    // This needs to be in useEffect to avoid SSR issues.
    const savedThemeName = localStorage.getItem('app-theme') || 'Violet';
    const savedSaturation = parseFloat(
      localStorage.getItem('app-saturation') || '1'
    );
    applyTheme(savedThemeName, savedSaturation);
  }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden p-4">
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <AnimatedTruckLoader />
        <div className="mt-8 h-16 flex items-center justify-center w-full max-w-2xl">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              align: 'center',
              loop: true,
            }}
          >
            <CarouselContent>
              {slogans.map((slogan, index) => (
                <CarouselItem key={index}>
                  <p className="text-muted-foreground text-lg text-center">
                    &quot;{slogan}&quot;
                  </p>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
      <div className="w-full text-center pb-8 px-4 h-8">
        {/* Placeholder for footer content if needed in the future */}
      </div>
    </div>
  );
}
