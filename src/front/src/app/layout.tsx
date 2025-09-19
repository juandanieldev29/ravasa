import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import Header from '@/components/header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ravasa',
  description: 'Somos un gimnasio ubicado en Sucre, Quesada, San Carlos',
  openGraph: {
    type: 'website',
    title: 'Ravasa',
    description: 'Somos un gimnasio ubicado en Sucre, Quesada, San Carlos',
    siteName: 'Ravasa',
    locale: 'es_CR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
