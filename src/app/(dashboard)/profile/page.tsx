
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
import { ArrowRight, Bell, CreditCard, Edit, LogOut, Moon, Palette, Save, User as UserIcon, Truck, BadgeCheck, FileText } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { Badge } from '@/components/ui/badge';
import { FileUploadItem } from '@/components/file-upload-item';
import { ThemeSwitcher } from '@/components/theme-switcher';

const settingsOptions = [
    {
        id: 'notifications',
        icon: Bell,
        title: 'اعلانات',
        description: 'دریافت اعلان برای پیشنهادها و وضعیت بار',
    },
];

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
    
    // Check for saved theme preference
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
    <div className="max-w-4xl mx-auto space-y-8">
       <div className="flex items-center gap-4">
         <button onClick={() => router.push('/dashboard')} className="p-2 rounded-md hover:bg-muted">
            <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold">پروفایل کاربری</h1>
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
            <Button variant={isEditing ? "default" : "outline"} size="lg" onClick={() => setIsEditing(!isEditing)} className="md:ml-auto mt-4 md:mt-0 w-full md:w-auto">
                {isEditing ? <Save className="ml-2"/> : <Edit className="ml-2"/>}
                {isEditing ? 'ذخیره' : 'ویرایش پروفایل'}
            </Button>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon className='text-primary'/>اطلاعات شخصی</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                  <Label htmlFor="name">نام و نام خانوادگی</Label>
                  <Input id="name" value={userData.name} disabled={!isEditing} />
              </div>
              <div>
                  <Label htmlFor="fatherName">نام پدر</Label>
                  <Input id="fatherName" value={userData.fatherName} disabled={!isEditing} />
              </div>
              <div>
                  <Label htmlFor="nationalId">کد ملی</Label>
                  <Input id="nationalId" value={userData.nationalId} disabled />
              </div>
               <div>
                  <Label htmlFor="phone">شماره تماس</Label>
                  <Input id="phone" value={userData.phone} disabled />
               </div>
              <div>
                  <Label htmlFor="birthPlace">محل تولد</Label>
                  <Input id="birthPlace" value={userData.birthPlace} disabled={!isEditing} />
              </div>
               <div>
                  <Label htmlFor="age">سن</Label>
                  <Input id="age" value={userData.age} disabled={!isEditing} />
              </div>
               <div>
                  <Label htmlFor="maritalStatus">وضعیت تاهل</Label>
                  <Input id="maritalStatus" value={userData.maritalStatus} disabled={!isEditing} />
              </div>
               <div className="md:col-span-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input id="email" value={userData.email} disabled={!isEditing} />
               </div>
          </CardContent>
      </Card>
      
      {role === 'driver' && (
          <>
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Truck className='text-primary'/>اطلاعات و مدارک خودرو</CardTitle>
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

               <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><FileText className='text-primary'/>مدارک و گواهی‌ها</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className='flex items-center gap-3'>
                              <BadgeCheck className="text-muted-foreground"/>
                              <div>
                                  <Label className="font-semibold">گواهی عدم سوء پیشینه</Label>
                              </div>
                          </div>
                          <Badge variant={userData.criminalRecord ? "secondary" : "destructive"} className="text-accent-foreground">{userData.criminalRecord ? "تایید شده" : "تایید نشده"}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className='flex items-center gap-3'>
                              <BadgeCheck className="text-muted-foreground"/>
                              <div>
                                  <Label className="font-semibold">گواهی عدم اعتیاد</Label>
                              </div>
                          </div>
                          <Badge variant={userData.addictionCertificate ? "secondary" : "destructive"} className="text-accent-foreground">{userData.addictionCertificate ? "تایید شده" : "تایید نشده"}</Badge>
                      </div>
                      <Separator />
                      {documentUploads.map((docLabel) => (
                         <FileUploadItem key={docLabel} label={docLabel} />
                      ))}
                  </CardContent>
              </Card>
          </>
      )}

       <Card>
            <CardHeader><CardTitle>تنظیمات</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {settingsOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                        <div key={option.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div className='flex items-center gap-3'>
                                <Icon className="text-muted-foreground"/>
                                <div>
                                    <Label htmlFor={option.id} className="font-semibold">{option.title}</Label>
                                    <p className='text-xs text-muted-foreground'>{option.description}</p>
                                </div>
                            </div>
                            <Switch id={option.id} defaultChecked/>
                        </div>
                    );
                })}
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className='flex items-center gap-3'>
                        <Moon className="text-muted-foreground"/>
                        <div>
                            <Label htmlFor="dark-mode" className="font-semibold">حالت تیره</Label>
                             <p className='text-xs text-muted-foreground'>فعال‌سازی تم تاریک برای مطالعه در شب</p>
                        </div>
                    </div>
                    <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleDarkModeToggle}/>
                </div>
                 <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className='flex items-center gap-3'>
                        <Palette className="text-muted-foreground"/>
                        <div>
                            <Label className="font-semibold">شخصی‌سازی ظاهر</Label>
                            <p className='text-xs text-muted-foreground'>رنگ و غلظت تم برنامه را انتخاب کنید</p>
                        </div>
                    </div>
                    <ThemeSwitcher />
                </div>
            </CardContent>
        </Card>

      <Card>
          <CardHeader><CardTitle>کیف پول</CardTitle></CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground">موجودی فعلی</p>
                <p className="text-3xl font-bold">۱۲,۵۰۰,۰۰۰ <span className='text-base font-normal'>تومان</span></p>
              </div>
              <Button variant="outline" onClick={() => router.push('/dashboard/transactions')}><CreditCard className="ml-2"/>تاریخچه تراکنش‌ها</Button>
          </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-4 pb-8">
          <Button variant="destructive" onClick={handleLogout}><LogOut className="ml-2"/>خروج از حساب</Button>
          {isEditing && <Button size="lg" onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="ml-2"/>ذخیره نهایی</Button>}
      </div>
    </div>
  );
}

    