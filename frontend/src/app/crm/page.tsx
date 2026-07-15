'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const TABS = [
  { id: 'deals', label: '💰 Deal Pipeline', icon: '💰' },
  { id: 'contacts', label: '👤 Contacts', icon: '👤' },
  { id: 'opportunities', label: '🎯 Opportunities', icon: '🎯' },
  { id: 'tasks', label: '✅ Tasks', icon: '✅' },
  { id: 'campaigns', label: '📧 Campaigns', icon: '📧' },
  { id: 'forecast', label: '📈 Forecast', icon: '📈' },
  { id: 'timeline', label: '⏱️ Activity Timeline', icon: '⏱️' },
];

const DEAL_STAGES = ['Discovery', 'ProposalSent', 'Negotiation', 'ContractSent', 'Won', 'Lost'];
const stageColor: Record<string, string> = {
  Discovery: '#3b82f6', ProposalSent: '#f59e0b', Negotiation: '#8a2be2',
  ContractSent: '#00f2fe', Won: '#10b981', Lost: '#ef4444'
};

function fmt(n: number) { return n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`; }

export default function CrmPage() {
  const [tab, setTab] = useState('deals');
  const [deals, setDeals] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async (t: string) => {
    setLoading(true);
    try {
      if (t === 'deals' && !deals.length) {
        const res = await fetch('/api/crm/deals');
        const data = await res.json();
        setDeals(Array.isArray(data) ? data : []);
      }
      if (t === 'contacts' && !contacts.length) {
        const res = await fetch('/api/crm/contacts');
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : []);
      }
      if (t === 'opportunities' && !opportunities.length) {
        const res = await fetch('/api/crm/opportunities');
        const data = await res.json();
        setOpportunities(Array.isArray(data) ? data : []);
      }
      if (t === 'tasks' && !tasks.length) {
        const res = await fetch('/api/crm/tasks');
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
      if (t === 'campaigns' && !campaigns.length) {
        const res = await fetch('/api/crm/campaigns');
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : []);
      }
      if (t === 'forecast' && !forecast) {
        const res = await fetch('/api/crm/forecast');
        const data = await res.json();
        setForecast(data && !data.error ? data : null);
      }
      if (t === 'timeline' && !activities.length) {
        const res = await fetch('/api/crm/activities');
        const data = await res.json();
        setActivities(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load('deals'); }, []);

  const switchTab = (t: string) => { setTab(t); load(t); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>💼 AI Sales CRM</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Deal pipeline, contact management, forecasting, and sales automation.</p>
        </div>
        <Link href="/leads" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>+ New Lead</Link>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '5px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => switchTab(t.id)} className="btn"
            style={{ padding: '7px 16px', fontSize: '0.82rem', borderRadius: '8px', background: tab === t.id ? 'var(--accent-gradient)' : 'transparent', color: tab === t.id ? '#0b0f19' : 'var(--text-secondary)', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>}

      {/* ── Deals Pipeline ── */}
      {tab === 'deals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {DEAL_STAGES.map(stage => {
              const stageDls = deals.filter(d => d.stage === stage);
              const total = stageDls.reduce((s, d) => s + Number(d.value), 0);
              return (
                <div key={stage} className="glass-panel" style={{ padding: '16px', borderTop: `3px solid ${stageColor[stage]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: stageColor[stage] }}>{stage}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{stageDls.length} deals</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '12px', color: '#00f2fe' }}>{fmt(total)}</div>
                  {stageDls.slice(0, 3).map((d: any) => (
                    <div key={d.id} style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '6px', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 600 }}>{d.title}</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{d.company?.companyName} • {fmt(Number(d.value))}</div>
                    </div>
                  ))}
                  {stageDls.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>No deals</p>}
                </div>
              );
            })}
          </div>
          {deals.length === 0 && !loading && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No deals yet. Create deals from the Leads page.</p>}
        </div>
      )}

      {/* ── Contacts ── */}
      {tab === 'contacts' && (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          {contacts.length === 0 && !loading ? (
            <p style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No contacts. Add contacts from the Lead detail page.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Name', 'Company', 'Designation', 'Email', 'Phone', 'Decision Maker'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{c.company?.companyName}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.designation}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}><a href={`mailto:${c.email}`} style={{ color: '#00f2fe' }}>{c.email}</a></td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>{c.phone}</td>
                    <td style={{ padding: '14px 16px' }}>{c.isDecisionMaker ? <span style={{ color: '#34d399' }}>✓ Yes</span> : <span style={{ color: 'var(--text-secondary)' }}>No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Opportunities ── */}
      {tab === 'opportunities' && (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          {opportunities.length === 0 && !loading ? (
            <p style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No opportunities tracked yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Title', 'Company', 'Expected Revenue', 'Probability', 'Status', 'Close Date'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {opportunities.map((o: any) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{o.title}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{o.company?.companyName}</td>
                    <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 700 }}>{fmt(Number(o.expectedRevenue))}</td>
                    <td style={{ padding: '14px 16px' }}>{o.probability}%</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: 'rgba(0,242,254,0.1)', color: '#00f2fe', borderRadius: '8px', padding: '3px 10px', fontSize: '0.78rem' }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{o.closeDate ? new Date(o.closeDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Tasks ── */}
      {tab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.length === 0 && !loading ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No tasks. Tasks appear here when created from lead/deal pages.</p>
          ) : tasks.map((t: any) => (
            <div key={t.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  {t.company?.companyName && `${t.company.companyName} • `}{t.assignee?.fullName}
                  {t.dueDate && ` • Due: ${new Date(t.dueDate).toLocaleDateString()}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ background: t.priority === 'High' || t.priority === 'Urgent' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: t.priority === 'High' || t.priority === 'Urgent' ? '#f87171' : '#fbbf24', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem' }}>{t.priority}</span>
                <span style={{ background: t.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: t.status === 'Completed' ? '#34d399' : 'var(--text-secondary)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem' }}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Campaigns ── */}
      {tab === 'campaigns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {campaigns.length === 0 && !loading ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No email campaigns yet.</p>
          ) : campaigns.map((c: any) => (
            <div key={c.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Subject: {c.subject}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>By {c.creator?.fullName}</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700, color: '#00f2fe' }}>{c.totalSent}</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Sent</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700, color: '#10b981' }}>{c.totalOpened}</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Opened</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 700, color: '#f59e0b' }}>{c.totalClicked}</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Clicked</div></div>
                <span style={{ background: c.status === 'Sent' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: c.status === 'Sent' ? '#34d399' : '#fbbf24', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', alignSelf: 'center' }}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Sales Forecast ── */}
      {tab === 'forecast' && forecast && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total Pipeline', value: fmt(forecast.totalPipeline), color: '#00f2fe', icon: '💰' },
            { label: 'Weighted Forecast', value: fmt(forecast.weightedForecast), color: '#10b981', icon: '📊' },
            { label: 'Revenue Won', value: fmt(forecast.wonRevenue), color: '#34d399', icon: '🏆' },
            { label: 'Active Deals', value: forecast.dealCount, color: '#f59e0b', icon: '🎯' },
            { label: 'Deals Won', value: forecast.wonCount, color: '#10b981', icon: '✅' },
            { label: 'Win Rate', value: `${forecast.dealCount > 0 ? Math.round((forecast.wonCount / forecast.dealCount) * 100) : 0}%`, color: '#c084fc', icon: '📈' },
          ].map(s => (
            <div key={s.label} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
          <div className="glass-panel" style={{ padding: '20px', gridColumn: '1 / -1' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>📊 Pipeline by Stage</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(forecast.byStage || {}).map(([stage, val]: any) => {
                const pct = forecast.totalPipeline > 0 ? Math.round((val / forecast.totalPipeline) * 100) : 0;
                return (
                  <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '130px', fontSize: '0.82rem', color: stageColor[stage] || '#fff' }}>{stage}</span>
                    <div style={{ flexGrow: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: stageColor[stage] || '#00f2fe', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, width: '80px', textAlign: 'right' }}>{fmt(val)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Activity Timeline ── */}
      {tab === 'timeline' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>⏱️ Activity Timeline</h3>
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No activities logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {activities.map((a: any, i) => (
                <div key={a.id} style={{ display: 'flex', gap: '16px', paddingBottom: '20px', borderLeft: i < activities.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none', marginLeft: '12px', paddingLeft: '20px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-8px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#00f2fe', border: '2px solid #0b0f19', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      {a.type} • {a.user?.fullName} {a.company?.companyName && `• ${a.company.companyName}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
