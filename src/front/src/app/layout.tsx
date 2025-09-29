import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import UserContextProvider from '@/contexts/user-context';

import ConfigureAmplifyClientSide from '@/components/configure-amplify';
import Header from '@/components/header';
import Footer from '@/components/footer';

import './globals.css';

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-slate-50`}
      >
        <ConfigureAmplifyClientSide />
        <UserContextProvider>
          <Header />
          <main className="w-[95%] lg:w-[90%] mx-auto mt-4 lg:mt-8 grow">{children}</main>
          <Footer />
        </UserContextProvider>
      </body>
    </html>
  );
}
