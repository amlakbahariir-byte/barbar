
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Truck, MapPin, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { handleDeviationAlert } from '@/app/actions';
import { DeviationAlertDialog } from './deviation-alert-dialog';
import { Button } from './ui/button';
import { Shipment } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Declare Leaflet type for TypeScript
declare const L: any;

// Placeholder coordinates for cities as we don't have a geocoding service
const cityCoordinates: { [key: string]: [number, number] } = {
  'تهران': [35.6892, 51.3890],
  'اصفهان': [32.6539, 51.6660],
  'شیراز': [29.5918, 52.5837],
  'تبریز': [38.08, 46.29],
  'مشهد': [36.2605, 59.6168],
  'کرج': [35.8327, 50.9915],
  'اهواز': [31.3183, 48.6909],
  'یزد': [31.8974, 54.3675],
  'کرمان': [30.2832, 57.0788],
};

const TOTAL_DURATION = 30000; // 30 seconds for full animation
const DEVIATION_TIME = 15000; // 15 seconds to trigger deviation

export function ShipmentTracking({ shipment }: { shipment: Shipment }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('در حال حرکت به سمت مقصد');
  const [deviationTriggered, setDeviationTriggered] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const truckMarkerRef = useRef<any>(null);

  const originCoords = cityCoordinates[shipment.origin] || cityCoordinates['تهران'];
  const destCoords = cityCoordinates[shipment.destination] || cityCoordinates['اصفهان'];

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || leafletMapRef.current) return;

    try {
      const map = L.map(mapRef.current, {
          zoomControl: false, // Disable default zoom control
      });
      leafletMapRef.current = map;
      
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const createIcon = (color: string) => L.divIcon({
          className: 'custom-marker',
          html: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin drop-shadow-lg"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
      });
      
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      const primaryIcon = createIcon(`hsl(${primaryColor})`);

      L.marker(originCoords, { icon: primaryIcon }).addTo(map).bindPopup(shipment.origin);
      L.marker(destCoords, { icon: primaryIcon }).addTo(map).bindPopup(shipment.destination);
      
      const latlngs = [originCoords, destCoords];
      const polyline = L.polyline(latlngs, { color: `hsl(${primaryColor})`, weight: 5, opacity: 0.8 }).addTo(map);

      map.fitBounds(polyline.getBounds().pad(0.3));

      const truckIcon = L.divIcon({
        className: 'truck-marker',
        html: `<div class="bg-primary p-2 rounded-full shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary-foreground))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck -scale-x-100"><path d="M10 17h4V5H2v12h3"/><path d="M22 17h-2.42a1 1 0 0 0-.9-1.41l-2.43-.29a1 1 0 0 0-1.05.8l-1.2 5.37A1 1 0 0 0 15 22h4a1 1 0 0 0 .95-.68l.94-3.76A1 1 0 0 0 22 17Z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      truckMarkerRef.current = L.marker(originCoords, { icon: truckIcon }).addTo(map);

    } catch (error) {
      console.error('Error initializing Leaflet map:', error);
    }
     return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [shipment.origin, shipment.destination]);


  // Truck Animation & Deviation Logic
  useEffect(() => {
    if (progress >= 100 || !truckMarkerRef.current) return;

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 100 / (TOTAL_DURATION / 1000), 100));
    }, 1000);
    
     // Animate truck on map
    const newProgress = Math.min(progress / 100, 1);
    const lat = originCoords[0] + (destCoords[0] - originCoords[0]) * newProgress;
    const lng = originCoords[1] + (destCoords[1] - originCoords[1]) * newProgress;
    
    let currentLatLng = L.latLng(lat, lng);

    // Simulate deviation
    if (deviationTriggered) {
        currentLatLng.lat += 0.05; // Move slightly off-course
        if(truckMarkerRef.current) {
            truckMarkerRef.current.setLatLng(currentLatLng);
        }
    } else {
        if(truckMarkerRef.current) {
            truckMarkerRef.current.setLatLng(currentLatLng);
        }
    }


    const deviationTimer = setTimeout(async () => {
      if (!deviationTriggered && shipment.acceptedDriver) {
        setStatusText('راننده از مسیر خارج شده است! در حال ارسال هشدار...');
        setDeviationTriggered(true);

        // const message = await handleDeviationAlert(shipment.acceptedDriver.id, shipment.id);
        // setAlertMessage(message);
        // setIsAlertOpen(true);
      }
    }, DEVIATION_TIME);


    if (progress >= 100) {
      setStatusText('به مقصد رسید.');
      toast({
        title: 'بار تحویل داده شد',
        description: 'محموله شما با موفقیت به مقصد رسید.',
      });
      clearInterval(interval);
      clearTimeout(deviationTimer);
    }

    return () => {
        clearInterval(interval);
        clearTimeout(deviationTimer);
    };
  }, [progress, toast, shipment.id, shipment.acceptedDriver, deviationTriggered, originCoords, destCoords]);


  return (
    <>
      <div className="relative h-screen w-full">
         <div ref={mapRef} className="w-full h-full bg-muted z-0" />
         
          <div className="absolute top-4 left-4 right-4 z-[1000]">
             <Card className="bg-background/80 backdrop-blur-sm">
                <CardHeader className="p-4">
                    <CardTitle className="flex items-center justify-between">
                        <span>رهگیری زنده محموله</span>
                         <Button variant="ghost" size="sm" onClick={() => router.back()}>بازگشت</Button>
                    </CardTitle>
                    <CardDescription>شناسه: {shipment.id}</CardDescription>
                </CardHeader>
             </Card>
         </div>

         <div className="absolute bottom-4 left-4 right-4 z-[1000]">
             <Card className="bg-background/80 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="space-y-3">
                        <Progress value={progress} />
                        <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">{statusText}</span>
                        <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                        </div>
                    </div>
                    <div className="mt-4 border-t pt-4">
                        <h3 className="font-semibold mb-2">اطلاعات راننده</h3>
                        {shipment.acceptedDriver ? (
                            <div className="flex items-center gap-4">
                            <Image
                                src={shipment.acceptedDriver.avatar}
                                alt={shipment.acceptedDriver.name}
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                            <div>
                                <p className="font-medium">{shipment.acceptedDriver.name}</p>
                                <p className="text-sm text-muted-foreground">{shipment.acceptedDriver.vehicle}</p>
                            </div>
                            <Button variant="outline" className="mr-auto">
                                <Phone className="ml-2 h-4 w-4"/>
                                تماس
                            </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">راننده هنوز مشخص نشده است.</p>
                        )}
                    </div>
                </CardContent>
             </Card>
         </div>
      </div>
      <DeviationAlertDialog isOpen={isAlertOpen} onOpenChange={setIsAlertOpen} alertMessage={alertMessage} />
    </>
  );
}

