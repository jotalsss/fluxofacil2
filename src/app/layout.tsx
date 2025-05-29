
import type {Metadata} from 'next';
import { Geist } from 'next/font/google'; // Using only Geist Sans as per current setup
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { APP_NAME } from '@/lib/constants';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Removed Geist Mono as it's not explicitly used in body className
// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Personal finance management made easy with FluxoFacil.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning><body className={`${geistSans.variable} antialiased`}>
        {children}
        <Toaster />
      </body></html>
  );
}
