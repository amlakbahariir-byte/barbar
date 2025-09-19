'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getShipmentById, Shipment } from '@/lib/data';
import { ArrowRight, Box, Calendar, Check, CircleDollarSign, MapPin, Star, User, Weight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShipmentTracking } from '@/components/shipment-tracking';
import Image from 'next/image';

const statusMap: { [key in Shipment['status']]: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
  pending: { text: 'در انتظار پیشنهاد', variant: 'secondary' },
  accepted: { text: 'قبول شده', variant: 'outline' },
  in_transit: { text: 'در حال حمل', variant: 'default' },
  delivered: { text: 'تحویل شده', variant: 'secondary' },
};

export default function RequestDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);

  useEffect(() => {
    const data = getShipmentById(id);
    if (data) {
      setShipment(data as Shipment);
    }
    const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    setRole(storedRole);
  }, [id]);

  const handleAcceptBid = () => {
    toast({
      title: 'پیشنهاد پذیرفته شد',
      description: 'راننده انتخاب شد. منتظر تماس راننده برای هماهنگی باشید.',
    });
    router.push('/dashboard');
  }

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
     toast({
      title: 'پیشنهاد شما ثبت شد',
      description: 'پیشنهاد قیمت شما برای این بار با موفقیت ثبت شد.',
    });
    router.push('/dashboard');
  }

  if (!shipment || !role) {
    return <div>در حال بارگذاری جزئیات...</div>;
  }

  const isShipper = role === 'shipper';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent">
            <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold">جزئیات درخواست: {shipment.id}</h1>
         <Badge variant={statusMap[shipment.status].variant} className="mr-auto">{statusMap[shipment.status].text}</Badge>
      </div>

      {isShipper && (shipment.status === 'in_transit' || shipment.status === 'accepted') && shipment.acceptedDriver && (
        <ShipmentTracking shipment={shipment} />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>اطلاعات محموله</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-lg">
                    <div className="flex items-center gap-2 font-semibold">
                        <MapPin className="text-primary"/> 
                        <span>{shipment.origin}</span>
                    </div>
                     <ArrowRight className="h-5 w-5 text-muted-foreground"/>
                     <div className="flex items-center gap-2 font-semibold">
                        <MapPin className="text-accent"/>
                        <span>{shipment.destination}</span>
                    </div>
                </div>
                 <Separator/>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground"/><span>تاریخ: {shipment.date}</span></div>
                    <div className="flex items-center gap-2"><Weight className="h-4 w-4 text-muted-foreground"/><span>وزن: {shipment.weight.toLocaleString()} کیلوگرم</span></div>
                    <div className="flex items-center gap-2"><Box className="h-4 w-4 text-muted-foreground"/><span>حجم: {shipment.volume} متر مکعب</span></div>
                </div>
                {shipment.description && <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">{shipment.description}</p>}
            </CardContent>
        </Card>

        {/* Bidding Section */}
        <div className="space-y-4">
            {isShipper && shipment.status === 'pending' && (
                <Card>
                    <CardHeader><CardTitle>پیشنهادهای رانندگان ({shipment.bids?.length || 0})</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {shipment.bids && shipment.bids.length > 0 ? shipment.bids.map(bid => (
                            <div key={bid.id} className="border p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Image src={bid.driver.avatar} alt={bid.driver.name} width={40} height={40} className="rounded-full" />
                                    <div>
                                        <p className="font-semibold">{bid.driver.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center"><Star className="w-3 h-3 ml-1 fill-amber-400 text-amber-500"/>{bid.driver.rating} ({bid.driver.vehicle})</p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-primary">{bid.amount.toLocaleString()} تومان</p>
                                    <Button size="sm" className="mt-1" onClick={handleAcceptBid}><Check className="w-4 h-4 ml-1"/>پذیرفتن</Button>
                                </div>
                            </div>
                        )) : <p className="text-sm text-muted-foreground text-center py-4">هنوز پیشنهادی ثبت نشده است.</p>}
                    </CardContent>
                </Card>
            )}

            {!isShipper && shipment.status === 'pending' && (
                <Card className="bg-primary/10 border-primary">
                    <CardHeader><CardTitle>ثبت پیشنهاد قیمت</CardTitle></CardHeader>
                    <form onSubmit={handlePlaceBid}>
                        <CardContent className="space-y-3">
                            <Label htmlFor="bid-amount">مبلغ پیشنهادی شما (تومان)</Label>
                            <div className="relative">
                                <Input id="bid-amount" type="number" dir="ltr" className="pr-8" placeholder="1,200,000" required/>
                                <CircleDollarSign className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full">ثبت پیشنهاد</Button>
                        </CardFooter>
                    </form>
                </Card>
            )}
             {shipment.status === 'delivered' && (
                 <Card>
                    <CardHeader><CardTitle>اتمام سفر</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm">این محموله با موفقیت در تاریخ {shipment.date} تحویل داده شد.</p>
                        <div className="mt-4 flex items-center gap-3 border-t pt-4">
                            <Image src={shipment.acceptedDriver?.avatar || ''} alt={shipment.acceptedDriver?.name || 'driver'} width={40} height={40} className="rounded-full" />
                            <div>
                                <p className="font-semibold">{shipment.acceptedDriver?.name}</p>
                                <p className="text-xs text-muted-foreground">راننده</p>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            )}
        </div>
      </div>
    </div>
  );
}
