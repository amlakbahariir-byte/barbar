
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
  { name: 'Rose', primary: '347 80% 63%', accent: '85 30% 45%', background: '350 100% 98%' },
  { name: 'Blue', primary: '221 83% 53%', accent: '262 83% 58%', background: '220 60% 98%' },
  { name: 'Green', primary: '142 76% 36%', accent: '142 60% 20%', background: '140 50% 97%' },
  { name: 'Orange', primary: '25 95% 53%', accent: '25 85% 40%', background: '30 100% 97%' },
  { name: 'Violet', primary: '262 83% 58%', accent: '221 83% 53%', background: '260 100% 98%' },
];

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState('Rose');

  useEffect(() => {
    // On mount, check localStorage for a saved theme
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      handleThemeChange(savedTheme);
    }
  }, []);
  
  const handleThemeChange = (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--sidebar-primary', theme.primary);
    root.style.setProperty('--sidebar-accent', theme.primary);
    root.style.setProperty('--sidebar-ring', theme.primary);
    root.style.setProperty('--chart-1', theme.primary);
    
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--chart-2', theme.accent);

    setActiveTheme(themeName);
    localStorage.setItem('app-theme', themeName);
  };

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
              رنگ اصلی و ثانویه برنامه را انتخاب کنید.
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
                style={{ backgroundColor: `hsl(${theme.primary})` }}
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

    
