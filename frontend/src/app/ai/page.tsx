'use client';

import { useEffect, useState } from 'react';

interface Company {
  id: string;
  companyName: string;
}

export default function AiHub() {
  const [activeSubTab, setActiveSubTab] = useState<'ats' | 'writer' | 'intelligence'>('ats');
  const [companies, setCompanies] = useState<Company[]>([]);

  // ATS state
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState<any | null>(null);
  const [loadingAts, setLoadingAts] = useState(false);

  // Writer state
  const [writerCompany, setWriterCompany] = useState('');
  const [writerJobTitle, setWriterJobTitle] = useState('');
  const [writerRequirements, setWriterRequirements] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loadingLetter, setLoadingLetter] = useState(false);

  // Intelligence state
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [intelligenceResult, setIntelligenceResult] = useState<any | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);

  useEffect(() => {
    // Load companies list for dropdowns
    fetch('/api/companies')
      .then(res => res.json())
      .then((data: Company[]) => {
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompanyId(data[0].id);
          setWriterCompany(data[0].companyName);
        }
      });
  }, []);

  const handleRunAtsAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText || !jobDescription) return;
    setLoadingAts(true);

    try {
      const response = await fetch('/api/ai/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      if (!response.ok) throw new Error('ATS analysis failed.');
      const data = await response.json();
      setAtsResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingAts(false);
    }
  };

  const handleGenerateDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writerCompany || !writerJobTitle) return;
    setLoadingLetter(true);

    try {
      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: writerCompany,
          jobTitle: writerJobTitle,
          requirements: writerRequirements
        }),
      });
      if (!response.ok) throw new Error('Generation failed.');
      const data = await response.json();
      setGeneratedLetter(data.letter);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingLetter(false);
    }
  };

  const handleRunIntelligence = async () => {
    if (!selectedCompanyId) return;
    setLoadingIntel(true);

    try {
      const response = await fetch('/api/ai/company-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompanyId }),
      });
      if (!response.ok) throw new Error('Company operational intelligence check failed.');
      const data = await response.json();
      setIntelligenceResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingIntel(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Content copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }} className="text-gradient">AI Automation Hub</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Cognitive CRM analysis suite for resume matching, document generators, and company operational intelligence.</p>
      </div>

      {/* Sub-tab Switchers */}
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
          onClick={() => setActiveSubTab('ats')}
          className="btn"
          style={{
            background: activeSubTab === 'ats' ? 'var(--accent-gradient)' : 'transparent',
            color: activeSubTab === 'ats' ? '#0b0f19' : 'var(--text-secondary)',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          🔍 ATS Resume Matcher
        </button>
        <button
          onClick={() => setActiveSubTab('writer')}
          className="btn"
          style={{
            background: activeSubTab === 'writer' ? 'var(--accent-gradient)' : 'transparent',
            color: activeSubTab === 'writer' ? '#0b0f19' : 'var(--text-secondary)',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          ✍️ Proposal & Letter Writer
        </button>
        <button
          onClick={() => setActiveSubTab('intelligence')}
          className="btn"
          style={{
            background: activeSubTab === 'intelligence' ? 'var(--accent-gradient)' : 'transparent',
            color: activeSubTab === 'intelligence' ? '#0b0f19' : 'var(--text-secondary)',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}
        >
          🤖 Company Intelligence
        </button>
      </div>

      {/* -------------------- 1. ATS RESUME MATCHER -------------------- */}
      {activeSubTab === 'ats' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Input Form */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '20px' }}>Input Profile Information</h3>
            <form onSubmit={handleRunAtsAnalysis} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Resume / CV Text Profile</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Paste details of your resume (education, experience, technical stack)..."
                  className="input-glass"
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Job Description</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Paste details of the job requirements, experience, and key stacks..."
                  className="input-glass"
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loadingAts} className="btn btn-primary" style={{ width: '100%' }}>
                {loadingAts ? 'Analyzing match ratios...' : 'Run ATS Scanner Match'}
              </button>
            </form>
          </div>

          {/* Results Output */}
          <div className="glass-panel" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!atsResult ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>📊</span>
                <p>Paste profile specifications and click "Run ATS Scanner" to fetch evaluation metrics.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Score Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="score-indicator score-high" style={{ width: '80px', height: '80px', fontSize: '1.8rem', flexShrink: 0 }}>
                    {atsResult.score}%
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem' }}>ATS Match Score</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {atsResult.score >= 80 ? 'Highly compatible! Ideal fit.' : atsResult.score >= 60 ? 'Moderate fit. Optimization recommended.' : 'Low fit. Heavy optimizations needed.'}
                    </p>
                  </div>
                </div>

                {/* Keyword Tags */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Matched Stacks</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {atsResult.matchedKeywords.map((kw: string, i: number) => (
                      <span key={i} className="badge badge-won" style={{ fontSize: '0.7rem' }}>{kw}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Missing Stacks</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {atsResult.missingKeywords.map((kw: string, i: number) => (
                      <span key={i} className="badge badge-lost" style={{ fontSize: '0.7rem' }}>{kw}</span>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '8px' }}>ATS Optimization Actions</h4>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {atsResult.suggestions.map((sug: string, i: number) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- 2. PROPOSAL & COVER LETTER WRITER -------------------- */}
      {activeSubTab === 'writer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
          {/* Inputs */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '20px' }}>Parameters</h3>
            <form onSubmit={handleGenerateDocuments} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oakridge Academy"
                  className="input-glass"
                  value={writerCompany}
                  onChange={e => setWriterCompany(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Position / Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT Lead / Systems Administrator"
                  className="input-glass"
                  value={writerJobTitle}
                  onChange={e => setWriterJobTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Core Application Requirements</label>
                <textarea
                  rows={4}
                  placeholder="e.g. School software management, Active Directory systems..."
                  className="input-glass"
                  value={writerRequirements}
                  onChange={e => setWriterRequirements(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loadingLetter} className="btn btn-primary">
                {loadingLetter ? 'Writing Outbound documents...' : 'Generate Cover Letter'}
              </button>
            </form>
          </div>

          {/* Letter Output */}
          <div className="glass-panel" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Generated Outbound Document</h3>
              {generatedLetter && (
                <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => copyToClipboard(generatedLetter)}>
                  📋 Copy Text
                </button>
              )}
            </div>
            
            {!generatedLetter ? (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: '3rem', marginBottom: '12px' }}>✍️</span>
                <p>Specify parameters to generate tailored documents.</p>
              </div>
            ) : (
              <pre style={{
                flexGrow: 1,
                padding: '16px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.03)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-sans)',
                overflowY: 'auto',
                maxHeight: '400px'
              }}>
                {generatedLetter}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* -------------------- 3. COMPANY INTELLIGENCE -------------------- */}
      {activeSubTab === 'intelligence' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
          {/* Input Selector */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '20px' }}>Select Active Lead Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Company Target Profile</label>
                <select
                  className="input-glass"
                  style={{ background: '#0b0f19' }}
                  value={selectedCompanyId}
                  onChange={e => setSelectedCompanyId(e.target.value)}
                >
                  {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>

              <button disabled={loadingIntel} onClick={handleRunIntelligence} className="btn btn-primary">
                {loadingIntel ? 'Analyzing operations...' : 'Analyze Company Intelligence'}
              </button>
            </div>
          </div>

          {/* Intel Output */}
          <div className="glass-panel" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            {!intelligenceResult ? (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: '3rem', marginBottom: '12px' }}>🏢</span>
                <p>Select a business lead and click "Analyze Company" to fetch operational intelligence and cold templates.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.2rem' }} className="text-gradient">Operational Analysis: {intelligenceResult.companyName}</h3>
                
                {/* Metadatas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>ESTIMATED STAFF</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '2px' }}>{intelligenceResult.estimatedStaff} Employees</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>ANNUAL REVENUE</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '2px', color: 'var(--success)' }}>{intelligenceResult.estimatedRevenue}</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>RECOMMENDED ERP SOFTWARE</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '4px', color: '#00f2fe' }}>{intelligenceResult.suggestedErp}</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>RECOMMENDED HRMS SOFTWARE</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '4px', color: '#c084fc' }}>{intelligenceResult.suggestedHrms}</div>
                  </div>
                </div>

                {/* Email template */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tailored Cold Email Pitch</h4>
                    <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => copyToClipboard(intelligenceResult.coldEmail)}>
                      Copy Outbound Pitch
                    </button>
                  </div>
                  <pre style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-sans)',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}>
                    {intelligenceResult.coldEmail}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
