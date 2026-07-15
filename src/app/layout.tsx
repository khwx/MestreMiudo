import type {Metadata} from 'next';
import { Nunito, Fredoka } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import { SkipNav } from '@/components/SkipNav';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
});

export const metadata: Metadata = {
  title: 'MestreMiúdo',
  description: 'Um jogo educativo para crianças do 1º ao 4º ano',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${nunito.variable} ${fredoka.variable} font-body antialiased`}>
        <AccessibilityProvider>
          <SkipNav />
          {children}
          <AccessibilitySettings />
        </AccessibilityProvider>
        <Toaster />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
