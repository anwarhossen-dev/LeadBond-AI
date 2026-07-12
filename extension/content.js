// LeadBond AI — Content Script v3.0
// Auto-scroll LinkedIn job detection + multi-platform scraping

// ─────────────────────────────────────────────────────────────────────────────
//  AUTO-SCROLL JOB MONITOR (LinkedIn Only)
// ─────────────────────────────────────────────────────────────────────────────

let autoMonitorActive = false;
let observedCards     = new Set(); // track already-processed card IDs

function isLinkedInJobsPage() {
  return window.location.href.includes('linkedin.com/jobs');
}

// Parse "2 hours ago", "45 minutes ago", "Just now", "1 day ago" → ms ago
function parsePostedTime(timeText) {
  if (!timeText) return Infinity;
  const t = timeText.toLowerCase().trim();
  if (t.includes('just now') || t.includes('moments ago')) return 0;

  const minMatch = t.match(/(\d+)\s*minute/);
  if (minMatch) return parseInt(minMatch[1]) * 60 * 1000;

  const hrMatch = t.match(/(\d+)\s*hour/);
  if (hrMatch) return parseInt(hrMatch[1]) * 60 * 60 * 1000;

  const dayMatch = t.match(/(\d+)\s*day/);
  if (dayMatch) return parseInt(dayMatch[1]) * 24 * 60 * 60 * 1000;

  // "1d", "2h", "30m" short formats
  const shortDay = t.match(/^(\d+)d/); if (shortDay) return parseInt(shortDay[1]) * 86400000;
  const shortHr  = t.match(/^(\d+)h/); if (shortHr)  return parseInt(shortHr[1])  * 3600000;
  const shortMin = t.match(/^(\d+)m/); if (shortMin) return parseInt(shortMin[1]) * 60000;

  return Infinity;
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function extractJobCard(cardEl) {
  try {
    // Job Title
    const titleEl = cardEl.querySelector(
      '.job-card-list__title, .job-card-container__primary-description, ' +
      'a.job-card-list__title--link, [class*="job-card"][class*="title"]'
    );
    const jobTitle = titleEl ? titleEl.innerText.trim() : '';

    // Company Name
    const compEl = cardEl.querySelector(
      '.job-card-container__company-name, ' +
      '.artdeco-entity-lockup__subtitle, ' +
      '.job-card-container__primary-description span, ' +
      '[class*="company-name"]'
    );
    const companyName = compEl ? compEl.innerText.trim() : '';

    // Location
    const locEl = cardEl.querySelector(
      '.job-card-container__metadata-item, ' +
      '.artdeco-entity-lockup__caption, ' +
      '[class*="workplace-type"], [class*="location"]'
    );
    const location = locEl ? locEl.innerText.trim() : '';

    // Posted Time
    const timeEl = cardEl.querySelector(
      '.job-card-container__listed-status, ' +
      'time, [class*="posted"], [class*="listdate"]'
    );
    const postedText = timeEl
      ? (timeEl.getAttribute('datetime') || timeEl.innerText || '').trim()
      : '';
    const msAgo = parsePostedTime(postedText);

    // Job URL
    const linkEl = cardEl.querySelector('a[href*="/jobs/view/"]');
    const jobUrl  = linkEl ? 'https://www.linkedin.com' + linkEl.getAttribute('href').split('?')[0] : '';

    // Card unique ID (from href or data attr)
    const cardId = jobUrl || (cardEl.getAttribute('data-job-id')) || jobTitle + companyName;

    // Work mode hints
    let workMode = 'Onsite';
    const fullText = cardEl.innerText.toLowerCase();
    if (fullText.includes('remote'))      workMode = 'Remote';
    else if (fullText.includes('hybrid')) workMode = 'Hybrid';

    return { jobTitle, companyName, location, postedText, msAgo, jobUrl, cardId, workMode, platform: 'linkedin' };
  } catch (e) {
    return null;
  }
}

function startAutoMonitor() {
  if (autoMonitorActive || !isLinkedInJobsPage()) return;
  autoMonitorActive = true;

  console.log('[LeadBond] 🔍 Auto-monitor started on LinkedIn Jobs');

  // Notify popup that monitor started
  chrome.runtime.sendMessage({ action: 'monitorStarted' });

  // Process existing cards on page load
  processVisibleCards();

  // MutationObserver: watch for new job cards as user scrolls
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length === 0) continue;
      mutation.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;

        // Check if node itself is a job card
        if (node.matches && (
          node.matches('.job-card-container, .jobs-search-results__list-item, [class*="job-card"]')
        )) {
          processCard(node);
        }

        // Check children
        const cards = node.querySelectorAll ?
          node.querySelectorAll('.job-card-container, .jobs-search-results__list-item, [class*="job-card-container"]') : [];
        cards.forEach(processCard);
      });
    }
  });

  // Target the jobs list container
  const targets = [
    document.querySelector('.jobs-search-results-list'),
    document.querySelector('.scaffold-layout__list'),
    document.querySelector('[class*="jobs-search-results"]'),
    document.body,
  ].filter(Boolean);

  targets.slice(0, 1).forEach(target => {
    observer.observe(target, { childList: true, subtree: true });
  });

  // Fallback: also process on scroll (throttled)
  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(processVisibleCards, 800);
  }, { passive: true });
}

