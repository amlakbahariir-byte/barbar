
'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { BottomNavbar } from '@/components/layout/bottom-navbar';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
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

  const [user, loading, error] = useAuthState(auth);
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    if (!loading) {
      if (!user) {
        router.push('/');
      } else {
        const userRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
        if (!userRole) {
           router.push('/');
        } else {
          setRole(userRole);
        }
      }
    }
  }, [user, loading, router]);


  const navigate = (newPath: string) => {
    if (newPath === pathname) return;
    router.push(newPath);
  };
  
  if (loading || !isClient || !role) {
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
