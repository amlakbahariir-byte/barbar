
'use client';

import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useEffect, useState, useMemo } from 'react';
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
      light: { primary: '347 80% 63%' },
      dark: { primary: '347 70% 55%' },
    },
  },
  {
    name: 'Blue',
    palette: {
      light: { primary: '221 83% 53%' },
      dark: { primary: '217 91% 60%' },
    },
  },
  {
    name: 'Green',
    palette: {
      light: { primary: '142 76% 36%' },
      dark: { primary: '142 60% 55%' },
    },
  },
  {
    name: 'Orange',
    palette: {
      light: { primary: '25 95% 53%' },
      dark: { primary: '25 85% 60%' },
    },
  },
    {
    name: 'Violet',
    palette: {
      light: { primary: '262 85% 58%' },
      dark: { primary: '263 70% 68%' },
    },
  },
    {
    name: 'Yellow',
    palette: {
      light: { primary: '48 96% 53%' },
      dark: { primary: '48 90% 60%' },
    },
  },
    {
    name: 'Slate',
    palette: {
      light: { primary: '215 28% 40%' },
      dark: { primary: '215 20% 65%' },
    },
  },
    {
    name: 'Gray',
    palette: {
      light: { primary: '220 9% 46%' },
      dark: { primary: '215 14% 65%' },
    },
  },
    {
    name: 'Zinc',
    palette: {
      light: { primary: '220 13% 42%' },
      dark: { primary: '220 10% 65%' },
    },
  },
];


export function ThemeSwitcher() {
  const [activeThemeName, setActiveThemeName] = useState('Rose');
  const [saturation, setSaturation] = useState(1);
  const [isClient, setIsClient] = useState(false);

  // Apply theme from localStorage on initial client load
  useEffect(() => {
    setIsClient(true);
    const savedThemeName = localStorage.getItem('app-theme') || 'Rose';
    const savedSaturation = parseFloat(localStorage.getItem('app-saturation') || '1');
    
    setActiveThemeName(savedThemeName);
    setSaturation(savedSaturation);
  }, []);
  
  const activeTheme = useMemo(() => themes.find((t) => t.name === activeThemeName) || themes[0], [activeThemeName]);


  const applyTheme = (theme: Theme, saturationValue: number) => {
    const root = document.documentElement;

    // Apply saturation
    root.style.setProperty('--saturation-scale', saturationValue.toString());
    
    // Apply primary color
    const isDark = root.classList.contains('dark');
    const primaryColor = isDark ? theme.palette.dark.primary : theme.palette.light.primary;

    root.style.setProperty('--primary', primaryColor);
    // Also update ring and sidebar colors to match
    root.style.setProperty('--ring', primaryColor);
    root.style.setProperty('--sidebar-primary', primaryColor);
    root.style.setProperty('--sidebar-accent', primaryColor);
    root.style.setProperty('--sidebar-ring', primaryColor);
    
    // The rest of the colors are defined in globals.css and will react to dark mode and saturation changes
  };

  // Effect to apply theme when activeThemeName or saturation changes, or on initial load
   useEffect(() => {
    if (isClient) {
      applyTheme(activeTheme, saturation);
    }
  }, [isClient, activeTheme, saturation]);


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

  const handleThemeChange = (themeName: string) => {
    setActiveThemeName(themeName);
    localStorage.setItem('app-theme', themeName);
  }

  const handleSaturationChange = (value: number[]) => {
    const newSaturation = value[0];
    setSaturation(newSaturation);
    localStorage.setItem('app-saturation', newSaturation.toString());
  };


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
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                    activeThemeName === theme.name ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: `hsl(${theme.palette.light.primary})` }}
                  title={theme.name}
                >
                  {activeThemeName === theme.name && <div className="h-3 w-3 rounded-full bg-white/80" />}
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
