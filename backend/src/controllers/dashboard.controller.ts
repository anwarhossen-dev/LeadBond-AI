import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. CRM Leads counts
    const totalLeads = await prisma.company.count();
    
    const qualifiedLeads = await prisma.company.count({
      where: { pipelineStage: 'Qualified' }
    });

    const wonLeads = await prisma.company.count({
      where: { pipelineStage: 'Won' }
    });

    const pendingFollowups = await prisma.followup.count({
      where: { status: 'Pending' }
    });

    // 2. Job applications counts
    const totalJobs = await prisma.jobApplication.count();
    const jobsApplied = await prisma.jobApplication.count({ where: { status: 'Applied' } });
    const jobsInterview = await prisma.jobApplication.count({ where: { status: 'Interview' } });
    const jobsOffer = await prisma.jobApplication.count({ where: { status: 'Offer' } });
    const jobsRejected = await prisma.jobApplication.count({ where: { status: 'Rejected' } });

    // 3. AI lead scores
    const avgScoreResult = await prisma.leadScore.aggregate({
      _avg: { aiScore: true }
    });
    const averageScore = Math.round(avgScoreResult._avg.aiScore || 0);

    // 4. Pipeline stages
    const stageCounts = await prisma.company.groupBy({
      by: ['pipelineStage'],
      _count: { id: true }
    });
    const pipelineBreakdown: Record<string, number> = {
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
    const sectorCounts = await prisma.company.groupBy({
      by: ['industry'],
      _count: { id: true }
    });
    const sectorBreakdown: Record<string, number> = {
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
    const sourceLogs = await prisma.captureLog.groupBy({
      by: ['sourceId'],
      _count: { id: true }
    });
    const platforms = await prisma.sourcePlatform.findMany();
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
    const weeklyReports = await prisma.weeklyReport.findMany({
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
    const recentActivity = await prisma.captureLog.findMany({
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
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
