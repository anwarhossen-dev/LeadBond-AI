import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompanyStage
} from '../controllers/companies.controller';
import {
  getFollowups,
  createFollowup,
  updateFollowupStatus
} from '../controllers/followups.controller';
import { getUsers, getPlatforms } from '../controllers/users.controller';
import {
  getJobs,
  getJobById,
  createJob,
  updateJobStatus
} from '../controllers/jobs.controller';
import {
  calculateAtsScore,
  generateCoverLetter,
  analyzeCompanyIntelligence
} from '../controllers/ai.controller';
import {
  exportCompaniesCsv,
  exportJobsCsv
} from '../controllers/export.controller';
import { runAutoScan } from '../controllers/scanner.controller';
import { runBulkImport, getBulkPreview } from '../controllers/bulk.controller';
import {
  getDeals, createDeal, updateDeal, deleteDeal,
  getContacts, createContact, updateContact,
  getOpportunities, createOpportunity,
  getTasks, createTask, updateTaskStatus,
  getActivities, createActivity,
  getCampaigns, createCampaign,
  getSalesForecast,
} from '../controllers/crm.controller';
import {
  generateDocument, generateAiReply, getDocumentTypes,
} from '../controllers/writing.controller';
import {
  searchJobs as recruitSearchJobs, getAtsScore as recruitAtsScore,
  getJobMatches, generateInterviewQuestions, getRecruiterStats,
} from '../controllers/recruitment.controller';
import {
  getIndustryReports, getIndustryDetail, getBusinessOpportunities,
  getCountryMarket, getGrowthPrediction, askBusinessAdvisor, getWeeklyReport,
} from '../controllers/market.controller';
import {
  getBusinessProfile,
  getProductIntelligence,
  getSalesIntelligence,
  getGrowthReport,
  getMarketTrends,
  getCompetitorAnalysis,
  getCustomerAnalysis,
  getLeadScoring,
  getIcpMatch,
  getSwotAnalysis,
  getFinancialIntelligence,
  getHiringIntelligence,
  getTechnologyAnalysis,
  getWebsiteAnalysis,
  getMarketingIntelligence,
  getSalesOpportunity,
  getRiskAnalysis,
  getAiRecommendations,
  getFullBiReport,
} from '../controllers/bi.controller';

const router = Router();

// Dashboard Stats
router.get('/dashboard/stats', getDashboardStats);

// Companies (Leads)
router.get('/companies', getCompanies);
router.get('/companies/:id', getCompanyById);
router.post('/companies', createCompany);
router.patch('/companies/:id/stage', updateCompanyStage);
router.post('/companies/bulk-import', runBulkImport);
router.get('/bulk/preview', getBulkPreview);

// Follow-ups
router.get('/followups', getFollowups);
router.post('/followups', createFollowup);
router.patch('/followups/:id/status', updateFollowupStatus);

// Job Applications (Job CRM)
router.get('/job-applications', getJobs);
router.get('/job-applications/:id', getJobById);
router.post('/job-applications', createJob);
router.patch('/job-applications/:id/status', updateJobStatus);
router.post('/jobs/auto-scan', runAutoScan);

// AI Automation Hub
router.post('/ai/ats-score', calculateAtsScore);
router.post('/ai/generate-cover-letter', generateCoverLetter);
router.post('/ai/company-analysis', analyzeCompanyIntelligence);

// Exports
router.get('/export/companies', exportCompaniesCsv);
router.get('/export/jobs', exportJobsCsv);

// Auxiliary Endpoints
router.get('/users', getUsers);
router.get('/platforms', getPlatforms);

// ── Enterprise Business Intelligence Module ──────────────────────────────
router.get('/bi/:id/profile',         getBusinessProfile);
router.get('/bi/:id/products',        getProductIntelligence);
router.get('/bi/:id/sales',           getSalesIntelligence);
router.get('/bi/:id/growth',          getGrowthReport);
router.get('/bi/market-trends',       getMarketTrends);
router.get('/bi/:id/competitors',     getCompetitorAnalysis);
router.get('/bi/:id/customers',       getCustomerAnalysis);
router.get('/bi/:id/lead-score',      getLeadScoring);
router.get('/bi/:id/icp',             getIcpMatch);
router.get('/bi/:id/swot',            getSwotAnalysis);
router.get('/bi/:id/financial',       getFinancialIntelligence);
router.get('/bi/:id/hiring',          getHiringIntelligence);
router.get('/bi/:id/technology',      getTechnologyAnalysis);
router.get('/bi/:id/website',         getWebsiteAnalysis);
router.get('/bi/:id/marketing',       getMarketingIntelligence);
router.get('/bi/:id/opportunity',     getSalesOpportunity);
router.get('/bi/:id/risk',            getRiskAnalysis);
router.get('/bi/:id/recommendations', getAiRecommendations);
router.get('/bi/:id/report',          getFullBiReport);

// ── CRM Module ───────────────────────────────────────────────────────────────
router.get('/crm/deals',              getDeals);
router.post('/crm/deals',             createDeal);
router.patch('/crm/deals/:id',        updateDeal);
router.delete('/crm/deals/:id',       deleteDeal);

router.get('/crm/contacts',           getContacts);
router.post('/crm/contacts',          createContact);
router.patch('/crm/contacts/:id',     updateContact);

router.get('/crm/opportunities',      getOpportunities);
router.post('/crm/opportunities',     createOpportunity);

router.get('/crm/tasks',              getTasks);
router.post('/crm/tasks',             createTask);
router.patch('/crm/tasks/:id/status', updateTaskStatus);

router.get('/crm/activities',         getActivities);
router.post('/crm/activities',        createActivity);

router.get('/crm/campaigns',          getCampaigns);
router.post('/crm/campaigns',         createCampaign);

router.get('/crm/forecast',           getSalesForecast);

// ── AI Writing Suite ─────────────────────────────────────────────────────────
router.get('/writing/types',          getDocumentTypes);
router.post('/writing/generate',      generateDocument);
router.post('/writing/ai-reply',      generateAiReply);

// ── Recruitment Platform ─────────────────────────────────────────────────────
router.get('/recruit/jobs',           recruitSearchJobs);
router.post('/recruit/ats-score',     recruitAtsScore);
router.post('/recruit/job-match',     getJobMatches);
router.post('/recruit/interview-questions', generateInterviewQuestions);
router.get('/recruit/stats',          getRecruiterStats);

// ── Market Intelligence ──────────────────────────────────────────────────────
router.get('/market/industries',           getIndustryReports);
router.get('/market/industries/:name',     getIndustryDetail);
router.get('/market/opportunities',        getBusinessOpportunities);
router.get('/market/countries',            getCountryMarket);
router.get('/market/growth-prediction',    getGrowthPrediction);
router.post('/market/advisor',             askBusinessAdvisor);
router.get('/market/weekly-report',        getWeeklyReport);

export default router;
