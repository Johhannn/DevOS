import './globals.css';
import { DevOSProvider } from '@/components/provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DevOS | Developer Operating System',
  description: 'A browser-based developer workspace.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">
        <DevOSProvider>
          {children}
        </DevOSProvider>
      </body>
    </html>
  );
}
