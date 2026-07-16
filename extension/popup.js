// LeadBond AI Capture — Popup Script v3.1 (CSP-compliant)
// NO inline handlers. All events wired via addEventListener.

const API = 'http://localhost:5000/api';

// ─────────────────────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────────────────────

let bulkPlatform  = 'linkedin';
let bulkCount     = 20;
let bulkCompanies = [];
let bulkSelected  = new Set();
let activeScrapeData = null;

// ─────────────────────────────────────────────────────────────────────────────
//  PLATFORM CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORM_CONFIG = {
  linkedin:    { icon: '💼', label: 'LinkedIn',    pillClass: 'pill-linkedin'  },
  google_maps: { icon: '🗺️',  label: 'Google Maps', pillClass: 'pill-google'   },
  facebook:    { icon: '📘', label: 'Facebook',    pillClass: 'pill-facebook'  },
  bdjobs:      { icon: '🇧🇩', label: 'BDJobs',      pillClass: 'pill-bdjobs'    },
  bikroy:      { icon: '🛒', label: 'Bikroy',      pillClass: 'pill-bikroy'    },
  chaldal:     { icon: '🛍️',  label: 'Chaldal',     pillClass: 'pill-chaldal'   },
  daraz:       { icon: '📦', label: 'Daraz',       pillClass: 'pill-daraz'     },
  generic:     { icon: '🌐', label: 'Web',         pillClass: 'pill-generic'   },
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function el(id) { return document.getElementById(id); }

// ─────────────────────────────────────────────────────────────────────────────
//  TAB SWITCHING
// ─────────────────────────────────────────────────────────────────────────────

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  el('tab-' + tabName).classList.add('active');
  el('panel-' + tabName).classList.add('active');
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK — Platform Selector
// ─────────────────────────────────────────────────────────────────────────────

