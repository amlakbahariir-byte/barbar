'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleLogin = (role: 'shipper' | 'driver') => {
    // In a real app, you would verify the OTP here.
    // We'll simulate a successful login.
    localStorage.setItem('userRole', role);
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-8 flex items-center gap-4">
          <Truck className="h-16 w-16 text-primary" />
          <h1 className="text-5xl font-headline font-bold text-foreground">باربر ایرانی</h1>
        </div>
        <p className="mb-10 max-w-2xl text-lg text-muted-foreground">
          سریع‌ترین و مطمئن‌ترین راه برای ارسال و دریافت بار در سراسر ایران. به ما بپیوندید و تحولی در حمل و نقل را تجربه کنید.
        </p>

        <Tabs defaultValue="login" className="w-[450px]">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="login">ورود یا ثبت‌نام</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>ورود به حساب کاربری</CardTitle>
                <CardDescription>
                  {step === 1
                    ? 'برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید.'
                    : 'کد تایید ارسال شده به شماره خود را وارد کنید.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 1 && (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">شماره موبایل</Label>
                      <Input
                        id="phone"
                        type="tel"
                        dir="ltr"
                        placeholder="09123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      دریافت کد تایید
                    </Button>
                  </form>
                )}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">کد تایید</Label>
                      <Input id="otp" type="text" placeholder="_ _ _ _" maxLength={4} dir="ltr" className="tracking-[1rem] text-center" />
                      <p className="text-xs text-muted-foreground pt-2 text-center">
                        کد تایید: 1234 (شبیه‌سازی شده)
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              {step === 2 && (
                <CardFooter className="flex flex-col gap-4">
                   <p className="text-sm text-muted-foreground">ورود به عنوان:</p>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Button onClick={() => handleLogin('shipper')} className="w-full" variant="secondary">
                      فرستنده
                    </Button>
                    <Button onClick={() => handleLogin('driver')} className="w-full">
                      راننده
                    </Button>
                  </div>
                   <Button variant="link" size="sm" onClick={() => setStep(1)}>
                    تغییر شماره موبایل
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
