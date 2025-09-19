
'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { BottomNavbar } from '@/components/layout/bottom-navbar';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatedTruckLoader } from '@/components/ui/animated-truck-loader';

export type DashboardPageProps = {
  role: 'shipper' | 'driver' | null;
  isClient: boolean;
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

  // Hardcoded role for development
  const role = 'shipper'; 
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    // Set a default role in localStorage for components that might use it
    localStorage.setItem('userRole', role);
  }, [role]);


  const navigate = (newPath: string) => {
    if (newPath === pathname) return;
    router.push(newPath);
  };
  
  if (!isClient) {
    return <AnimatedTruckLoader />;
  }
  
  return (
    <SidebarProvider>
      <AppSidebar navigate={navigate} />
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
           <div key={pathname} className="animate-in fade-in duration-500">
              {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                  // @ts-ignore
                  return React.cloneElement(child, { role, isClient, navigate, path: pathname });
                }
                return child;
              })}
           </div>
        </main>
        {isMobile && <BottomNavbar navigate={navigate} />}
      </SidebarInset>
    </SidebarProvider>
  );
}
