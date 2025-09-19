
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
  const [path, setPath] = useState('/dashboard');
  const [animationKey, setAnimationKey] = useState(0);
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    setIsClient(true);
    const userRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;

    if (loading) return; // Wait until auth state is loaded

    if (!user || !userRole) {
      router.push('/');
    } else {
      setRole(userRole);
    }
     // Set initial path from URL, and listen for changes
    const handlePathChange = () => {
        const currentPath = window.location.pathname;
        setPath(currentPath);
        setAnimationKey(prevKey => prevKey + 1); // Change key to re-trigger animation
    };
    handlePathChange();
    window.addEventListener('popstate', handlePathChange);
    return () => {
        window.removeEventListener('popstate', handlePathChange);
    };
  }, [router, user, loading]);

  const navigate = (newPath: string) => {
    if (newPath === path) return;
    window.history.pushState({}, '', newPath);
    setPath(newPath);
    setAnimationKey(prevKey => prevKey + 1); // Change key to re-trigger animation
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


  if (loading || !isClient || !user || !role) {
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
