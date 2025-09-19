
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
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function AuthForm({ onLoginSuccess }: { onLoginSuccess: (role: 'shipper' | 'driver') => void }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!recaptchaVerifier.current) {
      const recaptchaContainer = document.createElement('div');
      recaptchaContainer.id = 'recaptcha-container';
      document.body.appendChild(recaptchaContainer);
      
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
      recaptchaVerifier.current = verifier;
    }
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!recaptchaVerifier.current) {
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
      const result = await confirmationResult.confirm(otp);
      if (result.user) {
        setStep(3);
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


  const handleLogin = (role: 'shipper' | 'driver') => {
    localStorage.setItem('userRole', role);
    onLoginSuccess(role);
  };
  

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
    <>
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
    </>
  );
}


export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };

  useEffect(() => {
    if(isClient && !loading && user){
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
            handleLoginSuccess();
        }
    }
  }, [isClient, loading, user]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 overflow-hidden">
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
            {(isClient && !loading && !user) ? (
                <AuthForm onLoginSuccess={handleLoginSuccess} />
            ) : (
                <Card className="h-64">
                    <CardContent className="flex h-full items-center justify-center">
                         <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </CardContent>
                </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
