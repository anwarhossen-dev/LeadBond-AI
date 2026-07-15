'use client';

import styles from './page.module.css';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string;
  companyName: string;
  jobTitle: string;
  status: 'success' | 'pending';
}

export interface ImportSummary {
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
//  Component Props
// ─────────────────────────────────────────────────────────────────────────────

interface ImportProgressModalProps {
  showModal: boolean;
  importing: boolean;
  importDone: boolean;
  importSummary: ImportSummary | null;
  importError: string | null;
  importLog: LogEntry[];
  importProgress: number;
  activePlatform: string;
  totalToImport: number;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ImportProgressModal({
  showModal,
  importing,
  importDone,
  importSummary,
  importError,
  importLog,
  importProgress,
  activePlatform,
  totalToImport,
  onClose,
}: ImportProgressModalProps) {
  if (!showModal) return null;

  const platform = PLATFORMS.find(p => p.key === activePlatform);

  return (
    <div className={styles.modalOverlay} onClick={() => !importing && onClose()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalIcon}>{importDone ? '✅' : '⚡'}</span>
          <div>
            <div className={styles.modalTitle}>{importDone ? 'ইমপোর্ট সম্পন্ন!' : 'ইমপোর্ট চলছে…'}</div>
            <div className={styles.modalSubtitle}>{platform?.icon} {platform?.label} থেকে ডেটা সেভ হচ্ছে</div>
          </div>
        </div>

        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarFill} style={{ width: `${importProgress}%` }} />
        </div>
        <div className={styles.progressStats}>
          <span><strong>{importLog.filter(l => l.status === 'success').length}</strong> সম্পন্ন</span>
          <span><strong>{importProgress}%</strong></span>
          <span>মোট <strong>{totalToImport}</strong></span>
        </div>

        <div className={styles.logList}>
          {importLog.map((log) => (
            <div key={log.id} className={`${styles.logItem} ${log.status === 'success' ? styles.logSuccess : styles.logPending}`}>
              <span className={styles.logIcon}>{log.status === 'success' ? '✅' : '⏳'}</span>
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

        {importError && <div className={styles.errorBox}><strong>Import Failed:</strong> {importError}</div>}

        {importDone && importSummary && (
          <div className={styles.summaryBox}>
            <div className={styles.summaryItem}><strong>{importSummary.companiesImported}</strong><span>নতুন কোম্পানি</span></div>
            <div className={styles.summaryItem}><strong>{importSummary.jobsImported}</strong><span>জব টিকেট</span></div>
            <div className={styles.summaryItem}><strong>{importSummary.platform}</strong><span>সোর্স</span></div>
          </div>
        )}

        <div className={styles.modalActions}>
          {importDone ? (
            <>
              <button className="btn btn-secondary" onClick={onClose} id="modal-close">✖ বন্ধ করুন</button>
              <a href="/leads" className="btn btn-primary" id="modal-view-leads">Leads দেখুন →</a>
            </>
          ) : (
            <button className="btn btn-secondary" disabled id="modal-cancel">⏳ চলছে…</button>
          )}
        </div>
      </div>
    </div>
  );
}