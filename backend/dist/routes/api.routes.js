"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const companies_controller_1 = require("../controllers/companies.controller");
const followups_controller_1 = require("../controllers/followups.controller");
const users_controller_1 = require("../controllers/users.controller");
const jobs_controller_1 = require("../controllers/jobs.controller");
const ai_controller_1 = require("../controllers/ai.controller");
const export_controller_1 = require("../controllers/export.controller");
const scanner_controller_1 = require("../controllers/scanner.controller");
const bulk_controller_1 = require("../controllers/bulk.controller");
const crm_controller_1 = require("../controllers/crm.controller");
const writing_controller_1 = require("../controllers/writing.controller");
const recruitment_controller_1 = require("../controllers/recruitment.controller");
const market_controller_1 = require("../controllers/market.controller");
const bi_controller_1 = require("../controllers/bi.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Authentication
router.post('/auth/register', auth_controller_1.register);
router.post('/auth/login', auth_controller_1.login);
router.get('/auth/profile', auth_middleware_1.requireAuth, auth_controller_1.getProfile);
// Dashboard Stats
router.get('/dashboard/stats', dashboard_controller_1.getDashboardStats);
// Companies (Leads)
router.get('/companies', companies_controller_1.getCompanies);
router.get('/companies/:id', companies_controller_1.getCompanyById);
router.post('/companies', companies_controller_1.createCompany);
router.patch('/companies/:id/stage', companies_controller_1.updateCompanyStage);
router.post('/companies/bulk-import', bulk_controller_1.runBulkImport);
router.get('/bulk/preview', bulk_controller_1.getBulkPreview);
// Follow-ups
router.get('/followups', followups_controller_1.getFollowups);
router.post('/followups', followups_controller_1.createFollowup);
router.patch('/followups/:id/status', followups_controller_1.updateFollowupStatus);
// Job Applications (Job CRM)
router.get('/job-applications', jobs_controller_1.getJobs);
router.get('/job-applications/:id', jobs_controller_1.getJobById);
router.post('/job-applications', jobs_controller_1.createJob);
router.patch('/job-applications/:id/status', jobs_controller_1.updateJobStatus);
router.post('/jobs/auto-scan', scanner_controller_1.runAutoScan);
// AI Automation Hub
router.post('/ai/ats-score', ai_controller_1.calculateAtsScore);
router.post('/ai/generate-cover-letter', ai_controller_1.generateCoverLetter);
router.post('/ai/company-analysis', ai_controller_1.analyzeCompanyIntelligence);
// Exports
router.get('/export/companies', export_controller_1.exportCompaniesCsv);
router.get('/export/jobs', export_controller_1.exportJobsCsv);
// Auxiliary Endpoints
router.get('/users', users_controller_1.getUsers);
router.get('/platforms', users_controller_1.getPlatforms);
// ── Enterprise Business Intelligence Module ──────────────────────────────
router.get('/bi/:id/profile', bi_controller_1.getBusinessProfile);
router.get('/bi/:id/products', bi_controller_1.getProductIntelligence);
router.get('/bi/:id/sales', bi_controller_1.getSalesIntelligence);
router.get('/bi/:id/growth', bi_controller_1.getGrowthReport);
router.get('/bi/market-trends', bi_controller_1.getMarketTrends);
router.get('/bi/:id/competitors', bi_controller_1.getCompetitorAnalysis);
router.get('/bi/:id/customers', bi_controller_1.getCustomerAnalysis);
router.get('/bi/:id/lead-score', bi_controller_1.getLeadScoring);
router.get('/bi/:id/icp', bi_controller_1.getIcpMatch);
router.get('/bi/:id/swot', bi_controller_1.getSwotAnalysis);
router.get('/bi/:id/financial', bi_controller_1.getFinancialIntelligence);
router.get('/bi/:id/hiring', bi_controller_1.getHiringIntelligence);
router.get('/bi/:id/technology', bi_controller_1.getTechnologyAnalysis);
router.get('/bi/:id/website', bi_controller_1.getWebsiteAnalysis);
router.get('/bi/:id/marketing', bi_controller_1.getMarketingIntelligence);
router.get('/bi/:id/opportunity', bi_controller_1.getSalesOpportunity);
router.get('/bi/:id/risk', bi_controller_1.getRiskAnalysis);
router.get('/bi/:id/recommendations', bi_controller_1.getAiRecommendations);
router.get('/bi/:id/report', bi_controller_1.getFullBiReport);
// ── CRM Module ───────────────────────────────────────────────────────────────
router.get('/crm/deals', crm_controller_1.getDeals);
router.post('/crm/deals', crm_controller_1.createDeal);
router.patch('/crm/deals/:id', crm_controller_1.updateDeal);
router.delete('/crm/deals/:id', crm_controller_1.deleteDeal);
router.get('/crm/contacts', crm_controller_1.getContacts);
router.post('/crm/contacts', crm_controller_1.createContact);
router.patch('/crm/contacts/:id', crm_controller_1.updateContact);
router.get('/crm/opportunities', crm_controller_1.getOpportunities);
router.post('/crm/opportunities', crm_controller_1.createOpportunity);
router.get('/crm/tasks', crm_controller_1.getTasks);
router.post('/crm/tasks', crm_controller_1.createTask);
router.patch('/crm/tasks/:id/status', crm_controller_1.updateTaskStatus);
router.get('/crm/activities', crm_controller_1.getActivities);
router.post('/crm/activities', crm_controller_1.createActivity);
router.get('/crm/campaigns', crm_controller_1.getCampaigns);
router.post('/crm/campaigns', crm_controller_1.createCampaign);
router.get('/crm/forecast', crm_controller_1.getSalesForecast);
// ── AI Writing Suite ─────────────────────────────────────────────────────────
router.get('/writing/types', writing_controller_1.getDocumentTypes);
router.post('/writing/generate', writing_controller_1.generateDocument);
router.post('/writing/ai-reply', writing_controller_1.generateAiReply);
// ── Recruitment Platform ─────────────────────────────────────────────────────
router.get('/recruit/jobs', recruitment_controller_1.searchJobs);
router.post('/recruit/ats-score', recruitment_controller_1.getAtsScore);
router.post('/recruit/job-match', recruitment_controller_1.getJobMatches);
router.post('/recruit/interview-questions', recruitment_controller_1.generateInterviewQuestions);
router.get('/recruit/stats', recruitment_controller_1.getRecruiterStats);
// ── Market Intelligence ──────────────────────────────────────────────────────
router.get('/market/industries', market_controller_1.getIndustryReports);
router.get('/market/industries/:name', market_controller_1.getIndustryDetail);
router.get('/market/opportunities', market_controller_1.getBusinessOpportunities);
router.get('/market/countries', market_controller_1.getCountryMarket);
router.get('/market/growth-prediction', market_controller_1.getGrowthPrediction);
router.post('/market/advisor', market_controller_1.askBusinessAdvisor);
router.get('/market/weekly-report', market_controller_1.getWeeklyReport);
exports.default = router;
