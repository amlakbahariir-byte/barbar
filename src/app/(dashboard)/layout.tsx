'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-start border-b bg-background/80 p-4 backdrop-blur-sm md:hidden">
          <SidebarTrigger />
          <h2 className="mr-4 text-lg font-semibold">باربر ایرانی</h2>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
