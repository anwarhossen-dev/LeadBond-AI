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

export default router;
