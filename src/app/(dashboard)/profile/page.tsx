
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, LogOut, Edit, Save, User as UserIcon, Truck, Star, FileText, Fingerprint, Phone, Mail, MapPin, Calendar, Heart, CreditCard, Bell, Moon, Palette, Check, History, Car, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FileUploadItem } from '@/components/file-upload-item';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTransactions, Transaction } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const documentUploads = [
    "صفحه اول شناسنامه",
    "کارت ملی (پشت و رو)",
    "برگه سبز خودرو",
    "کارت ماشین"
];

const transactionTypeMap: { [key in Transaction['type']]: { text: string; sign: string } } = {
  deposit: { text: 'واریز', sign: '+' },
  withdrawal: { text: 'برداشت', sign: '-' },
  payment: { text: 'پرداخت', sign: '-' },
  refund: { text: 'بازگشت وجه', sign: '+' },
};

const transactionStatusMap: { [key in Transaction['status']]: { text: string; variant: 'default' | 'secondary' | 'destructive' } } = {
  completed: { text: 'موفق', variant: 'secondary' },
  pending: { text: 'در انتظار', variant: 'default' },
  failed: { text: 'ناموفق', variant: 'destructive' },
};


export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  
  const [userData, setUserData] = useState({
      name: 'کاربر نمونه',
      phone: '۰۹۱۲۳۴۵۶۷۸۹',
      email: 'user@example.com',
      nationalId: '۰۰۱۲۳۴۵۶۷۸',
      fatherName: 'احمد',
      birthPlace: 'تهران',
      age: '۳۵',
      maritalStatus: 'متاهل',
      criminalRecord: true,
      addictionCertificate: true,
      vehicleType: 'کامیون تک',
      vehicleModel: 'ولوو FH',
      licensePlate: 'ایران ۴۴ - ۱۲۳ب۵۶',
      rating: 4.8,
      totalTrips: 124,
  });

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    setRole(storedRole);
    if(storedRole === 'driver') {
        setUserData(prev => ({...prev, name: 'راننده نمونه'}));
    }
    
    // This check is to prevent SSR mismatch for dark mode preference
    if (typeof window !== 'undefined') {
        const darkModePreference = document.documentElement.classList.contains('dark');
        setIsDarkMode(darkModePreference);
        if ("Notification" in window) {
          setNotificationPermission(Notification.permission === 'granted');
        }
    }

    const fetchTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        toast({
          title: 'خطا در بارگذاری تراکنش‌ها',
          description: 'لطفا اتصال اینترنت خود را بررسی کنید.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    fetchTransactions();

  }, [toast]);
  
  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dark-mode', 'false');
    }
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (typeof window === 'undefined' || !("Notification" in window)) {
        toast({ title: 'مرورگر شما از اعلانات پشتیبانی نمی‌کند', variant: 'destructive'});
        return;
    }
    
    if(checked) {
        const permission = await Notification.requestPermission();
        if(permission === 'granted') {
            setNotificationPermission(true);
            toast({ title: 'دسترسی به اعلانات موفقیت آمیز بود.' });
            // In a real app, you would get the FCM token here and send to your server.
            console.log("Notification permission granted. Ready to get FCM token.");
        } else {
            setNotificationPermission(false);
            toast({ title: 'شما دسترسی به اعلانات را رد کردید.', variant: 'destructive' });
        }
    } else {
       setNotificationPermission(false);
       // Here you might want to remove the token from your server
       console.log('Notifications disabled by user.');
    }
  };


  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: 'پروفایل به‌روزرسانی شد',
      description: 'اطلاعات شما با موفقیت ذخیره شد.',
    });
  };

  const handleLogout = async () => {
    localStorage.removeItem('userRole');
    toast({ title: 'از حساب کاربری خود خارج شدید.'});
    router.push('/');
  };

  const getAmountClass = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return 'text-green-600 dark:text-green-400';
      case 'withdrawal':
      case 'payment':
        return 'text-red-600 dark:text-red-400';
      default:
        return '';
    }
  };


  if (!role) {
    return <div>در حال بارگذاری پروفایل...</div>;
  }

  return (
    <div className="space-y-6">
       <div className="relative flex items-center justify-between p-6 rounded-2xl overflow-hidden bg-card border shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent"></div>
            <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">پروفایل کاربری</h1>
                <p className="mt-2 text-muted-foreground max-w-prose">اطلاعات کاربری، مدارک و تنظیمات خود را مدیریت کنید.</p>
            </div>
            <button onClick={() => router.back()} className="relative z-10 p-2 rounded-full bg-background/50 hover:bg-background transition-colors">
                <ArrowRight className="h-6 w-6" />
            </button>
        </div>

      <Card className="relative overflow-hidden shadow-lg">
        <Image 
            src="https://picsum.photos/seed/road/1200/400"
            alt="Profile background"
            width={1200}
            height={400}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            data-ai-hint="road"
        />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <CardContent className="relative p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
                <Image 
                    src={`https://i.pravatar.cc/300?u=${role}`} 
                    alt="User avatar"
                    width={120}
                    height={120}
                    className="rounded-full object-cover shadow-lg border-4 border-background"
                />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{userData.name}</h2>
            <p className="text-base text-muted-foreground mt-1 capitalize">{role === 'shipper' ? 'صاحب بار' : 'راننده'}</p>

            {role === 'driver' && (
                <div className="mt-4 flex items-center gap-6">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold">{userData.rating.toLocaleString('fa-IR')}</span>
                        <div className="flex items-center text-sm text-muted-foreground"><Star className="w-4 h-4 ml-1 text-amber-400 fill-amber-400"/>امتیاز</div>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold">{userData.totalTrips.toLocaleString('fa-IR')}</span>
                        <span className="text-sm text-muted-foreground">سفر موفق</span>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="info" className="w-full">
          <TabsList className={cn("grid w-full", role === 'shipper' ? "grid-cols-3" : "grid-cols-4")}>
              <TabsTrigger value="info"><UserIcon className="ml-2"/>اطلاعات کاربری</TabsTrigger>
              {role === 'driver' && (
                <TabsTrigger value="docs"><FileText className="ml-2"/>مدارک</TabsTrigger>
              )}
              <TabsTrigger value="wallet"><CreditCard className="ml-2"/>کیف پول</TabsTrigger>
              <TabsTrigger value="settings"><Palette className="ml-2"/>تنظیمات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-6">
             <div className={cn("grid grid-cols-1 gap-6", role === 'driver' && "lg:grid-cols-2")}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><UserIcon className='text-primary'/>اطلاعات شخصی</CardTitle>
                         <Button variant="ghost" size="icon" onClick={() => {
                             if (isEditing) handleSave();
                             else setIsEditing(true);
                         }}>
                            {isEditing ? <Save className="h-5 w-5"/> : <Edit className="h-5 w-5"/>}
                            <span className="sr-only">{isEditing ? 'ذخیره' : 'ویرایش'}</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries({
                            name: { label: 'نام و نام خانوادگی', icon: UserIcon, editable: true },
                            fatherName: { label: 'نام پدر', icon: UserIcon, editable: true },
                            birthPlace: { label: 'محل تولد', icon: MapPin, editable: true },
                            age: { label: 'سن', icon: Calendar, editable: true },
                            maritalStatus: { label: 'وضعیت تاهل', icon: Heart, editable: true },
                            email: { label: 'ایمیل', icon: Mail, editable: true },
                            phone: { label: 'شماره تماس', icon: Phone, editable: false },
                            nationalId: { label: 'کد ملی', icon: Fingerprint, editable: false },
                        }).map(([key, { label, icon: Icon, editable }]) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5 text-muted-foreground" />
                                    <Label className="font-semibold">{label}</Label>
                                </div>
                                {isEditing && editable ? (
                                    <Input
                                        id={key}
                                        value={userData[key as keyof typeof userData] as string}
                                        onChange={(e) => setUserData(prev => ({...prev, [key]: e.target.value}))}
                                        className="max-w-xs text-left"
                                        dir="ltr"
                                    />
                                ) : (
                                    <span className="font-medium text-muted-foreground">
                                        {userData[key as keyof typeof userData]}
                                    </span>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                 {role === 'driver' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Truck className='text-primary'/>اطلاعات خودرو</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.entries({
                                vehicleType: { label: 'نوع وسیله نقلیه', icon: Truck, editable: true },
                                vehicleModel: { label: 'مدل', icon: Car, editable: true },
                                licensePlate: { label: 'شماره پلاک', icon: Shield, editable: true },
                            }).map(([key, { label, icon: Icon, editable }]) => (
                                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5 text-muted-foreground" />
                                        <Label className="font-semibold">{label}</Label>
                                    </div>
                                    {isEditing && editable ? (
                                        <Input
                                            id={key}
                                            value={userData[key as keyof typeof userData] as string}
                                            onChange={(e) => setUserData(prev => ({...prev, [key]: e.target.value}))}
                                            className="max-w-xs text-left"
                                            dir="ltr"
                                        />
                                    ) : (
                                        <span className="font-medium text-muted-foreground">
                                            {userData[key as keyof typeof userData]}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
             </div>
          </TabsContent>
          
          <TabsContent value="docs" className="mt-6">
            {role === 'driver' && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><FileText className='text-primary'/>مدارک و گواهی‌ها</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                <Label className="font-semibold flex items-center gap-2"><Check className="text-green-500"/>گواهی عدم سوء پیشینه</Label>
                                <Badge variant={userData.criminalRecord ? "secondary" : "destructive"}>{userData.criminalRecord ? "تایید شده" : "تایید نشده"}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                <Label className="font-semibold flex items-center gap-2"><Check className="text-green-500"/>گواهی عدم اعتیاد</Label>
                                <Badge variant={userData.addictionCertificate ? "secondary" : "destructive"}>{userData.addictionCertificate ? "تایید شده" : "تایید نشده"}</Badge>
                            </div>
                        </div>
                        <Separator className="my-6"/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {documentUploads.map((docLabel) => (
                                <FileUploadItem key={docLabel} label={docLabel} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
          </TabsContent>

           <TabsContent value="wallet" className="mt-6 space-y-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className='text-primary'/>کیف پول</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <div>
                            <p className="text-muted-foreground text-sm">موجودی فعلی</p>
                            <p className="text-4xl font-bold tracking-tighter">۱۲,۵۰۰,۰۰۰ <span className='text-lg font-normal'>تومان</span></p>
                        </div>
                        <Separator />
                         <div className="flex gap-4">
                            <Button className="flex-1" size="lg">افزایش موجودی</Button>
                            <Button variant="outline" className="flex-1" size="lg" onClick={() => toast({ title: 'این بخش در حال ساخت است' })}>
                                <History className="ml-2 h-5 w-5"/>
                                تسویه حساب
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>تراکنش‌های اخیر</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead>تاریخ</TableHead>
                                        <TableHead>نوع تراکنش</TableHead>
                                        <TableHead>شرح</TableHead>
                                        <TableHead className="text-left">مبلغ (تومان)</TableHead>
                                        <TableHead className="text-center">وضعیت</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingTransactions ? (
                                            Array.from({ length: 3 }).map((_, index) => (
                                                <TableRow key={index}>
                                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                    <TableCell className="text-left"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                                    <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : transactions.length > 0 ? (
                                            transactions.slice(0, 5).map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell className="font-medium whitespace-nowrap">{tx.date}</TableCell>
                                                <TableCell className="whitespace-nowrap">{transactionTypeMap[tx.type].text}</TableCell>
                                                <TableCell className="text-muted-foreground whitespace-nowrap">{tx.description}</TableCell>
                                                <TableCell className={`text-left font-semibold whitespace-nowrap ${getAmountClass(tx.type)}`}>
                                                {transactionTypeMap[tx.type].sign} {Math.abs(tx.amount).toLocaleString('fa-IR')}
                                                </TableCell>
                                                <TableCell className="text-center whitespace-nowrap">
                                                <Badge variant={transactionStatusMap[tx.status].variant}>
                                                    {transactionStatusMap[tx.status].text}
                                                </Badge>
                                                </TableCell>
                                            </TableRow>
                                            ))
                                        ) : (
                                             <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    تراکنشی یافت نشد.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                         {transactions.length > 5 && (
                             <div className="mt-4 text-center">
                                 <Button variant="link" onClick={() => router.push('/dashboard/transactions')}>مشاهده همه تراکنش‌ها</Button>
                             </div>
                         )}
                    </CardContent>
                </Card>
           </TabsContent>
           
           <TabsContent value="settings" className="mt-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Palette className='text-primary'/>تنظیمات</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                            <Label htmlFor="notifications" className="font-semibold cursor-pointer flex items-center gap-3"><Bell className="text-muted-foreground"/>اعلانات</Label>
                            <Switch id="notifications" checked={notificationPermission} onCheckedChange={handleNotificationToggle}/>
                        </div>
                         <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                            <Label htmlFor="dark-mode" className="font-semibold cursor-pointer flex items-center gap-3"><Moon className="text-muted-foreground"/>حالت تیره</Label>
                            <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleDarkModeToggle}/>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                            <Label className="font-semibold flex items-center gap-3"><Palette className="text-muted-foreground"/>شخصی‌سازی ظاهر</Label>
                            <ThemeSwitcher />
                        </div>
                    </CardContent>
                </Card>
           </TabsContent>
      </Tabs>


      <Separator />

      <div className="flex justify-end gap-4 pb-8">
          <Button variant="destructive" onClick={handleLogout}><LogOut className="ml-2"/>خروج از حساب</Button>
      </div>
    </div>
  );
}
