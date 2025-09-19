
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, Auth } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  // useAuthState should only be used on the client
  const [user, authLoading] = useAuthState(auth as Auth);

  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // This ensures code runs only on the client
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (!authLoading) {
      if (user) {
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
          router.push('/dashboard');
        } else {
          // If user is logged in but has no role, force them to choose.
          setStep(3);
        }
      }
    }
  }, [user, authLoading, router, isClient]);

  useEffect(() => {
    if (!isClient || !auth || recaptchaVerifier.current) return;

    if (recaptchaContainerRef.current) {
        recaptchaVerifier.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            size: 'invisible',
            callback: () => {},
        });

        recaptchaVerifier.current.render().catch((error) => {
            console.error("reCAPTCHA render error:", error);
            toast({
                title: 'خطا',
                description: 'reCAPTCHA به درستی بارگذاری نشد. لطفا صفحه را رفرش کنید.',
                variant: 'destructive',
            });
        });
    }
  }, [isClient, auth, toast]);


  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!recaptchaVerifier.current || !auth) {
      toast({
        title: 'خطا',
        description: 'reCAPTCHA مقداردهی نشده است. لطفا صفحه را رفرش کنید.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    const formattedPhone = `+98${phone.slice(1)}`;

    try {
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier.current);
      setConfirmationResult(result);
      setStep(2);
      toast({
        title: 'کد ارسال شد',
        description: 'کد تایید به شماره شما ارسال شد.',
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'خطا در ارسال کد',
        description: 'مشکلی در ارسال کد به وجود آمده است. لطفا دوباره تلاش کنید.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);

    try {
      await confirmationResult.confirm(otp);
      // User is now signed in. The useEffect will catch this and show step 3.
      setStep(3);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'کد نامعتبر',
        description: 'کد وارد شده صحیح نیست. لطفا دوباره تلاش کنید.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleLogin = (role: 'shipper' | 'driver') => {
    localStorage.setItem('userRole', role);
    router.push('/dashboard');
  };
  
  if (!isClient || authLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
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
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'دریافت کد تایید'}
            </Button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleOtpSubmit} className="space-y-4 animate-in fade-in-0 duration-500">
            <div className="space-y-2">
              <Label htmlFor="otp">کد تایید</Label>
              <Input 
                id="otp" 
                type="text" 
                placeholder="_ _ _ _ _ _" 
                maxLength={6} 
                dir="ltr" 
                className="tracking-[0.5rem] text-center" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
              />
            </div>
             <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'تایید کد'}
            </Button>
          </form>
        );
      case 3:
         return null; // Handled by CardFooter
      default:
        return null;
    }
  }

  const getCardDescription = () => {
     switch(step) {
      case 1:
        return 'برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید.';
      case 2:
        return 'کد تایید ۶ رقمی ارسال شده به شماره خود را وارد کنید.';
      case 3:
        return 'نقش خود را برای ورود به برنامه انتخاب کنید.';
       default:
        return '';
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 overflow-hidden">
       <div ref={recaptchaContainerRef}></div>
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-20"></div>
       <div className="absolute size-96 -bottom-48 -right-48 bg-primary/20 rounded-full blur-3xl"></div>
       <div className="absolute size-96 -top-48 -left-48 bg-accent/20 rounded-full blur-3xl"></div>

      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-8 flex items-center gap-4 animate-in fade-in-0 slide-in-from-top-12 duration-700">
          <Truck className="h-16 w-16 text-primary" />
          <h1 className="text-5xl font-headline font-bold text-foreground">باربر ایرانی</h1>
        </div>
        <p className="mb-10 max-w-2xl text-lg text-muted-foreground animate-in fade-in-0 slide-in-from-top-12 duration-700 delay-200">
          سریع‌ترین و مطمئن‌ترین راه برای ارسال و دریافت بار در سراسر ایران. به ما بپیوندید و تحولی در حمل و نقل را تجربه کنید.
        </p>

        <Tabs defaultValue="login" className="w-[450px] animate-in fade-in-0 slide-in-from-top-16 duration-700 delay-400">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="login">ورود یا ثبت‌نام</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>ورود به حساب کاربری</CardTitle>
                <CardDescription>
                  {getCardDescription()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderStepContent()}
              </CardContent>
              {step === 3 && (
                <CardFooter className="flex flex-col gap-4 animate-in fade-in-0 duration-500">
                   <p className="text-sm text-muted-foreground">ورود به عنوان:</p>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Button onClick={() => handleLogin('shipper')} className="w-full" variant="secondary">
                      فرستنده
                    </Button>
                    <Button onClick={() => handleLogin('driver')} className="w-full">
                      راننده
                    </Button>
                  </div>
                </CardFooter>
              )}
               {(step === 2) && !loading && (
                 <CardFooter>
                    <Button variant="link" size="sm" onClick={() => { setStep(1); setOtp(''); }}>
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
