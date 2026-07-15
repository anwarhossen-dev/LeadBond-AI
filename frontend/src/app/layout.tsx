import type { Metadata } from 'next';
import './globals.css';
import LayoutClient from '@/components/LayoutClient';

export const metadata: Metadata = {
  title: 'LeadBond AI | Intelligent Lead Pipeline & CRM',
  description: 'AI-powered B2B lead scoring, job posting signal analytics, and pipeline tracking dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', minHeight: '100vh' }}>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