function selectPlatform(btn) {
  document.querySelectorAll('.plat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  bulkPlatform = btn.dataset.plat;
  bulkSelected.clear();
  loadBulkPreview();
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK — Slider
// ─────────────────────────────────────────────────────────────────────────────

function onSliderChange(sliderEl) {
  bulkCount = parseInt(sliderEl.value, 10);
  const pct = ((bulkCount - 10) / 40) * 100;
  sliderEl.style.setProperty('--p', pct + '%');
  el('slider-val').textContent = bulkCount + ' টি';
  loadBulkPreview();
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK — Load Preview
// ─────────────────────────────────────────────────────────────────────────────

async function loadBulkPreview() {
  showBulkStatus('লোড হচ্ছে…', 'info');
  renderSkeletons();

  const liveMode = el('chk-live-capture').checked;

  if (liveMode) {
    chrome.runtime.sendMessage({ action: 'getAutoJobs' }, (res) => {
      if (chrome.runtime.lastError || !res || !res.jobs) {
        showBulkStatus('❌ Live jobs পাওয়া যায়নি।', 'error');
        bulkCompanies = [];
        renderCompanyList();
      } else {
        bulkCompanies = res.jobs.map((job, idx) => ({
          previewId: `live_${idx}`,
          companyName: job.companyName,
          industry: 'Technology',
          headquarters: job.location || 'Unknown',
          country: 'Bangladesh',
          phone: '',
          email: '',
          website: job.jobUrl || '',
          size: '10-50',
          jobTitle: job.jobTitle,
          workMode: job.workMode || 'Remote',
          jobType: 'Full Time',
          salary: 'Competitive',
          requirements: 'Not specified',
          icpMatch: 'High Fit',
          originalCapturedJob: job
        }));

        bulkSelected.clear();
        renderCompanyList();
        updateSelInfo();
        showBulkStatus(`✅ ${bulkCompanies.length} টি লাইভ জব কন্টাক্ট লোড হয়েছে`, 'success', 2500);
      }
    });
  } else {
    try {
      const res  = await fetch(`${API}/bulk/preview?platform=${bulkPlatform}&count=${bulkCount}`);
      const data = await res.json();

      if (!data.success || !data.companies) throw new Error('No data');

      bulkCompanies = data.companies;
      bulkSelected.clear();
      renderCompanyList();
      updateSelInfo();
      showBulkStatus(`✅ ${data.companies.length} টি কোম্পানি লোড হয়েছে`, 'success', 2500);

    } catch (err) {
      console.error('[LeadBond Bulk]', err);
      showBulkStatus('❌ Backend connect হয়নি। Server চালু আছে?', 'error');
      el('company-list').innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:var(--dim);font-size:.8rem;">
          ⚠️ Backend server চালু করুন<br>
          <span style="color:var(--muted);font-size:.7rem;">localhost:5000</span>
        </div>`;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK — Render Skeletons
// ─────────────────────────────────────────────────────────────────────────────

function renderSkeletons() {
  el('company-list').innerHTML = Array.from({ length: 6 }, () =>
    '<div class="skeleton-card"></div>'
  ).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK — Render Company Cards (NO inline handlers — uses data-id + delegation)
// ─────────────────────────────────────────────────────────────────────────────

function renderCompanyList() {
  const list = el('company-list');

  if (!bulkCompanies.length) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--dim);">কোনো ডেটা নেই</div>';
    return;
  }

  list.innerHTML = bulkCompanies.map(co => {
    const isSelected = bulkSelected.has(co.previewId);
    const icpClass   = co.icpMatch === 'High Fit' ? 'icp-high' : 'icp-medium';
    return `
      <div class="co-card ${isSelected ? 'selected' : ''}"
           data-id="${co.previewId}">
        <div class="co-check">
          <span class="co-check-mark">✓</span>
        </div>
        <div class="icp-dot ${icpClass}" title="${co.icpMatch}"></div>
        <div class="co-info">
          <div class="co-name">${co.companyName}</div>
          <div class="co-sub">${co.industry} &bull; ${co.headquarters}</div>
        </div>
        <div class="co-right">
          <span class="co-salary">${co.salary}</span>
          <span class="co-mode">${co.workMode}</span>
        </div>
      </div>`;
  }).join('');

  el('total-count').textContent = bulkCompanies.length;
}

// Delegated click handler — attached once on container
function onCompanyListClick(e) {
  const card = e.target.closest('.co-card');
  if (!card) return;
  const previewId = card.dataset.id;
  if (!previewId) return;

  if (bulkSelected.has(previewId)) {
    bulkSelected.delete(previewId);
    card.classList.remove('selected');
  } else {
    bulkSelected.add(previewId);
    card.classList.add('selected');
  }
  updateSelInfo();
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK — Select All / Clear All
// ─────────────────────────────────────────────────────────────────────────────

function bulkSelectAll() {
  bulkCompanies.forEach(co => bulkSelected.add(co.previewId));
  document.querySelectorAll('.co-card').forEach(c => c.classList.add('selected'));
  updateSelInfo();
}

function bulkClearAll() {
  bulkSelected.clear();
  document.querySelectorAll('.co-card').forEach(c => c.classList.remove('selected'));
  updateSelInfo();
}

function updateSelInfo() {
  const count  = bulkSelected.size;
  el('sel-count').textContent = count;
  const btn    = el('bulk-sync-btn');
  const label  = el('bulk-btn-label');

  if (count === 0) {
    btn.disabled      = true;
    label.textContent = 'সিলেক্ট করুন';
  } else {
    btn.disabled      = false;
    label.textContent = `${count} টি ইমপোর্ট করুন`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK — Run Sync with Progress Overlay
// ─────────────────────────────────────────────────────────────────────────────

async function runBulkSync() {
  const liveMode = el('chk-live-capture').checked;
  const toImport = bulkSelected.size > 0
    ? bulkCompanies.filter(co => bulkSelected.has(co.previewId))
    : bulkCompanies;

  if (!toImport.length) return;

  // Show overlay
  const overlay = el('progress-overlay');
  overlay.classList.add('show');
  el('prog-title').textContent     = '⚡ ইমপোর্ট চলছে…';
  el('prog-bar').style.width       = '0%';
  el('prog-done').textContent      = '0';
  el('prog-total').textContent     = toImport.length;
  el('prog-pct').textContent       = '0';
  el('prog-log').innerHTML         = '';
  el('prog-summary').style.display = 'none';
  el('prog-close-btn').style.display  = 'none';
  el('prog-leads-link').style.display = 'none';

  // Animate per-company
  const delay = Math.max(160, Math.floor(3200 / toImport.length));
  for (let i = 0; i < toImport.length; i++) {
    await sleep(delay);
    const co  = toImport[i];
    const pct = Math.round(((i + 1) / toImport.length) * 100);
    el('prog-bar').style.width     = pct + '%';
    el('prog-done').textContent    = i + 1;
    el('prog-pct').textContent     = pct;

    const logEl = document.createElement('div');
    logEl.className = 'log-row';
    logEl.innerHTML = `<span>✅</span><span style="flex:1"><strong>${co.companyName}</strong> — ${co.jobTitle}</span>`;
    const logBox = el('prog-log');
    logBox.prepend(logEl);
    if (logBox.children.length > 8) logBox.lastChild.remove();
  }

  // API call
  try {
    const payload = {
      platform:    bulkPlatform,
      selectedIds: Array.from(bulkSelected),
      count:       toImport.length,
    };

    if (liveMode) {
      payload.customItems = toImport;
    }

    const res  = await fetch(`${API}/companies/bulk-import`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (liveMode) {
      const urls = toImport.map(j => j.website).filter(Boolean);
      chrome.runtime.sendMessage({ action: 'removeSyncedJobs', urls });
    }

    if (data.summary) {
      el('sum-companies').textContent  = data.summary.companiesImported;
      el('sum-jobs').textContent       = data.summary.jobsImported;
      el('sum-platform').textContent   = data.summary.platform || bulkPlatform;
      el('prog-summary').style.display = 'flex';
    }
    el('prog-title').textContent = '✅ ইমপোর্ট সম্পন্ন!';

  } catch (err) {
    console.error('[Bulk Sync]', err);
    el('prog-title').textContent = '⚠️ সম্পন্ন (offline mode)';
  }

  el('prog-close-btn').style.display  = 'block';
  el('prog-leads-link').style.display = 'flex';
}

function closeProgress() {
  el('progress-overlay').classList.remove('show');
  bulkSelected.clear();
  loadBulkPreview();
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK — Status Bar
// ─────────────────────────────────────────────────────────────────────────────

function showBulkStatus(msg, type, autoHide = 0) {
  const bar = el('bulk-status');
  bar.className        = `status-bar st-${type}`;
  bar.style.display    = 'flex';
  el('bulk-status-text').textContent = msg;
  if (autoHide > 0) setTimeout(() => { bar.style.display = 'none'; }, autoHide);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SINGLE CAPTURE — Status
// ─────────────────────────────────────────────────────────────────────────────

function showSingleStatus(msg, type, autoHide = 0) {
  const bar = el('status-bar');
  bar.className               = `status-bar st-${type}`;
  bar.style.display           = 'flex';
  el('status-text').textContent = msg;
  el('status-spinner').style.display = type === 'info' ? 'block' : 'none';
  if (autoHide > 0) setTimeout(() => { bar.style.display = 'none'; }, autoHide);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SINGLE CAPTURE — Form Populate
// ─────────────────────────────────────────────────────────────────────────────

function populateForm(data) {
  const pConf  = PLATFORM_CONFIG[data.platform] || PLATFORM_CONFIG.generic;
  const isJob  = data.type === 'job';
  const isComp = data.type === 'company';

  // Pill & badge
  const pill = el('platform-pill');
  pill.className   = `platform-pill ${pConf.pillClass}`;
  pill.textContent = `${pConf.icon} ${pConf.label}`;

  const badge = el('type-badge');
  badge.className   = `type-badge ${isJob ? 'badge-job' : isComp ? 'badge-company' : 'badge-generic'}`;
  badge.textContent = isJob ? 'Job Listing' : isComp ? 'Company' : 'Web Page';

  // Preview card
  el('preview-card').style.display = 'flex';
  el('preview-icon').textContent   = isJob ? '💼' : isComp ? '🏢' : '🌐';
  el('preview-name').textContent   = data.companyName || data.title || '—';
  el('preview-sub').textContent    = [data.industry, data.location].filter(Boolean).join(' • ') || (data.url || '').slice(0, 50) || '—';

  const metaEl = el('preview-meta');
  metaEl.innerHTML = '';
  const addChip = t => {
    const c = document.createElement('span');
    c.className   = 'meta-chip';
    c.textContent = t;
    metaEl.appendChild(c);
  };
  if (isJob && data.workMode) addChip(data.workMode);
  if (isJob && data.jobType)  addChip(data.jobType);
  if (isJob && data.salary)   addChip(data.salary);

  // Fields
  el('company-name').value  = data.companyName  || '';
  el('job-title').value     = data.jobTitle     || '';
  el('company-email').value = data.email        || '';
  el('company-phone').value = data.phone        || '';
  el('location').value      = data.location     || '';
  el('industry').value      = data.industry     || '';
  el('description').value   = (data.description || '').slice(0, 400);

  const jtEl = el('job-type');
  const wmEl = el('work-mode');
  if (data.jobType  && jtEl) jtEl.value = data.jobType;
  if (data.workMode && wmEl) wmEl.value = data.workMode;
  if (data.salary)           el('salary').value = data.salary;

  toggleJobFields(isJob);
  el('pipeline-stage').value = isJob ? 'Applied' : 'Captured';
}

function toggleJobFields(isJob) {
  el('job-title-group').style.display  = isJob ? 'flex'  : 'none';
  el('job-meta-row').style.display     = isJob ? 'grid'  : 'none';
  el('salary-group').style.display     = isJob ? 'flex'  : 'none';
}

// ─────────────────────────────────────────────────────────────────────────────
//  SINGLE CAPTURE — Scrape Page
// ─────────────────────────────────────────────────────────────────────────────

async function runScrape() {
  showSingleStatus('পেজ স্ক্যান হচ্ছে…', 'info');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) { showSingleStatus('Active tab পাওয়া যায়নি।', 'error'); return; }

    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    } catch (_) { /* already injected */ }

    chrome.tabs.sendMessage(tab.id, { action: 'scrapePage' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        showSingleStatus('পেজ ডেটা পাওয়া যায়নি। Reload করুন।', 'error');
        el('rescrape-btn').style.display = 'block';
        return;
      }
      activeScrapeData = response;
      populateForm(response);
      el('rescrape-btn').style.display = 'block';
      showSingleStatus('✅ পেজ স্ক্যান সম্পন্ন!', 'success', 2500);
    });
  } catch (err) {
    console.error('[LeadBond Scrape]', err);
    showSingleStatus('Permission error। পেজ reload করুন।', 'error');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SINGLE CAPTURE — Sync to CRM
// ─────────────────────────────────────────────────────────────────────────────

async function syncSingle() {
  const companyName = el('company-name').value.trim();
  const stage       = el('pipeline-stage').value;
  const isJob       = ['Draft', 'Applied'].includes(stage);

  if (!companyName) {
    showSingleStatus('Company name দিন!', 'error');
    el('company-name').focus();
    return;
  }

  el('sync-btn').disabled = true;
  showSingleStatus('CRM-এ সংরক্ষণ হচ্ছে…', 'info');

  const platform = activeScrapeData?.platform || 'generic';
  const endpoint = isJob ? `${API}/job-applications` : `${API}/companies`;

  const payload = isJob
    ? {
        companyName,
        jobTitle:    el('job-title').value.trim()    || 'Captured Position',
        jobType:     el('job-type').value,
        workMode:    el('work-mode').value,
        location:    el('location').value.trim(),
        description: el('description').value.trim(),
        applyEmail:  el('company-email').value.trim(),
        salary:      el('salary').value.trim() || 'Not specified',
        status:      stage,
        deadline:    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        sourceUrl:   activeScrapeData?.url || '',
        platform,
      }
    : {
        companyName,
        industry:     el('industry').value.trim(),
        website:      activeScrapeData?.website || '',
        headquarters: el('location').value.trim(),
        email:        el('company-email').value.trim(),
        phone:        el('company-phone').value.trim(),
        description:  el('description').value.trim(),
        pipelineStage: stage,
        sourceUrl:    activeScrapeData?.url || '',
        platform,
      };

  try {
    const res = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showSingleStatus('✅ LeadBond CRM-এ সেভ হয়েছে!', 'success');
    setTimeout(() => window.close(), 1800);
  } catch (err) {
    console.error('[Sync]', err);
    showSingleStatus('❌ Backend connect হয়নি।', 'error');
    el('sync-btn').disabled = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  INIT — Wire all event listeners once DOM is ready
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {

  // ── Tabs ──
  el('tab-single').addEventListener('click', () => switchTab('single'));
  el('tab-bulk').addEventListener('click', () => {
    switchTab('bulk');
    if (bulkCompanies.length === 0) loadBulkPreview();
  });

  // ── Platform tabs (event delegation on container) ──
  el('plat-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.plat-tab');
    if (btn) selectPlatform(btn);
  });

  // ── Slider ──
  el('bulk-slider').addEventListener('input', function () {
    onSliderChange(this);
  });

  // ── Live Mode Checkbox ──
  el('chk-live-capture').addEventListener('change', () => {
    loadBulkPreview();
  });

  // ── Select All / Clear / Refresh ──
  el('btn-select-all').addEventListener('click', bulkSelectAll);
  el('btn-clear-all').addEventListener('click',  bulkClearAll);
  el('btn-refresh').addEventListener('click',    loadBulkPreview);

  // ── Company list (event delegation) ──
  el('company-list').addEventListener('click', onCompanyListClick);

  // ── Bulk Sync button ──
  el('bulk-sync-btn').addEventListener('click', runBulkSync);

  // ── Progress close ──
  el('prog-close-btn').addEventListener('click', closeProgress);

  // ── Single — stage dropdown ──
  el('pipeline-stage').addEventListener('change', () => {
    const isJob = ['Draft', 'Applied'].includes(el('pipeline-stage').value);
    toggleJobFields(isJob);
  });

  // ── Single — rescrape ──
  el('rescrape-btn').addEventListener('click', runScrape);

  // ── Single — sync ──
  el('sync-btn').addEventListener('click', syncSingle);

  // ── Boot: start single-page scrape ──
  showSingleStatus('পেজ স্ক্যান হচ্ছে…', 'info');
  await runScrape();
});
