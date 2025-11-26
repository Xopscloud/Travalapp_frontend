import type { Metadata } from 'next';
import './globals.css';
import { PhotoLightboxProvider } from '@/components/PhotoLightboxProvider';

export const metadata: Metadata = {
  title: 'Travel Field Notes',
  description: 'A travel photo posting web app built with Next.js'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PhotoLightboxProvider>{children}</PhotoLightboxProvider>
      </body>
    </html>
  );
}
