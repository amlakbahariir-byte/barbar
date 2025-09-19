
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Shipment } from '@/lib/data';
import { ArrowLeft, Box, Calendar, MapPin, Weight } from 'lucide-react';
import { useEffect, useState } from 'react';

const statusMap: { [key in Shipment['status']]: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
  pending: { text: 'در انتظار پیشنهاد', variant: 'secondary' },
  accepted: { text: 'قبول شده', variant: 'outline' },
  in_transit: { text: 'در حال حمل', variant: 'default' },
  delivered: { text: 'تحویل شده', variant: 'secondary' },
};

export function ShipmentCard({ shipment, role, navigate }: { shipment: Shipment; role: 'shipper' | 'driver', navigate: (path: string) => void; }) {
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    // This should run only on the client
    setDistance(Math.floor(Math.random() * 200) + 10);
  }, []);

  return (
    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="text-xl font-bold">
                    {shipment.origin} <ArrowLeft className="inline-block h-5 w-5 mx-2" /> {shipment.destination}
                </CardTitle>
                <CardDescription>شناسه: {shipment.id}</CardDescription>
            </div>
            <Badge variant={statusMap[shipment.status].variant}>{statusMap[shipment.status].text}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>تاریخ: {shipment.date}</span>
        </div>
         <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-muted-foreground" />
            <span>وزن: {shipment.weight.toLocaleString()} کیلوگرم</span>
        </div>
         <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-muted-foreground" />
            <span>حجم: {shipment.volume} متر مکعب</span>
        </div>
        {role === 'driver' && (
             <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>فاصله: {distance} کیلومتر</span>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => navigate(`/dashboard/requests/${shipment.id}`)}>
            مشاهده جزئیات
        </Button>
      </CardFooter>
    </Card>
  );
}
