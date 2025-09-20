
'use client';

import { useEffect, useState } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';
import { applyTheme } from '../theme-switcher';

export function LoaderWithSlogan() {
  const [currentSlogan, setCurrentSlogan] = useState('');
  const [isThemeApplied, setIsThemeApplied] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side, after hydration.
    const savedThemeName = localStorage.getItem('app-theme') || 'Rose';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    const darkMode = document.documentElement.classList.contains('dark');
    
    // Apply the theme immediately
    applyTheme(savedThemeName, savedSaturation);
    
    // Set a random slogan
    setCurrentSlogan(slogans[Math.floor(Math.random() * slogans.length)]);
    
    // Mark theme as applied to trigger render
    setIsThemeApplied(true);

  }, []);
  
  // We don't render the loader until the theme and slogan are ready on the client
  if (!isThemeApplied) {
    return null; // Or a very minimal, unstyled loader
  }

  return <AnimatedTruckLoader slogan={currentSlogan} />;
}
