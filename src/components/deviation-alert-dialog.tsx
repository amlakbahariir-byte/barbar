'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';

interface DeviationAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  alertMessage: string | null;
}

export function DeviationAlertDialog({ isOpen, onOpenChange, alertMessage }: DeviationAlertDialogProps) {
  
  const handleResponse = (response: string) => {
    console.log(`Driver response: ${response}`);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ هشدار خروج از مسیر</AlertDialogTitle>
          <AlertDialogDescription>
            {alertMessage || 'در حال بارگذاری پیام...'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <AlertDialogCancel>بستن</AlertDialogCancel>
          <Button variant="outline" onClick={() => handleResponse('ترافیک سنگین')}>ترافیک سنگین</Button>
          <Button variant="outline" onClick={() => handleResponse('بسته بودن راه')}>بسته بودن راه</Button>
          <Button variant="outline" onClick={() => handleResponse('تصادف')}>تصادف</Button>
          <AlertDialogAction onClick={() => handleResponse('سایر موارد')}>سایر موارد</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
