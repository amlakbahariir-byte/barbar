
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Truck, ChevronRight, User, Building, LogIn } from 'lucide-react';
import type { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { LoaderWithSlogan } from '@/components/ui/loader-with-slogan';
import { cn } from '@/lib/utils';
import { AnimatedTruckLoader } from '@/components/ui/animated-truck-loader';

// Extend window type to include our custom properties
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

function AuthChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isInitialVisit, setIsInitialVisit] = useState(true);

  useEffect(() => {
    // This effect runs on the client after hydration.
    const hasVisited = localStorage.getItem('hasVisited');

    if (hasVisited) {
      // If the user has visited before, we don't need the initial 5-second wait.
      setIsInitialVisit(false);
    } else {
      // First visit: Show loader for 5 seconds then allow content to show.
      setTimeout(() => {
        localStorage.setItem('hasVisited', 'true');
        setIsInitialVisit(false);
      }, 5000);
    }

    const userRole = localStorage.getItem('userRole');
    
    // If a role is set in localStorage, it means the user is fully logged in. 
    // Redirect them to the dashboard.
    if (userRole) {
      router.replace('/dashboard');
    } else {
      // If there's no role, it's safe to show the login page.
      // We mark auth as checked to unmount the loader.
      setAuthChecked(true);
    }
  }, [router]);

  // While checking auth state OR during the initial 5-second visit, show a full-screen loader.
  if (!authChecked || isInitialVisit) {
    return <LoaderWithSlogan />;
  }

  // If auth state is checked and the user isn't logged in, render the children (the login page).
  return <>{children}</>;
}


export default function Home() {
  return (
    <AuthChecker>
      <main className="h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden relative p-4">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div 
                className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-primary/20 rounded-full"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 100%)',
                  transform: 'rotate(-15deg) scale(1.2)',
                  opacity: 0.5,
                }}
            />
             <div 
                className="absolute top-0 left-0 w-full h-full bg-primary"
                style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 40%, 0% 70%)',
                    transform: 'rotate(10deg) scale(1.5)',
                }}
            />
          </div>
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
    if (step === 1 && !window.recaptchaVerifier) {
      try {
        // This is a fake verifier for the demo.
        window.recaptchaVerifier = {
          verify: () => Promise.resolve('fake-recaptcha-token')
        } as unknown as RecaptchaVerifier;
      } catch (e) {
        console.error("RecaptchaVerifier error", e)
      }
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
    
    // SIMULATION: Bypass actual Firebase call to avoid configuration errors in demo.
    setTimeout(() => {
      // Fake confirmation object for the next step.
      window.confirmationResult = {
        confirm: async (code: string) => { 
          // In a real app, this would verify the code. Here we just pretend it's successful.
          return Promise.resolve({} as any); // Return a fake user credential
        }
      } as ConfirmationResult;

      setIsSubmitting(false);
      setStep(2);
      toast({ title: 'کد تایید ارسال شد', description: 'کد تایید ۱۲۳۴۵۶ است' });
    }, 1000);
  };
  
  const handleOtpSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitting || otp.length < 6) return;
    setIsSubmitting(true);
    toast({ title: 'در حال تایید کد...' });

    try {
      // We use our fake confirmation object from the previous step.
      await window.confirmationResult?.confirm(otp);
      
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
      <div className="w-full max-w-md flex flex-col justify-between h-full py-12 z-10">
        
        <div className="text-center text-primary-foreground animate-in fade-in-0 slide-in-from-top-10 duration-700">
           <AnimatedTruckLoader />
        </div>
        
        <div className={cn("transition-opacity duration-500 mb-[30px]", isSubmitting && "opacity-50 pointer-events-none")}>
            <div className="bg-card p-6 rounded-3xl shadow-2xl space-y-6 animate-in fade-in-0 slide-in-from-bottom-10 duration-700">
                <div className='text-center'>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {step === 1 && 'ورود یا ثبت‌نام'}
                    {step === 2 && 'کد تایید را وارد کنید'}
                    {step === 3 && 'نقش خود را انتخاب کنید'}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step === 1 && 'با شماره موبایل خود وارد شوید.'}
                    {step === 2 && `کد ۶ رقمی به شماره ${phone} ارسال شد.`}
                    {step === 3 && 'برای ورود به پنل کاربری نقش خود را مشخص کنید.'}
                  </p>
                </div>

                {step === 1 && (
                  <form className="space-y-4" onSubmit={handlePhoneSubmit}>
                    <div className="relative">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        className="text-center text-lg tracking-[.2em] h-14 bg-input"
                        placeholder="09100910995"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                      {isSubmitting ? 'در حال ارسال...' : 'ارسال کد'}
                      <LogIn className="mr-2"/>
                    </Button>
                    <div id="recaptcha-container"></div>
                  </form>
                )}

                {step === 2 && (
                   <form onSubmit={handleOtpSubmit} className="space-y-4">
                        <div className="flex justify-center gap-2" dir="ltr">
                          {[...Array(6)].map((_, i) => (
                            <Input
                              key={i}
                              ref={el => otpInputs.current[i] = el}
                              type="text"
                              maxLength={1}
                              className="size-10 md:size-12 text-xl text-center font-bold bg-input"
                              value={otp[i] || ''}
                              onChange={(e) => handleOtpInputChange(e, i)}
                              onKeyDown={(e) => handleOtpKeyDown(e, i)}
                            />
                          ))}
                        </div>
                        <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || otp.length < 6}>
                           {isSubmitting ? 'در حال تایید...' : 'تایید و ادامه'}
                           <ChevronRight className="mr-2"/>
                        </Button>
                         <Button variant="link" size="sm" onClick={() => { setStep(1); setOtp(''); }}>
                            ویرایش شماره موبایل
                        </Button>
                  </form>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full h-16 text-lg justify-between"
                      onClick={() => handleRoleSelect('shipper')}
                    >
                      <div className='flex items-center gap-4'>
                        <Building className="size-7 text-primary" />
                        <span>صاحب بار هستم</span>
                      </div>
                      <ChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-16 text-lg justify-between"
                      onClick={() => handleRoleSelect('driver')}
                    >
                       <div className='flex items-center gap-4'>
                        <User className="size-7 text-primary" />
                        <span>راننده هستم</span>
                      </div>
                      <ChevronRight />
                    </Button>
                  </div>
                )}
            </div>
        </div>
      </div>
  );
}
