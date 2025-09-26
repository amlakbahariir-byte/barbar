
'use client';

import { AppSidebar } from '@/components/layout/sidebar';
import { BottomNavbar } from '@/components/layout/bottom-navbar';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderWithSlogan } from '@/components/ui/loader-with-slogan';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // This effect handles authentication state changes.
    // It runs only on the client side.
    const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    
    // If no role is stored in localStorage,
    // then the user is not properly logged in. Redirect to the login page.
    if (!storedRole) {
        router.replace('/');
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
  // We need to clone the children to pass down the navigate and play props.
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // It's not guaranteed that the child accepts a navigate prop.
      // So we pass it, but let the child component decide if it uses it.
      // This is a common pattern in React.
      // We also rename the prop to avoid potential conflicts with internal component logic.
      return React.cloneElement(child, { _navigate: navigate } as any);
    }
    return child;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 md:p-6 pb-24 md:pb-24 overflow-y-auto">
         <div key={pathname} className="animate-in fade-in-0 slide-in-from-top-4 duration-300">
            {childrenWithProps}
         </div>
      </main>
      <BottomNavbar navigate={navigate} />
    </div>
  );
}
