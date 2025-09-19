
'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { BottomNavbar } from '@/components/layout/bottom-navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardPage from './dashboard/page';
import NewRequestPage from './requests/new/page';
import RequestDetailsPage from './requests/[id]/page';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { Loader2 } from 'lucide-react';
import type { Auth, User } from 'firebase/auth';

export type DashboardPageProps = {
  role: 'shipper' | 'driver' | null;
  isClient: boolean;
  navigate: (path: string) => void;
  path: string;
};

function MyRequestsPage() {
    return <div>درخواست های من</div>
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  const [path, setPath] = useState('');
  const [animationKey, setAnimationKey] = useState(0);

  const [user, loading, error] = useAuthState(auth as Auth);

  useEffect(() => {
    // If not loading and no user is authenticated, redirect to home.
    if (!loading && !user) {
      router.push('/');
      return;
    }

    // If user is authenticated, get their role from localStorage.
    if (user) {
      const userRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
      if (!userRole) {
        // If role is missing, something is wrong, redirect to home to re-auth.
        router.push('/');
        return;
      }
      setRole(userRole);
    }
    
    const handlePathChange = () => {
        const currentPath = window.location.pathname;
        setPath(currentPath);
        setAnimationKey(prevKey => prevKey + 1);
    };
    handlePathChange();
    
    // Listen for custom location change event
    const onLocationChange = () => handlePathChange();
    window.addEventListener('locationchange', onLocationChange);

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePathChange);

    return () => {
        window.removeEventListener('locationchange', onLocationChange);
        window.removeEventListener('popstate', handlePathChange);
    };
  }, [user, loading, router]);


  const navigate = (newPath: string) => {
    if (newPath === window.location.pathname) return;
    window.history.pushState({}, '', newPath);
    // Dispatch a custom event to notify the layout of the path change
    window.dispatchEvent(new Event('locationchange'));
  };
  
  const renderContent = () => {
    const pageProps: DashboardPageProps = { role, isClient: true, navigate, path };
    
    if (path.startsWith('/requests/new')) {
      return <NewRequestPage {...pageProps} />;
    }
    if (path.startsWith('/requests/my')) {
        return <MyRequestsPage />;
    }
    if (path.startsWith('/requests/')) {
      return <RequestDetailsPage {...pageProps} />;
    }
    return <DashboardPage {...pageProps} />;
  };


  if (loading || !user || !role) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar navigate={navigate} />
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-hidden">
           <div key={animationKey} className="animate-in fade-in duration-500">
             {renderContent()}
           </div>
        </main>
        {isMobile && <BottomNavbar navigate={navigate} />}
      </SidebarInset>
    </SidebarProvider>
  );
}
