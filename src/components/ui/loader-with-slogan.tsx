
'use client';

import { useEffect, useState } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';
import { applyTheme } from '../theme-switcher';

export function LoaderWithSlogan() {
  const [currentSlogan, setCurrentSlogan] = useState('');

  useEffect(() => {
    // This effect runs only on the client side, after hydration.
    // It's responsible for setting the theme and a random slogan.
    const savedThemeName = localStorage.getItem('app-theme') || 'Rose';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    
    // Apply the theme immediately on client load
    applyTheme(savedThemeName, savedSaturation);
    
    // Set a random slogan
    setCurrentSlogan(slogans[Math.floor(Math.random() * slogans.length)]);

  }, []);
  
  // The loader is always rendered. The useEffect above will handle applying the correct
  // theme colors as soon as the component mounts on the client.
  return <AnimatedTruckLoader slogan={currentSlogan} />;
}
