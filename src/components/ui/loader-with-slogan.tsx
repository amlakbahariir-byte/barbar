
'use client';

import { useEffect, useState } from 'react';
import { slogans } from '@/lib/slogans';
import { AnimatedTruckLoader } from './animated-truck-loader';

export function LoaderWithSlogan() {
  const [currentSlogan, setCurrentSlogan] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side, after hydration.
    // This ensures that Math.random() doesn't cause a hydration mismatch.
    setIsClient(true);
    setCurrentSlogan(slogans[Math.floor(Math.random() * slogans.length)]);
  }, []);
  
  // We don't render anything until we are on the client and have a slogan
  if (!isClient) {
    return <AnimatedTruckLoader slogan="" />;
  }

  return <AnimatedTruckLoader slogan={currentSlogan} />;
}
