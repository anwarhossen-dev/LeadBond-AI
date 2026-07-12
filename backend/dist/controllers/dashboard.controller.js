"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getDashboardStats = async (req, res) => {
    try {
        // 1. CRM Leads counts
        const totalLeads = await prisma_1.default.company.count();
        const qualifiedLeads = await prisma_1.default.company.count({
            where: { pipelineStage: 'Qualified' }
        });
        const wonLeads = await prisma_1.default.company.count({
            where: { pipelineStage: 'Won' }
        });
        const pendingFollowups = await prisma_1.default.followup.count({
            where: { status: 'Pending' }
        });
        // 2. Job applications counts
        const totalJobs = await prisma_1.default.jobApplication.count();
        const jobsApplied = await prisma_1.default.jobApplication.count({ where: { status: 'Applied' } });
        const jobsInterview = await prisma_1.default.jobApplication.count({ where: { status: 'Interview' } });
        const jobsOffer = await prisma_1.default.jobApplication.count({ where: { status: 'Offer' } });
        const jobsRejected = await prisma_1.default.jobApplication.count({ where: { status: 'Rejected' } });
        // 3. AI lead scores
        const avgScoreResult = await prisma_1.default.leadScore.aggregate({
            _avg: { aiScore: true }
        });
        const averageScore = Math.round(avgScoreResult._avg.aiScore || 0);
        // 4. Pipeline stages
        const stageCounts = await prisma_1.default.company.groupBy({
            by: ['pipelineStage'],
            _count: { id: true }
        });
        const pipelineBreakdown = {
            'New Lead': 0,
            'Contacted': 0,
            'Qualified': 0,
            'Proposal Sent': 0,
            'Meeting': 0,
            'Won': 0,
            'Lost': 0
        };
        stageCounts.forEach(stage => {
            pipelineBreakdown[stage.pipelineStage] = stage._count.id;
        });
        // 5. Company sectors counts (Manufacturing, Hospital, School, Retail, Software & Technology)
        const sectorCounts = await prisma_1.default.company.groupBy({
            by: ['industry'],
            _count: { id: true }
        });
        const sectorBreakdown = {
            'Manufacturing': 0,
            'Hospital': 0,
            'School': 0,
            'Retail': 0,
            'Software & Technology': 0
        };
        sectorCounts.forEach(sec => {
            sectorBreakdown[sec.industry] = sec._count.id;
        });
        // 6. Platform captures
        const sourceLogs = await prisma_1.default.captureLog.groupBy({
            by: ['sourceId'],
            _count: { id: true }
        });
        const platforms = await prisma_1.default.sourcePlatform.findMany();
        const sourceBreakdown = platforms.map(plat => {
            const logCount = sourceLogs.find(log => log.sourceId === plat.id);
            return {
                id: plat.id,
                name: plat.platformName,
                type: plat.platformType,
                count: logCount?._count.id || 0
            };
        }).sort((a, b) => b.count - a.count);
        // 7. Weekly Activity Trend
        const weeklyReports = await prisma_1.default.weeklyReport.findMany({
            include: { user: true },
            orderBy: { weekStart: 'asc' }
        });
        const weeklyTrend = weeklyReports.map(report => ({
            id: report.id,
            agentName: report.user.fullName,
            weekStart: report.weekStart.toISOString().split('T')[0],
            captured: report.leadsCaptured,
            qualified: report.leadsQualified,
            followups: report.followupsDone
        }));
        // 8. Recent capturings feed
        const recentActivity = await prisma_1.default.captureLog.findMany({
            take: 5,
            orderBy: { capturedAt: 'desc' },
            include: {
                company: true,
                user: true,
                sourcePlatform: true
            }
        });
        const activities = recentActivity.map(log => ({
            id: log.id,
            companyId: log.companyId,
            companyName: log.company.companyName,
            agentName: log.user.fullName,
            platform: log.sourcePlatform.platformName,
            timestamp: log.capturedAt
        }));
        res.json({
            stats: {
                totalLeads,
                qualifiedLeads,
                wonLeads,
                pendingFollowups,
                averageScore,
                // Job Tracker metrics
                totalJobs,
                jobsApplied,
                jobsInterview,
                jobsOffer,
                jobsRejected
            },
            pipelineBreakdown,
            sectorBreakdown,
            sourceBreakdown,
            weeklyTrend,
            recentActivity: activities
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getDashboardStats = getDashboardStats;
