
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, LogOut, Edit, Save, User as UserIcon, Truck, Star, FileText, Fingerprint, Phone, Mail, MapPin, Calendar, Heart, CreditCard, Bell, Moon, Palette, Check, History } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { Badge } from '@/components/ui/badge';
import { FileUploadItem } from '@/components/file-upload-item';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const documentUploads = [
    "صفحه اول شناسنامه",
    "کارت ملی (پشت و رو)",
    "برگه سبز خودرو",
    "کارت ماشین"
];


export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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
    
    const darkModePreference = document.documentElement.classList.contains('dark');
    setIsDarkMode(darkModePreference);

  }, []);
  
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

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: 'پروفایل به‌روزرسانی شد',
      description: 'اطلاعات شما با موفقیت ذخیره شد.',
    });
  };

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('userRole');
    toast({ title: 'از حساب کاربری خود خارج شدید.'});
    router.push('/');
  };

  if (!role) {
    return <div>در حال بارگذاری پروفایل...</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-muted">
              <ArrowRight className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold">پروفایل کاربری</h1>
        </div>
        <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)} >
            {isEditing ? <Save className="ml-2 h-4 w-4"/> : <Edit className="ml-2 h-4 w-4"/>}
            {isEditing ? 'ذخیره' : 'ویرایش'}
        </Button>
      </div>

      <Card className="relative overflow-hidden shadow-lg">
        <Image 
            src="https://picsum.photos/seed/road/1200/400"
            alt="Profile background"
            width={1200}
            height={400}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
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
          <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info"><UserIcon className="ml-2"/>اطلاعات کاربری</TabsTrigger>
              <TabsTrigger value="docs" disabled={role === 'shipper'}><FileText className="ml-2"/>مدارک</TabsTrigger>
              <TabsTrigger value="wallet"><CreditCard className="ml-2"/>کیف پول</TabsTrigger>
              <TabsTrigger value="settings"><Palette className="ml-2"/>تنظیمات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon className='text-primary'/>اطلاعات شخصی</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                         <div className="space-y-1">
                            <Label htmlFor="name">نام و نام خانوادگی</Label>
                            <Input id="name" value={userData.name} disabled={!isEditing} />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="fatherName">نام پدر</Label>
                            <Input id="fatherName" value={userData.fatherName} disabled={!isEditing} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="birthPlace">محل تولد</Label>
                            <Input id="birthPlace" value={userData.birthPlace} disabled={!isEditing} />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="age">سن</Label>
                            <Input id="age" value={userData.age} disabled={!isEditing} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="maritalStatus">وضعیت تاهل</Label>
                            <Input id="maritalStatus" value={userData.maritalStatus} disabled={!isEditing} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email">ایمیل</Label>
                            <Input id="email" value={userData.email} disabled={!isEditing} />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="phone">شماره تماس</Label>
                            <Input id="phone" value={userData.phone} disabled />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="nationalId">کد ملی</Label>
                            <Input id="nationalId" value={userData.nationalId} disabled />
                        </div>
                    </CardContent>
                </Card>

                 {role === 'driver' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Truck className='text-primary'/>اطلاعات خودرو</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="vehicleType">نوع وسیله نقلیه</Label>
                                <Input id="vehicleType" value={userData.vehicleType} disabled={!isEditing} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="vehicleModel">مدل</Label>
                                <Input id="vehicleModel" value={userData.vehicleModel} disabled={!isEditing} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="licensePlate">شماره پلاک</Label>
                                <Input id="licensePlate" value={userData.licensePlate} disabled={!isEditing} />
                            </div>
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

           <TabsContent value="wallet" className="mt-6">
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
                            <Button variant="outline" className="flex-1" size="lg" onClick={() => router.push('/dashboard/transactions')}>
                                <History className="ml-2 h-5 w-5"/>
                                تاریخچه تراکنش‌ها
                            </Button>
                        </div>
                    </CardContent>
                </Card>
           </TabsContent>
           
           <TabsContent value="settings" className="mt-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Palette className='text-primary'/>تنظیمات</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                            <Label htmlFor="notifications" className="font-semibold cursor-pointer flex items-center gap-3"><Bell className="text-muted-foreground"/>اعلانات</Label>
                            <Switch id="notifications" defaultChecked/>
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
          {isEditing && <Button size="lg" onClick={handleSave}><Save className="ml-2"/>ذخیره تغییرات</Button>}
          <Button variant="destructive" onClick={handleLogout}><LogOut className="ml-2"/>خروج از حساب</Button>
      </div>
    </div>
  );
}
