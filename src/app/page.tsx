
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut, type ConfirmationResult } from 'firebase/auth';
import { AnimatedTruckLoader } from '@/components/ui/animated-truck-loader';

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: ConfirmationResult;
    }
}

function AuthChecker({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [sessionChecked, setSessionChecked] = useState(false);

    useEffect(() => {
        if (!loading) {
            const userRole = localStorage.getItem('userRole');
            if (user && userRole) {
                router.push('/dashboard');
            } else {
                setSessionChecked(true);
            }
        }
    }, [user, loading, router]);


    if (loading || !sessionChecked) {
       return <AnimatedTruckLoader />;
    }

    return <>{children}</>;
}


function AuthForm({ onLoginSuccess }: { onLoginSuccess: (role: 'shipper' | 'driver') => void }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const otpFormRef = useRef<HTMLFormElement>(null);
  
  // Simulate receiving and entering OTP
  useEffect(() => {
    if (step === 2) {
      setLoading(true);
      const timer = setTimeout(() => {
        setOtp('123456'); // Auto-fill OTP
         toast({
            title: 'کد تایید دریافت شد',
        });
      }, 2000); // Simulate 2-second delay

      return () => clearTimeout(timer);
    }
  }, [step, toast]);
  
  // Automatically submit OTP form when OTP is filled
  useEffect(() => {
    if (otp.length === 6 && otpFormRef.current) {
        // We use a short timeout to allow the user to see the OTP has been filled
        setTimeout(() => {
             otpFormRef.current?.requestSubmit();
        }, 500);
    }
  }, [otp]);

  const setupRecaptcha = () => {
    if (typeof window === 'undefined') return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved
        }
      });
    }
    return window.recaptchaVerifier;
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
        setLoading(false);
        setStep(2);
        toast({
            title: 'در حال ارسال کد',
            description: 'یک کد تایید برای شما شبیه‌سازی می‌شود.',
        });
    }, 1000);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate OTP verification delay
    setTimeout(() => {
        setLoading(false);
        toast({ title: 'ورود موفقیت‌آمیز بود', description: 'نقش خود را انتخاب کنید.' });
        setStep(3);
    }, 1000);
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'ارسال کد تایید'}
            </Button>
          </form>
        );
      case 2:
        return (
          <form ref={otpFormRef} onSubmit={handleOtpSubmit} className="space-y-4 animate-in fade-in-0 duration-500">
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
        return 'برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید.';
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
              <Button variant="link" size="sm" onClick={() => { setStep(1); setOtp(''); }}>
                تغییر شماره یا تلاش مجدد
              </Button>
           </CardFooter>
          )}
      </Card>
  );
}


function HomePageContent() {
  const router = useRouter();
  
  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };
  
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
       <div id="recaptcha-container"></div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 overflow-hidden">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-20"></div>
       <div className="absolute size-96 -bottom-48 -right-48 bg-primary/20 rounded-full blur-3xl"></div>
       <div className="absolute size-96 -top-48 -left-48 bg-accent/20 rounded-full blur-3xl"></div>
        <AuthChecker>
          <HomePageContent />
        </AuthChecker>
    </main>
  );
}
