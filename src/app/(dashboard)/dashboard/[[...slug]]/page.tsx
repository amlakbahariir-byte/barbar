
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackagePlus, List, Map as MapIcon, ArrowLeft, Package, LocateFixed, ArrowRight, MapPin, RefreshCw, MessageSquareQuote } from 'lucide-react';
import { ShipmentCard } from '@/components/shipment-card';
import { getMyShipments, Shipment } from '@/lib/data';
import { useEffect, useState } from 'react';
import { ShipmentListPage } from '@/components/shipment-list-page';
import NewRequestPage from '../../requests/new/page';
import RequestDetailsPage from '../../requests/[id]/page';
import ProfilePage from '../../profile/page';
import TransactionsPage from '../../transactions/page';
import { MapView } from '@/components/map-view';
import { Separator } from '@/components/ui/separator';
import { slogans } from '@/lib/slogans';
import { Skeleton } from '@/components/ui/skeleton';

function ShipperDashboard({ navigate, shipments, isLoading }: { navigate: (path: string) => void, shipments: Shipment[], isLoading: boolean }) {
  const recentShipments = shipments.slice(0, 2);
  const pendingCount = shipments.filter(s => s.status === 'pending').length;
  const inTransitCount = shipments.filter(s => s.status === 'in_transit').length;
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;

  return (
    <div className="space-y-6">
      <Card className="bg-primary text-primary-foreground border-0 animate-in fade-in-0 slide-in-from-top-4 duration-500 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">داشبورد شما</CardTitle>
          <CardDescription className="text-primary-foreground/80">خلاصه وضعیت درخواست‌های شما</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-primary-foreground/10 p-3 rounded-lg">
                  <p className="text-3xl font-bold">{pendingCount.toLocaleString('fa-IR')}</p>
                  <p className="text-sm text-primary-foreground/80">در انتظار</p>
              </div>
              <div className="bg-primary-foreground/10 p-3 rounded-lg">
                  <p className="text-3xl font-bold">{inTransitCount.toLocaleString('fa-IR')}</p>
                  <p className="text-sm text-primary-foreground/80">در حال حمل</p>
              </div>
              <div className="bg-primary-foreground/10 p-3 rounded-lg">
                  <p className="text-3xl font-bold">{deliveredCount.toLocaleString('fa-IR')}</p>
                  <p className="text-sm text-primary-foreground/80">تحویل شده</p>
              </div>
            </div>
             <Button size="lg" variant="secondary" onClick={() => navigate('/dashboard/requests/new')}>
              <PackagePlus className="ml-2 h-5 w-5" />
              ایجاد درخواست جدید
            </Button>
        </CardContent>
      </Card>
      
      <div className="animate-in fade-in-0 slide-in-from-top-8 duration-500 delay-200">
        <h2 className="text-2xl font-bold mb-4">درخواست‌های اخیر شما</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : recentShipments.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {recentShipments.map((shipment, index) => (
                <div key={shipment.id} className="animate-in fade-in-0 slide-in-from-top-12 duration-500" style={{ animationDelay: `${index * 150 + 300}ms`, animationFillMode: 'backwards' }}>
                  <ShipmentCard shipment={shipment} role="shipper" navigate={navigate} />
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => navigate('/dashboard/requests/my')}>
                مشاهده همه درخواست‌ها
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
           <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">هنوز درخواستی ثبت نکرده‌اید</h3>
                <p className="mt-2 text-sm text-muted-foreground">با کلیک بر روی دکمه "ایجاد درخواست جدید"، اولین بار خود را ارسال کنید.</p>
            </div>
        )}
      </div>
    </div>
  );
}

