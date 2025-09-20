
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Bell, CreditCard, Edit, LogOut, Moon, Palette, Save, User as UserIcon, Truck, BadgeCheck, FileText, Fingerprint, Phone, Mail, MapPin, Calendar, Heart } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { Badge } from '@/components/ui/badge';
import { FileUploadItem } from '@/components/file-upload-item';
import { ThemeSwitcher } from '@/components/theme-switcher';

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
  
  // Dummy user data
  const [userData, setUserData] = useState({
      name: 'کاربر نمونه',
      phone: '۰۹۱۲۳۴۵۶۷۸۹',
      email: 'user@example.com',
      // Driver specific
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-muted">
              <ArrowRight className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold">پروفایل کاربری</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)} >
                {isEditing ? <Save className="ml-2 h-4 w-4"/> : <Edit className="ml-2 h-4 w-4"/>}
                {isEditing ? 'ذخیره' : 'ویرایش'}
            </Button>
             {isEditing && <Button size="lg" onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="ml-2 h-4 w-4"/>ذخیره نهایی</Button>}
        </div>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${role}`} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='flex-1 text-center md:text-right'>
                <h2 className="text-3xl font-bold">{userData.name}</h2>
                <p className="text-base text-muted-foreground mt-1 capitalize">{role === 'shipper' ? 'صاحب بار' : 'راننده'}</p>
            </div>
            
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon className='text-primary'/>اطلاعات شخصی</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-28">نام و نام خانوادگی</Label>
                        <Input id="name" value={userData.name} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto" />
                    </div>
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-28">نام پدر</Label>
                        <Input id="fatherName" value={userData.fatherName} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Fingerprint className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-28">کد ملی</Label>
                        <Input id="nationalId" value={userData.nationalId} disabled className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-28">شماره تماس</Label>
                        <Input id="phone" value={userData.phone} disabled className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-28">محل تولد</Label>
                        <Input id="birthPlace" value={userData.birthPlace} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-28">سن</Label>
                        <Input id="age" value={userData.age} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Heart className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-28">وضعیت تاهل</Label>
                        <Input id="maritalStatus" value={userData.maritalStatus} disabled={!isEditing} className="bg-transparent disabled:border-none disabled:p-0 h-auto"/>
                    </div>
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <Label className="w-28">ایمیل</Label>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="vehicleType">نوع وسیله نقلیه</Label>
                                <Input id="vehicleType" value={userData.vehicleType} disabled={!isEditing} />
                            </div>
                            <div>
                                <Label htmlFor="vehicleModel">مدل</Label>
                                <Input id="vehicleModel" value={userData.vehicleModel} disabled={!isEditing} />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="licensePlate">شماره پلاک</Label>
                                <Input id="licensePlate" value={userData.licensePlate} disabled={!isEditing} />
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
                <CardHeader><CardTitle>کیف پول</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <p className="text-muted-foreground">موجودی فعلی</p>
                        <p className="text-3xl font-bold">۱۲,۵۰۰,۰۰۰ <span className='text-base font-normal'>تومان</span></p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/transactions')}><CreditCard className="ml-2"/>تاریخچه تراکنش‌ها</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>تنظیمات</CardTitle></CardHeader>
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

    