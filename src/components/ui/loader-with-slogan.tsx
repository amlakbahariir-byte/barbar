
'use client';

import { useEffect, useState } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';
import { applyTheme } from '../theme-switcher';

export function LoaderWithSlogan() {
  const [sloganIndex, setSloganIndex] = useState(0);

  useEffect(() => {
    // This effect runs only on the client side, after hydration.
    // It's responsible for setting the theme and starting the slogan rotation.
    const savedThemeName = localStorage.getItem('app-theme') || 'Rose';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    
    // Apply the theme immediately on client load
    applyTheme(savedThemeName, savedSaturation);
    
    // Set an initial random slogan
    setSloganIndex(Math.floor(Math.random() * slogans.length));

    // Set up an interval to change the slogan every 4 seconds
    const sloganInterval = setInterval(() => {
      setSloganIndex(prevIndex => (prevIndex + 1) % slogans.length);
    }, 4000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(sloganInterval);

  }, []);
  
  // The loader is always rendered. The useEffect above will handle applying the correct
  // theme colors and updating the slogan as soon as the component mounts on the client.
  return <AnimatedTruckLoader slogan={slogans[sloganIndex]} sloganKey={sloganIndex} />;
}
