'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Company {
  id: string;
  companyName: string;
  industry: string;
  pipelineStage: string;
  aiScore: number;
}

export default function IntelligenceHub() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/companies')
      .then(r => r.json())
      .then(data => { setCompanies(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = companies.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>🏢 Enterprise Intelligence Hub</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
          Deep AI-powered business intelligence for every company in your pipeline.
        </p>
      </div>

      {/* Market Trends Banner */}
      <div className="glass-panel" style={{ padding: '20px 28px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>📈 Growing Markets</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['AI Software', 'Cyber Security', 'Cloud', 'EV', 'Healthcare', 'EdTech'].map(t => (
              <span key={t} style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>📉 Declining Markets</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['DVD', 'Traditional Printing', 'Fax Services'].map(t => (
              <span key={t} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        className="input-glass"
        style={{ maxWidth: '400px' }}
        placeholder="🔍  Search companies..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading companies...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map(c => (
            <div key={c.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{c.companyName}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{c.industry}</p>
                </div>
                <div className={`score-indicator ${c.aiScore >= 80 ? 'score-high' : c.aiScore >= 60 ? 'score-medium' : 'score-low'}`} style={{ width: '42px', height: '42px', fontSize: '0.9rem' }}>
                  {c.aiScore}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link href={`/intelligence/${c.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', flexGrow: 1, justifyContent: 'center' }}>
                  🧠 Full BI Report
                </Link>
                <Link href={`/intelligence/${c.id}?tab=swot`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  SWOT
                </Link>
                <Link href={`/intelligence/${c.id}?tab=competitors`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  Compete
                </Link>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', gridColumn: '1/-1' }}>No companies found. Add leads first.</p>
          )}
        </div>
      )}
    </div>
  );
}
