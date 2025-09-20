
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
import { ArrowRight, Bell, CreditCard, Edit, LogOut, Moon, Palette, Save, User as UserIcon, Truck } from 'lucide-react';
import { auth } from '@/lib/firebase/config';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<'shipper' | 'driver' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Dummy user data
  const [userData, setUserData] = useState({
      name: 'کاربر نمونه',
      phone: '۰۹۱۲۳۴۵۶۷۸۹',
      email: 'user@example.com',
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
  }, []);

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
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex items-center gap-4">
         <button onClick={() => router.push('/dashboard')} className="p-2 rounded-md hover:bg-muted">
            <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold">پروفایل کاربری</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${role}`} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='text-center md:text-right'>
                <CardTitle className="text-3xl">{userData.name}</CardTitle>
                <CardDescription className="text-base mt-1 capitalize">{role === 'shipper' ? 'صاحب بار' : 'راننده'}</CardDescription>
            </div>
            <Button variant={isEditing ? "default" : "outline"} size="lg" className="mr-auto" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <Save className="ml-2"/> : <Edit className="ml-2"/>}
                {isEditing ? 'ذخیره' : 'ویرایش پروفایل'}
            </Button>
        </CardHeader>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon className='text-primary'/>اطلاعات شخصی</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label htmlFor="name">نام و نام خانوادگی</Label>
                    <Input id="name" value={userData.name} disabled={!isEditing} />
                 </div>
                 <div>
                    <Label htmlFor="phone">شماره تماس</Label>
                    <Input id="phone" value={userData.phone} disabled />
                 </div>
                 <div>
                    <Label htmlFor="email">ایمیل</Label>
                    <Input id="email" value={userData.email} disabled={!isEditing} />
                 </div>
            </CardContent>
        </Card>
        
        {role === 'driver' && (
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Truck className='text-primary'/>اطلاعات وسیله نقلیه</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="vehicleType">نوع وسیله نقلیه</Label>
                        <Input id="vehicleType" value={userData.vehicleType} disabled={!isEditing} />
                    </div>
                     <div>
                        <Label htmlFor="vehicleModel">مدل</Label>
                        <Input id="vehicleModel" value={userData.vehicleModel} disabled={!isEditing} />
                    </div>
                    <div>
                        <Label htmlFor="licensePlate">شماره پلاک</Label>
                        <Input id="licensePlate" value={userData.licensePlate} disabled={!isEditing} />
                    </div>
                </CardContent>
            </Card>
        )}
      </div>

       <Card>
            <CardHeader><CardTitle>تنظیمات</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className='flex items-center gap-3'>
                        <Bell className="text-muted-foreground"/>
                        <div>
                            <Label htmlFor="notifications" className="font-semibold">اعلانات</Label>
                            <p className='text-xs text-muted-foreground'>دریافت اعلان برای پیشنهادها و وضعیت بار</p>
                        </div>
                    </div>
                    <Switch id="notifications" defaultChecked/>
                </div>
                 <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className='flex items-center gap-3'>
                        <Palette className="text-muted-foreground"/>
                         <div>
                            <Label htmlFor="dark-mode" className="font-semibold">حالت تیره</Label>
                            <p className='text-xs text-muted-foreground'>فعال‌سازی تم تاریک برای مطالعه در شب</p>
                        </div>
                    </div>
                    <Switch id="dark-mode" />
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
              <Button variant="outline"><CreditCard className="ml-2"/>تاریخچه تراکنش‌ها</Button>
          </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-4">
          <Button variant="destructive" onClick={handleLogout}><LogOut className="ml-2"/>خروج از حساب</Button>
          {isEditing && <Button size="lg" onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="ml-2"/>ذخیره نهایی</Button>}
      </div>
    </div>
  );
}
