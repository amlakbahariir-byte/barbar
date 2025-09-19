
'use client';

import { Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

const slogans = [
    "بوق نزن شاگردم خوابه",
    "در جوانی پاک بودن شیوه پیغمبریست",
    "من هم در به درم",
    "سر پایینی پرنده، سر بالایی شرمنده",
    "بخاطر اشک مادر، پا روی گاز نده",
    "داداش مرگ من یواش"
];

export function AnimatedTruckLoader() {
  const [currentSlogan, setCurrentSlogan] = useState(slogans[0]);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
            setCurrentSlogan(prevSlogan => {
                const currentIndex = slogans.indexOf(prevSlogan);
                const nextIndex = (currentIndex + 1) % slogans.length;
                return slogans[nextIndex];
            });
            setFade(true);
        }, 500); // fade-out duration
    }, 3000); // 2.5s display + 0.5s fade

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-8 animate-in fade-in-0 slide-in-from-top-10 duration-1000">
          باربر ایرانی
        </h2>
        <div className="relative w-full max-w-lg h-32 overflow-hidden">
          <div className="absolute inset-x-0 bottom-8 h-1 road-lines animate-[move-road_1s_linear_infinite]"></div>
          <div className="absolute inset-0 flex items-center justify-center animate-[move-truck_4s_ease-in-out_infinite]">
            <Truck className="w-20 h-20 text-primary -scale-x-100" />
          </div>
        </div>
      </div>
      <div className="w-full text-center pb-8 px-4">
        <p className={`text-muted-foreground text-lg transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
          "{currentSlogan}"
        </p>
      </div>
    </div>
  );
}

    