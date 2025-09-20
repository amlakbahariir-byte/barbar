
'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { BottomNavbar } from '@/components/layout/bottom-navbar';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { auth } from '@/lib/firebase/config';
import { LoaderWithSlogan } from '@/components/ui/loader-with-slogan';

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
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // This effect handles authentication state changes.
    // It runs only on the client side.
    const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    
    // If no role is stored in localStorage,
    // then the user is not properly logged in. Redirect to the login page.
    if (!storedRole) {
        auth.signOut().finally(() => {
            router.replace('/');
        });
    } else {
      // If a role is stored, set it in the component's state and finish checking.
      setRole(storedRole);
      setIsChecking(false);
    }
  }, [router]);


  const navigate = (newPath: string) => {
    if (newPath === pathname) return;
    router.push(newPath);
  };
  
  // While we are checking for the role, show a loader.
  // This prevents a flash of the dashboard before a potential redirect.
  if (isChecking) {
    return <LoaderWithSlogan />;
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

    

    