function processVisibleCards() {
  const cardSelectors = [
    '.job-card-container',
    '.jobs-search-results__list-item',
    '[data-job-id]',
    '.scaffold-layout__list-item',
  ];

  cardSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(processCard);
  });
}

async function processCard(cardEl) {
  const job = extractJobCard(cardEl);
  if (!job || !job.companyName || !job.jobTitle) return;
  if (observedCards.has(job.cardId)) return; // already seen

  observedCards.add(job.cardId);

  // Filter: only 24-hour jobs
  if (job.msAgo > TWENTY_FOUR_HOURS) return;

  console.log(`[LeadBond] 📌 Captured: ${job.jobTitle} @ ${job.companyName} (${job.postedText})`);

  // Send to background for storage
  chrome.runtime.sendMessage({
    action:  'jobCaptured',
    payload: {
      ...job,
      capturedAt: new Date().toISOString(),
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  MANUAL SCRAPE (popup requests "scrapePage")
// ─────────────────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'scrapePage') {
    const url  = window.location.href;
    const host = window.location.hostname;
    const body = document.body.innerText || '';

    let data = {
      platform:    detectPlatform(host, url),
      type:        'generic',
      title:       document.title,
      url,
      companyName: '',
      jobTitle:    '',
      location:    '',
      description: '',
      website:     '',
      industry:    '',
      email:       '',
      phone:       '',
      salary:      '',
      jobType:     'Full Time',
      workMode:    'Remote',
    };

    try {
      const emailM = body.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}/);
      if (emailM) data.email = emailM[0];
      const phoneM = body.match(/(?:\+?880|0)[\s\-]?1[3-9]\d{8}|(?:\+?1[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}/);
      if (phoneM) data.phone = phoneM[0];
    } catch (_) {}

    try {
      if (data.platform === 'linkedin' && url.includes('/jobs/')) {
        data = { ...data, ...scrapeLinkedInJob() };
      } else if (data.platform === 'linkedin' && url.includes('/company/')) {
        data = { ...data, ...scrapeLinkedInCompany() };
      } else if (data.platform === 'google_maps') {
        data = { ...data, ...scrapeGoogleMaps() };
      } else if (data.platform === 'facebook') {
        data = { ...data, ...scrapeFacebook() };
      } else if (data.platform === 'bdjobs') {
        data = { ...data, ...scrapeBDJobs() };
      } else if (data.platform === 'bikroy') {
        data = { ...data, ...scrapeBikroy() };
      } else {
        data = { ...data, ...scrapeGeneric(url) };
      }
    } catch (err) {
      console.error('[LeadBond] Extraction error:', err);
    }

    sendResponse(data);
  }

  if (request.action === 'startMonitor') {
    startAutoMonitor();
    sendResponse({ ok: true });
  }

  if (request.action === 'getMonitorStatus') {
    sendResponse({ active: autoMonitorActive, seen: observedCards.size });
  }

  return true;
});

// Auto-start monitor if we're on LinkedIn Jobs
if (isLinkedInJobsPage()) {
  // Short delay to let page settle
  setTimeout(startAutoMonitor, 1500);
}

// ─────────────────────────────────────────────────────────────────────────────
//  PLATFORM DETECTION
// ─────────────────────────────────────────────────────────────────────────────

