'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('leadbond_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('leadbond_token');
    localStorage.removeItem('leadbond_user');
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Sales CRM', path: '/crm', icon: '💼' },
    { name: 'Leads Pipeline', path: '/leads', icon: '🎯' },
    { name: 'Recruitment', path: '/recruitment', icon: '👔' },
    { name: 'AI Writing Suite', path: '/writing', icon: '✍️' },
    { name: 'Market Intelligence', path: '/market', icon: '📈' },
    { name: 'BI Intelligence', path: '/intelligence', icon: '🔭' },
    { name: 'Job Tracker', path: '/jobs', icon: '🗂️' },
    { name: 'AI Automation Hub', path: '/ai', icon: '🧠' },
    { name: 'Follow-ups', path: '/followups', icon: '⏰' },
    { name: 'Bulk Collect', path: '/bulk', icon: '📦' },
  ];

  return (
    <aside className="glass-panel" style={{
      width: '260px',
      height: 'calc(100vh - 40px)',
      position: 'fixed',
      top: '20px',
      left: '20px',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      borderRight: '1px solid var(--panel-border)',
      overflowY: 'auto',
    }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="LeadBond AI Logo" style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} />
          <span className="text-gradient" style={{ fontWeight: 800 }}>LeadBond AI</span>
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', paddingLeft: '4px' }}>
          AI Sales Intelligence Platform
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link key={item.path} href={item.path} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 500,
              color: isActive ? '#00f2fe' : 'var(--text-secondary)',
              background: isActive ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
              border: isActive ? '1px solid rgba(0, 242, 254, 0.15)' : '1px solid transparent',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            className={isActive ? '' : 'glass-panel-hover'}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0b0f19',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            {user ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AJ'}
          </div>
          <div style={{ flexGrow: 1, overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user ? user.fullName : 'Sarah Jenkins'}
            </h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {user ? user.role : 'Sales Director'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="btn btn-secondary" 
          style={{ 
            width: '100%', 
            padding: '6px 12px', 
            fontSize: '0.75rem', 
            borderRadius: '8px', 
            background: 'rgba(239, 68, 68, 0.06)', 
            color: '#f87171', 
            border: '1px solid rgba(239, 68, 68, 0.15)',
            cursor: 'pointer'
          }}
        >
          Logout 🚪
        </button>
      </div>
    </aside>
  );
}
