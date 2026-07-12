'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

interface Company {
  previewId: string;
  companyName: string;
  industry: string;
  headquarters: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  size: string;
  jobTitle: string;
  workMode: string;
  jobType: string;
  salary: string;
  requirements: string;
  icpMatch: string;
}

interface LogEntry {
  id: string;
  companyName: string;
  jobTitle: string;
  status: 'success' | 'pending';
}

interface ImportSummary {
  companiesImported: number;
  jobsImported: number;
  platform: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Platform config
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { key: 'linkedin',    label: 'LinkedIn',     icon: '💼', color: '#0a66c2' },
  { key: 'google_maps', label: 'Google Maps',  icon: '🗺️', color: '#34a853' },
  { key: 'facebook',    label: 'Facebook',     icon: '📘', color: '#1877f2' },
  { key: 'bdjobs',      label: 'BDJobs',       icon: '🇧🇩', color: '#e8341c' },
  { key: 'all_sites',   label: 'All Sites',    icon: '🌐', color: '#00f2fe' },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BulkCollectionPage() {
  const [activePlatform, setActivePlatform]   = useState('linkedin');
  const [count, setCount]                     = useState(20);
  const [companies, setCompanies]             = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [selected, setSelected]               = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery]         = useState('');
  const [loading, setLoading]                 = useState(false);

  // Modal / import state
  const [importing, setImporting]             = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [importLog, setImportLog]             = useState<LogEntry[]>([]);
  const [importProgress, setImportProgress]   = useState(0);
  const [importDone, setImportDone]           = useState(false);
  const [importSummary, setImportSummary]     = useState<ImportSummary | null>(null);