function detectPlatform(host, url) {
  if (host.includes('linkedin.com'))                          return 'linkedin';
  if (host.includes('google.com') && url.includes('/maps'))   return 'google_maps';
  if (host.includes('facebook.com') || host.includes('fb.com')) return 'facebook';
  if (host.includes('bdjobs.com'))                            return 'bdjobs';
  if (host.includes('bikroy.com'))                            return 'bikroy';
  if (host.includes('chaldal.com'))                           return 'chaldal';
  if (host.includes('daraz.com'))                             return 'daraz';
  return 'generic';
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCRAPERS
// ─────────────────────────────────────────────────────────────────────────────

function scrapeLinkedInJob() {
  const r = { type: 'job', jobType: 'Full Time', workMode: 'Remote' };
  const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title h1, h1.t-24');
  if (titleEl) r.jobTitle = titleEl.innerText.trim();
  const compEl = document.querySelector('.job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name a');
  if (compEl) r.companyName = compEl.innerText.trim();
  const locEl = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet');
  if (locEl) r.location = locEl.innerText.trim();
  const descEl = document.querySelector('#job-details, .jobs-description__container');
  if (descEl) r.description = descEl.innerText.slice(0, 600).trim();
  document.querySelectorAll('.job-details-jobs-unified-top-card__job-insight').forEach(el => {
    const t = el.innerText.toLowerCase();
    if (t.includes('remote'))      r.workMode = 'Remote';
    else if (t.includes('hybrid')) r.workMode = 'Hybrid';
    else if (t.includes('on-site') || t.includes('onsite')) r.workMode = 'Onsite';
    if (t.includes('contract'))    r.jobType  = 'Contract';
    else if (t.includes('intern')) r.jobType  = 'Internship';
  });
  return r;
}

function scrapeLinkedInCompany() {
  const r = { type: 'company' };
  const nameEl = document.querySelector('.org-top-card-summary__title, h1.t-24');
  if (nameEl) r.companyName = nameEl.innerText.trim();
  const indEl = document.querySelector('.org-top-card-summary__industry');
  if (indEl) r.industry = indEl.innerText.trim();
  const descEl = document.querySelector('.org-about-us-organization-description__text');
  if (descEl) r.description = descEl.innerText.slice(0, 600).trim();
  const webEl = document.querySelector('.org-top-card-primary-actions__action--website');
  if (webEl && webEl.href) r.website = webEl.href;
  return r;
}

function scrapeGoogleMaps() {
  const r = { type: 'company', platform: 'google_maps' };
  const nameEl = document.querySelector('h1.DUwDvf, h1[data-attrid="title"]');
  if (nameEl) r.companyName = nameEl.innerText.trim();
  const catEl = document.querySelector('.DkEaL, button[jsaction*="category"]');
  if (catEl) r.industry = catEl.innerText.trim();
  const addrEl = document.querySelector('button[data-item-id="address"] .Io6YTe');
  if (addrEl) r.location = addrEl.innerText.trim();
  const phoneEl = document.querySelector('[data-item-id*="phone"] .Io6YTe');
  if (phoneEl) r.phone = phoneEl.innerText.trim();
  const webEl = document.querySelector('a[data-item-id="authority"]');
  if (webEl) r.website = webEl.href;
  return r;
}

function scrapeFacebook() {
  const r = { type: 'company', platform: 'facebook' };
  const nameEl = document.querySelector('h1[class*="x1heor9g"]');
  if (nameEl) r.companyName = nameEl.innerText.trim();
  const links = document.querySelectorAll('a[href*="http"][role="link"]');
  for (const a of links) {
    if (!a.href.includes('facebook.com') && a.href.startsWith('http')) { r.website = a.href; break; }
  }
  return r;
}

function scrapeBDJobs() {
  const r = { type: 'job', platform: 'bdjobs', jobType: 'Full Time', workMode: 'Onsite' };
  const titleEl = document.querySelector('.jobDetailPageHead h1, h1.job_title');
  if (titleEl) r.jobTitle = titleEl.innerText.trim();
  const compEl = document.querySelector('.companyInfo a, .company-name a');
  if (compEl) r.companyName = compEl.innerText.trim();
  const locEl = document.querySelector('.JobPlace, .job-location');
  if (locEl) r.location = locEl.innerText.trim();
  const salEl = document.querySelector('.JobSalary, .salary-range');
  if (salEl) r.salary = salEl.innerText.trim();
  const descEl = document.querySelector('#des_requirement, .job-description');
  if (descEl) r.description = descEl.innerText.slice(0, 600).trim();
  return r;
}

function scrapeBikroy() {
  const r = { type: 'company', platform: 'bikroy' };
  const nameEl = document.querySelector('h1.title, .detail-title h1');
  if (nameEl) r.companyName = nameEl.innerText.trim();
  const locEl = document.querySelector('.location-text');
  if (locEl) r.location = locEl.innerText.trim();
  return r;
}

function scrapeGeneric(url) {
  const r = { type: 'generic' };
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) r.description = metaDesc.getAttribute('content') || '';
  const ogName = document.querySelector('meta[property="og:site_name"]');
  if (ogName) r.companyName = ogName.getAttribute('content') || '';
  if (!r.companyName) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) r.companyName = (ogTitle.getAttribute('content') || '').split(' | ')[0].trim();
  }
  if (!r.companyName) {
    try { r.companyName = new URL(url).hostname.replace('www.', '').split('.')[0]; } catch (_) {}
  }
  r.website = url;
  return r;
}
