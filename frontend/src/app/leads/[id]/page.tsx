'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  isDecisionMaker: boolean;
}

interface JobPosting {
  id: string;
  jobTitle: string;
  platform: string;
  postedDate: string;
  hiringSignalType: string;
}

interface LeadScore {
  id: string;
  aiScore: number;
  scoreReason: string;
  scoredAt: string;
}

interface PipelineHistory {
  id: string;
  fromStage: string;
  toStage: string;
  changedAt: string;
}

interface Followup {
  id: string;
  note: string;
  followUpDate: string;
  status: string;
  agentName: string;
}

interface CompanyDetails {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  licenseNo: string;
  icpMatch: string;
  pipelineStage: string;
  createdAt: string;
  agentName: string;
  contacts: Contact[];
  jobPostings: JobPosting[];
  leadScores: LeadScore[];
  pipelineHistory: PipelineHistory[];
  followups: Followup[];
}

interface User {
  id: string;
  fullName: string;
}

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState<CompanyDetails | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Followup form state
  const [newFollowupNote, setNewFollowupNote] = useState('');
  const [newFollowupDate, setNewFollowupDate] = useState('');
  const [newFollowupUser, setNewFollowupUser] = useState('');
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  // Stage change transition loading state
  const [updatingStage, setUpdatingStage] = useState(false);

  const stages = ['Captured', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];

  const fetchLeadDetails = () => {
    fetch(`/api/companies/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Lead company details not found.');
        return res.json();
      })
      .then((data: CompanyDetails) => {
        setLead(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      fetchLeadDetails();

      // Fetch users for followup assignment
      fetch('/api/users')
        .then(res => res.json())
        .then((data: User[]) => {
          setUsers(data);
          if (data.length > 0) setNewFollowupUser(data[0].id);
        });
    }
  }, [id]);

  const handleStageChange = async (newStage: string) => {
    if (!lead || updatingStage) return;
    setUpdatingStage(true);

    try {
      const response = await fetch(`/api/companies/${lead.id}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toStage: newStage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stage.');
      }

      // Refresh data
      fetchLeadDetails();
    } catch (err: any) {
      alert(err.message || 'Error occurred updating stage.');
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newFollowupNote || !newFollowupDate || !newFollowupUser) return;
    setSubmittingFollowup(true);

    try {
      const response = await fetch('/api/followups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: lead.id,
          userId: newFollowupUser,
          note: newFollowupNote,
          followUpDate: newFollowupDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule followup.');
      }

      setNewFollowupNote('');
      setNewFollowupDate('');
      // Refresh details
      fetchLeadDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to create followup.');
    } finally {
      setSubmittingFollowup(false);
    }
  };

  const handleCompleteFollowup = async (followupId: string) => {
    try {
      const response = await fetch(`/api/followups/${followupId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Completed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete followup.');
      }

      // Refresh details
      fetchLeadDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to complete task.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#00f2fe' }}>
        Loading Lead Details...
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Operational Error</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Lead company details could not be retrieved.'}</p>
        <Link href="/leads" className="btn btn-secondary" style={{ marginTop: '20px' }}>
          Back to Pipeline List
        </Link>
      </div>
    );
  }

  const latestScore = lead.leadScores[0];
  const isHigh = latestScore?.aiScore >= 80;
  const isMed = latestScore?.aiScore >= 50 && latestScore?.aiScore < 80;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div>
        <Link href="/leads" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}
        onMouseEnter={e => e.currentTarget.style.color = '#00f2fe'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          ← Back to Pipelines List
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>{lead.companyName}</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{lead.industry}</span>
              <span>•</span>
              <span>{lead.website ? <a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#00f2fe' }}>{lead.website}</a> : 'No website'}</span>
            </p>
          </div>

          {/* Pipeline Stage Controller */}
          <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pipeline Stage:</span>
            <select
              className="input-glass"
              style={{ padding: '6px 12px', background: '#0b0f19', cursor: updatingStage ? 'not-allowed' : 'pointer' }}
              disabled={updatingStage}
              value={lead.pipelineStage}
              onChange={(e) => handleStageChange(e.target.value)}
            >
              {stages.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Profile Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: AI Score Gauge & Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* AI Assessment Card */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div className={`score-indicator ${isHigh ? 'score-high' : isMed ? 'score-medium' : 'score-low'}`} style={{
              width: '90px',
              height: '90px',
              fontSize: '2rem',
              flexShrink: 0
            }}>
              {latestScore?.aiScore ?? 0}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🧠 AI Predictive Lead Score
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {latestScore?.scoreReason ?? 'No AI score assessment available.'}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                Evaluated: {latestScore ? new Date(latestScore.scoredAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Primary Contacts */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 Decision Makers & Contacts
            </h3>
            {lead.contacts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No contacts linked to this account.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {lead.contacts.map((contact) => (
                  <div key={contact.id} style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{contact.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{contact.designation}</p>
                      </div>
                      {contact.isDecisionMaker && (
                        <span className="badge" style={{
                          background: 'rgba(0, 242, 254, 0.1)',
                          color: '#00f2fe',
                          borderColor: 'rgba(0, 242, 254, 0.2)',
                          padding: '2px 6px',
                          fontSize: '0.65rem'
                        }}>
                          DM
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>✉️ {contact.email || 'N/A'}</div>
                      <div>📞 {contact.phone || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hiring Signals Section */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Platform Hiring Signals
            </h3>
            {lead.jobPostings.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No job listings detected acting as hiring signals.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lead.jobPostings.map((job) => (
                  <div key={job.id} style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{job.jobTitle}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Source: {job.platform} • Posted: {new Date(job.postedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="badge" style={{
                      backgroundColor: 'rgba(192, 132, 252, 0.1)',
                      color: '#c084fc',
                      borderColor: 'rgba(192, 132, 252, 0.2)'
                    }}>
                      {job.hiringSignalType}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Follow-ups and Changelogs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Company Details Metadata */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Account Properties</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>ICP Match Evaluation</span>
                <span style={{ fontWeight: 600 }}>{lead.icpMatch}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Business License No</span>
                <span style={{ fontWeight: 600 }}>{lead.licenseNo || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lead Sourcing Agent</span>
                <span style={{ fontWeight: 600 }}>{lead.agentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Captured On</span>
                <span style={{ fontWeight: 600 }}>{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Follow-up Manager */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏰ Follow-ups & Activities
            </h3>
            
            {/* Create new followup form */}
            <form onSubmit={handleCreateFollowup} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Action Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule discovery pricing call"
                  className="input-glass"
                  value={newFollowupNote}
                  onChange={e => setNewFollowupNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scheduled Date</label>
                  <input
                    type="date"
                    required
                    className="input-glass"
                    value={newFollowupDate}
                    onChange={e => setNewFollowupDate(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assign Agent</label>
                  <select
                    className="input-glass"
                    style={{ background: '#0b0f19' }}
                    value={newFollowupUser}
                    onChange={e => setNewFollowupUser(e.target.value)}
                  >
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={submittingFollowup} className="btn btn-primary" style={{ marginTop: '6px', width: '100%', padding: '8px' }}>
                {submittingFollowup ? 'Saving...' : 'Add Follow-up'}
              </button>
            </form>

            {/* Followups Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lead.followups.map((f) => (
                <div key={f.id} style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: f.status === 'Completed' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid rgba(255,255,255,0.03)',
                  opacity: f.status === 'Completed' ? 0.7 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{f.note}</div>
                    {f.status === 'Pending' ? (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '2px 8px', fontSize: '0.7rem', borderRadius: '4px' }}
                        onClick={() => handleCompleteFollowup(f.id)}
                      >
                        ✓ Complete
                      </button>
                    ) : (
                      <span className="badge badge-won" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Done</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <span>By: {f.agentName}</span>
                    <span>Date: {new Date(f.followUpDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Pipeline Changelog */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔄 Stage History Changelog
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lead.pipelineHistory.map((hist) => (
                <div key={hist.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  paddingBottom: '8px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>{hist.fromStage}</span>
                    <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>→</span>
                    <span style={{ fontWeight: 600, color: '#00f2fe' }}>{hist.toStage}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(hist.changedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
