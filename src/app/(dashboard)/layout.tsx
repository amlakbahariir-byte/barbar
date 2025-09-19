'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { BottomNavbar } from '@/components/layout/bottom-navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      router.push('/');
    }
  }, [router]);

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
        {isMobile && <BottomNavbar />}
      </SidebarInset>
    </SidebarProvider>
  );
}
