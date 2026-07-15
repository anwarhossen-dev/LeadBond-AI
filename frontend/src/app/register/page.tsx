'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SalesRep');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save token & user profile
      localStorage.setItem('leadbond_token', data.token);
      localStorage.setItem('leadbond_user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      width: '100%'
    }}>
      <div className="glass-panel" style={{
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Register as a Sales Agent on LeadBond AI
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '0.82rem',
            fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              className="input-glass"
              style={{ width: '100%' }}
              placeholder="e.g. Sarah Jenkins"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-glass"
              style={{ width: '100%' }}
              placeholder="e.g. sarah@leadbond.ai"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              className="input-glass"
              style={{ width: '100%' }}
              placeholder="•••••••• (Min 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              User Role
            </label>
            <select
              className="input-glass"
              style={{ width: '100%', background: '#0b0f19' }}
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="SalesRep">SalesRep</option>
              <option value="SalesManager">Sales Manager</option>
              <option value="Director">Sales Director</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 700, marginTop: '8px' }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '20px'
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#00f2fe', fontWeight: 600, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
