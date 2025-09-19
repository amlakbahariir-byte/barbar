
'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { BottomNavbar } from '@/components/layout/bottom-navbar';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { AnimatedTruckLoader } from '@/components/ui/animated-truck-loader';

export type DashboardPageProps = {
  role: 'shipper' | 'driver' | null;
  navigate: (path: string) => void;
  path: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [user, loading, error] = useAuthState(auth);
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  
  useEffect(() => {
    // Wait until the loading is finished
    if (!loading) {
      // If no user is authenticated, redirect to login page
      if (!user) {
        router.replace('/');
      } else {
        // If user is authenticated, check for role
        const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
        if (storedRole) {
          setRole(storedRole);
        } else {
          // If role is not set, maybe redirect to a role selection page or handle it
           auth.signOut(); // Sign out if role is missing
           router.replace('/');
        }
      }
    }
  }, [user, loading, router]);


  const navigate = (newPath: string) => {
    if (newPath === pathname) return;
    router.push(newPath);
  };
  
  if (loading || !user || !role) {
    return <AnimatedTruckLoader />;
  }
  
  return (
    <SidebarProvider>
      <AppSidebar navigate={navigate} />
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
           <div key={pathname} className="animate-in fade-in duration-500">
              {children}
           </div>
        </main>
        {isMobile && <BottomNavbar navigate={navigate} />}
      </SidebarInset>
    </SidebarProvider>
  );
}
