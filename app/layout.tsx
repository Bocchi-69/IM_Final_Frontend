import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/sonner';
import { SmoothScroll } from '@/components/smooth-scroll';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Stockify • Retail POS & Inventory Management',
  description: 'Modern sales and inventory management platform for retail and grocery businesses.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
      <body className={`${geistSans.className} font-sans bg-background text-foreground antialiased min-h-screen`}>
        <SmoothScroll>
          <AuthProvider>{children}</AuthProvider>
          <Toaster richColors position="top-center" />
        </SmoothScroll>
      </body>
    </html>
  );
}
