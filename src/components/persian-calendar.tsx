
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Start of Jalali Calendar Logic ---

// Converts a Gregorian date to a Jalali date
function toJalali(gy: number, gm: number, gd: number) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return { jy, jm, jd };
}

// Converts a Jalali date to a Gregorian date
function toGregorian(jy: number, jm: number, jd: number) {
  let gy = (jy <= 979) ? 621 : 1600;
  jy -= (jy <= 979) ? 0 : 979;
  let days = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30 + 186));
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  gy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  
  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm;
  for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
  return { gy, gm, gd };
}

// Check if a Jalali year is a leap year
const isJalaliLeap = (jy: number) => {
  return (((((jy - ((jy > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816 < 682;
};

// Get the number of days in a Jalali month
const getJalaliMonthLength = (jy: number, jm: number) => {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  if (isJalaliLeap(jy)) return 30;
  return 29;
};

const JALALI_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const PERSIAN_WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

// --- End of Jalali Calendar Logic ---

interface PersianCalendarProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date) => void;
}

export function PersianCalendar({ selectedDate, onDateChange }: PersianCalendarProps) {
  const [displayDate, setDisplayDate] = useState(selectedDate || new Date());

  const jalaliDisplay = toJalali(displayDate.getFullYear(), displayDate.getMonth() + 1, displayDate.getDate());
  const jalaliSelected = selectedDate ? toJalali(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate()) : null;
  const today = new Date();
  const jalaliToday = toJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const { jy, jm } = jalaliDisplay;

  const monthLength = getJalaliMonthLength(jy, jm);
  const firstDayOfMonthGregorian = toGregorian(jy, jm, 1);
  const firstDayDate = new Date(firstDayOfMonthGregorian.gy, firstDayOfMonthGregorian.gm - 1, firstDayOfMonthGregorian.gd);
  const startDayOfWeek = (firstDayDate.getDay() + 1) % 7; // 0 for Shanbe, 1 for Yekshanbe, etc.

  const days = Array.from({ length: monthLength }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const handleDayClick = (day: number) => {
    const gregorian = toGregorian(jy, jm, day);
    const newDate = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    onDateChange(newDate);
  };

  const changeMonth = (amount: number) => {
    // A bit of a simplification, might not be perfect with month lengths
    const newDisplayDate = new Date(displayDate);
    const currentJalali = toJalali(newDisplayDate.getFullYear(), newDisplayDate.getMonth() + 1, newDisplayDate.getDate());
    
    let newJalaliMonth = currentJalali.jm + amount;
    let newJalaliYear = currentJalali.jy;

    if (newJalaliMonth > 12) {
      newJalaliMonth = 1;
      newJalaliYear++;
    } else if (newJalaliMonth < 1) {
      newJalaliMonth = 12;
      newJalaliYear--;
    }
    
    // Go to the first of that month to avoid issues with unequal month lengths
    const newGregorian = toGregorian(newJalaliYear, newJalaliMonth, 1);
    setDisplayDate(new Date(newGregorian.gy, newGregorian.gm - 1, newGregorian.gd));
  };
  
  const toPersianNumber = (n: number | string) => {
      const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
      return String(n).replace(/\d/g, (d: any) => persianDigits[d]);
  }

  return (
    <div className="p-3" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="text-lg font-semibold">
          {JALALI_MONTHS[jm - 1]} {toPersianNumber(jy)}
        </div>
        <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm text-muted-foreground">
        {PERSIAN_WEEK_DAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 mt-2">
        {blanks.map((_, index) => (
          <div key={`blank-${index}`} />
        ))}
        {days.map((day) => {
          const isSelected = jalaliSelected && jalaliSelected.jy === jy && jalaliSelected.jm === jm && jalaliSelected.jd === day;
          const isToday = jalaliToday.jy === jy && jalaliToday.jm === jm && jalaliToday.jd === day;
          
          return (
            <Button
              key={day}
              variant={isSelected ? 'default' : (isToday ? 'secondary' : 'ghost')}
              size="icon"
              className={cn(
                  "w-9 h-9 rounded-full",
                  isSelected && "text-primary-foreground",
                  !isSelected && isToday && "text-accent-foreground",
                  !isSelected && !isToday && "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => handleDayClick(day)}
            >
              {toPersianNumber(day)}
            </Button>
          )
        })}
      </div>
    </div>
  );
}
