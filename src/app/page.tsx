
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedTruckLoader } from '@/components/ui/animated-truck-loader';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return <AnimatedTruckLoader />;
}
