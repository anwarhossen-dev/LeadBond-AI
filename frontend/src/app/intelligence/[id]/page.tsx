'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',     label: '🏢 Overview',     emoji: '🏢' },
  { id: 'products',     label: '📦 Products',      emoji: '📦' },
  { id: 'sales',        label: '💰 Sales Intel',   emoji: '💰' },
  { id: 'growth',       label: '📈 Growth',        emoji: '📈' },
  { id: 'competitors',  label: '⚔️ Competitors',   emoji: '⚔️' },
  { id: 'customers',    label: '👥 Customers',     emoji: '👥' },
  { id: 'leads',        label: '🎯 Lead Score',    emoji: '🎯' },
  { id: 'icp',          label: '🧩 ICP Match',     emoji: '🧩' },
  { id: 'swot',         label: '🔄 SWOT',          emoji: '🔄' },
  { id: 'financial',    label: '💳 Financial',     emoji: '💳' },
  { id: 'hiring',       label: '👔 Hiring',        emoji: '👔' },
  { id: 'technology',   label: '⚙️ Tech Stack',    emoji: '⚙️' },
  { id: 'website',      label: '🌐 Website',       emoji: '🌐' },
  { id: 'marketing',    label: '📣 Marketing',     emoji: '📣' },
  { id: 'opportunity',  label: '🚀 Opportunity',   emoji: '🚀' },
  { id: 'risk',         label: '⚠️ Risk',          emoji: '⚠️' },
  { id: 'ai',           label: '🤖 AI Engine',     emoji: '🤖' },
];

// ─── Shared helpers ──────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

function ScoreBar({ label, value, color = '#00f2fe' }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
      {children}
    </div>
  );
}

