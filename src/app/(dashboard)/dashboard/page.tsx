'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackagePlus, List, Map as MapIcon, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { ShipmentCard } from '@/components/shipment-card';
import { shipments } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function ShipperDashboard() {
  const router = useRouter();
  const myShipments = shipments.slice(0, 2);

  return (
    <div className="space-y-6">
      <Card className="bg-primary/10 border-primary">
        <CardHeader>
          <CardTitle>سفر بار خود را شروع کنید</CardTitle>
          <CardDescription>یک درخواست حمل بار جدید ایجاد کنید و بهترین پیشنهادها را از رانندگان معتبر دریافت کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" onClick={() => router.push('/requests/new')}>
            <PackagePlus className="ml-2 h-5 w-5" />
            ایجاد درخواست جدید
          </Button>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">درخواست‌های اخیر شما</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {myShipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} role="shipper" />
          ))}
        </div>
         <div className="mt-4 text-center">
            <Button variant="link" onClick={() => router.push('/requests/my')}>
                مشاهده همه درخواست‌ها
                <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}

function DriverDashboard() {
  const mapImage = PlaceHolderImages.find(p => p.id === 'map-view');

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">درخواست‌های بار نزدیک شما</h1>
        <Tabs defaultValue="list-view">
            <div className="flex justify-between items-center">
                <TabsList>
                    <TabsTrigger value="list-view"><List className="ml-2 h-4 w-4" />نمای لیست</TabsTrigger>
                    <TabsTrigger value="map-view"><MapIcon className="ml-2 h-4 w-4" />نمای نقشه</TabsTrigger>
                </TabsList>
                {/* Add sorting options here if needed */}
            </div>
            <TabsContent value="list-view" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {shipments.filter(s => s.status === 'pending').map((shipment) => (
                        <ShipmentCard key={shipment.id} shipment={shipment} role="driver" />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="map-view" className="mt-6">
                <Card>
                    <CardContent className="p-2">
                        {mapImage && (
                             <Image
                                src={mapImage.imageUrl}
                                alt={mapImage.description}
                                data-ai-hint={mapImage.imageHint}
                                width={1200}
                                height={800}
                                className="w-full h-auto rounded-md aspect-[16/9] object-cover"
                            />
                        )}
                       
                    </CardContent>
                     <CardHeader>
                        <CardTitle>نمای نقشه</CardTitle>
                        <CardDescription>در این قسمت، یک نقشه از ارائه دهنده ایرانی (مانند نشان) برای نمایش درخواست‌های بار بر روی نقشه قرار می‌گیرد.</CardDescription>
                    </CardHeader>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    setRole(storedRole);
  }, []);

  if (!role) {
    return <div>در حال بارگذاری...</div>;
  }

  return role === 'shipper' ? <ShipperDashboard /> : <DriverDashboard />;
}
