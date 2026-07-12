import { Request, Response } from 'express';
import prisma from '../prisma';

export const getFollowups = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const whereClause: any = {};
    if (status && status !== 'All') {
      whereClause.status = status as string;
    }

    const followups = await prisma.followup.findMany({
      where: whereClause,
      include: {
        company: {
          select: { companyName: true }
        },
        jobApplication: {
          select: { jobTitle: true }
        },
        user: {
          select: { fullName: true }
        }
      },
      orderBy: {
        followUpDate: 'asc'
      }
    });

    const result = followups.map(f => ({
      id: f.id,
      companyId: f.companyId,
      companyName: f.company?.companyName || f.jobApplication?.jobTitle || 'General Followup',
      agentName: f.user.fullName,
      note: f.note,
      followUpDate: f.followUpDate,
      status: f.status
    }));

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching followups:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createFollowup = async (req: Request, res: Response) => {
  try {
    const { companyId, jobApplicationId, userId, note, followUpDate } = req.body;

    if (!userId || !note || !followUpDate) {
      return res.status(400).json({ error: 'userId, note, and followUpDate are required.' });
    }

    const newFollowup = await prisma.followup.create({
      data: {
        companyId: companyId || null,
        jobApplicationId: jobApplicationId || null,
        userId,
        note,
        followUpDate: new Date(followUpDate),
        status: 'Pending'
      },
      include: {
        company: { select: { companyName: true } },
        jobApplication: { select: { jobTitle: true } },
        user: { select: { fullName: true } }
      }
    });

    res.status(201).json({
      id: newFollowup.id,
      companyId: newFollowup.companyId,
      companyName: newFollowup.company?.companyName || newFollowup.jobApplication?.jobTitle || 'General Followup',
      agentName: newFollowup.user.fullName,
      note: newFollowup.note,
      followUpDate: newFollowup.followUpDate,
      status: newFollowup.status
    });
  } catch (error: any) {
    console.error('Error creating followup:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateFollowupStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Missing status parameter.' });
    }

    const followup = await prisma.followup.findUnique({
      where: { id }
    });

    if (!followup) {
      return res.status(404).json({ error: 'Followup not found' });
    }

    const updated = await prisma.followup.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating followup status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
