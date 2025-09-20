
'use client';

import { Home, Package, Truck, User, LogOut, PackagePlus, CreditCard, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase/config';


const ShipperMenu = [
  { href: '/dashboard', label: 'داشبورد', icon: Home },
  { href: '/dashboard/requests/my', label: 'درخواست‌ها', icon: Package },
  { href: '/dashboard/requests/new', label: 'جدید', icon: PackagePlus },
  { href: '/dashboard/profile', label: 'پروفایل', icon: User },
];

const DriverMenu = [
  { href: '/dashboard', label: 'داشبورد', icon: Home },
  { href: '/dashboard/requests/available', label: 'بارهای موجود', icon: Package },
  { href: '/dashboard/requests/my-shipments', label: 'بارهای من', icon: Truck },
  { href: '/dashboard/profile', label: 'پروفایل', icon: User },
];

export function BottomNavbar({ navigate }: { navigate: (path: string) => void }) {
  const router = useRouter();
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    setRole(storedRole);
    
    const handlePathChange = () => {
        setCurrentPath(window.location.pathname);
    };
    handlePathChange();
    window.addEventListener('popstate', handlePathChange);
    return () => {
        window.removeEventListener('popstate', handlePathChange);
    };

  }, []);

  const menu = role === 'shipper' ? ShipperMenu : DriverMenu;
  const gridColsClass = role === 'shipper' ? 'grid-cols-5' : 'grid-cols-5';


  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('userRole');
    router.push('/');
  };

  if (!role) return null;

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
      <div className={cn("grid h-full max-w-lg mx-auto font-medium", gridColsClass)}>
        {menu.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => navigate(item.href)}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 hover:bg-muted group',
              (currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href))) ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
         <button
            type="button"
            onClick={handleLogout}
            className="inline-flex flex-col items-center justify-center px-5 text-muted-foreground hover:bg-muted group"
          >
            <LogOut className="w-6 h-6 mb-1" />
            <span className="text-xs">خروج</span>
          </button>
      </div>
    </div>
  );
}
