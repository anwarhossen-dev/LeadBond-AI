'use client';

import { useEffect, useState } from 'react';

const DOC_TYPES = [
  { id: 'resume', label: 'AI Resume Builder', icon: '📄', category: 'Career', color: '#00f2fe', desc: 'ATS-optimized professional resume' },
  { id: 'cover_letter', label: 'AI Cover Letter', icon: '✉️', category: 'Career', color: '#10b981', desc: 'Tailored job application letter' },
  { id: 'email', label: 'AI Email Writer', icon: '📧', category: 'Communication', color: '#3b82f6', desc: 'Cold, follow-up, or sales emails' },
  { id: 'proposal', label: 'AI Proposal Writer', icon: '📋', category: 'Business', color: '#f59e0b', desc: 'Professional business proposals' },
  { id: 'business_letter', label: 'AI Business Letter', icon: '🏢', category: 'Business', color: '#8a2be2', desc: 'Formal business correspondence' },
  { id: 'contract', label: 'AI Contract Draft', icon: '⚖️', category: 'Legal', color: '#ef4444', desc: 'Service agreements & contracts' },
  { id: 'meeting_agenda', label: 'AI Meeting Agenda', icon: '📅', category: 'Productivity', color: '#f59e0b', desc: 'Structured meeting plan' },
  { id: 'meeting_summary', label: 'AI Meeting Summary', icon: '📝', category: 'Productivity', color: '#10b981', desc: 'Post-meeting action notes' },
  { id: 'report', label: 'AI Report Generator', icon: '📊', category: 'Analytics', color: '#00f2fe', desc: 'Business & executive reports' },
  { id: 'blog', label: 'AI Blog Writer', icon: '✍️', category: 'Marketing', color: '#f59e0b', desc: 'SEO-optimized blog articles' },
  { id: 'linkedin_post', label: 'AI LinkedIn Post', icon: '💼', category: 'Social', color: '#3b82f6', desc: 'Engaging LinkedIn content' },
];

export default function WritingPage() {
  const [selected, setSelected] = useState(DOC_TYPES[0]);
  const [form, setForm] = useState({ name: '', target: '', role: '', skills: '', tone: 'professional' });
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(DOC_TYPES.map(d => d.category)))];
  const filtered = activeCategory === 'All' ? DOC_TYPES : DOC_TYPES.filter(d => d.category === activeCategory);

  const handleGenerate = async () => {
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch('/api/writing/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: selected.id, ...form })
      });
      const data = await res.json();
      setOutput(data.content || 'Generation failed');
    } catch { setOutput('Error generating document'); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>✍️ AI Writing Suite</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Generate professional documents instantly with AI. 11 document types.</p>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)} className="btn"
            style={{ padding: '6px 16px', fontSize: '0.82rem', background: activeCategory === c ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)', color: activeCategory === c ? '#0b0f19' : 'var(--text-secondary)', borderRadius: '20px', fontWeight: activeCategory === c ? 700 : 400 }}>
            {c}
          </button>
        ))}
      </div>

      {/* Document type grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        {filtered.map(d => (
          <button key={d.id} onClick={() => setSelected(d)}
            style={{ padding: '18px', borderRadius: '14px', textAlign: 'left', background: selected.id === d.id ? `${d.color}15` : 'rgba(255,255,255,0.02)', border: selected.id === d.id ? `1px solid ${d.color}40` : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{d.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: selected.id === d.id ? d.color : 'var(--text-primary)' }}>{d.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{d.desc}</div>
          </button>
        ))}
      </div>

      {/* Generator panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px', color: selected.color }}>{selected.icon} {selected.label}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Your Name</label>
              <input className="input-glass" style={{ width: '100%' }} placeholder="e.g. Sarah Jenkins" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Target Company / Recipient</label>
              <input className="input-glass" style={{ width: '100%' }} placeholder="e.g. Google, Microsoft" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Role / Subject / Title</label>
              <input className="input-glass" style={{ width: '100%' }} placeholder="e.g. Senior Software Engineer" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Key Skills / Topics</label>
              <textarea className="input-glass" style={{ width: '100%', resize: 'none' }} rows={3} placeholder="e.g. React, TypeScript, Team Leadership" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Tone</label>
              <select className="input-glass" style={{ width: '100%', background: '#0b0f19' }} value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })}>
                {['professional', 'formal', 'casual', 'persuasive', 'concise'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <button onClick={handleGenerate} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              {loading ? 'Generating...' : `✨ Generate ${selected.label}`}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700 }}>📄 Generated Document</h3>
            {output && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => navigator.clipboard.writeText(output)}>📋 Copy</button>
                <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => {
                  const blob = new Blob([output], { type: 'text/plain' });
                  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                  a.download = `${selected.id}.txt`; a.click();
                }}>⬇️ Download</button>
              </div>
            )}
          </div>
          {!output ? (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', gap: '12px' }}>
              <span style={{ fontSize: '3rem' }}>{selected.icon}</span>
              <p>Fill in the details and click Generate to create your document.</p>
            </div>
          ) : (
            <pre style={{ flexGrow: 1, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)', fontSize: '0.87rem', lineHeight: 1.7, color: 'var(--text-secondary)', overflowY: 'auto', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              {output}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
