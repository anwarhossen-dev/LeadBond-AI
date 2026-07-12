'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface JobApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  logo: string;
  location: string;
  workMode: string;
  jobType: string;
  status: string;
  datePosted: string;
  createdAt: string;
}

interface Company {
  id: string;
  companyName: string;
}

interface User {
  id: string;
  fullName: string;
}

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [workModeFilter, setWorkModeFilter] = useState('All');

  // Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    jobTitle: '',
    position: '',
    department: '',
    experience: '',
    salary: '',
    location: '',
    workMode: 'Remote',
    jobType: 'Full Time',
    datePosted: '',
    deadline: '',
    applyMethod: 'LinkedIn',
    applyLink: '',
    description: '',
    requirements: '',
    benefits: '',
    agentName: 'Sarah Jenkins' // defaults log user
  });

  const handleAutoScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/jobs/auto-scan', { method: 'POST' });
      if (!res.ok) throw new Error('Auto scan failed.');
      const data = await res.json();
      alert(data.message);
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Error occurred during auto scanning.');
    } finally {
      setScanning(false);
    }
  };

  const statuses = ['All', 'Draft', 'Applied', 'Interview', 'Offer', 'Rejected'];
  const workModes = ['All', 'Remote', 'Hybrid', 'Onsite'];

  const fetchJobs = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (statusFilter !== 'All') query.append('status', statusFilter);
    if (workModeFilter !== 'All') query.append('workMode', workModeFilter);

    fetch(`/api/job-applications?${query.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load job opportunities.');
        return res.json();
      })
      .then((data: JobApplication[]) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter, workModeFilter]);

  useEffect(() => {
    // Load companies and users lists for drop-downs
    fetch('/api/companies')
      .then(res => res.json())
      .then((data: Company[]) => {
        setCompanies(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, companyId: data[0].id }));
        }
      });

    fetch('/api/users')
      .then(res => res.json())
      .then((data: User[]) => {
        setUsers(data);
      });

    if (searchParams.get('new') === 'true') {
      setShowModal(true);
    }
  }, [searchParams]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to log job application.');
      }

      setShowModal(false);
      // Reset form
      setFormData(prev => ({
        ...prev,
        jobTitle: '',
        position: '',
        department: '',
        experience: '',
        salary: '',
        location: '',
        applyLink: '',
        description: '',
        requirements: '',
        benefits: ''
      }));

      fetchJobs();
      router.replace('/jobs');
    } catch (err: any) {
      alert(err.message || 'Error saving job application.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'badge badge-captured';
      case 'applied': return 'badge badge-contacted';
      case 'interview': return 'badge badge-proposal';
      case 'offer': return 'badge badge-won';
      case 'rejected': return 'badge badge-lost';
      default: return 'badge';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }} className="text-gradient">Job Opportunity Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Log applications, track statuses, and organize ATS resumes/proposals.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ border: '1px solid rgba(0,242,254,0.3)', color: '#00f2fe' }} disabled={scanning} onClick={handleAutoScan}>
            {scanning ? '⚡ Scanning last 24h...' : '⚡ Auto Scan Recent Jobs'}
          </button>
          <button className="btn btn-secondary" onClick={() => window.open('/api/export/jobs', '_blank')}>
            📥 Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Log Job Opportunity
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 250px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Search Opportunities</label>
          <input
            type="text"
            className="input-glass"
            placeholder="Search job title, company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '180px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Application Status</label>
          <select
            className="input-glass"
            style={{ appearance: 'none', cursor: 'pointer' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map(st => (
              <option key={st} value={st} style={{ background: '#0b0f19' }}>{st}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '180px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Work Mode</label>
          <select
            className="input-glass"
            style={{ appearance: 'none', cursor: 'pointer' }}
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
          >
            {workModes.map(wm => (
              <option key={wm} value={wm} style={{ background: '#0b0f19' }}>{wm}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List view */}
      {loading ? (
        <div style={{ padding: '40px', color: '#00f2fe', textAlign: 'center' }}>Loading opportunities list...</div>
      ) : error ? (
        <div style={{ padding: '20px', color: 'var(--danger)', textAlign: 'center' }}>{error}</div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No tracked jobs match the criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {jobs.map((job) => (
            <div key={job.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className={getStatusClass(job.status)}>{job.status}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>
                  <Link href={`/jobs/${job.id}`} style={{ color: 'var(--text-primary)' }} onMouseEnter={e => e.currentTarget.style.color = '#00f2fe'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                    {job.jobTitle}
                  </Link>
                </h3>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '12px' }}>
                  🏢 {job.companyName}
                </h4>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '4px 8px', 
                    borderRadius: '6px',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} title={job.location || 'Remote'}>
                    📍 {job.location || 'Remote'}
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px' }}>💻 {job.workMode}</span>
                  <span style={{ background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px' }}>⏰ {job.jobType}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <Link href={`/jobs/${job.id}`} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                  Manage Details →
                </Link>
              </div>
            </div>
          ))}
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
              <h2 style={{ fontSize: '1.4rem' }} className="text-gradient">Track New Job Opportunity</h2>
              <button onClick={() => { setShowModal(false); router.replace('/jobs'); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', paddingBottom: '4px' }}>Job Profile Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Company *</label>
                    <select className="input-glass" style={{ background: '#0b0f19' }} value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})}>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Job Title *</label>
                    <input type="text" required placeholder="e.g. Senior Frontend Dev" className="input-glass" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Functional Position</label>
                    <input type="text" placeholder="e.g. Lead Engineer" className="input-glass" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department</label>
                    <input type="text" placeholder="e.g. Engineering" className="input-glass" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Experience Required</label>
                    <input type="text" placeholder="e.g. 5-8 Years" className="input-glass" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Salary Range</label>
                    <input type="text" placeholder="e.g. $120k - $140k" className="input-glass" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Location (City, State)</label>
                    <input type="text" placeholder="e.g. Austin, TX" className="input-glass" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Work Mode</label>
                    <select className="input-glass" style={{ background: '#0b0f19' }} value={formData.workMode} onChange={e => setFormData({...formData, workMode: e.target.value})}>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Job Type</label>
                    <select className="input-glass" style={{ background: '#0b0f19' }} value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}>
                      <option value="Full Time">Full Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assign Agent</label>
                    <select className="input-glass" style={{ background: '#0b0f19' }} value={formData.agentName} onChange={e => setFormData({...formData, agentName: e.target.value})}>
                      {users.map(u => <option key={u.id} value={u.fullName}>{u.fullName}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Application Method Link</label>
                    <input type="url" placeholder="https://..." className="input-glass" value={formData.applyLink} onChange={e => setFormData({...formData, applyLink: e.target.value})} />
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', paddingBottom: '4px' }}>Descriptions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Job Description Summary</label>
                    <textarea rows={2} className="input-glass" style={{ resize: 'none' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Candidate Requirements</label>
                    <textarea rows={2} className="input-glass" style={{ resize: 'none' }} value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); router.replace('/jobs'); }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Log Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Jobs() {
  return (
    <Suspense fallback={<div style={{ color: '#00f2fe' }}>Loading Opportunity Systems...</div>}>
      <JobsContent />
    </Suspense>
  );
}
