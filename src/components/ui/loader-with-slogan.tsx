
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
  const [api, setApi] = React.useState<CarouselApi>();
  const [isClient, setIsClient] = React.useState(false);
  const plugin = useRef<any>(null);

  useEffect(() => {
    // This effect runs only on the client side, after the initial render.
    setIsClient(true);
    
    // Apply theme from localStorage on initial client load
    const savedThemeName = localStorage.getItem('app-theme') || 'Violet';
    const savedSaturation = parseFloat(
      localStorage.getItem('app-saturation') || '1'
    );
    applyTheme(savedThemeName, savedSaturation);

    // Initialize plugin on client side
    plugin.current = Autoplay({
      delay: 1000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    });
    
    // Force a re-render to apply the plugin if the api is already set.
    // This is a workaround for embla-carousel's plugin system with server components.
    if(api) {
        api.reInit();
    }

  }, [api]);

  if (!isClient) {
    // On the server or initial client render, return a placeholder to avoid hydration mismatch.
    return <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden p-4"></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden p-4">
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <AnimatedTruckLoader />
        <div className="mt-8 h-16 flex items-center justify-center w-full max-w-2xl">
          <Carousel
            // Adding a key ensures re-initialization when plugin ref changes.
            key={plugin.current ? 'autoplay-ready' : 'no-autoplay'}
            plugins={plugin.current ? [plugin.current] : []}
            setApi={setApi}
            className="w-full"
            onMouseEnter={() => plugin.current?.stop()}
            onMouseLeave={() => plugin.current?.reset()}
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
