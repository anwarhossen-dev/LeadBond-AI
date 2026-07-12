'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Company {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  licenseNo: string;
  icpMatch: string;
  pipelineStage: string;
  createdAt: string;
  agentName: string;
  aiScore: number;
}

interface User {
  id: string;
  fullName: string;
  role: string;
}

interface Platform {
  id: string;
  platformName: string;
}

function LeadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');

  // Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Software & Technology',
    website: '',
    licenseNo: '',
    icpMatch: 'Strong Fit',
    capturedBy: '',
    sourcePlatformId: '',
    contactName: '',
    contactDesignation: '',
    contactEmail: '',
    contactPhone: '',
    isDecisionMaker: true,
    aiScore: 85,
    scoreReason: ''
  });

  const industries = ['All', 'Software & Technology', 'Healthcare & Biotech', 'Transportation & Logistics', 'Cybersecurity', 'Real Estate & SaaS'];
  const stages = ['All', 'Captured', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];

  const fetchLeads = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (selectedIndustry !== 'All') query.append('industry', selectedIndustry);
    if (selectedStage !== 'All') query.append('stage', selectedStage);

    fetch(`/api/companies?${query.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load lead list.');
        return res.json();
      })
      .then((data: Company[]) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, [search, selectedIndustry, selectedStage]);

  useEffect(() => {
    // Load auxiliary lists for drop-downs
    fetch('/api/users')
      .then(res => res.json())
      .then((data: User[]) => {
        setUsers(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, capturedBy: data[0].id }));
        }
      });

    fetch('/api/platforms')
      .then(res => res.json())
      .then((data: Platform[]) => {
        setPlatforms(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, sourcePlatformId: data[0].id }));
        }
      });

    // Check if redirect triggers new lead modal
    if (searchParams.get('new') === 'true') {
      setShowModal(true);
    }
  }, [searchParams]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to capture company lead.');
      }

      setShowModal(false);
      // Reset form
      setFormData(prev => ({
        ...prev,
        companyName: '',
        website: '',
        licenseNo: '',
        contactName: '',
        contactDesignation: '',
        contactEmail: '',
        contactPhone: '',
        scoreReason: ''
      }));
      
      // Refresh lead list
      fetchLeads();
      router.replace('/leads'); // Clear search query 'new=true'
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStageBadgeClass = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'captured': return 'badge badge-captured';
      case 'contacted': return 'badge badge-contacted';
      case 'qualified': return 'badge badge-qualified';
      case 'proposal': return 'badge badge-proposal';
      case 'won': return 'badge badge-won';
      case 'lost': return 'badge badge-lost';
      default: return 'badge';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }} className="text-gradient">Captured Leads</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Analyze, scores, and track prospective enterprise clients.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => window.open('/api/export/companies', '_blank')}>
            📥 Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Capture Lead
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 250px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Search Leads</label>
          <input
            type="text"
            className="input-glass"
            placeholder="Search company name, industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '180px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Industry Filter</label>
          <select
            className="input-glass"
            style={{ appearance: 'none', cursor: 'pointer' }}
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
          >
            {industries.map(ind => (
              <option key={ind} value={ind} style={{ background: '#0b0f19' }}>{ind}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '180px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pipeline Stage</label>
          <select
            className="input-glass"
            style={{ appearance: 'none', cursor: 'pointer' }}
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
          >
            {stages.map(st => (
              <option key={st} value={st} style={{ background: '#0b0f19' }}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#00f2fe' }}>Loading Lead list...</div>
      ) : error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
      ) : companies.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No lead companies match the filter criteria.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Company Name</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Industry</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Lead Agent</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'center' }}>AI Score</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>ICP Match</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Pipeline Stage</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((comp) => {
                const isHigh = comp.aiScore >= 80;
                const isMed = comp.aiScore >= 50 && comp.aiScore < 80;

                return (
                  <tr key={comp.id} className="glass-panel-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <Link href={`/leads/${comp.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#00f2fe')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                      >
                        {comp.companyName}
                      </Link>
                      {comp.website && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          <a href={comp.website} target="_blank" rel="noreferrer" style={{ opacity: 0.7 }}>{comp.website.replace('https://', '')}</a>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {comp.industry}
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '0.9rem' }}>
                      {comp.agentName}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <span className={`badge ${isHigh ? 'score-high' : isMed ? 'score-medium' : 'score-low'}`} style={{
                        display: 'inline-flex',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        fontWeight: 700,
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem'
                      }}>
                        {comp.aiScore}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '0.9rem' }}>
                      <span style={{
                        color: comp.icpMatch === 'Strong Fit' ? 'var(--success)' : comp.icpMatch === 'Moderate Fit' ? 'var(--warning)' : 'var(--danger)',
                        fontWeight: 600
                      }}>
                        {comp.icpMatch}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span className={getStageBadgeClass(comp.pipelineStage)}>{comp.pipelineStage}</span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <Link href={`/leads/${comp.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        View Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 7, 12, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{
            width: '90%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem' }} className="text-gradient">Capture New Business Lead</h2>
              <button onClick={() => { setShowModal(false); router.replace('/leads'); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Section 1: Company Profile */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', paddingBottom: '4px' }}>Company Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Company Name *</label>
                    <input type="text" required className="input-glass" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Industry *</label>
                    <select className="input-glass" style={{ background: '#0b0f19' }} value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                      {industries.filter(i => i !== 'All').map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Website URL</label>
                    <input type="url" placeholder="https://..." className="input-glass" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Business License No</label>
                    <input type="text" placeholder="LIC-XXXXX-XX" className="input-glass" value={formData.licenseNo} onChange={e => setFormData({...formData, licenseNo: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ICP Match Evaluation</label>
                    <select className="input-glass" style={{ background: '#0b0f19' }} value={formData.icpMatch} onChange={e => setFormData({...formData, icpMatch: e.target.value})}>
                      <option value="Strong Fit">Strong Fit</option>
                      <option value="Moderate Fit">Moderate Fit</option>
                      <option value="Low Fit">Low Fit</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sourcing Agent *</label>
                    <select className="input-glass" style={{ background: '#0b0f19' }} value={formData.capturedBy} onChange={e => setFormData({...formData, capturedBy: e.target.value})}>
                      {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Capture Sourcing Platform</label>
                    <select className="input-glass" style={{ background: '#0b0f19' }} value={formData.sourcePlatformId} onChange={e => setFormData({...formData, sourcePlatformId: e.target.value})}>
                      {platforms.map(p => <option key={p.id} value={p.id}>{p.platformName}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Person */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', paddingBottom: '4px' }}>Primary Contact Profile</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Name</label>
                    <input type="text" className="input-glass" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Designation</label>
                    <input type="text" className="input-glass" value={formData.contactDesignation} onChange={e => setFormData({...formData, contactDesignation: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Address</label>
                    <input type="email" className="input-glass" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                    <input type="text" className="input-glass" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: 'span 2', marginTop: '6px' }}>
                    <input type="checkbox" id="dm" checked={formData.isDecisionMaker} onChange={e => setFormData({...formData, isDecisionMaker: e.target.checked})} />
                    <label htmlFor="dm" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Is verified key decision maker</label>
                  </div>
                </div>
              </div>

              {/* Section 3: AI Scoring */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', paddingBottom: '4px' }}>AI Lead Scoring</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Score (1-100)</label>
                    <input type="number" min="1" max="100" className="input-glass" value={formData.aiScore} onChange={e => setFormData({...formData, aiScore: parseInt(e.target.value, 10)})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Evaluation Explanation</label>
                    <textarea rows={2} className="input-glass" style={{ resize: 'none' }} placeholder="Specify factors driving the AI scoring algorithm..." value={formData.scoreReason} onChange={e => setFormData({...formData, scoreReason: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); router.replace('/leads'); }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting...' : 'Register Company Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Leads() {
  return (
    <Suspense fallback={<div style={{ color: '#00f2fe' }}>Loading Page Components...</div>}>
      <LeadsContent />
    </Suspense>
  );
}
