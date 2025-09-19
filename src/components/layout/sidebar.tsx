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
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ShipperMenu = [
  { href: '/dashboard', label: 'داشبورد', icon: Home },
  { href: '/requests/my', label: 'درخواست‌های من', icon: Package },
  { href: '/requests/new', label: 'درخواست جدید', icon: PackagePlus },
  { href: '/profile', label: 'پروفایل', icon: User },
];

const DriverMenu = [
  { href: '/dashboard', label: 'داشبورد', icon: Home },
  { href: '/requests/available', label: 'درخواست‌های موجود', icon: Package },
  { href: '/requests/my-shipments', label: 'بارهای من', icon: Truck },
  { href: '/profile', label: 'پروفایل', icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    if (storedRole) {
      setRole(storedRole);
    } else {
      router.push('/');
    }
  }, [router]);

  const menu = role === 'shipper' ? ShipperMenu : DriverMenu;

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/');
  };

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="h-16 justify-between border-b p-2">
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
                onClick={() => router.push(item.href)}
                isActive={pathname === item.href}
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
      <SidebarFooter className="p-2">
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
