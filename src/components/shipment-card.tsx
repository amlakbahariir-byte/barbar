
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Shipment } from '@/lib/data';
import { ArrowLeft, Box, Calendar, MapPin, Weight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

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
    <Card 
        className="group flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out hover:border-primary/50 hover:shadow-lg"
        onClick={() => navigate(`/dashboard/requests/${shipment.id}`)}
    >
        <CardHeader className="pb-3">
            <div className="flex items-center justify-between text-lg font-bold">
                <div className="flex items-center gap-2">
                    <MapPin className="text-primary size-5"/>
                    <span className="truncate">{shipment.origin}</span>
                </div>
                <div className="flex-1 px-2">
                    <div className="w-full border-t-2 border-dashed border-muted-foreground/50"></div>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="text-primary size-5"/>
                    <span className="truncate">{shipment.destination}</span>
                </div>
            </div>
            <CardDescription className="text-right pt-1">شناسه: {shipment.id}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4 pt-3">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-secondary/70">
                    <Weight className="size-6 text-muted-foreground" />
                    <p className="mt-1 text-base font-bold">{shipment.weight.toLocaleString('fa-IR')}</p>
                    <p className="text-xs text-muted-foreground">کیلوگرم</p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-secondary/70">
                    <Box className="size-6 text-muted-foreground" />
                    <p className="mt-1 text-base font-bold truncate">{shipment.cargoType}</p>
                    <p className="text-xs text-muted-foreground">نوع بار</p>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch p-0">
            <Separator />
            <div className="flex items-center justify-between p-3 bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>{shipment.date}</span>
                </div>
                <Badge variant={statusMap[shipment.status].variant}>{statusMap[shipment.status].text}</Badge>
            </div>
            <div className="p-3">
                <Button variant="outline" className="w-full">
                    مشاهده جزئیات
                    <ArrowLeft className="mr-2 size-4" />
                </Button>
            </div>
        </CardFooter>
    </Card>
  );
}
