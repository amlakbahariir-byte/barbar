'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { handleDeviationAlert } from '@/app/actions';
import { DeviationAlertDialog } from './deviation-alert-dialog';
import { Button } from './ui/button';
import { Shipment } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const TOTAL_DURATION = 30000; // 30 seconds for full animation
const DEVIATION_TIME = 15000; // 15 seconds to trigger deviation

export function ShipmentTracking({ shipment }: { shipment: Shipment }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('در حال حرکت به سمت مقصد');
  const [deviationTriggered, setDeviationTriggered] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const { toast } = useToast();
  const trackingImage = PlaceHolderImages.find((p) => p.id === 'tracking-view');

  useEffect(() => {
    if (progress >= 100) return;

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / (TOTAL_DURATION / 1000), 100));
    }, 1000);

    return () => clearInterval(interval);
  }, [progress]);

  useEffect(() => {
    if (progress >= 100) {
      setStatusText('به مقصد رسید.');
      toast({
        title: 'بار تحویل داده شد',
        description: 'محموله شما با موفقیت به مقصد رسید.',
      });
    }
  }, [progress, toast]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!deviationTriggered && shipment.acceptedDriver) {
        setStatusText('راننده از مسیر خارج شده است! در حال ارسال هشدار...');
        setDeviationTriggered(true);

        const message = await handleDeviationAlert(shipment.acceptedDriver.id, shipment.id);
        setAlertMessage(message);

        // This would be for the driver, but we show it here for demo purposes
        setIsAlertOpen(true);
      }
    }, DEVIATION_TIME);

    return () => clearTimeout(timer);
  }, [deviationTriggered, shipment.acceptedDriver, shipment.id]);

  if (!trackingImage) return null;

  // Simulate truck position. 8% and 92% to keep it within the image bounds.
  const truckPosition = 8 + (progress / 100) * 84;
  const deviationClass = deviationTriggered ? '-translate-y-4' : '';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>رهگیری زنده محموله</CardTitle>
          <CardDescription>وضعیت لحظه‌ای حرکت راننده به سمت مقصد را مشاهده کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-hidden rounded-md border">
            <Image
              src={trackingImage.imageUrl}
              alt={trackingImage.description}
              data-ai-hint={trackingImage.imageHint}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
            />
            <div
              className={`absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear ${deviationClass}`}
              style={{ right: `${truckPosition}%` }}
            >
              <Truck className="w-10 h-10 text-primary-foreground bg-primary p-2 rounded-full shadow-lg -scale-x-100" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <Progress value={progress} />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">{statusText}</span>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">اطلاعات راننده</h3>
            <div className="flex items-center gap-4">
              <Image
                src={shipment.acceptedDriver?.avatar || ''}
                alt={shipment.acceptedDriver?.name || 'Driver'}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{shipment.acceptedDriver?.name}</p>
                <p className="text-sm text-muted-foreground">{shipment.acceptedDriver?.vehicle}</p>
              </div>
              <Button variant="outline" className="mr-auto">تماس با راننده</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <DeviationAlertDialog isOpen={isAlertOpen} onOpenChange={setIsAlertOpen} alertMessage={alertMessage} />
    </>
  );
}
