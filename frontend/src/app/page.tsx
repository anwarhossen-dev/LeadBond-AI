'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import PipelineFunnel from '@/components/PipelineFunnel';
import Link from 'next/link';

interface Stats {
  totalLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  pendingFollowups: number;
  averageScore: number;
  
  // Job Tracker stats
  totalJobs: number;
  jobsApplied: number;
  jobsInterview: number;
  jobsOffer: number;
  jobsRejected: number;
}

interface Platform {
  id: string;
  name: string;
  type: string;
  count: number;
}

interface WeeklyActivity {
  id: string;
  agentName: string;
  weekStart: string;
  captured: number;
  qualified: number;
  followups: number;
}

interface Activity {
  id: string;
  companyId: string;
  companyName: string;
  agentName: string;
  platform: string;
  timestamp: string;
}

interface CompanyIntelligence {
  id: string;
  companyName: string;
  industry: string;
  headquarters: string;
  annualRevenue: string;
  employeesCount: number;
}

interface DashboardData {
  stats: Stats;
  pipelineBreakdown: Record<string, number>;
  sectorBreakdown: Record<string, number>;
  sourceBreakdown: Platform[];
  weeklyTrend: WeeklyActivity[];
  recentActivity: Activity[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [sectorCompanies, setSectorCompanies] = useState<CompanyIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sales' | 'jobs' | 'intelligence'>('sales');

  useEffect(() => {
    // 1. Fetch dashboard statistics
    fetch('/api/dashboard/stats')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard statistics.');
        return res.json();
      })
      .then((data: DashboardData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });

    // 2. Fetch companies for Sector Intelligence
    fetch('/api/companies')
      .then(res => res.json())
      .then((data: any[]) => {
        const mapped = data.map(c => ({
          id: c.id,
          companyName: c.companyName,
          industry: c.industry,
          headquarters: c.headquarters || 'N/A',
          annualRevenue: c.annualRevenue || 'N/A',
          employeesCount: c.employeesCount || 0
        }));
        setSectorCompanies(mapped);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#00f2fe', animation: 'pulse 1.5s infinite' }}>
          Loading CRM Dashboard Systems...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Operational Error</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Failed to populate dashboard. Ensure backend and database are running.'}</p>
        <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={() => window.location.reload()}>
          Retry Reload
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }} className="text-gradient">LeadBond Command Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Unified portal managing corporate sales pipeline, job matching, and company intelligence.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/leads?new=true" className="btn btn-secondary">
            + Capture Lead
          </Link>
          <Link href="/jobs?new=true" className="btn btn-primary">
            + Log Job Opportunity
          </Link>
        </div>
      </div>

      {/* Tab Switcher Controls */}
      <div className="glass-panel" style={{
        padding: '6px',
        display: 'inline-flex',
        alignSelf: 'flex-start',
        gap: '4px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <button
          onClick={() => setActiveTab('sales')}
          className="btn"
          style={{
            background: activeTab === 'sales' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'sales' ? '#0b0f19' : 'var(--text-secondary)',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          💼 Sales CRM Pipeline
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className="btn"
          style={{
            background: activeTab === 'jobs' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'jobs' ? '#0b0f19' : 'var(--text-secondary)',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          🎯 Job CRM Tracker
        </button>
        <button
          onClick={() => setActiveTab('intelligence')}
          className="btn"
          style={{
            background: activeTab === 'intelligence' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'intelligence' ? '#0b0f19' : 'var(--text-secondary)',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          🏢 Sector Intelligence
        </button>
      </div>

      {/* -------------------- 1. SALES CRM TAB -------------------- */}
      {activeTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Sales Stats Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <StatsCard title="Total Leads" value={data.stats.totalLeads} icon="💼" trend="10%" trendDirection="up" colorGlow="rgba(59, 130, 246, 0.12)" />
            <StatsCard title="Qualified Leads" value={data.stats.qualifiedLeads} icon="🛡️" trend="8%" trendDirection="up" colorGlow="rgba(16, 185, 129, 0.12)" />
            <StatsCard title="Deals Won" value={data.stats.wonLeads} icon="🏆" trend="15%" trendDirection="up" colorGlow="rgba(0, 230, 118, 0.12)" />
            <StatsCard title="AI Lead Score" value={`${data.stats.averageScore}/100`} icon="🧠" trend="2%" trendDirection="up" colorGlow="rgba(138, 43, 226, 0.12)" />
          </div>

          {/* Funnels & Feeds Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.0fr', gap: '24px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>📈 Pipeline Funnel</h3>
                <PipelineFunnel data={data.pipelineBreakdown} />
              </div>
              
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>📊 SDR Weekly Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {data.weeklyTrend.map(trend => (
                    <div key={trend.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '120px', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 600 }}>{trend.agentName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Week: {trend.weekStart}</div>
                      </div>
                      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', width: '70px', color: 'var(--text-secondary)' }}>Captured</span>
                          <div style={{ flexGrow: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '3px' }}>
                            <div style={{ width: `${Math.min(trend.captured * 15, 100)}%`, height: '100%', backgroundColor: '#60a5fa', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, width: '15px' }}>{trend.captured}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', width: '70px', color: 'var(--text-secondary)' }}>Follow-ups</span>
                          <div style={{ flexGrow: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '3px' }}>
                            <div style={{ width: `${Math.min(trend.followups * 15, 100)}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, width: '15px' }}>{trend.followups}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>🚀 Sourcing Channels</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.sourceBreakdown.map(plat => (
                    <div key={plat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.015)', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{plat.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{plat.type}</p>
                      </div>
                      <span style={{ background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>{plat.count} leads</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>⚡ Capture Live Feed</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {data.recentActivity.map(act => (
                    <div key={act.id} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '12px' }}>
                      <div style={{ fontSize: '1.3rem' }}>📥</div>
                      <div>
                        <Link href={`/leads/${act.companyId}`} style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{act.companyName}</Link>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Sourced by {act.agentName} via {act.platform}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 2. JOB CRM TAB -------------------- */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Job Stats Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <StatsCard title="Total Job Tracked" value={data.stats.totalJobs} icon="💼" colorGlow="rgba(192, 132, 252, 0.12)" />
            <StatsCard title="Applications Sent" value={data.stats.jobsApplied} icon="📨" colorGlow="rgba(59, 130, 246, 0.12)" />
            <StatsCard title="Interviews Secured" value={data.stats.jobsInterview} icon="👥" colorGlow="rgba(245, 158, 11, 0.12)" />
            <StatsCard title="Job Offers" value={data.stats.jobsOffer} icon="🎉" colorGlow="rgba(16, 185, 129, 0.12)" />
            <StatsCard title="Rejections" value={data.stats.jobsRejected} icon="❌" colorGlow="rgba(239, 68, 68, 0.12)" />
          </div>

          {/* Job Overview lists */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>🎯 Job Search Funnel Status</h3>
              <Link href="/jobs" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Open Job Board →
              </Link>
            </div>
            
            {/* Custom SVG Pipeline Funnel representing application stages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Applied Opportunities', count: data.stats.jobsApplied, color: '#3b82f6' },
                { label: 'Interview Phase', count: data.stats.jobsInterview, color: '#f59e0b' },
                { label: 'Offers Received', count: data.stats.jobsOffer, color: '#10b981' },
                { label: 'Rejections Logged', count: data.stats.jobsRejected, color: '#ef4444' }
              ].map((stage, idx) => {
                const total = data.stats.totalJobs || 1;
                const percentage = Math.round((stage.count / total) * 100);
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 500 }}>{stage.label}</span>
                      <span style={{ fontWeight: 600 }}>{stage.count} ({percentage}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: stage.color, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 3. SECTOR INTELLIGENCE TAB -------------------- */}
      {activeTab === 'intelligence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Sector Stats Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <StatsCard title="Manufacturing" value={data.sectorBreakdown['Manufacturing'] || 0} icon="🏭" colorGlow="rgba(156, 163, 175, 0.12)" />
            <StatsCard title="Healthcare / Hospital" value={data.sectorBreakdown['Hospital'] || 0} icon="🏥" colorGlow="rgba(239, 68, 68, 0.12)" />
            <StatsCard title="Education / School" value={data.sectorBreakdown['School'] || 0} icon="🏫" colorGlow="rgba(59, 130, 246, 0.12)" />
            <StatsCard title="Retail / E-Commerce" value={data.sectorBreakdown['Retail'] || 0} icon="🛍️" colorGlow="rgba(245, 158, 11, 0.12)" />
            <StatsCard title="Software / SaaS" value={data.sectorBreakdown['Software & Technology'] || 0} icon="💻" colorGlow="rgba(0, 242, 254, 0.12)" />
          </div>

          {/* Firmographic Intelligence Board */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>🏢 Firmographic Target Profiles</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Company</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Sector / Industry</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Headquarters</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Employees</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Annual Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorCompanies.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>
                        <Link href={`/leads/${c.id}`} style={{ color: 'var(--text-primary)' }} onMouseEnter={e => e.currentTarget.style.color = '#00f2fe'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                          {c.companyName}
                        </Link>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{c.industry}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{c.headquarters}</td>
                      <td style={{ padding: '16px' }}>{c.employeesCount} staff</td>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--success)' }}>{c.annualRevenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
