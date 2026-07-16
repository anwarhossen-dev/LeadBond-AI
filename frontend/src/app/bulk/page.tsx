'use client';

import { useEffect, useCallback, useReducer } from 'react';
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
//  Reducer State & Actions
// ─────────────────────────────────────────────────────────────────────────────

interface BulkCollectionState {
  activePlatform: string;
  count: number;
  companies: Company[];
  filteredCompanies: Company[];
  selected: Set<string>;
  searchQuery: string;
  loading: boolean;
  importing: boolean;
  showModal: boolean;
  importLog: LogEntry[];
  importProgress: number;
  importDone: boolean;
  importSummary: ImportSummary | null;
  importError: string | null;
}

type BulkCollectionAction =
  | { type: 'SET_ACTIVE_PLATFORM'; payload: string }
  | { type: 'SET_COUNT'; payload: number }
  | { type: 'FETCH_PREVIEW_START' }
  | { type: 'FETCH_PREVIEW_SUCCESS'; payload: Company[] }
  | { type: 'FETCH_PREVIEW_ERROR' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERED_COMPANIES'; payload: Company[] }
  | { type: 'TOGGLE_SELECT'; payload: string }
  | { type: 'SELECT_ALL'; payload: Company[] }
  | { type: 'CLEAR_ALL' }
  | { type: 'RUN_IMPORT_START' }
  | { type: 'ADD_IMPORT_LOG'; payload: LogEntry }
  | { type: 'SET_IMPORT_PROGRESS'; payload: number }
  | { type: 'SET_IMPORT_SUMMARY'; payload: ImportSummary | null }
  | { type: 'SET_IMPORT_ERROR'; payload: string | null }
  | { type: 'FINISH_IMPORT' }
  | { type: 'CLOSE_MODAL' };

const initialState: BulkCollectionState = {
  activePlatform: 'linkedin', count: 20, companies: [], filteredCompanies: [], selected: new Set(), searchQuery: '', loading: false, importing: false, showModal: false, importLog: [], importProgress: 0, importDone: false, importSummary: null, importError: null,
};

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

function bulkCollectionReducer(state: BulkCollectionState, action: BulkCollectionAction): BulkCollectionState {
  switch (action.type) {
    case 'SET_ACTIVE_PLATFORM': return { ...state, activePlatform: action.payload };
    case 'SET_COUNT': return { ...state, count: action.payload };
    case 'FETCH_PREVIEW_START': return { ...state, loading: true, selected: new Set() };
    case 'FETCH_PREVIEW_SUCCESS': return { ...state, companies: action.payload, loading: false };
    case 'FETCH_PREVIEW_ERROR': return { ...state, companies: [], loading: false };
    case 'SET_SEARCH_QUERY': return { ...state, searchQuery: action.payload };
    case 'SET_FILTERED_COMPANIES': return { ...state, filteredCompanies: action.payload };
    case 'TOGGLE_SELECT': {
      const newSelected = new Set(state.selected);
      newSelected.has(action.payload) ? newSelected.delete(action.payload) : newSelected.add(action.payload);
      return { ...state, selected: newSelected };
    }
    case 'SELECT_ALL': return { ...state, selected: new Set(action.payload.map(c => c.previewId)) };
    case 'CLEAR_ALL': return { ...state, selected: new Set() };
    case 'RUN_IMPORT_START': return { ...state, showModal: true, importing: true, importDone: false, importLog: [], importProgress: 0, importSummary: null, importError: null };
    case 'ADD_IMPORT_LOG': return { ...state, importLog: [action.payload, ...state.importLog] };
    case 'SET_IMPORT_PROGRESS': return { ...state, importProgress: action.payload };
    case 'SET_IMPORT_SUMMARY': return { ...state, importSummary: action.payload };
    case 'SET_IMPORT_ERROR': return { ...state, importError: action.payload };
    case 'FINISH_IMPORT': return { ...state, importDone: true, importing: false };
    case 'CLOSE_MODAL': return { ...state, showModal: false };
    default: return state;
  }
}

export default function BulkCollectionPage() {
  const [state, dispatch] = useReducer(bulkCollectionReducer, initialState);
  const {
    activePlatform,
    count,
    companies,
    filteredCompanies,
    selected,
    searchQuery,
    loading,
    importing,
    showModal,
    importLog,
    importProgress,
    importDone,
    importSummary,
    importError,
  } = state;

  // // ── Fetch preview whenever platform or count changes ──
  const fetchPreview = useCallback(async () => {
    dispatch({ type: 'FETCH_PREVIEW_START' });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/bulk/preview?platform=${state.activePlatform}&count=${state.count}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch preview: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      
      // Ensure that we are setting an array, even if API returns something else.
      if (data && Array.isArray(data.companies)) {
        // Ensure previewId is a string to prevent key errors.
        const sanitizedCompanies = data.companies.map((c: any) => ({
          ...c,
          previewId: String(c.previewId),
        }));
        dispatch({ type: 'FETCH_PREVIEW_SUCCESS', payload: sanitizedCompanies });
      } else {
        console.warn("API did not return a 'companies' array.", data);
        dispatch({ type: 'FETCH_PREVIEW_ERROR' });
      }
    } catch (err) {
      console.error("Error in fetchPreview:", err);
      dispatch({ type: 'FETCH_PREVIEW_ERROR' });
    }
  }, [state.activePlatform, state.count]);

  useEffect(() => { fetchPreview(); }, [fetchPreview]);

  // ── Filter by search query ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      dispatch({ type: 'SET_FILTERED_COMPANIES', payload: companies });
    } else {
      const q = searchQuery.toLowerCase();
      dispatch({ type: 'SET_FILTERED_COMPANIES', payload:
        companies.filter(
          (c) =>
            c.companyName.toLowerCase().includes(q) ||
            c.industry.toLowerCase().includes(q) ||
            c.headquarters.toLowerCase().includes(q)
        )
      });
    }
  }, [companies, searchQuery]);

  // ── Toggle card selection ──
  const toggleSelect = (id: string) => dispatch({ type: 'TOGGLE_SELECT', payload: id });

  const selectAll  = () => dispatch({ type: 'SELECT_ALL', payload: filteredCompanies });
  const clearAll   = () => dispatch({ type: 'CLEAR_ALL' });

  // ── Run Import ──
  const runImport = async () => {
    const toImport = selected.size > 0
      ? filteredCompanies.filter((c) => selected.has(c.previewId))
      : filteredCompanies;

    if (toImport.length === 0) return;

    dispatch({ type: 'RUN_IMPORT_START' });

    // Use a Web Worker for the simulation to avoid blocking the main thread.
    const worker = new Worker(new URL('../../workers/import-worker.ts', import.meta.url));

    worker.onmessage = (event) => {
      if (event.data.type === 'progress') {
        dispatch({ type: 'ADD_IMPORT_LOG', payload: event.data.payload.log });
        dispatch({ type: 'SET_IMPORT_PROGRESS', payload: event.data.payload.progress });
      } else if (event.data.type === 'done') {
        // When simulation is done, make the actual API call
        performApiImport(toImport);
        worker.terminate();
      }
    };

    worker.postMessage({ toImport });
  };

  const performApiImport = async (toImport: Company[]) => {
     try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/companies/bulk-import`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
          platform: activePlatform,
          selectedIds: Array.from(selected),
          count: toImport.length,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          message: 'An unknown error occurred during import.',
        }));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.summary) dispatch({ type: 'SET_IMPORT_SUMMARY', payload: data.summary });
    } catch (err) {
      dispatch({ type: 'SET_IMPORT_ERROR', payload: err instanceof Error ? err.message : 'An unexpected error occurred.' });
    } finally {
      dispatch({ type: 'FINISH_IMPORT' });
    }
  };

  const closeModal = () => {
    if (!importing) {
      dispatch({ type: 'CLOSE_MODAL' });
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
            onClick={() => dispatch({ type: 'SET_ACTIVE_PLATFORM', payload: p.key })}
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
            onChange={(e) => dispatch({ type: 'SET_COUNT', payload: Number(e.target.value) })}
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
            onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
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
                    <span>{typeof company.headquarters === 'object' ? (company.headquarters as any).name : company.headquarters}</span>
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

            {/* Error Message */}
            {importError && (
              <div className={styles.errorBox}>
                <strong>Import Failed:</strong> {importError}
              </div>
            )}

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
