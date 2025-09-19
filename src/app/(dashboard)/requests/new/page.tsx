'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns-jalali';
import { Calendar as CalendarIcon, PackagePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewRequestPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'درخواست شما ثبت شد',
      description: 'درخواست حمل بار شما با موفقیت ثبت شد و به رانندگان نمایش داده می‌شود.',
      variant: 'default',
    });
    router.push('/dashboard');
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <PackagePlus className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">ایجاد درخواست حمل بار جدید</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>مشخصات بار</CardTitle>
          <CardDescription>لطفا اطلاعات مربوط به بار و مسیر خود را با دقت وارد کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weight">وزن (کیلوگرم)</Label>
                <Input id="weight" type="number" placeholder="مثال: 500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume">حجم (متر مکعب)</Label>
                <Input id="volume" type="number" placeholder="مثال: 2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">تاریخ بارگیری</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-right font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>یک تاریخ انتخاب کنید</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات (اختیاری)</Label>
              <Textarea id="description" placeholder="اطلاعات تکمیلی مانند نوع بار، حساسیت، نیاز به تجهیزات خاص و ..." />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg">ثبت درخواست</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
