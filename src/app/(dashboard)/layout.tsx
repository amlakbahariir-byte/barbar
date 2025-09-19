
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
    // This effect handles authentication state changes.
    // It waits until firebase auth state is resolved.
    if (!loading) {
      const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
      
      // If no user is authenticated via Firebase OR no role is stored in localStorage,
      // then the user is not properly logged in. Redirect to the login page.
      if (!user || !storedRole) {
          // Clear any potentially lingering state before redirecting.
          auth.signOut().finally(() => {
              localStorage.removeItem('userRole');
              router.replace('/');
          });
      } else {
        // If a user session exists and a role is stored, set the role in the component's state.
        setRole(storedRole);
      }
    }
  }, [user, loading, router]);


  const navigate = (newPath: string) => {
    if (newPath === pathname) return;
    router.push(newPath);
  };
  
  // While auth state is loading OR if the user is valid but the role hasn't been set in state yet,
  // show a loader. This prevents a flash of the dashboard before a potential redirect.
  if (loading || !role) {
    return <AnimatedTruckLoader />;
  }
  
  // If we've passed the loading stage and have a role, render the dashboard.
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
