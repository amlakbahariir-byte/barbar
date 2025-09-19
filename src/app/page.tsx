
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
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, type Auth, type User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';

function AuthForm({ onLoginSuccess }: { onLoginSuccess: (role: 'shipper' | 'driver') => void }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
  const { toast } = useToast();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!auth || !recaptchaContainerRef.current) return;

    // To prevent re-rendering issues, only initialize once
    if (recaptchaVerifier.current) return;

    const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
      'size': 'normal',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        setIsRecaptchaVerified(true);
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        setIsRecaptchaVerified(false);
        toast({
            title: 'کپچا منقضی شد',
            description: 'لطفا دوباره تیک "من ربات نیستم" را بزنید.',
            variant: 'destructive',
        });
      }
    });

    recaptchaVerifier.current = verifier;
    // Render the reCAPTCHA
    verifier.render();

  }, [auth, toast]);


  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRecaptchaVerified || !recaptchaVerifier.current) {
        toast({
            title: 'تأیید هویت لازم است',
            description: 'لطفاً ابتدا تیک "من ربات نیستم" را بزنید.',
            variant: 'destructive',
        });
        return;
    }
    setLoading(true);

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
        description: 'مشکلی در ارسال کد به وجود آمده است. لطفا شماره را بررسی کرده و دوباره تلاش کنید.',
        variant: 'destructive',
      });
      // Reset reCAPTCHA for retry
       if (recaptchaVerifier.current && (window as any).grecaptcha) {
         (window as any).grecaptcha.reset();
         setIsRecaptchaVerified(false);
       }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      if (result.user) {
        toast({ title: 'ورود موفقیت‌آمیز بود', description: 'نقش خود را انتخاب کنید.' });
        setStep(3); // Move to role selection step
      }
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


  const handleRoleSelect = (role: 'shipper' | 'driver') => {
    localStorage.setItem('userRole', role);
    onLoginSuccess(role);
  };
  

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
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
            <div ref={recaptchaContainerRef} className="flex justify-center"></div>
            <Button type="submit" className="w-full" disabled={loading || !isRecaptchaVerified}>
              {loading ? <Loader2 className="animate-spin" /> : 'ارسال کد تایید'}
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
              {loading ? <Loader2 className="animate-spin" /> : 'تایید و ورود'}
            </Button>
          </form>
        );
       case 3:
         return (
            <div className="space-y-4 animate-in fade-in-0 duration-500">
                 <p className="text-sm text-center text-muted-foreground">برای تکمیل ثبت‌نام، نقش خود را مشخص کنید:</p>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button onClick={() => handleRoleSelect('shipper')} className="w-full" variant="secondary">
                    فرستنده بار
                  </Button>
                  <Button onClick={() => handleRoleSelect('driver')} className="w-full">
                    راننده
                  </Button>
                </div>
            </div>
         );
      default:
        return null;
    }
  }

  const getCardDescription = () => {
     switch(step) {
      case 1:
        return 'برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کرده و تیک "من ربات نیستم" را بزنید.';
      case 2:
        return `کد تایید ۶ رقمی ارسال شده به شماره ${phone} را وارد کنید.`;
      case 3:
        return 'ثبت‌نام شما تقریباً تمام است!';
       default:
        return '';
    }
  }

  return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>ورود یا ثبت‌نام در باربر ایرانی</CardTitle>
          <CardDescription>
            {getCardDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
         {(step === 2) && !loading && (
           <CardFooter>
              <Button variant="link" size="sm" onClick={() => { setStep(1); setOtp(''); setIsRecaptchaVerified(false); }}>
                تغییر شماره یا تلاش مجدد
              </Button>
           </CardFooter>
          )}
      </Card>
  );
}


function HomePageContent() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth as Auth);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
        <Card className="w-[450px]">
            <CardContent className="flex h-64 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
        </Card>
    );
  }
  
  // If user is already logged in, redirect them. Don't show login form.
  if (user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="mb-8 flex items-center gap-4 animate-in fade-in-0 slide-in-from-top-12 duration-700">
        <Truck className="h-16 w-16 text-primary" />
        <h1 className="text-5xl font-headline font-bold text-foreground">باربر ایرانی</h1>
      </div>
      <p className="mb-10 max-w-2xl text-lg text-muted-foreground animate-in fade-in-0 slide-in-from-top-12 duration-700 delay-200">
        سریع‌ترین و مطمئن‌ترین راه برای ارسال و دریافت بار در سراسر ایران. به ما بپیوندید و تحولی در حمل و نقل را تجربه کنید.
      </p>

      <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-top-16 duration-700 delay-400">
         <AuthForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 overflow-hidden">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-20"></div>
       <div className="absolute size-96 -bottom-48 -right-48 bg-primary/20 rounded-full blur-3xl"></div>
       <div className="absolute size-96 -top-48 -left-48 bg-accent/20 rounded-full blur-3xl"></div>

      {isClient ? <HomePageContent /> : (
        <Card className="w-[450px]">
          <CardContent className="flex h-64 items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
