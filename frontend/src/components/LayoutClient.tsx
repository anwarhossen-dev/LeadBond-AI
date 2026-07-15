'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    const token = localStorage.getItem('leadbond_token');
    
    if (!token && !isAuthPage) {
      router.push('/login');
    } else if (token && isAuthPage) {
      router.push('/');
    } else {
      setLoading(false);
    }
  }, [pathname, isAuthPage, router]);

  if (loading && !isAuthPage) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        fontWeight: 600
      }}>
        🔄 Loading LeadBond AI...
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <main style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar />
      <main style={{
        flexGrow: 1,
        marginLeft: '300px',
        padding: '40px 40px 40px 0',
        width: 'calc(100% - 300px)',
        minHeight: '100vh'
      }}>
        {children}
      </main>
    </>
  );
}
