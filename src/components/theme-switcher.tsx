'use client';

import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEffect, useState } from 'react';

const themes = [
  { name: 'Rose', color: '347 80% 63%' },
  { name: 'Blue', color: '221 83% 53%' },
  { name: 'Green', color: '142 76% 36%' },
  { name: 'Orange', color: '25 95% 53%' },
  { name: 'Violet', color: '262 83% 58%' },
];

const darkThemes = [
  { name: 'Rose', color: '347 70% 55%' },
  { name: 'Blue', color: '221 70% 55%' },
  { name: 'Green', color: '142 60% 40%' },
  { name: 'Orange', color: '25 85% 55%' },
  { name: 'Violet', color: '262 70% 60%' },
];

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState('Rose');

  useEffect(() => {
    // On mount, check localStorage for a saved theme and apply it
    const savedThemeName = localStorage.getItem('app-theme') || 'Rose';
    handleThemeChange(savedThemeName, true);
  }, []);

  const handleThemeChange = (themeName: string, isInitial = false) => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    const themeList = isDark ? darkThemes : themes;
    const theme = themeList.find(t => t.name === themeName);
    
    if (!theme) return;

    root.style.setProperty('--primary', theme.color);
    root.style.setProperty('--ring', theme.color);
    root.style.setProperty('--sidebar-primary', theme.color);
    root.style.setProperty('--sidebar-accent', theme.color);
    root.style.setProperty('--sidebar-ring', theme.color);
    root.style.setProperty('--chart-1', theme.color);

    setActiveTheme(themeName);
    if (!isInitial) {
      localStorage.setItem('app-theme', themeName);
    }
  };
  
  useEffect(() => {
    // Re-apply theme when dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
           const savedThemeName = localStorage.getItem('app-theme') || 'Rose';
           handleThemeChange(savedThemeName, true);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">تغییر تم</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="grid gap-3">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">انتخاب رنگ تم</h4>
            <p className="text-sm text-muted-foreground">
              رنگ اصلی برنامه را انتخاب کنید.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            {themes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleThemeChange(theme.name)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  activeTheme === theme.name ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ backgroundColor: `hsl(${theme.color})` }}
                title={theme.name}
              >
                <span className="sr-only">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
