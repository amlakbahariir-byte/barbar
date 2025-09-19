
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Truck, Home, Package, User, LogOut, PackagePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';

const ShipperMenu = [
  { href: '/dashboard', label: 'داشبورد', icon: Home },
  { href: '/dashboard/requests/my', label: 'درخواست‌های من', icon: Package },
  { href: '/dashboard/requests/new', label: 'درخواست جدید', icon: PackagePlus },
  { href: '/dashboard/profile', label: 'پروفایل', icon: User },
];

const DriverMenu = [
  { href: '/dashboard', label: 'داشبورد', icon: Home },
  { href: '/dashboard/requests/available', label: 'درخواست‌های موجود', icon: Package },
  { href: '/dashboard/requests/my-shipments', label: 'بارهای من', icon: Truck },
  { href: '/dashboard/profile', label: 'پروفایل', icon: User },
];

export function AppSidebar({ navigate }: { navigate: (path: string) => void }) {
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

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('userRole');
    router.push('/');
  };

  return (
    <Sidebar collapsible="icon" side="right" className="hidden md:block bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="h-16 justify-between border-b border-sidebar-border p-2">
        <div className="flex items-center gap-2 p-2">
          <Truck className="size-8 text-primary" />
          <span className="text-lg font-bold">باربر ایرانی</span>
        </div>
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {menu.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                onClick={() => navigate(item.href)}
                isActive={currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href))}
                tooltip={item.label}
              >
                <a>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="خروج">
              <LogOut />
              <span>خروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
