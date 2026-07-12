import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

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
        <Sidebar />
        <main style={{
          flexGrow: 1,
          marginLeft: '300px', // 260px sidebar + 40px spacing
          padding: '40px 40px 40px 0',
          width: 'calc(100% - 300px)',
          minHeight: '100vh'
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
