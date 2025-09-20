
'use client';

import { useEffect, useState } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';
import { applyTheme } from '../theme-switcher';

export function LoaderWithSlogan() {
  // Start with a random index to avoid showing the same slogan on every load.
  const [sloganIndex, setSloganIndex] = useState(() => Math.floor(Math.random() * slogans.length));

  useEffect(() => {
    // This effect runs only on the client side, after hydration.
    // It's responsible for setting the theme and starting the slogan rotation.
    const savedThemeName = localStorage.getItem('app-theme') || 'Violet';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    
    // Apply the theme immediately on client load
    applyTheme(savedThemeName, savedSaturation);
    
    // Set up an interval to cycle through slogans
    const sloganInterval = setInterval(() => {
      setSloganIndex(prevIndex => (prevIndex + 1) % slogans.length);
    }, 4000); // Change slogan every 4 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(sloganInterval);

  }, []);
  
  // The loader is always rendered. The useEffect above will handle applying the correct
  // theme colors and updating the slogan as soon as the component mounts on the client.
  return <AnimatedTruckLoader slogan={slogans[sloganIndex]} sloganKey={sloganIndex} />;
}
