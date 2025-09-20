
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Package, MapPin, ArrowLeft, CalendarIcon, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PersianCalendar } from '@/components/persian-calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addShipment } from '@/lib/data';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const toPersianNumber = (n: number | string) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    return String(n).replace(/\d/g, (d: any) => persianDigits[d]);
}

// Validation Schema
const formSchema = z.object({
  origin: z.string({ required_error: "مبدا الزامی است." }).min(1, { message: "مبدا نمی‌تواند خالی باشد." }),
  destination: z.string({ required_error: "مقصد الزامی است." }).min(1, { message: "مقصد نمی‌تواند خالی باشد." }),
  weight: z.string().min(1, { message: "وزن نمی‌تواند خالی باشد." }),
  cargoType: z.string().min(1, { message: "نوع بار نمی‌تواند خالی باشد." }),
  date: z.date({ required_error: "انتخاب تاریخ الزامی است." }).refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    return date >= today;
  }, {
    message: "تاریخ بارگیری نمی‌تواند در گذشته باشد."
  }),
  hour: z.string(),
  minute: z.string(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewRequestPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: '',
      destination: '',
      weight: '',
      cargoType: '',
      date: new Date(),
      hour: '09',
      minute: '00',
      description: '',
    },
  });

  const toPersianDate = (date: Date | undefined) => {
      if (!date) return 'یک تاریخ انتخاب کنید';
      return new Intl.DateTimeFormat('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      }).format(date);
  }

  const onSubmit = (values: FormValues) => {
    const newShipment = {
        id: `shp${Math.floor(Math.random() * 1000) + 1007}`,
        origin: values.origin,
        destination: values.destination,
        weight: parseInt(values.weight) || 0,
        cargoType: values.cargoType,
        description: values.description || '',
        date: `${toPersianDate(values.date)} - ${values.hour}:${values.minute}`,
        status: 'pending' as const,
        bids: [],
    };

    addShipment(newShipment);

    toast({
      title: 'درخواست شما ثبت شد',
      description: 'درخواست حمل بار شما با موفقیت ثبت شد و به رانندگان نمایش داده می‌شود.',
      variant: 'default',
    });
    router.push('/dashboard');
  };
  
  const navigate = (path: string) => {
      router.push(path);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="relative flex items-center justify-between p-6 rounded-2xl overflow-hidden bg-card border shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent"></div>
            <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">ایجاد درخواست حمل بار</h1>
            <p className="mt-2 text-muted-foreground max-w-prose">اطلاعات زیر را برای ثبت درخواست خود تکمیل کنید.</p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="relative z-10 p-2 rounded-full bg-background/50 hover:bg-background transition-colors">
                <ArrowLeft className="h-6 w-6" />
            </button>
        </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><MapPin/>مسیر</CardTitle>
                    <CardDescription>مبدا و مقصد حمل بار خود را مشخص کنید.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="origin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مبدا</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: تهران، میدان آزادی" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مقصد</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: اصفهان، میدان نقش جهان" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><Package/>مشخصات بار</CardTitle>
                    <CardDescription>اطلاعات مربوط به وزن، نوع و توضیحات بار را وارد کنید.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>وزن (کیلوگرم)</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="مثال: ۵۰۰" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cargoType"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>نوع بار</FormLabel>
                                <FormControl>
                                <Input placeholder="مثال: مبلمان" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>توضیحات (اختیاری)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="اطلاعات تکمیلی مانند نوع بار، حساسیت، نیاز به تجهیزات خاص و ..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><CalendarIcon/>تاریخ و زمان بارگیری</CardTitle>
                    <CardDescription>تاریخ و ساعت مورد نظر خود برای شروع حمل را انتخاب کنید.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
                     <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-center">
                               <Popover>
                                   <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[280px] justify-start text-right font-normal h-12 text-base",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                                <CalendarIcon className="ml-2 h-5 w-5" />
                                                {toPersianDate(field.value)}
                                            </Button>
                                        </FormControl>
                                   </PopoverTrigger>
                                   <PopoverContent className="w-auto p-0">
                                       <PersianCalendar
                                           selectedDate={field.value}
                                           onDateChange={field.onChange}
                                       />
                                   </PopoverContent>
                               </Popover>
                               <FormMessage className="mt-2" />
                            </FormItem>
                        )}
                        />

                        <div className="flex items-center gap-4" dir="rtl">
                            <Clock className="h-6 w-6 text-muted-foreground" />
                            <div className="flex items-center gap-2" dir="ltr">
                                 <FormField
                                    control={form.control}
                                    name="minute"
                                    render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-[100px]">
                                                    <SelectValue className="font-headline text-lg" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['00', '15', '30', '45'].map(m => (
                                                    <SelectItem key={m} value={m} className="font-headline text-lg justify-center">{toPersianNumber(m)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                    )}
                                />
                                <span className="font-bold text-xl">:</span>
                                <FormField
                                    control={form.control}
                                    name="hour"
                                    render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-[100px]">
                                                    <SelectValue className="font-headline text-lg" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
                                                    <SelectItem key={h} value={h} className="font-headline text-lg justify-center">{toPersianNumber(h)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                </CardContent>
            </Card>

            <div className="flex justify-end p-6">
                <Button type="submit" size="lg" className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                    ثبت نهایی درخواست
                </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
