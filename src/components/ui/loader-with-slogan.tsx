
'use client';

import { useEffect, useState } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';
import { applyTheme } from '../theme-switcher';

export function LoaderWithSlogan() {
  // Initialize with null to prevent server/client mismatch
  const [sloganIndex, setSloganIndex] = useState<number | null>(null);

  useEffect(() => {
    // This effect runs only on the client side, after hydration.
    // It's responsible for setting the theme and starting the slogan rotation.
    const savedThemeName = localStorage.getItem('app-theme') || 'Violet';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    
    // Apply the theme immediately on client load
    applyTheme(savedThemeName, savedSaturation);

    // Set the initial random slogan only on the client
    setSloganIndex(Math.floor(Math.random() * slogans.length));
    
    // Set up an interval to cycle through slogans
    const sloganInterval = setInterval(() => {
      setSloganIndex(prevIndex => (prevIndex !== null ? (prevIndex + 1) % slogans.length : 0));
    }, 4000); // Change slogan every 4 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(sloganInterval);

  }, []);
  
  // Conditionally render the slogan to avoid mismatch during initial render
  const slogan = sloganIndex !== null ? slogans[sloganIndex] : '';
  
  // The loader is always rendered. The useEffect above will handle applying the correct
  // theme colors and updating the slogan as soon as the component mounts on the client.
  return <AnimatedTruckLoader slogan={slogan} sloganKey={sloganIndex ?? 0} />;
}
