
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
    if (!loading) { // Wait until the loading is finished
      const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
      
      // If no user is authenticated OR no role is stored, redirect to login page.
      if (!user || !storedRole) {
        // Sign out to clear any partial state before redirecting
        auth.signOut().finally(() => {
            localStorage.removeItem('userRole');
            router.replace('/');
        });
      } else {
        // If user is authenticated and role exists, set the role in state.
        setRole(storedRole);
      }
    }
  }, [user, loading, router]);


  const navigate = (newPath: string) => {
    if (newPath === pathname) return;
    router.push(newPath);
  };
  
  // Show a loader while authentication is in progress or role is not yet set.
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
