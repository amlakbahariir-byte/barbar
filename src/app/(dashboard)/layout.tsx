
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
import type { Auth } from 'firebase/auth';

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
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  const [path, setPath] = useState('');
  const [animationKey, setAnimationKey] = useState(0);
  const [user, loading, error] = useAuthState(auth as Auth);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (loading) {
      return;
    }
    
    const userRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    
    if (!user || !userRole) {
      router.push('/');
      return;
    }
    
    setRole(userRole);

    const handlePathChange = () => {
        const currentPath = window.location.pathname;
        setPath(currentPath);
        setAnimationKey(prevKey => prevKey + 1);
    };
    handlePathChange();
    
    const onLocationChange = () => handlePathChange();
    window.addEventListener('locationchange', onLocationChange);
    window.addEventListener('popstate', handlePathChange);

    return () => {
        window.removeEventListener('locationchange', onLocationChange);
        window.removeEventListener('popstate', handlePathChange);
    };
  }, [isClient, router, user, loading]);

  const navigate = (newPath: string) => {
    if (newPath === window.location.pathname) return;
    window.history.pushState({}, '', newPath);
    window.dispatchEvent(new Event('locationchange'));
  };
  
  const renderContent = () => {
    const pageProps: DashboardPageProps = { role, isClient, navigate, path };
    
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


  if (loading || !isClient || !auth || !user || !role) {
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
