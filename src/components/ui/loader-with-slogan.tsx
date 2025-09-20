
'use client';

import { useEffect, useState } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';

export function LoaderWithSlogan() {
  const [currentSlogan, setCurrentSlogan] = useState('');

  useEffect(() => {
    // This effect runs only on the client side, after hydration.
    // This ensures that Math.random() doesn't cause a hydration mismatch.
    setCurrentSlogan(slogans[Math.floor(Math.random() * slogans.length)]);
  }, []);

  return <AnimatedTruckLoader slogan={currentSlogan} />;
}
