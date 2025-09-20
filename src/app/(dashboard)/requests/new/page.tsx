
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Package, MapPin, ArrowLeft, ArrowRight, CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PersianCalendar } from '@/components/persian-calendar';

const steps = [
  { id: 1, title: 'مسیر', icon: MapPin },
  { id: 2, title: 'مشخصات بار', icon: Package },
  { id: 3, title: 'تاریخ بارگیری', icon: CalendarIcon },
];

export default function NewRequestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());

  const navigate = (path: string) => {
    router.push(path);
  };
  
  const toPersianDate = (date: Date) => {
      return new Intl.DateTimeFormat('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      }).format(date);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'درخواست شما ثبت شد',
      description: 'درخواست حمل بار شما با موفقیت ثبت شد و به رانندگان نمایش داده می‌شود.',
      variant: 'default',
    });
    navigate('/dashboard');
  };

  const nextStep = () => setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
  const prevStep = () => setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));

  const progressValue = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="relative flex items-center justify-between p-6 rounded-2xl overflow-hidden bg-card border shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent"></div>
            <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">ایجاد درخواست حمل بار</h1>
            <p className="mt-2 text-muted-foreground max-w-prose">این فرآیند {steps.length} مرحله‌ای را برای ثبت درخواست خود کامل کنید.</p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="relative z-10 p-2 rounded-full bg-background/50 hover:bg-background transition-colors">
                <ArrowLeft className="h-6 w-6" />
            </button>
        </div>
      
      <Card className="overflow-hidden">
         <div className="p-6 border-b">
            <div className="relative flex justify-between items-center mb-4 px-4 md:px-8">
                 <Progress value={progressValue} className="absolute h-1 top-1/2 -translate-y-1/2 -z-10 transition-all duration-300" />
                {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center z-10">
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 bg-background",
                            currentStep > index + 1 ? "bg-primary border-primary text-primary-foreground" :
                            currentStep === index + 1 ? "border-primary text-primary" :
                            "bg-muted border-border text-muted-foreground"
                        )}>
                            <step.icon className="w-5 h-5" />
                        </div>
                        <p className={cn(
                             "mt-2 text-xs md:text-sm font-medium transition-colors duration-300",
                             currentStep >= index + 1 ? "text-foreground" : "text-muted-foreground"
                        )}>{step.title}</p>
                    </div>
                ))}
            </div>
        </div>

        <form onSubmit={handleSubmit}>
            <CardContent className="p-6 md:p-8">
                <div className={cn("transition-all duration-300", currentStep === 1 ? "block" : "hidden")}>
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-2xl">مرحله ۱: مبدا و مقصد</CardTitle>
                        <CardDescription>مسیر حمل بار خود را مشخص کنید.</CardDescription>
                    </CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="origin">مبدا</Label>
                            <Input id="origin" placeholder="مثال: تهران، میدان آزادی" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="destination">مقصد</Label>
                            <Input id="destination" placeholder="مثال: اصفهان، میدان نقش جهان" required />
                        </div>
                    </div>
                </div>

                <div className={cn("transition-all duration-300", currentStep === 2 ? "block" : "hidden")}>
                     <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-2xl">مرحله ۲: مشخصات بار</CardTitle>
                        <CardDescription>اطلاعات مربوط به وزن، حجم و نوع بار خود را وارد کنید.</CardDescription>
                    </CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="weight">وزن (کیلوگرم)</Label>
                            <Input id="weight" type="number" placeholder="مثال: ۵۰۰" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="volume">حجم (متر مکعب)</Label>
                            <Input id="volume" type="number" placeholder="مثال: ۲" />
                        </div>
                         <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="description">توضیحات (اختیاری)</Label>
                            <Textarea id="description" placeholder="اطلاعات تکمیلی مانند نوع بار، حساسیت، نیاز به تجهیزات خاص و ..." />
                        </div>
                    </div>
                </div>

                 <div className={cn("transition-all duration-300", currentStep === 3 ? "block" : "hidden")}>
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-2xl">مرحله ۳: تاریخ بارگیری</CardTitle>
                        <CardDescription>تاریخ مورد نظر خود برای شروع حمل را انتخاب کنید.</CardDescription>
                    </CardHeader>
                    <div className="flex justify-center">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[280px] justify-start text-right font-normal h-12 text-base",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="ml-2 h-5 w-5" />
                                {date ? toPersianDate(date) : <span>یک تاریخ انتخاب کنید</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <PersianCalendar
                                    selectedDate={date}
                                    onDateChange={setDate}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

            </CardContent>

            <div className="flex items-center justify-between p-6 bg-muted/50 border-t">
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                    <ArrowRight className="ml-2 h-4 w-4" />
                    قبلی
                </Button>
                {currentStep < steps.length && (
                    <Button type="button" onClick={nextStep}>
                        بعدی
                        <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                )}
                {currentStep === steps.length && (
                    <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        ثبت نهایی درخواست
                    </Button>
                )}
            </div>
        </form>
      </Card>
    </div>
  );
}
