'use client';

import { useEffect, useState } from 'react';

const TABS = [
  { id: 'jobs', label: '🔍 Job Search' },
  { id: 'ats', label: '📊 ATS Score' },
  { id: 'match', label: '🎯 AI Job Match' },
  { id: 'interview', label: '🎤 Interview Prep' },
  { id: 'dashboard', label: '📈 Recruiter Dashboard' },
];

export default function RecruitmentPage() {
  const [tab, setTab] = useState('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [atsForm, setAtsForm] = useState({ resumeText: '', jobDescription: '' });
  const [atsResult, setAtsResult] = useState<any>(null);
  const [matchForm, setMatchForm] = useState({ skills: '', experience: '', location: '' });
  const [matches, setMatches] = useState<any[]>([]);
  const [interviewForm, setInterviewForm] = useState({ role: '', type: 'HR', level: 'Mid' });
  const [interviewQ, setInterviewQ] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetch('/api/recruit/stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/recruit/jobs').then(r => r.json()).then(setJobs).catch(() => {});
  }, []);

  const runAts = async () => {
    setLoading(true);
    try { setAtsResult(await (await fetch('/api/recruit/ats-score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(atsForm) })).json()); } catch {}
    setLoading(false);
  };

  const runMatch = async () => {
    setLoading(true);
    try { setMatches(await (await fetch('/api/recruit/job-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(matchForm) })).json()); } catch {}
    setLoading(false);
  };

  const runInterview = async () => {
    setLoading(true);
    try { setInterviewQ(await (await fetch('/api/recruit/interview-questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(interviewForm) })).json()); } catch {}
    setLoading(false);
  };

  const filtered = jobs.filter(j => j.jobTitle?.toLowerCase().includes(keyword.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>🎯 Recruitment Platform</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>AI-powered job matching, ATS scoring, interview prep, and candidate tracking.</p>
      </div>

      {/* Stats row */}
      {stats && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {[
            { label: 'Total Tracked', value: stats.total, color: '#00f2fe', icon: '💼' },
            { label: 'Applications', value: stats.applied, color: '#3b82f6', icon: '📨' },
            { label: 'Interviews', value: stats.interview, color: '#f59e0b', icon: '🎤' },
            { label: 'Offers', value: stats.offer, color: '#10b981', icon: '🎉' },
            { label: 'Rejected', value: stats.rejected, color: '#ef4444', icon: '❌' },
            { label: 'Conversion Rate', value: `${stats.conversionRate}%`, color: '#c084fc', icon: '📊' },
          ].map(s => (
            <div key={s.label} className="glass-panel" style={{ padding: '18px 22px', minWidth: '150px', flexGrow: 1 }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', padding: '5px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="btn"
            style={{ padding: '7px 16px', fontSize: '0.82rem', borderRadius: '8px', background: tab === t.id ? 'var(--accent-gradient)' : 'transparent', color: tab === t.id ? '#0b0f19' : 'var(--text-secondary)', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Job Search ── */}
      {tab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input className="input-glass" style={{ maxWidth: '400px' }} placeholder="🔍 Search jobs..." value={keyword} onChange={e => setKeyword(e.target.value)} />
          {filtered.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>No jobs found. Import or capture jobs from the extension.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filtered.map((j: any) => (
                <div key={j.id} className="glass-panel glass-panel-hover" style={{ padding: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{j.jobTitle}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{j.company?.companyName} • {j.location || j.company?.country || 'Remote'}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {j.workMode && <span style={{ background: 'rgba(0,242,254,0.08)', color: '#00f2fe', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem' }}>{j.workMode}</span>}
                    {j.jobType && <span style={{ background: 'rgba(16,185,129,0.08)', color: '#34d399', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem' }}>{j.jobType}</span>}
                    <span style={{ background: j.status === 'Applied' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)', color: j.status === 'Applied' ? '#60a5fa' : 'var(--text-secondary)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem' }}>{j.status}</span>
                  </div>
                  {j.salary && <div style={{ fontSize: '0.82rem', color: '#f59e0b', marginTop: '8px', fontWeight: 600 }}>{j.salary}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ATS Score ── */}
      {tab === 'ats' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontWeight: 700 }}>📊 ATS Resume Analyzer</h3>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Resume Text</label>
              <textarea className="input-glass" style={{ width: '100%', resize: 'none' }} rows={8} placeholder="Paste your resume content..." value={atsForm.resumeText} onChange={e => setAtsForm({ ...atsForm, resumeText: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Job Description</label>
              <textarea className="input-glass" style={{ width: '100%', resize: 'none' }} rows={8} placeholder="Paste the job description..." value={atsForm.jobDescription} onChange={e => setAtsForm({ ...atsForm, jobDescription: e.target.value })} />
            </div>
            <button onClick={runAts} disabled={loading} className="btn btn-primary">
              {loading ? 'Analyzing...' : '🔍 Run ATS Analysis'}
            </button>
          </div>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!atsResult ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📊</div>
                <p>Run ATS analysis to see your resume score.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', fontWeight: 900, color: atsResult.score >= 80 ? '#10b981' : atsResult.score >= 60 ? '#f59e0b' : '#ef4444' }}>{atsResult.score}%</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>Grade: {atsResult.grade}</div>
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>✅ MATCHED SKILLS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {atsResult.matchedTech?.map((k: string) => <span key={k} style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', borderRadius: '6px', padding: '3px 8px', fontSize: '0.75rem' }}>{k}</span>)}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>❌ MISSING SKILLS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {atsResult.missingTech?.map((k: string) => <span key={k} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '6px', padding: '3px 8px', fontSize: '0.75rem' }}>{k}</span>)}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: '#00f2fe', marginBottom: '8px' }}>💡 SUGGESTIONS</p>
                  {atsResult.suggestions?.map((s: string, i: number) => <p key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>• {s}</p>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Job Match ── */}
      {tab === 'match' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Your Skills</label>
              <input className="input-glass" style={{ width: '100%' }} placeholder="React, TypeScript, Node.js" value={matchForm.skills} onChange={e => setMatchForm({ ...matchForm, skills: e.target.value })} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Experience Level</label>
              <select className="input-glass" style={{ width: '100%', background: '#0b0f19' }} value={matchForm.experience} onChange={e => setMatchForm({ ...matchForm, experience: e.target.value })}>
                {['Junior', 'Mid', 'Senior', 'Lead'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <button onClick={runMatch} disabled={loading} className="btn btn-primary" style={{ flexShrink: 0 }}>🎯 Find Matches</button>
          </div>
          {matches.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {matches.map((j: any) => (
                <div key={j.id} className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 700 }}>{j.jobTitle}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: j.matchScore >= 80 ? '#10b981' : '#f59e0b' }}>{j.matchScore}%</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '6px 0' }}>{j.company?.companyName}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {j.matchReasons?.map((r: string) => <span key={r} style={{ background: 'rgba(16,185,129,0.08)', color: '#34d399', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem' }}>✓ {r}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Interview Prep ── */}
      {tab === 'interview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontWeight: 700 }}>🎤 Interview Question Generator</h3>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Role / Position</label>
              <input className="input-glass" style={{ width: '100%' }} placeholder="e.g. Senior Software Engineer" value={interviewForm.role} onChange={e => setInterviewForm({ ...interviewForm, role: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Question Type</label>
              <select className="input-glass" style={{ width: '100%', background: '#0b0f19' }} value={interviewForm.type} onChange={e => setInterviewForm({ ...interviewForm, type: e.target.value })}>
                {['HR', 'Technical', 'Behavioral', 'Mixed'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Experience Level</label>
              <select className="input-glass" style={{ width: '100%', background: '#0b0f19' }} value={interviewForm.level} onChange={e => setInterviewForm({ ...interviewForm, level: e.target.value })}>
                {['Junior', 'Mid', 'Senior', 'Lead', 'Executive'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <button onClick={runInterview} disabled={loading} className="btn btn-primary">{loading ? 'Generating...' : '🎤 Generate Questions'}</button>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            {!interviewQ ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎤</div>
                <p>Generate interview questions to prepare.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { title: '🤝 HR Questions', items: interviewQ.hrQuestions },
                  { title: '⚙️ Technical Questions', items: interviewQ.technicalQuestions },
                  { title: '👥 Behavioral Questions', items: interviewQ.behavioralQuestions },
                ].map(section => (
                  <div key={section.title}>
                    <h4 style={{ color: '#00f2fe', marginBottom: '10px', fontSize: '0.9rem' }}>{section.title}</h4>
                    {section.items?.map((q: string, i: number) => (
                      <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '6px', fontSize: '0.87rem', borderLeft: '2px solid rgba(0,242,254,0.3)' }}>
                        {i + 1}. {q}
                      </div>
                    ))}
                  </div>
                ))}
                <div>
                  <h4 style={{ color: '#f59e0b', marginBottom: '10px', fontSize: '0.9rem' }}>💰 Salary Negotiation Tips</h4>
                  {interviewQ.salaryNegotiationTips?.map((t: string, i: number) => <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>• {t}</p>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Recruiter Dashboard ── */}
      {tab === 'dashboard' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>📈 Recruitment Funnel</h3>
            {[
              { label: 'Total Jobs Tracked', count: stats.total, color: '#00f2fe' },
              { label: 'Applications Submitted', count: stats.applied, color: '#3b82f6' },
              { label: 'Interviews Secured', count: stats.interview, color: '#f59e0b' },
              { label: 'Offers Received', count: stats.offer, color: '#10b981' },
              { label: 'Rejections', count: stats.rejected, color: '#ef4444' },
            ].map(s => {
              const pct = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0;
              return (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <span style={{ width: '200px', fontSize: '0.85rem', color: s.color }}>{s.label}</span>
                  <div style={{ flexGrow: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: '4px', transition: 'width 0.7s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, width: '40px' }}>{s.count}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', width: '40px' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
