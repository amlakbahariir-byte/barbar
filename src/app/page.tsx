
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Truck, ChevronRight, User, Building, LogIn } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, type ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { AnimatedTruckLoader } from '@/components/ui/animated-truck-loader';

// Extend window type to include our custom properties
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

function AuthChecker({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // This effect runs on the client after hydration and when auth state is resolved.
    if (!loading) {
      const userRole = localStorage.getItem('userRole');
      
      // If a Firebase user session exists AND a role is set in localStorage,
      // it means the user is fully logged in. Redirect them to the dashboard.
      if (user && userRole) {
        router.replace('/dashboard');
      } else {
        // If there's no user or no role, it's safe to show the login page.
        // We mark auth as checked to unmount the loader.
        setAuthChecked(true);
      }
    }
  }, [user, loading, router]);

  // While checking auth state, show a full-screen loader.
  if (!authChecked) {
    return <AnimatedTruckLoader />;
  }

  // If auth state is checked and the user isn't logged in, render the children (the login page).
  return <>{children}</>;
}


export default function Home() {
  return (
    <AuthChecker>
      <main className="h-screen w-full flex items-center justify-center bg-background overflow-hidden relative p-4">
          <div className="absolute size-96 -bottom-48 -right-48 bg-primary/10 rounded-full blur-3xl -z-10 animate-in fade-in-0 duration-1000"></div>
          <div className="absolute size-96 -top-48 -left-48 bg-accent/10 rounded-full blur-3xl -z-10 animate-in fade-in-0 duration-1000 delay-500"></div>
          <HomePageContent />
      </main>
    </AuthChecker>
  );
}


function HomePageContent() {
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: role
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Setup reCAPTCHA
  useEffect(() => {
    // This check is to prevent re-initializing the verifier on every render.
    if (step === 1 && !window.recaptchaVerifier) {
      // The container is necessary for the verifier to work.
      // It's invisible, but it must be in the DOM.
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [step]);
  
  // Auto-fill OTP for demo purposes
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        const fakeOtp = '123456';
        setOtp(fakeOtp);
      }, 1500);
    }
  }, [step]);
  
  // Auto-submit OTP for demo when it's fully entered
  useEffect(() => {
    if (otp.length === 6) {
      handleOtpSubmit();
    }
  }, [otp]);


  const handlePhoneSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);
    toast({ title: 'در حال ارسال کد تایید...' });

    const appVerifier = window.recaptchaVerifier!;
    
    // We use a test phone number and fake confirmation for demo.
    try {
        const confirmationResult = await signInWithPhoneNumber(auth, '+11111111111', appVerifier);
        window.confirmationResult = confirmationResult;
        setIsSubmitting(false);
        setStep(2);
        toast({ title: 'کد تایید ارسال شد', description: 'کد تایید ۱۲۳۴۵۶ است' });
    } catch (error) {
        console.error("Error during phone sign-in:", error);
        toast({ title: 'خطا در ارسال کد', description: 'لطفا دوباره تلاش کنید.', variant: 'destructive' });
        setIsSubmitting(false);
        // In a real app, you might need to reset reCAPTCHA here.
    }
  };
  
  const handleOtpSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitting || otp.length < 6) return;
    setIsSubmitting(true);
    toast({ title: 'در حال تایید کد...' });

    try {
      // For the demo, we use the fake OTP to confirm.
      // `window.confirmationResult` is set in the `handlePhoneSubmit` function.
      await window.confirmationResult?.confirm(otp);
      // The `onAuthStateChanged` in `AuthChecker` and `DashboardLayout` will now have a valid user.
      
      setIsSubmitting(false);
      setStep(3); // Move to role selection on successful confirmation
      toast({ title: 'ورود موفقیت‌آمیز بود', description: 'لطفا نقش خود را انتخاب کنید.' });
    } catch (error) {
      console.error("Error during OTP confirmation:", error);
      toast({ title: 'کد تایید نامعتبر است', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  const handleRoleSelect = (role: 'shipper' | 'driver') => {
    // This is the final step. We save the role and redirect.
    localStorage.setItem('userRole', role);
    toast({
      title: 'نقش شما انتخاب شد',
      description: `شما به عنوان ${role === 'shipper' ? 'صاحب بار' : 'راننده'} وارد شدید.`,
    });
    router.push('/dashboard');
  };

  const handleOtpInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/[^0-9]/.test(value)) return;
    
    const newOtp = otp.split('');
    newOtp[index] = value;
    setOtp(newOtp.join('').slice(0, 6));

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };
  
   const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };


  return (
      <div className="w-full max-w-md space-y-8 animate-in fade-in-0 slide-in-from-bottom-10 duration-700 text-center">
        <div>
          <Truck className="mx-auto h-12 w-auto text-primary" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            ورود به باربر ایرانی
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === 1 && 'شماره موبایل خود را برای ورود یا ثبت‌نام وارد کنید.'}
            {step === 2 && 'کد ۶ رقمی ارسال شده به موبایل خود را وارد کنید.'}
            {step === 3 && 'نقش خود را برای ورود به پنل کاربری انتخاب کنید.'}
          </p>
        </div>

        {step === 1 && (
          <form className="space-y-6" onSubmit={handlePhoneSubmit}>
            <div className="relative">
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="text-center text-lg tracking-[.2em] h-14"
                placeholder="0912 345 6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
              />
            </div>
            <Button type="submit" className="w-full !mt-8 h-12 text-lg" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ارسال...' : 'ارسال کد تایید'}
              <LogIn className="mr-2"/>
            </Button>
            <div id="recaptcha-container"></div>
          </form>
        )}

        {step === 2 && (
           <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex justify-center gap-2" dir="ltr">
                  {[...Array(6)].map((_, i) => (
                    <Input
                      key={i}
                      ref={el => otpInputs.current[i] = el}
                      type="text"
                      maxLength={1}
                      className="size-14 text-2xl text-center font-bold"
                      value={otp[i] || ''}
                      onChange={(e) => handleOtpInputChange(e, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    />
                  ))}
                </div>
                <Button type="submit" className="w-full !mt-8 h-12 text-lg" disabled={isSubmitting || otp.length < 6}>
                   {isSubmitting ? 'در حال تایید...' : 'تایید و ادامه'}
                   <ChevronRight className="mr-2"/>
                </Button>
                 <Button variant="link" size="sm" onClick={() => { setStep(1); setOtp(''); }}>
                    ویرایش شماره موبایل
                </Button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4 !mt-10">
            <Button
              variant="outline"
              className="w-full h-20 text-xl justify-between"
              onClick={() => handleRoleSelect('shipper')}
            >
              <div className='flex items-center gap-4'>
                <Building className="size-8 text-primary" />
                <span>صاحب بار هستم</span>
              </div>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="w-full h-20 text-xl justify-between"
              onClick={() => handleRoleSelect('driver')}
            >
               <div className='flex items-center gap-4'>
                <User className="size-8 text-accent" />
                <span>راننده هستم</span>
              </div>
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>
  );
}
