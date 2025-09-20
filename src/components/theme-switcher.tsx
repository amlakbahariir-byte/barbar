
'use client';

import { Palette, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Theme = {
  name: string;
  palette: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

const themes: Theme[] = [
  {
    name: 'Rose',
    palette: {
      light: {
        background: '350 100% 98%',
        foreground: '350 10% 20%',
        card: '0 0% 100%',
        'card-foreground': '350 10% 20%',
        popover: '0 0% 100%',
        'popover-foreground': '350 10% 20%',
        primary: '347 80% 63%',
        'primary-foreground': '0 0% 100%',
        secondary: '350 80% 96%',
        'secondary-foreground': '347 80% 40%',
        muted: '350 80% 96%',
        'muted-foreground': '350 20% 45%',
        accent: '85 30% 45%',
        'accent-foreground': '0 0% 100%',
        border: '350 80% 90%',
        input: '350 80% 92%',
        ring: '347 80% 63%',
      },
      dark: {
        background: '350 10% 15%',
        foreground: '350 10% 85%',
        card: '350 10% 20%',
        'card-foreground': '350 10% 85%',
        popover: '350 10% 15%',
        'popover-foreground': '350 10% 85%',
        primary: '347 70% 55%',
        'primary-foreground': '0 0% 100%',
        secondary: '350 15% 25%',
        'secondary-foreground': '350 10% 90%',
        muted: '350 15% 25%',
        'muted-foreground': '350 10% 65%',
        accent: '85 35% 55%',
        'accent-foreground': '0 0% 100%',
        border: '350 15% 25%',
        input: '350 15% 25%',
        ring: '347 70% 55%',
      },
    },
  },
  {
    name: 'Blue',
    palette: {
      light: {
        background: '210 40% 98%',
        foreground: '222 84% 4%',
        card: '0 0% 100%',
        'card-foreground': '222 84% 4%',
        popover: '0 0% 100%',
        'popover-foreground': '222 84% 4%',
        primary: '221 83% 53%',
        'primary-foreground': '210 40% 98%',
        secondary: '210 40% 96.1%',
        'secondary-foreground': '222 47% 11%',
        muted: '210 40% 96.1%',
        'muted-foreground': '215 20% 45%',
        accent: '210 40% 94.1%',
        'accent-foreground': '222 47% 11%',
        border: '214.3 31.8% 91.4%',
        input: '214.3 31.8% 91.4%',
        ring: '221 83% 53%',
      },
      dark: {
        background: '222 84% 4.9%',
        foreground: '210 40% 98%',
        card: '222 84% 4.9%',
        'card-foreground': '210 40% 98%',
        popover: '222 84% 4.9%',
        'popover-foreground': '210 40% 98%',
        primary: '217 91% 60%',
        'primary-foreground': '222 47% 11%',
        secondary: '217 33% 17%',
        'secondary-foreground': '210 40% 98%',
        muted: '217 33% 17%',
        'muted-foreground': '215 20% 65%',
        accent: '217 33% 17%',
        'accent-foreground': '210 40% 98%',
        border: '217 33% 27%',
        input: '217 33% 27%',
        ring: '217 91% 60%',
      },
    },
  },
  {
    name: 'Green',
    palette: {
      light: {
        background: '150 50% 98%',
        foreground: '145 60% 10%',
        card: '0 0% 100%',
        'card-foreground': '145 60% 10%',
        popover: '0 0% 100%',
        'popover-foreground': '145 60% 10%',
        primary: '142 76% 36%',
        'primary-foreground': '145 60% 98%',
        secondary: '150 50% 96%',
        'secondary-foreground': '142 76% 20%',
        muted: '150 50% 96%',
        'muted-foreground': '150 20% 45%',
        accent: '130 30% 45%',
        'accent-foreground': '0 0% 100%',
        border: '150 50% 90%',
        input: '150 50% 92%',
        ring: '142 76% 36%',
      },
      dark: {
        background: '145 60% 8%',
        foreground: '150 50% 90%',
        card: '145 60% 12%',
        'card-foreground': '150 50% 90%',
        popover: '145 60% 8%',
        'popover-foreground': '150 50% 90%',
        primary: '142 60% 55%',
        'primary-foreground': '145 60% 98%',
        secondary: '145 50% 20%',
        'secondary-foreground': '145 50% 90%',
        muted: '145 50% 20%',
        'muted-foreground': '150 20% 65%',
        accent: '130 35% 55%',
        'accent-foreground': '0 0% 100%',
        border: '145 50% 25%',
        input: '145 50% 25%',
        ring: '142 60% 55%',
      },
    },
  },
    {
    name: 'Orange',
    palette: {
      light: {
        background: '30 100% 98%',
        foreground: '25 60% 15%',
        card: '0 0% 100%',
        'card-foreground': '25 60% 15%',
        popover: '0 0% 100%',
        'popover-foreground': '25 60% 15%',
        primary: '25 95% 53%',
        'primary-foreground': '0 0% 100%',
        secondary: '30 100% 96%',
        'secondary-foreground': '25 95% 35%',
        muted: '30 100% 96%',
        'muted-foreground': '30 20% 45%',
        accent: '45 80% 50%',
        'accent-foreground': '0 0% 100%',
        border: '30 100% 90%',
        input: '30 100% 92%',
        ring: '25 95% 53%',
      },
      dark: {
        background: '25 60% 10%',
        foreground: '30 100% 90%',
        card: '25 60% 13%',
        'card-foreground': '30 100% 90%',
        popover: '25 60% 10%',
        'popover-foreground': '30 100% 90%',
        primary: '25 85% 60%',
        'primary-foreground': '0 0% 100%',
        secondary: '25 50% 22%',
        'secondary-foreground': '25 50% 90%',
        muted: '25 50% 22%',
        'muted-foreground': '30 20% 65%',
        accent: '45 85% 60%',
        'accent-foreground': '0 0% 100%',
        border: '25 50% 28%',
        input: '25 50% 28%',
        ring: '25 85% 60%',
      },
    },
  },
];

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState('Rose');
  const [saturation, setSaturation] = useState(1);
  const [isClient, setIsClient] = useState(false);

  // Apply theme and saturation from localStorage on initial client load
  useEffect(() => {
    setIsClient(true);
    const savedThemeName = localStorage.getItem('app-theme') || 'Rose';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    setSaturation(savedSaturation);
    applyTheme(savedThemeName, savedSaturation);
  }, []);

  const applyTheme = (themeName: string, saturationValue: number) => {
    const theme = themes.find((t) => t.name === themeName);
    if (!theme) return;

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const palette = isDark ? theme.palette.dark : theme.palette.light;

    for (const [key, value] of Object.entries(palette)) {
      root.style.setProperty(`--${key}`, value);
    }
    
    root.style.setProperty('--saturation-scale', saturationValue.toString());
    setActiveTheme(themeName);
  };
  
  const handleThemeChange = (themeName: string) => {
    applyTheme(themeName, saturation);
    localStorage.setItem('app-theme', themeName);
  }

  const handleSaturationChange = (value: number[]) => {
    const newSaturation = value[0];
    setSaturation(newSaturation);
    document.documentElement.style.setProperty('--saturation-scale', newSaturation.toString());
    localStorage.setItem('app-saturation', newSaturation.toString());
  };

  // Re-apply theme palette when dark mode changes
  useEffect(() => {
    if (!isClient) return;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          applyTheme(activeTheme, saturation);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [isClient, activeTheme, saturation]);

  if (!isClient) {
    return <div className="h-8 w-8" />; // Placeholder on the server
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">تغییر تم</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">شخصی‌سازی ظاهر</h4>
            <p className="text-sm text-muted-foreground">
              پالت رنگی و غلظت آن را انتخاب کنید.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>رنگ تم</Label>
            <div className="flex items-center gap-2 pt-1">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                    activeTheme === theme.name ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: `hsl(${theme.palette.light.primary})` }}
                  title={theme.name}
                >
                  {activeTheme === theme.name && <div className="h-3 w-3 rounded-full bg-white/80" />}
                  <span className="sr-only">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
             <Label>غلظت رنگ</Label>
             <Slider
                defaultValue={[saturation]}
                max={1.5}
                min={0}
                step={0.1}
                onValueChange={handleSaturationChange}
              />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

    