function StatItem({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: highlight ? '#00f2fe' : 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Low: { bg: 'rgba(16,185,129,0.12)', text: '#34d399' },
    Medium: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' },
    High: { bg: 'rgba(239,68,68,0.12)', text: '#f87171' },
  };
  const c = colors[level] || colors.Low;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.text}30`, borderRadius: '8px', padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
      {level}
    </span>
  );
}

// ─── Tab panels ──────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Card title="🏢 Business Profile">
        <StatItem label="Company Type" value={data.companyType} />
        <StatItem label="Business Model" value={data.businessModel} />
        <StatItem label="Industry" value={data.industry} />
        <StatItem label="Sub Industry" value={data.subIndustry} />
        <StatItem label="Years in Business" value={`${data.yearsInBusiness} years`} />
        <StatItem label="Funding Status" value={data.fundingStatus} highlight />
        <StatItem label="Branch Count" value={data.branchCount} />
        <StatItem label="Market Presence" value={data.marketPresence} />
      </Card>
      <Card title="📊 Intelligence Scores">
        <ScoreBar label="Digital Presence" value={data.digitalPresenceScore} color="#00f2fe" />
        <ScoreBar label="Website Quality" value={data.websiteQualityScore} color="#4facfe" />
        <ScoreBar label="Hiring Activity" value={data.hiringActivity} color="#10b981" />
        <ScoreBar label="Expansion Score" value={data.expansionScore} color="#f59e0b" />
        <div style={{ marginTop: '8px' }}>
          <StatItem label="Social Media Activity" value={data.socialMediaActivity} />
          <StatItem label="Employee Growth" value={`${data.employeeGrowth > 0 ? '+' : ''}${data.employeeGrowth}%`} highlight />
          <StatItem label="Revenue Estimate" value={data.revenueEstimate} highlight />
          <StatItem label="Business Risk Score" value={`${data.businessRiskScore}/100`} />
        </div>
      </Card>
    </div>
  );
}

function ProductsTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <Card title="Portfolio Score">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#00f2fe' }}>{data.portfolioScore}%</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>Overall Portfolio Health</p>
          </div>
          <StatItem label="Best Category" value={data.bestCategory} highlight />
          <StatItem label="Weak Category" value={data.weakCategory} />
          <StatItem label="SKU Count" value={data.skuCount} />
          <StatItem label="Price Range" value={`$${data.priceRangeMin} – $${data.priceRangeMax}`} />
        </Card>
        <Card title="AI Summary">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{data.aiSummary}</p>
          <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(0,242,254,0.05)', borderRadius: '10px', border: '1px solid rgba(0,242,254,0.1)' }}>
            <p style={{ fontSize: '0.8rem', color: '#00f2fe', fontWeight: 600 }}>💡 Recommendation</p>
            <p style={{ fontSize: '0.85rem', marginTop: '6px', color: 'var(--text-secondary)' }}>{data.recommendation}</p>
          </div>
        </Card>
        <Card title="Product Stats">
          <ScoreBar label="Best Sellers" value={Math.round(data.products.filter((p: any) => p.isBestSeller).length / data.products.length * 100)} />
          <ScoreBar label="Premium Products" value={Math.round(data.products.filter((p: any) => p.isPremium).length / data.products.length * 100)} color="#f59e0b" />
          <ScoreBar label="New Launches" value={Math.round(data.products.filter((p: any) => p.isNewLaunch).length / data.products.length * 100)} color="#10b981" />
        </Card>
      </div>
      <Card title="📦 Product Portfolio">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Product', 'Category', 'Rating', 'Demand', 'Growth', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.products.map((p: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.category}</td>
                  <td style={{ padding: '12px 14px' }}><span style={{ color: '#f59e0b' }}>★</span> {p.rating}</td>
                  <td style={{ padding: '12px 14px' }}><RiskBadge level={p.demandLevel === 'High' ? 'Low' : p.demandLevel === 'Medium' ? 'Medium' : 'High'} /></td>
                  <td style={{ padding: '12px 14px', color: p.growthRate >= 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>{p.growthRate > 0 ? '+' : ''}{p.growthRate}%</td>
                  <td style={{ padding: '12px 14px' }}>
                    {p.isBestSeller && <span style={{ background: 'rgba(0,242,254,0.1)', color: '#00f2fe', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', marginRight: '4px' }}>🔥 Best</span>}
                    {p.isNewLaunch && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem' }}>✨ New</span>}
                    {p.isPremium && <span style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem' }}>💎 Premium</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SalesTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <Card title="💰 Revenue Estimates">
          <StatItem label="Monthly Revenue" value={fmt(data.estimatedMonthlyRevenue)} highlight />
          <StatItem label="Annual Revenue" value={fmt(data.estimatedAnnualRevenue)} highlight />
          <StatItem label="Revenue Trend" value={data.revenueTrend} />
          <StatItem label="Sales Growth" value={`+${data.salesGrowthPct}%`} highlight />
          <StatItem label="Seasonal Peak" value={data.seasonalSales} />
        </Card>
        <Card title="📊 Key Metrics">
          <StatItem label="Avg Order Value" value={fmt(data.averageOrderValue)} />
          <StatItem label="Customer LTV" value={fmt(data.customerLifetimeValue)} highlight />
          <StatItem label="Conversion Rate" value={`${data.conversionRate}%`} />
          <StatItem label="Repeat Customer Rate" value={`${data.repeatCustomerRate}%`} />
          <StatItem label="Lead Conversion" value={`${data.leadConversion}%`} />
          <StatItem label="Sales Velocity" value={`${data.salesVelocity} days`} />
        </Card>
        <Card title="🔮 AI Forecast">
          <StatItem label="30-Day Forecast" value={fmt(data.forecast30Days)} highlight />
          <StatItem label="60-Day Forecast" value={fmt(data.forecast60Days)} highlight />
          <StatItem label="90-Day Forecast" value={fmt(data.forecast90Days)} highlight />
          <StatItem label="1-Year Forecast" value={fmt(data.forecast365Days)} highlight />
        </Card>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card title="📈 Monthly Sales">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.monthlySalesData?.map((m: any) => {
              const max = Math.max(...data.monthlySalesData.map((x: any) => x.revenue));
              return (
                <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '28px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.month}</span>
                  <div style={{ flexGrow: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                    <div style={{ width: `${(m.revenue / max) * 100}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', width: '55px', textAlign: 'right', color: '#00f2fe' }}>{fmt(m.revenue)}</span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="📊 Quarterly & Yearly">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.quarterlySalesData?.map((q: any) => (
              <div key={q.quarter} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>{q.quarter}</span>
                <span style={{ color: '#00f2fe', fontWeight: 700 }}>{fmt(q.revenue)}</span>
              </div>
            ))}
            <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
              {data.yearlySalesData?.map((y: any) => (
                <div key={y.year} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{y.year}</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{fmt(y.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function GrowthTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  const metrics = [
    { label: 'Growth', value: data.growth, color: '#00f2fe' },
    { label: 'Finance', value: data.finance, color: '#4facfe' },
    { label: 'Marketing', value: data.marketing, color: '#10b981' },
    { label: 'Technology', value: data.technology, color: '#8a2be2' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Card title="📈 Business Health Score">
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '4rem', fontWeight: 800, color: '#00f2fe' }}>{data.overall}%</div>
          <p style={{ color: 'var(--text-secondary)' }}>Overall Business Health</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {metrics.map(m => <ScoreBar key={m.label} label={m.label} value={m.value} color={m.color} />)}
        </div>
      </Card>
      <Card title="🔮 AI Growth Insights">
        {metrics.map(m => (
          <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            <span style={{ fontWeight: 600 }}>{m.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                <div style={{ width: `${m.value}%`, height: '100%', background: m.color, borderRadius: '3px' }} />
              </div>
              <span style={{ fontWeight: 700, color: m.color, width: '40px' }}>{m.value}%</span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: '8px', padding: '14px', background: 'rgba(0,242,254,0.04)', borderRadius: '10px', border: '1px solid rgba(0,242,254,0.1)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Strong technology and marketing scores indicate sustainable growth. Finance score suggests room for operational efficiency improvements.
          </p>
        </div>
      </Card>
    </div>
  );
}

function CompetitorsTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ padding: '14px 20px', background: 'rgba(0,242,254,0.05)', borderRadius: '12px', border: '1px solid rgba(0,242,254,0.15)' }}>
        <p style={{ fontSize: '0.85rem', color: '#00f2fe', fontWeight: 600 }}>🤖 AI Recommendation</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{data.aiRecommendation}</p>
      </div>
      {data.competitors?.map((comp: any, i: number) => (
        <Card key={i} title={`⚔️ ${comp.name}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <StatItem label="Revenue" value={comp.revenue} highlight />
              <StatItem label="Employees" value={comp.employees.toLocaleString()} />
              <StatItem label="Products" value={comp.productsCount} />
            </div>
            <div>
              <StatItem label="Market Share" value={`${comp.marketShare}%`} highlight />
              <StatItem label="Pricing Strategy" value={comp.pricingStrategy} />
              <StatItem label="Hiring Trend" value={comp.hiringTrend} />
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '8px 12px', color: 'var(--text-secondary)', textAlign: 'left' }}>Feature</th>
                <th style={{ padding: '8px 12px', color: '#00f2fe', textAlign: 'center' }}>You</th>
                <th style={{ padding: '8px 12px', color: 'var(--text-secondary)', textAlign: 'center' }}>Competitor</th>
              </tr>
            </thead>
            <tbody>
              {['Revenue', 'Employees', 'Products', 'Market Share', 'Pricing'].map(f => (
                <tr key={f} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{f}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>✓</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
}

function CustomersTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Card title="👥 Target Audience">
        <StatItem label="Target Audience" value={data.targetAudience} />
        <StatItem label="Customer Segment" value={data.customerSegment} />
        <StatItem label="Primary Country" value={data.primaryCountry} />
        <StatItem label="Gender" value={data.genderDemographic} />
        <StatItem label="Age Group" value={data.ageGroup} />
        <StatItem label="Income Level" value={data.incomeLevel} highlight />
        <StatItem label="Buying Behavior" value={data.buyingBehavior} />
      </Card>
      <Card title="📊 Engagement Metrics">
        <ScoreBar label="Engagement Score" value={data.engagementScore} color="#00f2fe" />
        <ScoreBar label="Loyalty Score" value={data.loyaltyScore} color="#10b981" />
        <div style={{ marginTop: '8px' }}>
          <StatItem label="Churn Rate" value={`${data.churnRate}%`} />
          <StatItem label="Predicted Churn" value={`${data.predictedChurnRate}%`} />
        </div>
      </Card>
    </div>
  );
}

function LeadScoreTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  const tierColor = data.tier === 'Hot Lead' ? '#ef4444' : data.tier === 'Warm Lead' ? '#f59e0b' : '#3b82f6';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Card title="🎯 Lead Score">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '5rem', fontWeight: 900, color: tierColor }}>{data.leadScore}%</div>
          <div style={{ marginTop: '12px', display: 'inline-block', background: `${tierColor}20`, color: tierColor, border: `1px solid ${tierColor}40`, borderRadius: '20px', padding: '6px 20px', fontWeight: 700, fontSize: '1rem' }}>
            🔥 {data.tier}
          </div>
        </div>
      </Card>
      <Card title="📌 Score Reasons">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.reasons?.map((r: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <span style={{ color: '#00f2fe' }}>✓</span>
              <span style={{ fontSize: '0.9rem' }}>{r}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function IcpTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Card title="🧩 ICP Match Score">
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: '#10b981' }}>{data.matchScore}%</div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Ideal Customer Profile Match</p>
        </div>
        <ScoreBar label="Overall Match" value={data.matchScore} color="#10b981" />
      </Card>
      <Card title="📋 ICP Criteria">
        <StatItem label="Target Industry" value={data.targetIndustry} highlight />
        <StatItem label="Employee Range" value={data.employeeRange} />
        <StatItem label="Revenue Minimum" value={data.revenueMin} />
        <StatItem label="Target Country" value={data.targetCountry} />
        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(16,185,129,0.05)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.15)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{data.matchReason}</p>
        </div>
      </Card>
    </div>
  );
}

function SwotTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  const quadrants = [
    { label: '💪 Strengths', key: 'strengths', color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
    { label: '⚠️ Weaknesses', key: 'weaknesses', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
    { label: '🚀 Opportunities', key: 'opportunities', color: '#00f2fe', bg: 'rgba(0,242,254,0.06)' },
    { label: '🛡️ Threats', key: 'threats', color: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {quadrants.map(q => (
        <div key={q.key} className="glass-panel" style={{ padding: '24px', background: q.bg, borderColor: `${q.color}20` }}>
          <h3 style={{ color: q.color, fontWeight: 700, marginBottom: '16px' }}>{q.label}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(data[q.key] as string[])?.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: q.color, fontWeight: 700, marginTop: '2px' }}>•</span>
                <span style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FinancialTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Card title="💳 Financial Overview">
        <StatItem label="Revenue" value={fmt(data.revenue)} highlight />
        <StatItem label="Profit" value={fmt(data.profit)} highlight />
        <StatItem label="Expenses" value={fmt(data.expenses)} />
        <StatItem label="EBITDA" value={fmt(data.ebitda)} highlight />
        <StatItem label="Cash Flow" value={fmt(data.cashFlow)} />
        <StatItem label="Growth Rate" value={`${data.growthRate}%`} highlight />
        {data.burnRate > 0 && <StatItem label="Burn Rate / mo" value={fmt(data.burnRate)} />}
      </Card>
      <Card title="💼 Funding & Investors">
        <StatItem label="Total Funding" value={fmt(data.fundingTotal)} highlight />
        {data.investors?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {data.investors.map((inv: string, i: number) => (
              <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.9rem' }}>
                🏦 {inv}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No external investors detected — likely bootstrapped.</p>
        )}
      </Card>
    </div>
  );
}

function HiringTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <Card title="👔 Hiring Overview">
          <StatItem label="Open Jobs" value={data.openJobs} highlight />
          <StatItem label="Hiring Trend" value={data.hiringTrend} highlight />
          <StatItem label="Remote Hiring" value={`${data.remoteHiring}%`} />
          <StatItem label="Salary Range" value={data.salaryRange} />
        </Card>
        <Card title="🔧 Top Skills in Demand">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.topSkillDemand?.map((s: string) => (
              <span key={s} style={{ background: 'rgba(0,242,254,0.1)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </Card>
        <Card title="🏢 Department Growth">
          {data.departmentGrowth?.map((d: any) => (
            <div key={d.department} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.85rem' }}>{d.department}</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.openRoles} roles</span>
                <RiskBadge level={d.trend === 'Growing' ? 'Low' : d.trend === 'Declining' ? 'High' : 'Medium'} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function TechnologyTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  const sections = [
    { label: '💻 Languages', items: data.languages },
    { label: '⚙️ Frameworks', items: data.frameworks },
    { label: '☁️ Cloud', items: data.cloudProviders },
    { label: '🐳 DevOps', items: data.devOps },
    { label: '🔒 Security', items: data.security },
    { label: '🛒 eCommerce', items: data.eCommerce },
    { label: '💳 Payments', items: data.paymentGateways },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {sections.filter(s => s.items?.length > 0).map(s => (
          <Card key={s.label} title={s.label}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {s.items.map((item: string) => (
                <span key={item} style={{ background: 'rgba(138,43,226,0.1)', color: '#c084fc', border: '1px solid rgba(138,43,226,0.2)', borderRadius: '8px', padding: '5px 12px', fontSize: '0.85rem', fontWeight: 600 }}>{item}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WebsiteTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Card title="🌐 Performance Metrics">
        <ScoreBar label="Performance" value={data.performance} color="#00f2fe" />
        <ScoreBar label="SEO Score" value={data.seoScore} color="#10b981" />
        <ScoreBar label="Accessibility" value={data.accessibility} color="#f59e0b" />
        <ScoreBar label="Lighthouse Score" value={data.lighthouseScore} color="#8a2be2" />
        <StatItem label="Page Speed" value={`${data.pageSpeedMs}ms`} />
        <StatItem label="Mobile Friendly" value={data.mobileFriendly ? '✅ Yes' : '❌ No'} />
        <StatItem label="SSL Active" value={data.sslActive ? '✅ Secure' : '⚠️ Insecure'} />
        <StatItem label="Domain Age" value={`${data.domainAgeYears} years`} />
      </Card>
      <Card title="🔒 Security Headers">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.securityHeaders?.map((h: string) => (
            <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.1)' }}>
              <span style={{ color: '#34d399' }}>✓</span>
              <span style={{ fontSize: '0.85rem' }}>{h}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MarketingTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Card title="📣 Marketing Overview">
        <ScoreBar label="SEO Score" value={data.seoScore} />
        <ScoreBar label="Email Marketing" value={data.emailMarketingScore} color="#10b981" />
        <StatItem label="Organic Traffic" value={data.organicTraffic.toLocaleString()} highlight />
        <StatItem label="Backlinks" value={data.backlinksCount.toLocaleString()} />
        <StatItem label="Brand Mentions" value={data.brandMentionsCount.toLocaleString()} />
        <StatItem label="Paid Ads Running" value={data.hasPaidAds ? '✅ Yes' : '❌ No'} />
        <StatItem label="Social Engagement" value={data.socialEngagement} />
      </Card>
      <Card title="📢 Active Channels">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.activeChannels?.map((ch: string) => (
            <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <span style={{ color: '#00f2fe' }}>📡</span>
              <span style={{ fontSize: '0.9rem' }}>{ch}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OpportunityTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  const levelColor: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#3b82f6' };
  return (
    <Card title="🚀 Sales Opportunity Matrix">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.opportunities?.map((op: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: `1px solid ${levelColor[op.level]}20` }}>
            <div style={{ width: '70px', flexShrink: 0 }}>
              <span style={{ background: `${levelColor[op.level]}15`, color: levelColor[op.level], border: `1px solid ${levelColor[op.level]}30`, borderRadius: '8px', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700 }}>{op.level}</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, marginBottom: '4px' }}>{op.product}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{op.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RiskTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  const risks = [
    { label: 'Bankruptcy Risk', value: data.bankruptcyRisk },
    { label: 'Financial Risk', value: data.financialRisk },
    { label: 'Hiring Risk', value: data.hiringRisk },
    { label: 'Compliance Risk', value: data.complianceRisk },
    { label: 'Cyber Risk', value: data.cyberRisk },
    { label: 'Market Risk', value: data.marketRisk },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <Card title="⚠️ Risk Matrix">
        {risks.map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.9rem' }}>{r.label}</span>
            <RiskBadge level={r.value} />
          </div>
        ))}
      </Card>
      <Card title="📊 Overall Risk Score">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: data.overallRiskScore < 30 ? '#10b981' : data.overallRiskScore < 60 ? '#f59e0b' : '#ef4444' }}>
            {data.overallRiskScore}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            {data.overallRiskScore < 30 ? '✅ Low Risk Profile' : data.overallRiskScore < 60 ? '⚠️ Moderate Risk Profile' : '🚨 High Risk Profile'}
          </p>
        </div>
        <ScoreBar label="Risk Score" value={data.overallRiskScore} color={data.overallRiskScore < 30 ? '#10b981' : data.overallRiskScore < 60 ? '#f59e0b' : '#ef4444'} />
      </Card>
    </div>
  );
}

function AiEngineTab({ data }: { data: any }) {
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card title="🤖 AI Signals">
          <div style={{ padding: '12px', background: 'rgba(16,185,129,0.06)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.15)', marginBottom: '8px' }}>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{data.hiringGrowthPulse}</p>
          </div>
          <div style={{ padding: '12px', background: 'rgba(0,242,254,0.06)', borderRadius: '10px', border: '1px solid rgba(0,242,254,0.15)' }}>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{data.revenueGrowthPulse}</p>
          </div>
          <StatItem label="Suitable Solution" value={data.suitableSolution} highlight />
          <StatItem label="Recommended Product" value={data.recommendedProduct} highlight />
          <StatItem label="Confidence Score" value={`${data.confidenceScore}%`} highlight />
        </Card>
        <Card title="🎯 Next Best Action">
          <div style={{ padding: '16px', background: 'rgba(138,43,226,0.06)', borderRadius: '12px', border: '1px solid rgba(138,43,226,0.15)' }}>
            <p style={{ color: '#c084fc', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>💡 Recommended Next Step</p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{data.nextBestAction}</p>
          </div>
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Opportunity Matrix</p>
            {Object.entries(data.opportunityMatrix || {}).map(([k, v]: any) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '0.85rem' }}>{k}</span>
                <RiskBadge level={v === 'High' ? 'Low' : v === 'Medium' ? 'Medium' : 'High'} />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card title="✉️ AI-Generated Outreach Email">
        <pre style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7, background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {data.emailOutreach}
        </pre>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CompanyBIPage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [companyName, setCompanyName] = useState('');

  // Data stores per tab
  const [tabData, setTabData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Endpoint map
  const endpoints: Record<string, string> = {
    overview:    `/api/bi/${id}/profile`,
    products:    `/api/bi/${id}/products`,
    sales:       `/api/bi/${id}/sales`,
    growth:      `/api/bi/${id}/growth`,
    competitors: `/api/bi/${id}/competitors`,
    customers:   `/api/bi/${id}/customers`,
    leads:       `/api/bi/${id}/lead-score`,
    icp:         `/api/bi/${id}/icp`,
    swot:        `/api/bi/${id}/swot`,
    financial:   `/api/bi/${id}/financial`,
    hiring:      `/api/bi/${id}/hiring`,
    technology:  `/api/bi/${id}/technology`,
    website:     `/api/bi/${id}/website`,
    marketing:   `/api/bi/${id}/marketing`,
    opportunity: `/api/bi/${id}/opportunity`,
    risk:        `/api/bi/${id}/risk`,
    ai:          `/api/bi/${id}/recommendations`,
  };

  const loadTab = useCallback((tab: string) => {
    if (tabData[tab] || loading[tab]) return;
    setLoading(prev => ({ ...prev, [tab]: true }));
    const url = endpoints[tab];
    if (!url) return;
    fetch(url)
      .then(r => r.json())
      .then(d => setTabData(prev => ({ ...prev, [tab]: d })))
      .catch(e => console.error(e))
      .finally(() => setLoading(prev => ({ ...prev, [tab]: false })));
  }, [tabData, loading, id]);

  useEffect(() => {
    // Load company name
    fetch(`/api/bi/${id}/report`)
      .then(r => r.json())
      .then(d => setCompanyName(d.companyName || ''))
      .catch(() => {});
    // Load initial tab
    loadTab(activeTab);
  }, [id]);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    router.replace(`/intelligence/${id}?tab=${tab}`, { scroll: false });
    loadTab(tab);
  };

  const renderTab = () => {
    const d = tabData[activeTab];
    if (loading[activeTab]) return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#00f2fe' }}>
        Loading {activeTab} intelligence...
      </div>
    );
    switch (activeTab) {
      case 'overview':    return <OverviewTab data={d} />;
      case 'products':    return <ProductsTab data={d} />;
      case 'sales':       return <SalesTab data={d} />;
      case 'growth':      return <GrowthTab data={d} />;
      case 'competitors': return <CompetitorsTab data={d} />;
      case 'customers':   return <CustomersTab data={d} />;
      case 'leads':       return <LeadScoreTab data={d} />;
      case 'icp':         return <IcpTab data={d} />;
      case 'swot':        return <SwotTab data={d} />;
      case 'financial':   return <FinancialTab data={d} />;
      case 'hiring':      return <HiringTab data={d} />;
      case 'technology':  return <TechnologyTab data={d} />;
      case 'website':     return <WebsiteTab data={d} />;
      case 'marketing':   return <MarketingTab data={d} />;
      case 'opportunity': return <OpportunityTab data={d} />;
      case 'risk':        return <RiskTab data={d} />;
      case 'ai':          return <AiEngineTab data={d} />;
      default:            return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <Link href="/intelligence" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>← Intelligence Hub</Link>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>
            🧠 {companyName || 'Company'} — BI Report
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            AI-powered Enterprise Business Intelligence • 17 Analysis Modules
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => window.print()}>
            📄 Export PDF
          </button>
          <Link href={`/leads/${id}`} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            📋 View CRM Profile
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className="btn"
            style={{
              padding: '7px 14px',
              fontSize: '0.78rem',
              borderRadius: '8px',
              background: activeTab === t.id ? 'var(--accent-gradient)' : 'transparent',
              color: activeTab === t.id ? '#0b0f19' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? 700 : 500,
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>{renderTab()}</div>
    </div>
  );
}
