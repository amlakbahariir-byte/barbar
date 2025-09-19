
import { Truck } from 'lucide-react';

export function AnimatedTruckLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background animate-pulse-bg duration-1000">
      <div className="relative w-64 h-32 overflow-hidden">
        <div className="absolute inset-x-0 bottom-8 h-1 road-lines animate-[move-road_1s_linear_infinite]"></div>
        <div className="absolute inset-0 flex items-center justify-center animate-[move-truck_3s_ease-in-out_infinite]">
          <Truck className="w-20 h-20 text-primary -scale-x-100" />
        </div>
      </div>
      <h2 className="mt-6 text-2xl font-headline font-bold text-foreground animate-[fade-in-up_1.5s_ease-out]">
        باربر ایرانی
      </h2>
      <p className="text-muted-foreground animate-[fade-in-up_1.5s_ease-out_0.2s]">
        در حال بارگذاری...
      </p>
    </div>
  );
}
