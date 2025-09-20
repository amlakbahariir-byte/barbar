
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, LogOut, Edit, Save, User as UserIcon, Truck, BadgeCheck, FileText, Fingerprint, Phone, Mail, MapPin, Calendar, Heart, CreditCard, Bell, Moon, Palette } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { Badge } from '@/components/ui/badge';
import { FileUploadItem } from '@/components/file-upload-item';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';

const documentUploads = [
    "صفحه اول شناسنامه",
    "صفحات توضیحات شناسنامه",
    "کارت ملی (پشت و رو)"
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
      licensePlate: 'ایران ۴۴ - ۱۲۳ب۵۶'
  });

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as 'shipper' | 'driver' | null;
    setRole(storedRole);
    if(storedRole === 'driver') {
        setUserData(prev => ({...prev, name: 'راننده نمونه'}));
    }
    
    const darkModePreference = localStorage.getItem('dark-mode') === 'true';
    setIsDarkMode(darkModePreference);
    if (darkModePreference) {
        document.documentElement.classList.add('dark');
    }

  }, []);
  
  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('dark-mode', String(checked));
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
    <div className="space-y-8 max-w-5xl mx-auto">
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

      <div className="relative mt-8">
        <Card className="overflow-visible pt-28">
            <CardContent className="text-center">
                <div className="absolute w-full flex justify-center -top-20">
                    <div className="relative">
                        <div className="ring-4 ring-primary/50 ring-offset-4 ring-offset-background rounded-2xl">
                             <Image 
                                src={`https://i.pravatar.cc/300?u=${role}`} 
                                alt="User avatar"
                                width={200}
                                height={250}
                                className="rounded-2xl object-cover w-40 h-48 shadow-lg"
                            />
                        </div>
                    </div>
                </div>
                
                <h2 className="text-4xl font-bold tracking-tight">{userData.name}</h2>
                <p className="text-base text-muted-foreground mt-2 capitalize">{role === 'shipper' ? 'صاحب بار' : 'راننده'}</p>
                
                 {role === 'driver' && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="flex flex-col items-center gap-1 p-3 bg-secondary/50 rounded-lg">
                            <Fingerprint className="w-6 h-6 text-primary mb-1"/>
                            <span className="text-xs text-muted-foreground">کد ملی</span>
                            <span className="font-semibold">{userData.nationalId}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 bg-secondary/50 rounded-lg">
                            <Phone className="w-6 h-6 text-primary mb-1"/>
                            <span className="text-xs text-muted-foreground">شماره تماس</span>
                            <span className="font-semibold">{userData.phone}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 bg-secondary/50 rounded-lg">
                            <Truck className="w-6 h-6 text-primary mb-1"/>
                            <span className="text-xs text-muted-foreground">نوع خودرو</span>
                            <span className="font-semibold">{userData.vehicleType}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon className='text-primary'/>اطلاعات شخصی</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-24">نام و نام خانوادگی</Label>
                        <Input id="name" value={userData.name} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto" />
                    </div>
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-24">نام پدر</Label>
                        <Input id="fatherName" value={userData.fatherName} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-24">محل تولد</Label>
                        <Input id="birthPlace" value={userData.birthPlace} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-24">سن</Label>
                        <Input id="age" value={userData.age} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Heart className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-24">وضعیت تاهل</Label>
                        <Input id="maritalStatus" value={userData.maritalStatus} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-24">ایمیل</Label>
                        <Input id="email" value={userData.email} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                </CardContent>
            </Card>

             {role === 'driver' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Truck className='text-primary'/>اطلاعات خودرو</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                <Label className="w-28">نوع وسیله نقلیه</Label>
                                <Input id="vehicleType" value={userData.vehicleType} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                <Label className="w-28">مدل</Label>
                                <Input id="vehicleModel" value={userData.vehicleModel} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                            </div>
                            <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                <Label className="w-28">شماره پلاک</Label>
                                <Input id="licensePlate" value={userData.licensePlate} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                            </div>
                        </div>
                         <Separator />
                        <FileUploadItem label="کارت ماشین" />
                        <FileUploadItem label="برگه سبز خودرو" />
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="lg:col-span-1 space-y-8">
            {role === 'driver' && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><FileText className='text-primary'/>مدارک و گواهی‌ها</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <Label className="font-semibold">گواهی عدم سوء پیشینه</Label>
                            <Badge variant={userData.criminalRecord ? "secondary" : "destructive"}>{userData.criminalRecord ? "تایید شده" : "تایید نشده"}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <Label className="font-semibold">گواهی عدم اعتیاد</Label>
                            <Badge variant={userData.addictionCertificate ? "secondary" : "destructive"}>{userData.addictionCertificate ? "تایید شده" : "تایید نشده"}</Badge>
                        </div>
                        <Separator />
                        {documentUploads.map((docLabel) => (
                            <FileUploadItem key={docLabel} label={docLabel} />
                        ))}
                    </CardContent>
                </Card>
            )}

             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className='text-primary'/>کیف پول</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <p className="text-muted-foreground">موجودی فعلی</p>
                        <p className="text-3xl font-bold">۱۲,۵۰۰,۰۰۰ <span className='text-base font-normal'>تومان</span></p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/transactions')}>تاریخچه تراکنش‌ها</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Palette className='text-primary'/>تنظیمات</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                        <div className='flex items-center gap-3'>
                            <Bell className="text-muted-foreground"/>
                            <Label htmlFor="notifications" className="font-semibold cursor-pointer">اعلانات</Label>
                        </div>
                        <Switch id="notifications" defaultChecked/>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                        <div className='flex items-center gap-3'>
                            <Moon className="text-muted-foreground"/>
                            <Label htmlFor="dark-mode" className="font-semibold cursor-pointer">حالت تیره</Label>
                        </div>
                        <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleDarkModeToggle}/>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
                        <div className='flex items-center gap-3'>
                            <Palette className="text-muted-foreground"/>
                            <Label className="font-semibold">شخصی‌سازی ظاهر</Label>
                        </div>
                        <ThemeSwitcher />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-4 pb-8">
          <Button variant="destructive" onClick={handleLogout}><LogOut className="ml-2"/>خروج از حساب</Button>
      </div>
    </div>
  );
}