function DriverDashboard({ navigate, shipments, isLoading }: { navigate: (path: string) => void, shipments: Shipment[], isLoading: boolean }) {
    const [currentLocation, setCurrentLocation] = useState("در حال خواندن موقعیت...");
    const [slogan, setSlogan] = useState('');

    useEffect(() => {
        const storedLocation = localStorage.getItem('driverLocation');
        if (storedLocation) {
            setCurrentLocation(storedLocation);
        } else {
            setCurrentLocation("تهران، میدان آزادی");
        }
    }, []);

    useEffect(() => {
        const getNewSlogan = () => {
            const randomIndex = Math.floor(Math.random() * slogans.length);
            setSlogan(slogans[randomIndex]);
        };

        getNewSlogan(); // Initial slogan
        const intervalId = setInterval(getNewSlogan, 5000); // Change slogan every 5 seconds

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);


  return (
    <div className="space-y-6">
        <Card className="border-primary/50 bg-gradient-to-tr from-primary/10 via-background to-background animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <CardContent className="space-y-4 text-center pt-6">
                <p className="font-headline text-2xl h-16 flex items-center justify-center text-foreground/80 transition-opacity duration-500">
                    &quot;{slogan}&quot;
                </p>
            </CardContent>
        </Card>

        <Card className="bg-accent/50 border-accent animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LocateFixed className="text-primary"/> موقعیت مکانی شما</CardTitle>
                <CardDescription>آخرین موقعیت ثبت شده شما برای نمایش به صاحبان بار.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">موقعیت فعلی</p>
                        <p className="font-semibold">{currentLocation}</p>
                    </div>
                </div>
                <Separator />
                <Button className="w-full" onClick={() => navigate('/dashboard/location')}>
                    <MapIcon className="ml-2 h-5 w-5" />
                    تغییر یا به‌روزرسانی موقعیت
                </Button>
            </CardContent>
        </Card>

        <div className="animate-in fade-in-0 slide-in-from-top-8 duration-500 delay-200">
            <h1 className="text-3xl font-bold">درخواست‌های بار نزدیک شما</h1>
            <p className="text-muted-foreground mt-1">بر اساس آخرین موقعیت مکانی ثبت شده شما.</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {isLoading ? (
                    Array.from({length: 3}).map((_, index) => <Skeleton key={index} className="h-64 w-full" />)
                ) : shipments.filter(s => s.status === 'pending').slice(0, 3).map((shipment, index) => (
                    <div key={shipment.id} className="animate-in fade-in-0 slide-in-from-top-12 duration-500" style={{ animationDelay: `${index * 100 + 200}ms`, animationFillMode: 'backwards' }}>
                        <ShipmentCard shipment={shipment} role="driver" navigate={navigate} />
                    </div>
                ))}
            </div>
            {shipments.filter(s => s.status === 'pending').length > 3 && (
                <div className="mt-4 text-center">
                    <Button variant="link" onClick={() => navigate('/dashboard/requests/available')}>
                        مشاهده همه درخواست‌ها
                        <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    </div>
  );
}

// A simple component to render the correct page based on the slug
const PageRenderer = ({ slug, role, navigate }: { slug: string[], role: 'shipper' | 'driver', navigate: (path: string) => void }) => {
  const page = slug[0] || 'home';
  const subPage = slug[1];
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (role) {
      const fetchShipments = async () => {
        setIsLoading(true);
        let shipmentType: 'all' | 'available' | 'accepted' = 'all';
        if (role === 'driver') {
          if (page === 'home' || subPage === 'available') shipmentType = 'available';
          else if (subPage === 'my-shipments') shipmentType = 'accepted';
        }
        
        const data = await getMyShipments(role, shipmentType);
        setShipments(data);
        setIsLoading(false);
      };
      fetchShipments();
    }
  }, [role, page, subPage]);

  if (page === 'profile') {
    return <ProfilePage />;
  }

  if (page === 'transactions') {
    return <TransactionsPage />;
  }
  
  if (page === 'location' && role === 'driver') {
      return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="p-2 rounded-md hover:bg-accent">
                    <ArrowRight className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">تنظیم موقعیت مکانی</h1>
                    <p className="text-muted-foreground">مکان خود را روی نقشه مشخص و تایید کنید.</p>
                </div>
            </div>
            <MapView onConfirm={() => navigate('/dashboard')} />
        </div>
      );
  }

  if (page === 'requests') {
    if (subPage === 'new') {
      return <NewRequestPage />;
    }
    if (subPage === 'my' && role === 'shipper') {
      return <ShipmentListPage 
        title="درخواست‌های من" 
        description="در این صفحه تمام درخواست‌های حمل بار خود را مشاهده و مدیریت کنید." 
        shipments={shipments} 
        isLoading={isLoading}
        role={role} 
        navigate={navigate} 
      />;
    }
    if (subPage === 'available' && role === 'driver') {
      return <ShipmentListPage 
        title="درخواست‌های بار موجود" 
        description="در این صفحه بارهای موجود در سراسر کشور را مشاهده کرده و پیشنهاد خود را ثبت کنید." 
        shipments={shipments}
        isLoading={isLoading} 
        role={role} 
        navigate={navigate} 
      />;
    }
    if (subPage === 'my-shipments' && role === 'driver') {
      return <ShipmentListPage 
        title="بارهای من" 
        description="در این صفحه بارهایی که پذیرفته‌اید و در حال حمل آن‌ها هستید را مشاهده کنید." 
        shipments={shipments}
        isLoading={isLoading} 
        role={role} 
        navigate={navigate} 
      />;
    }
    // This handles /requests/[id]
    if (subPage && !['new', 'my', 'available', 'my-shipments'].includes(subPage)) {
      return <RequestDetailsPage />;
    }
  }

  // Fallback to the main dashboard content
  if (role === 'shipper') {
    return <ShipperDashboard navigate={navigate} shipments={shipments} isLoading={isLoading} />;
  }
  return <DriverDashboard navigate={navigate} shipments={shipments} isLoading={isLoading} />;
};


export default function DashboardPage({ _navigate }: { _navigate?: (path: string) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Correctly derive slug from pathname for client components
  const slug = pathname.replace('/dashboard', '').split('/').filter(Boolean);
  
  const navigate = (path: string) => {
    if (path === pathname) return;
    router.push(path);
  };


  useEffect(() => {
    // This effect runs only on the client, ensuring localStorage is available.
    setIsClient(true);
    const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);
  
  if (!isClient) {
    // Render a loading state or null on the server and initial client render
    return <div>در حال بارگذاری...</div>;
  }
  
  // This check ensures we don't render a page for a role that hasn't been determined yet.
  if (!role) {
    return <div>در حال بارگذاری نقش کاربری...</div>;
  }

  // Pass the necessary props to the renderer
  return <PageRenderer slug={slug} role={role} navigate={navigate} />;
}
