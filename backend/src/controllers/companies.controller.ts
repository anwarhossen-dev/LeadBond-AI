import { Request, Response } from 'express';
import prisma from '../prisma';

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const { search, industry, stage } = req.query;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { companyName: { contains: search as string, mode: 'insensitive' } },
        { industry: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (industry && industry !== 'All') {
      whereClause.industry = industry as string;
    }

    if (stage && stage !== 'All') {
      whereClause.pipelineStage = stage as string;
    }

    const companies = await prisma.company.findMany({
      where: whereClause,
      include: {
        capturedByUser: {
          select: { fullName: true }
        },
        leadScores: {
          orderBy: { scoredAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const result = companies.map(comp => ({
      id: comp.id,
      companyName: comp.companyName,
      industry: comp.industry,
      website: comp.website,
      licenseNo: comp.licenseNo,
      icpMatch: comp.icpMatch,
      pipelineStage: comp.pipelineStage,
      createdAt: comp.createdAt,
      agentName: comp.capturedByUser.fullName,
      aiScore: comp.leadScores[0]?.aiScore ?? 0
    }));

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        capturedByUser: {
          select: { fullName: true }
        },
        contacts: true,
        jobPostings: true,
        leadScores: {
          orderBy: { scoredAt: 'desc' }
        },
        pipelineHistory: {
          orderBy: { changedAt: 'desc' }
        },
        followups: {
          include: {
            user: { select: { fullName: true } }
          },
          orderBy: { followUpDate: 'asc' }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({
      id: company.id,
      companyName: company.companyName,
      industry: company.industry,
      website: company.website,
      licenseNo: company.licenseNo,
      icpMatch: company.icpMatch,
      pipelineStage: company.pipelineStage,
      createdAt: company.createdAt,
      agentName: company.capturedByUser.fullName,
      contacts: company.contacts,
      jobPostings: company.jobPostings,
      leadScores: company.leadScores,
      pipelineHistory: company.pipelineHistory,
      followups: company.followups.map(f => ({
        id: f.id,
        note: f.note,
        followUpDate: f.followUpDate,
        status: f.status,
        agentName: f.user.fullName
      }))
    });
  } catch (error: any) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    const {
      companyName,
      industry,
      website,
      licenseNo,
      icpMatch,
      capturedBy,
      email,
      phone,
      location,
      contactName,
      contactDesignation,
      contactEmail,
      contactPhone,
      isDecisionMaker,
      aiScore,
      scoreReason,
      sourcePlatformId
    } = req.body;

    let resolvedIndustry = industry || 'Software & Technology';
    let resolvedCapturedBy = capturedBy;
    if (!resolvedCapturedBy) {
      const user = await prisma.user.findFirst();
      resolvedCapturedBy = user ? user.id : undefined;
    }

    if (!companyName || !resolvedCapturedBy) {
      return res.status(400).json({ error: 'Missing required parameters: companyName and valid user.' });
    }

    // Wrap in database transaction
    const newCompany = await prisma.$transaction(async (tx) => {
      // 1. Create company
      const comp = await tx.company.create({
        data: {
          companyName,
          industry: resolvedIndustry,
          website: website || '',
          licenseNo: licenseNo || 'LIC-' + Math.floor(100000 + Math.random() * 900000),
          icpMatch: icpMatch || 'Low Fit',
          pipelineStage: req.body.pipelineStage || 'Captured',
          capturedBy: resolvedCapturedBy,
          email: email || null,
          phone: phone || null,
          headquarters: location || null
        }
      });

      // 2. Create primary contact if provided
      if (contactName) {
        await tx.contact.create({
          data: {
            companyId: comp.id,
            name: contactName,
            designation: contactDesignation || '',
            email: contactEmail || '',
            phone: contactPhone || '',
            isDecisionMaker: isDecisionMaker === true
          }
        });
      }

      // 3. Create lead score
      const score = aiScore ? parseInt(aiScore, 10) : Math.floor(Math.random() * 50) + 40;
      await tx.leadScore.create({
        data: {
          companyId: comp.id,
          aiScore: score,
          scoreReason: scoreReason || 'Initial lead capture AI assessment.'
        }
      });

      // 4. Create pipeline history
      await tx.pipelineHistory.create({
        data: {
          companyId: comp.id,
          fromStage: 'None',
          toStage: 'Captured'
        }
      });

      // 5. Create capture log if platform exists
      if (sourcePlatformId) {
        await tx.captureLog.create({
          data: {
            companyId: comp.id,
            userId: capturedBy,
            sourceId: sourcePlatformId,
            rawDataUrl: 'https://s3.amazonaws.com/leadbond-data/raw/manual-entry.json'
          }
        });
      }

      return comp;
    });

    res.status(201).json(newCompany);
  } catch (error: any) {
    console.error('Error creating company lead:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCompanyStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { toStage } = req.body;

    if (!toStage) {
      return res.status(400).json({ error: 'Missing toStage parameter.' });
    }

    const company = await prisma.company.findUnique({
      where: { id }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const fromStage = company.pipelineStage;
    if (fromStage === toStage) {
      return res.json(company);
    }

    const updatedCompany = await prisma.$transaction(async (tx) => {
      // Update company stage
      const updated = await tx.company.update({
        where: { id },
        data: { pipelineStage: toStage }
      });

      // Insert pipeline history log
      await tx.pipelineHistory.create({
        data: {
          companyId: id,
          fromStage,
          toStage
        }
      });

      return updated;
    });

    res.json(updatedCompany);
  } catch (error: any) {
    console.error('Error updating company stage:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
