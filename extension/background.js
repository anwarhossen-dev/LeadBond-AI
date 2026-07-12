// LeadBond AI — Background Service Worker v3.0
// Handles: auto-captured job storage, badge counter, notifications

const STORAGE_KEY = 'leadbond_auto_jobs';
const MAX_STORED  = 200;

// ─────────────────────────────────────────────────────────────────────────────
//  Install / Update
// ─────────────────────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ [STORAGE_KEY]: [] });
    chrome.tabs.create({ url: 'http://localhost:3000' });
  }
  console.log('[LeadBond] Service worker ready v3.0');
});

// ─────────────────────────────────────────────────────────────────────────────
//  Message Handler
// ─────────────────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // ── New job auto-captured from content script ──
  if (msg.action === 'jobCaptured') {
    handleJobCaptured(msg.payload).then(count => {
      sendResponse({ ok: true, count });
    });
    return true;
  }

  // ── Popup requesting stored jobs ──
  if (msg.action === 'getAutoJobs') {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      sendResponse({ jobs: result[STORAGE_KEY] || [] });
    });
    return true;
  }

  // ── Clear stored jobs ──
  if (msg.action === 'clearAutoJobs') {
    chrome.storage.local.set({ [STORAGE_KEY]: [] });
    updateBadge(0);
    sendResponse({ ok: true });
    return true;
  }

  // ── Remove specific jobs by URL ──
  if (msg.action === 'removeSyncedJobs') {
    const urls = new Set(msg.urls || []);
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const filtered = (result[STORAGE_KEY] || []).filter(j => !urls.has(j.jobUrl));
      chrome.storage.local.set({ [STORAGE_KEY]: filtered });
      updateBadge(filtered.length);
      sendResponse({ ok: true, remaining: filtered.length });
    });
    return true;
  }

  // ── Monitor started ──
  if (msg.action === 'monitorStarted') {
    console.log('[LeadBond BG] Auto-monitor active on tab', sender.tab?.id);
    // Set a green monitoring badge
    if (sender.tab?.id) {
      chrome.action.setBadgeText({ text: '👁', tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId: sender.tab.id });
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  Store Captured Job
// ─────────────────────────────────────────────────────────────────────────────

async function handleJobCaptured(job) {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const existing = result[STORAGE_KEY] || [];

      // Dedup by jobUrl or title+company
      const isDup = existing.some(j =>
        (j.jobUrl && j.jobUrl === job.jobUrl) ||
        (j.jobTitle === job.jobTitle && j.companyName === job.companyName)
      );

      if (isDup) { resolve(existing.length); return; }

      // Prepend new job, trim to MAX_STORED
      const updated = [job, ...existing].slice(0, MAX_STORED);
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        updateBadge(updated.length);
        resolve(updated.length);
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Badge Counter
// ─────────────────────────────────────────────────────────────────────────────

function updateBadge(count) {
  const text  = count > 0 ? (count > 99 ? '99+' : String(count)) : '';
  const color = count > 0 ? '#00f2fe' : '#6b7280';
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Tab Activation — platform badge
// ─────────────────────────────────────────────────────────────────────────────

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    const url = tab.url || '';

    // Restore auto-job count badge when switching tabs
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const jobs = result[STORAGE_KEY] || [];
      if (jobs.length > 0) {
        updateBadge(jobs.length);
        return;
      }

      // Platform indicator badge
      let badge = '', color = '#6b7280';
      if (url.includes('linkedin.com/jobs')) { badge = 'LI'; color = '#0a66c2'; }
      else if (url.includes('linkedin.com'))  { badge = 'LI'; color = '#0a66c2'; }
      else if (url.includes('google.com/maps')) { badge = 'GM'; color = '#34a853'; }
      else if (url.includes('facebook.com'))    { badge = 'FB'; color = '#1877f2'; }
      else if (url.includes('bdjobs.com'))      { badge = 'BD'; color = '#e8341c'; }
      else if (url.includes('bikroy.com'))      { badge = 'BK'; color = '#f59e0b'; }
      chrome.action.setBadgeText({ text: badge, tabId });
      chrome.action.setBadgeBackgroundColor({ color, tabId });
    });
  } catch (_) {}
});
