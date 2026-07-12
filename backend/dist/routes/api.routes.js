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
const router = (0, express_1.Router)();
// Dashboard Stats
router.get('/dashboard/stats', dashboard_controller_1.getDashboardStats);
// Companies (Leads)
router.get('/companies', companies_controller_1.getCompanies);
router.get('/companies/:id', companies_controller_1.getCompanyById);
router.post('/companies', companies_controller_1.createCompany);
router.patch('/companies/:id/stage', companies_controller_1.updateCompanyStage);
router.post('/companies/bulk-import', bulk_controller_1.runBulkImport);
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
exports.default = router;
