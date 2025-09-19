'use client';

import { Home, Package, Truck, User, LogOut, PackagePlus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const ShipperMenu = [
  { href: '/dashboard', label: 'داشبورد', icon: Home },
  { href: '/requests/my', label: 'درخواست‌ها', icon: Package },
  { href: '/requests/new', label: 'جدید', icon: PackagePlus },
  { href: '/profile', label: 'پروفایل', icon: User },
];

const DriverMenu = [
  { href: '/dashboard', label: 'داشبورد', icon: Home },
  { href: '/requests/available', label: 'درخواست‌ها', icon: Package },
  { href: '/requests/my-shipments', label: 'بارهای من', icon: Truck },
  { href: '/profile', label: 'پروفایل', icon: User },
];

export function BottomNavbar({ navigate }: { navigate: (path: string) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    setRole(storedRole);
  }, []);

  const menu = role === 'shipper' ? ShipperMenu : DriverMenu;

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/');
  };

  if (!role) return null;

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {menu.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => navigate(item.href)}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 hover:bg-muted group',
              pathname === item.href ? 'text-primary' : 'text-muted-foreground'
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