  // ── Fetch preview whenever platform or count changes ──
  const fetchPreview = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await fetch(`/api/bulk/preview?platform=${activePlatform}&count=${count}`);
      if (!res.ok) throw new Error('Failed to fetch preview');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activePlatform, count]);

  useEffect(() => { fetchPreview(); }, [fetchPreview]);

  // ── Filter by search query ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredCompanies(
        companies.filter(
          (c) =>
            c.companyName.toLowerCase().includes(q) ||
            c.industry.toLowerCase().includes(q) ||
            c.headquarters.toLowerCase().includes(q)
        )
      );
    }
  }, [companies, searchQuery]);

  // ── Toggle card selection ──
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll  = () => setSelected(new Set(filteredCompanies.map((c) => c.previewId)));
  const clearAll   = () => setSelected(new Set());

  // ── Run Import ──
  const runImport = async () => {
    const toImport = selected.size > 0
      ? filteredCompanies.filter((c) => selected.has(c.previewId))
      : filteredCompanies;

    if (toImport.length === 0) return;

    // Open modal and reset
    setShowModal(true);
    setImporting(true);
    setImportDone(false);
    setImportLog([]);
    setImportProgress(0);
    setImportSummary(null);

    // Simulate per-company progress (real import happens in bulk, but we animate it)
    const simulationDelay = Math.max(200, Math.floor(3000 / toImport.length));
    for (let i = 0; i < toImport.length; i++) {
      await new Promise((r) => setTimeout(r, simulationDelay));
      const c = toImport[i];
      setImportLog((prev) => [
        { id: c.previewId, companyName: c.companyName, jobTitle: c.jobTitle, status: 'success' },
        ...prev,
      ]);
      setImportProgress(Math.round(((i + 1) / toImport.length) * 100));
    }

    // Actual API call
    try {
      const res = await fetch('/api/companies/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: activePlatform,
          selectedIds: Array.from(selected),
          count: toImport.length,
        }),
      });
      const data = await res.json();
      if (data.summary) setImportSummary(data.summary);
    } catch (err) {
      console.error('Import error:', err);
    }

    setImportDone(true);
    setImporting(false);
  };

  const closeModal = () => {
    if (!importing) {
      setShowModal(false);
      fetchPreview(); // Refresh after import
    }
  };

  // ── Slider progress CSS variable ──
  const sliderProgress = `${((count - 10) / (50 - 10)) * 100}%`;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.pageWrapper}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>
            <span className="text-gradient">Bulk Collection</span> Manager
          </h1>
          <p>একসাথে ১০–৫০টি কোম্পানি বিভিন্ন প্ল্যাটফর্ম থেকে কালেক্ট করুন</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statChip}>
            <strong>{companies.length}</strong>
            <span>Preview</span>
          </div>
          <div className={styles.statChip}>
            <strong>{selected.size}</strong>
            <span>Selected</span>
          </div>
          <div className={styles.statChip}>
            <strong>5</strong>
            <span>Platforms</span>
          </div>
        </div>
      </div>

      {/* ── Platform Tabs ── */}
      <div className={styles.platformTabs}>
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            id={`tab-${p.key}`}
            className={`${styles.platformTab} ${activePlatform === p.key ? styles.platformTabActive : ''}`}
            onClick={() => setActivePlatform(p.key)}
          >
            <span className={styles.platformIcon}>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Control Panel ── */}
      <div className={styles.controlPanel}>
        <div className={styles.sliderGroup}>
          <div className={styles.sliderLabel}>
            <span>কোম্পানি সংখ্যা</span>
            <span className={styles.sliderValue}>{count} টি</span>
          </div>
          <input
            id="company-count-slider"
            type="range"
            min={10}
            max={50}
            step={1}
            value={count}
            className={styles.slider}
            style={{ '--progress': sliderProgress } as React.CSSProperties}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>১০</span><span>৫০</span>
          </div>
        </div>

        <div className={styles.controlActions}>
          <input
            id="bulk-search"
            type="text"
            placeholder="🔍  কোম্পানি/ইন্ডাস্ট্রি খুঁজুন…"
            className={styles.searchBox}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={styles.btnSelectAll} onClick={fetchPreview} id="btn-refresh">
            🔄 রিফ্রেশ
          </button>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className={styles.actionBar}>
        <div className={styles.selectionInfo}>
          <span>
            <span className={styles.selectionCount}>{selected.size}</span> টি সিলেক্ট করা হয়েছে —{' '}
            {filteredCompanies.length} টি দেখাচ্ছে
          </span>
        </div>
        <div className={styles.actionBtns}>
          <button className={styles.btnSelectAll} onClick={selectAll} id="btn-select-all">
            ✅ সব সিলেক্ট
          </button>
          <button className={styles.btnSelectAll} onClick={clearAll} id="btn-clear-all">
            ✖️ ক্লিয়ার
          </button>
          <button
            id="btn-import-selected"
            className={styles.btnImport}
            disabled={importing || (selected.size === 0 && filteredCompanies.length === 0)}
            onClick={runImport}
          >
            🚀 {selected.size > 0 ? `${selected.size} টি ইমপোর্ট` : `${filteredCompanies.length} টি ইমপোর্ট`}
          </button>
        </div>
      </div>

      {/* ── Company Cards Grid ── */}
      <div className={styles.grid}>
        {loading
          ? Array.from({ length: count }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeleton} style={{ height: 20, width: '60%' }} />
                <div className={styles.skeleton} style={{ height: 14, width: '40%' }} />
                <div className={styles.skeleton} style={{ height: 12, width: '80%' }} />
                <div className={styles.skeleton} style={{ height: 12, width: '70%' }} />
                <div className={styles.skeleton} style={{ height: 12, width: '50%' }} />
              </div>
            ))
          : filteredCompanies.length === 0
          ? (
            <div className={styles.emptyState}>
              <p style={{ fontSize: '2rem' }}>🔍</p>
              <p>কোনো কোম্পানি পাওয়া যায়নি। রিফ্রেশ করুন বা অন্য প্ল্যাটফর্ম চেক করুন।</p>
            </div>
          )
          : filteredCompanies.map((company) => {
            const isSelected = selected.has(company.previewId);
            return (
              <div
                key={company.previewId}
                id={`card-${company.previewId}`}
                className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                onClick={() => toggleSelect(company.previewId)}
                role="checkbox"
                aria-checked={isSelected}
              >
                <div className={styles.cardHeader}>
                  {/* Checkbox */}
                  <div className={`${styles.cardCheckbox} ${isSelected ? styles.cardCheckboxChecked : ''}`}>
                    {isSelected && <span className={styles.checkmark}>✓</span>}
                  </div>

                  {/* Company Info */}
                  <div className={styles.companyNameSection}>
                    <div className={styles.companyName}>{company.companyName}</div>
                    <div className={styles.companyIndustry}>{company.industry}</div>
                  </div>

                  {/* ICP Badge */}
                  <span className={`${styles.icpBadge} ${company.icpMatch === 'High Fit' ? styles.icpHigh : styles.icpMedium}`}>
                    {company.icpMatch === 'High Fit' ? '🔥 High' : '📊 Med'}
                  </span>
                </div>

                <div className={styles.cardDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailIcon}>📍</span>
                    <span>{company.headquarters}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailIcon}>🏢</span>
                    <span>{company.size} কর্মী</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailIcon}>💰</span>
                    <span>{company.salary}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailIcon}>📧</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {company.email}
                    </span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.jobTitle}>💼 {company.jobTitle}</span>
                  <span className={styles.workBadge}>{company.workMode}</span>
                </div>
              </div>
            );
          })}
      </div>

      {/* ─── Import Progress Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => !importing && closeModal()}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>
                {importDone ? '✅' : '⚡'}
              </span>
              <div>
                <div className={styles.modalTitle}>
                  {importDone ? 'ইমপোর্ট সম্পন্ন!' : 'ইমপোর্ট চলছে…'}
                </div>
                <div className={styles.modalSubtitle}>
                  {PLATFORMS.find(p => p.key === activePlatform)?.icon}{' '}
                  {PLATFORMS.find(p => p.key === activePlatform)?.label} থেকে ডেটা সেভ হচ্ছে
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${importProgress}%` }}
              />
            </div>
            <div className={styles.progressStats}>
              <span>
                <strong>{importLog.filter(l => l.status === 'success').length}</strong> সম্পন্ন
              </span>
              <span><strong>{importProgress}%</strong></span>
              <span>
                মোট <strong>{selected.size > 0 ? selected.size : filteredCompanies.length}</strong>
              </span>
            </div>

            {/* Live Log */}
            <div className={styles.logList}>
              {importLog.map((log) => (
                <div
                  key={log.id}
                  className={`${styles.logItem} ${log.status === 'success' ? styles.logSuccess : styles.logPending}`}
                >
                  <span className={styles.logIcon}>
                    {log.status === 'success' ? '✅' : '⏳'}
                  </span>
                  <div className={styles.logText}>
                    <strong>{log.companyName}</strong>
                    <span>{log.jobTitle}</span>
                  </div>
                </div>
              ))}
              {importLog.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ⏳ প্রসেস শুরু হচ্ছে…
                </div>
              )}
            </div>

            {/* Summary */}
            {importDone && importSummary && (
              <div className={styles.summaryBox}>
                <div className={styles.summaryItem}>
                  <strong>{importSummary.companiesImported}</strong>
                  <span>নতুন কোম্পানি</span>
                </div>
                <div className={styles.summaryItem}>
                  <strong>{importSummary.jobsImported}</strong>
                  <span>জব টিকেট</span>
                </div>
                <div className={styles.summaryItem}>
                  <strong>{importSummary.platform}</strong>
                  <span>সোর্স</span>
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              {importDone ? (
                <>
                  <button className="btn btn-secondary" onClick={closeModal} id="modal-close">
                    ✖ বন্ধ করুন
                  </button>
                  <a href="/leads" className="btn btn-primary" id="modal-view-leads">
                    Leads দেখুন →
                  </a>
                </>
              ) : (
                <button className="btn btn-secondary" disabled id="modal-cancel">
                  ⏳ চলছে…
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
