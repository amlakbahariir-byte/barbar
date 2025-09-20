import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'باربر ایرانی',
  description: 'اپلیکیشن حمل و نقل بار در ایران',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Neshan Maps CSS */}
        <link
          href="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css"
          rel="stylesheet"
          type="text/css"
        />
      </head>
      <body className="font-body antialiased overflow-x-hidden">
        {children}
        <Toaster />
        {/* Neshan Maps JS */}
        <Script
          src="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
