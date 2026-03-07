import { ImpersonationProvider } from '@/components/contexts/impersonation-context';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { ServiceWorkerRegistration } from '@/components/layout/service-worker-registration';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { auth } from '@/lib/auth';
import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Home | C4G Template',
  description:
    'A starter template for the computing 4 good projects leveraging Next.js and Prisma.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'C4G Template',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <SessionProvider session={session}>
            <ImpersonationProvider>
              <ServiceWorkerRegistration />
              <Header />
              <div className='mt-16 min-h-[calc(100dvh-8.4rem)]'>
                {children}
              </div>
              <Footer />
              <Toaster />
            </ImpersonationProvider>
          </SessionProvider>
        </ThemeProvider>
        <Script
          src='https://analytics.c4g.dev/script.js'
          data-website-id='96d0af65-283a-42a0-8074-099c8b77ff14'
        />
      </body>
    </html>
  );
}
