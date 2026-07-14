'use client';

import { useEffect, useState } from 'react';

const TABS = [
  { id: 'opportunities', label: '🚀 Opportunities' },
  { id: 'industries', label: '📊 Industry Reports' },
  { id: 'countries', label: '🌍 Country Markets' },
  { id: 'prediction', label: '🔮 Growth Predictor' },
  { id: 'advisor', label: '🤖 AI Advisor' },
  { id: 'weekly', label: '📰 Weekly Report' },
];

export default function MarketPage() {
  const [tab, setTab] = useState('opportunities');
  const [opportunities, setOpportunities] = useState<any>(null);
  const [industries, setIndustries] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [predIndustry, setPredIndustry] = useState('AI & Machine Learning');
  const [weekly, setWeekly] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [advisorAnswer, setAdvisorAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/market/opportunities').then(r => r.json()).then(setOpportunities).catch(() => {});
    fetch('/api/market/industries').then(r => r.json()).then(setIndustries).catch(() => {});
    fetch('/api/market/countries').then(r => r.json()).then(setCountries).catch(() => {});
    fetch('/api/market/weekly-report').then(r => r.json()).then(setWeekly).catch(() => {});
  }, []);

  const fetchPrediction = async () => {
    setLoading(true);
    try { setPrediction(await (await fetch(`/api/market/growth-prediction?industry=${encodeURIComponent(predIndustry)}`)).json()); } catch {}
    setLoading(false);
  };

  const askAdvisor = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try { setAdvisorAnswer(await (await fetch('/api/market/advisor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) })).json()); } catch {}
    setLoading(false);
  };

  const growthColor = (g: number) => g > 20 ? '#10b981' : g > 0 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>📈 AI Market Intelligence</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Discover business opportunities, industry trends, and growth predictions powered by AI.</p>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '5px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="btn"
            style={{ padding: '7px 16px', fontSize: '0.82rem', borderRadius: '8px', background: tab === t.id ? 'var(--accent-gradient)' : 'transparent', color: tab === t.id ? '#0b0f19' : 'var(--text-secondary)', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Business Opportunities ── */}
      {tab === 'opportunities' && opportunities && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ color: '#10b981', fontWeight: 700, marginBottom: '14px' }}>📈 Growing Markets</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {opportunities.growingMarkets?.map((m: string) => (
                  <span key={m} style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '5px 12px', fontSize: '0.82rem', fontWeight: 600 }}>{m}</span>
                ))}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ color: '#ef4444', fontWeight: 700, marginBottom: '14px' }}>📉 Declining Markets</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {opportunities.decliningMarkets?.map((m: any) => (
                  <span key={m.name} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '5px 12px', fontSize: '0.82rem', fontWeight: 600 }}>{m.name}</span>
                ))}
              </div>
            </div>
          </div>
          <h3 style={{ fontWeight: 700 }}>🚀 Top Business Opportunities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {opportunities.opportunities?.map((o: any, i: number) => (
              <div key={i} className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{o.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{o.industry} • {o.country}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>Demand</div>
                  <span style={{ background: o.demand === 'Very High' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: o.demand === 'Very High' ? '#34d399' : '#fbbf24', borderRadius: '6px', padding: '3px 8px', fontSize: '0.78rem', fontWeight: 700 }}>{o.demand}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>Competition</div>
                  <span style={{ fontSize: '0.82rem' }}>{o.competition}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>Potential</div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00f2fe' }}>{o.potential}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>💡 {o.recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Industry Reports ── */}
      {tab === 'industries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {industries.map((ind: any) => (
            <div key={ind.name} className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center', borderLeft: `3px solid ${growthColor(ind.growth)}` }}>
              <div>
                <div style={{ fontWeight: 700 }}>{ind.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>Market Size: {ind.size}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Growth</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: growthColor(ind.growth) }}>{ind.growth > 0 ? '+' : ''}{ind.growth}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Competition</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ind.competition}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Hiring</div>
                <div style={{ fontSize: '0.82rem', color: ind.hiring === 'Rapidly Growing' ? '#10b981' : ind.hiring === 'Declining' ? '#ef4444' : '#f59e0b' }}>{ind.hiring}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Opportunity</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: ind.opportunity === 'Very High' ? '#10b981' : ind.opportunity === 'Very Low' ? '#ef4444' : '#f59e0b' }}>{ind.opportunity}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Risk</div>
                <div style={{ fontSize: '0.82rem', color: ind.risk === 'Very High' ? '#ef4444' : ind.risk === 'Low' ? '#10b981' : '#f59e0b' }}>{ind.risk}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Country Markets ── */}
      {tab === 'countries' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {countries.map((c: any) => (
            <div key={c.country} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>🌍 {c.country}</h3>
                <span style={{ color: '#10b981', fontWeight: 700 }}>+{c.gdpGrowth}% GDP</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Tech Spend: <strong style={{ color: '#00f2fe' }}>{c.techSpend}</strong> • {c.businessClimate} climate
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>TOP INDUSTRIES</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {c.topIndustries?.map((i: string) => <span key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem' }}>{i}</span>)}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', color: '#00f2fe', marginBottom: '6px' }}>🎯 RECOMMENDED SECTORS</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {c.recommendedSectors?.map((s: string) => <span key={s} style={{ background: 'rgba(0,242,254,0.08)', color: '#00f2fe', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem' }}>{s}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Growth Predictor ── */}
      {tab === 'prediction' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Select Industry</label>
              <select className="input-glass" style={{ width: '100%', background: '#0b0f19' }} value={predIndustry} onChange={e => setPredIndustry(e.target.value)}>
                {industries.map(i => <option key={i.name}>{i.name}</option>)}
              </select>
            </div>
            <button onClick={fetchPrediction} disabled={loading} className="btn btn-primary">{loading ? 'Predicting...' : '🔮 Predict Growth'}</button>
          </div>
          {prediction && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>📊 Growth Forecast: {prediction.industry}</h3>
                {[{ label: 'Current Growth', value: prediction.currentGrowth }, { label: '1-Year Forecast', value: prediction.prediction1Year }, { label: '3-Year Forecast', value: prediction.prediction3Year }, { label: '5-Year Forecast', value: prediction.prediction5Year }].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{r.label}</span>
                    <span style={{ fontWeight: 700, color: parseFloat(r.value) > 0 ? '#10b981' : '#ef4444' }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Growth Probability</div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    <div style={{ width: `${prediction.growthProbability}%`, height: '100%', background: '#00f2fe', borderRadius: '4px' }} />
                  </div>
                  <div style={{ marginTop: '4px', fontWeight: 700, color: '#00f2fe' }}>{prediction.growthProbability}%</div>
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>🔭 Market Signals</h3>
                {Object.entries(prediction.signals || {}).map(([k, v]: any) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span style={{ fontWeight: 600, color: '#f59e0b' }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(0,242,254,0.04)', borderRadius: '10px', border: '1px solid rgba(0,242,254,0.1)' }}>
                  <p style={{ fontSize: '0.82rem', color: '#00f2fe' }}>5-Year Outlook</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{prediction.fiveYearOutlook}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AI Business Advisor ── */}
      {tab === 'advisor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>🤖 AI Business Advisor</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>Ask anything about business opportunities, market trends, or industry insights.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input className="input-glass" style={{ flexGrow: 1 }} placeholder='e.g. "What SaaS opportunities exist in Bangladesh?" or "Which industries are growing in Canada?"' value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAdvisor()} />
              <button onClick={askAdvisor} disabled={loading || !question} className="btn btn-primary" style={{ flexShrink: 0 }}>{loading ? 'Thinking...' : '🤖 Ask AI'}</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              {['What SaaS opportunities exist in Bangladesh?', 'Which IT industries grow fastest?', 'Best markets for HR software?', 'AI business trends for 2025?'].map(q => (
                <button key={q} onClick={() => { setQuestion(q); }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '5px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>{q}</button>
              ))}
            </div>
          </div>
          {advisorAnswer && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.8rem', color: '#00f2fe', marginBottom: '10px' }}>🤖 AI Response</p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-primary)' }}>{advisorAnswer.answer}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '16px' }}>{advisorAnswer.disclaimer}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Weekly Report ── */}
      {tab === 'weekly' && weekly && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>📰 Weekly Market Report</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '20px' }}>Week of {weekly.weekOf}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {weekly.headlines?.map((h: any, index: number) => (
                <div key={`${h.event}-${index}`} style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', borderLeft: `3px solid ${h.sentiment === 'Positive' ? '#10b981' : '#ef4444'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ background: 'rgba(0,242,254,0.08)', color: '#00f2fe', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', marginRight: '10px' }}>{h.sector}</span>
                    <span style={{ fontSize: '0.88rem' }}>{h.event}</span>
                  </div>
                  <span style={{ color: h.sentiment === 'Positive' ? '#34d399' : '#f87171', fontSize: '0.78rem', fontWeight: 700 }}>{h.sentiment}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {[
              { title: '🔥 Top Growth Sectors', items: weekly.topGrowthSectors, color: '#10b981' },
              { title: '📍 Hiring Hotspots', items: weekly.hiringHotspots, color: '#f59e0b' },
              { title: '💡 Emerging Opportunities', items: weekly.emergingOpportunities, color: '#00f2fe' },
            ].map(s => (
              <div key={s.title} className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '12px', color: s.color }}>{s.title}</h4>
                {s.items?.map((item: any, index: number) => (
                  <div 
                    key={typeof item === 'object' ? `${item.name}-${index}` : `${item}-${index}`} 
                    style={{ padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.87rem' }}
                  >
                    • {typeof item === 'object' ? item.name : item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
