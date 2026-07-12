'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Document {
  id: string;
  resume: string;
  coverLetter: string;
  proposal: string;
  portfolio: string;
}

interface JobHistory {
  id: string;
  status: string;
  remarks: string;
  updatedBy: string;
  updatedAt: string;
}

interface Followup {
  id: string;
  note: string;
  followUpDate: string;
  status: string;
  agentName: string;
}

interface Company {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  headquarters: string;
}

interface JobDetails {
  id: string;
  jobTitle: string;
  position: string;
  department: string;
  experience: string;
  salary: string;
  location: string;
  workMode: string;
  jobType: string;
  datePosted: string;
  deadline: string;
  applyMethod: string;
  applyEmail: string;
  applyLink: string;
  jobLink: string;
  description: string;
  requirements: string;
  benefits: string;
  status: string;
  createdAt: string;
  company: Company;
  documents: Document | null;
  histories: JobHistory[];
  followups: Followup[];
}

interface User {
  id: string;
  fullName: string;
}

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Followup form state
  const [newFollowupNote, setNewFollowupNote] = useState('');
  const [newFollowupDate, setNewFollowupDate] = useState('');
  const [newFollowupUser, setNewFollowupUser] = useState('');
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  // Status update states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusRemarks, setStatusRemarks] = useState('');

  const statuses = ['Draft', 'Applied', 'Interview', 'Offer', 'Rejected'];

  const fetchJobDetails = () => {
    fetch(`/api/job-applications/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Job opportunity record not found.');
        return res.json();
      })
      .then((data: JobDetails) => {
        setJob(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      fetchJobDetails();

      // Fetch users for followup assignment
      fetch('/api/users')
        .then(res => res.json())
        .then((data: User[]) => {
          setUsers(data);
          if (data.length > 0) setNewFollowupUser(data[0].id);
        });
    }
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!job || updatingStatus) return;
    setUpdatingStatus(true);

    const remarks = prompt(`Enter update remarks for transitioning to "${newStatus}":`, `Changed opportunity state to ${newStatus}.`) || '';

    try {
      const response = await fetch(`/api/job-applications/${job.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          remarks,
          agentName: 'Sarah Jenkins' // Default updating agent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status.');
      }

      fetchJobDetails();
    } catch (err: any) {
      alert(err.message || 'Error occurred transitioning status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !newFollowupNote || !newFollowupDate || !newFollowupUser) return;
    setSubmittingFollowup(true);

    try {
      const response = await fetch('/api/followups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobApplicationId: job.id,
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
      fetchJobDetails();
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

      fetchJobDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to complete task.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#00f2fe' }}>
        Loading Job Opportunity details...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Operational Error</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Opportunity details could not be retrieved.'}</p>
        <Link href="/jobs" className="btn btn-secondary" style={{ marginTop: '20px' }}>
          Back to Jobs Board
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div>
        <Link href="/jobs" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}
        onMouseEnter={e => e.currentTarget.style.color = '#00f2fe'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          ← Back to Jobs Board
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>{job.jobTitle}</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏢 {job.company.companyName}</span>
              <span>•</span>
              <span>📍 {job.location || job.company.headquarters}</span>
              <span>•</span>
              <span>{job.jobType}</span>
            </p>
          </div>

          {/* Status Stage Controller */}
          <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Application Status:</span>
            <select
              className="input-glass"
              style={{ padding: '6px 12px', background: '#0b0f19', cursor: updatingStatus ? 'not-allowed' : 'pointer' }}
              disabled={updatingStatus}
              value={job.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {statuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Job description */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
              📝 Job Details & Description
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.92rem', lineHeight: 1.6 }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '6px' }}>Role Profile</h4>
                <p style={{ color: 'var(--text-secondary)' }}>{job.description || 'No description provided.'}</p>
              </div>
              
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '6px' }}>Core Requirements</h4>
                <p style={{ color: 'var(--text-secondary)' }}>{job.requirements || 'No requirements specified.'}</p>
              </div>

              {job.benefits && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '6px' }}>Benefits & Offer Package</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{job.benefits}</p>
                </div>
              )}
            </div>
          </div>

          {/* Job documents sheet */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>📁 Application Documents</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Resume */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target Resume</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>
                  {job.documents?.resume || 'No Resume uploaded yet'}
                </div>
                {job.documents?.resume && (
                  <span style={{ fontSize: '0.75rem', color: '#00f2fe', cursor: 'pointer', display: 'block', marginTop: '12px' }}>Download File</span>
                )}
              </div>

              {/* Cover Letter */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cover Letter</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>
                  {job.documents?.coverLetter || 'Not generated yet'}
                </div>
                {job.documents?.coverLetter && (
                  <span style={{ fontSize: '0.75rem', color: '#00f2fe', cursor: 'pointer', display: 'block', marginTop: '12px' }}>Download File</span>
                )}
              </div>
            </div>
          </div>

          {/* Activity Logs (Status history) */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>🔄 Application History Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {job.histories.map((hist, idx) => (
                <div key={hist.id} style={{ display: 'flex', gap: '12px', borderBottom: idx !== job.histories.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>⚙️</div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#00f2fe' }}>Status changed to: {hist.status}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(hist.updatedAt).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{hist.remarks}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Updated by: {hist.updatedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Metadata properties */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Job Metadata</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Salary Range</span>
                <span style={{ fontWeight: 600 }}>{job.salary || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Work Mode</span>
                <span style={{ fontWeight: 600 }}>{job.workMode || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Apply Channel</span>
                <span style={{ fontWeight: 600 }}>{job.applyMethod || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Deadline date</span>
                <span style={{ fontWeight: 600 }}>{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'None'}</span>
              </div>
            </div>
          </div>

          {/* Followups Reminders */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏰ Followups & Action Items
            </h3>

            {/* Create new followup form */}
            <form onSubmit={handleCreateFollowup} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reminder Action Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up on panel results"
                  className="input-glass"
                  value={newFollowupNote}
                  onChange={e => setNewFollowupNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Outreach Date</label>
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
                {submittingFollowup ? 'Saving...' : 'Add Reminder'}
              </button>
            </form>

            {/* Followups list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {job.followups.map((f) => (
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

        </div>

      </div>

    </div>
  );
}
