'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Followup {
  id: string;
  companyId: string;
  companyName: string;
  agentName: string;
  note: string;
  followUpDate: string;
  status: string;
}

export default function Followups() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('Pending');

  const fetchFollowups = () => {
    setLoading(true);
    fetch(`/api/followups?status=${statusFilter}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load follow-up tasks.');
        return res.json();
      })
      .then((data) => {
        setFollowups(data.followups || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFollowups();
  }, [statusFilter]);

  const handleCompleteFollowup = async (id: string) => {
    try {
      const response = await fetch(`/api/followups/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Completed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete task.');
      }

      // Refresh list
      fetchFollowups();
    } catch (err: any) {
      alert(err.message || 'Error completing task.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }} className="text-gradient">Follow-up Activities</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Track sales activities, pending outreach schedules, and reminders.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '180px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Status</label>
          <select
            className="input-glass"
            style={{ appearance: 'none', cursor: 'pointer' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All" style={{ background: '#0b0f19' }}>All Activities</option>
            <option value="Pending" style={{ background: '#0b0f19' }}>Pending Reminders</option>
            <option value="Completed" style={{ background: '#0b0f19' }}>Completed Logs</option>
          </select>
        </div>
      </div>

      {/* Followups List view */}
      {loading ? (
        <div style={{ padding: '40px', color: '#00f2fe', textAlign: 'center' }}>Loading activities list...</div>
      ) : error ? (
        <div style={{ padding: '20px', color: 'var(--danger)', textAlign: 'center' }}>{error}</div>
      ) : followups.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No follow-up activities found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {followups.map((f, index) => {
            const isOverdue = new Date(f.followUpDate) < new Date() && f.status === 'Pending';
            
            return (
              <div key={`${f.id}-${index}`} className="glass-panel glass-panel-hover" style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                borderLeft: isOverdue ? '4px solid var(--danger)' : '1px solid var(--panel-border)',
                background: f.status === 'Completed' ? 'rgba(16, 185, 129, 0.03)' : 'var(--panel-bg)'
              }}>
                <div style={{ flexGrow: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <Link href={`/leads/${f.companyId}`} style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#00f2fe')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    >
                      {f.companyName}
                    </Link>
                    {isOverdue && (
                      <span className="badge badge-lost" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Overdue</span>
                    )}
                  </div>
                  <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{f.note}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    <span>Agent: {f.agentName}</span>
                    <span>•</span>
                    <span>Date: {new Date(f.followUpDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  {f.status === 'Pending' ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCompleteFollowup(f.id)}
                    >
                      Mark Completed
                    </button>
                  ) : (
                    <span className="badge badge-won" style={{ padding: '6px 12px' }}>Completed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
