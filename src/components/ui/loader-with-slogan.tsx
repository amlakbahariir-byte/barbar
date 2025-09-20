
'use client';

import { useEffect, useRef } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';
import { applyTheme } from '../theme-switcher';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";

export function LoaderWithSlogan() {
  const plugin = useRef(
      Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  useEffect(() => {
    // This effect runs only on the client side, after hydration.
    // It's responsible for setting the theme.
    const savedThemeName = localStorage.getItem('app-theme') || 'Violet';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    
    // Apply the theme immediately on client load
    applyTheme(savedThemeName, savedSaturation);
  }, []);
  

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden p-4">
        <div className="flex-grow flex flex-col items-center justify-center w-full">
            <AnimatedTruckLoader />
            <Carousel 
                plugins={[plugin.current]}
                className="w-full max-w-md mt-8"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{ loop: true }}
            >
                <CarouselContent>
                    {slogans.map((slogan, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                            <p className="text-muted-foreground text-lg text-center h-full">
                                "{slogan}"
                            </p>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
         <div className="w-full text-center pb-8 px-4 h-8">
            {/* Placeholder for footer content if needed in the future */}
        </div>
      </div>
  );
}
