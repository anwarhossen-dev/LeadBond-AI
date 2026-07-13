import { Request, Response } from 'express';
import prisma from '../prisma';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const { search, status, workMode } = req.query;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { jobTitle: { contains: search as string, mode: 'insensitive' } },
        { company: { companyName: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    if (status && status !== 'All') {
      whereClause.status = status as string;
    }

    if (workMode && workMode !== 'All') {
      whereClause.workMode = workMode as string;
    }

    const applications = await prisma.jobApplication.findMany({
      where: whereClause,
      include: {
        company: {
          select: { companyName: true, logo: true, headquarters: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const result = applications.map(app => ({
      id: app.id,
      jobTitle: app.jobTitle,
      companyName: app.company.companyName,
      logo: app.company.logo,
      location: app.location || app.company.headquarters,
      workMode: app.workMode,
      jobType: app.jobType,
      status: app.status,
      datePosted: app.datePosted,
      createdAt: app.createdAt
    }));

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        company: true,
        documents: true,
        histories: {
          orderBy: { updatedAt: 'desc' }
        },
        followups: {
          include: {
            user: { select: { fullName: true } }
          },
          orderBy: { followUpDate: 'asc' }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    res.json({
      id: application.id,
      jobTitle: application.jobTitle,
      position: application.position,
      department: application.department,
      experience: application.experience,
      salary: application.salary,
      location: application.location,
      workMode: application.workMode,
      jobType: application.jobType,
      datePosted: application.datePosted,
      deadline: application.deadline,
      applyMethod: application.applyMethod,
      applyEmail: application.applyEmail,
      applyLink: application.applyLink,
      jobLink: application.jobLink,
      description: application.description,
      requirements: application.requirements,
      benefits: application.benefits,
      status: application.status,
      createdAt: application.createdAt,
      company: application.company,
      documents: application.documents[0] || null, // return single doc card
      histories: application.histories,
      followups: application.followups.map(f => ({
        id: f.id,
        note: f.note,
        followUpDate: f.followUpDate,
        status: f.status,
        agentName: f.user.fullName
      }))
    });
  } catch (error: any) {
    console.error('Error fetching job application details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      companyName,
      jobTitle,
      position,
      department,
      experience,
      salary,
      location,
      workMode,
      jobType,
      datePosted,
      deadline,
      applyMethod,
      applyLink,
      description,
      requirements,
      benefits,
      status,
      agentName // for logging update
    } = req.body;

    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId && companyName) {
      const company = await prisma.company.findFirst({
        where: { companyName: { equals: companyName, mode: 'insensitive' } }
      });
      if (company) {
        resolvedCompanyId = company.id;
      } else {
        // Find or create a system user for auto-captured companies
        let user = await prisma.user.findFirst();
        if (!user) {
          user = await prisma.user.create({
            data: {
              fullName: 'LeadBond System',
              email: 'system@leadbond.ai',
              role: 'admin',
            },
          });
        }
        const newComp = await prisma.company.create({
          data: {
            companyName: companyName,
            industry: 'Software & Technology',
            website: `https://www.google.com/search?q=${encodeURIComponent(companyName)}`,
            licenseNo: 'LIC-' + Math.floor(100000 + Math.random() * 900000),
            icpMatch: 'Low Fit',
            pipelineStage: 'Captured',
            capturedBy: user.id,
          },
        });
        resolvedCompanyId = newComp.id;
      }
    }

    if (!resolvedCompanyId || !jobTitle) {
      return res.status(400).json({ error: 'companyId (or companyName) and jobTitle are required.' });
    }

    const newJob = await prisma.$transaction(async (tx) => {
      // 1. Create job application record
      const job = await tx.jobApplication.create({
        data: {
          companyId: resolvedCompanyId,
          jobTitle,
          position: position || '',
          department: department || '',
          experience: experience || '',
          salary: salary || '',
          location: location || '',
          workMode: workMode || 'Remote',
          jobType: jobType || 'Full Time',
          datePosted: datePosted ? new Date(datePosted) : new Date(),
          deadline: deadline ? new Date(deadline) : null,
          applyMethod: applyMethod || 'Website',
          applyLink: applyLink || '',
          description: description || '',
          requirements: requirements || '',
          benefits: benefits || '',
          status: status || 'Draft'
        }
      });

      // 2. Create documents placeholder card
      await tx.document.create({
        data: {
          jobApplicationId: job.id,
          resume: '',
          coverLetter: '',
          proposal: '',
          portfolio: ''
        }
      });

      // 3. Create initial history record
      await tx.jobHistory.create({
        data: {
          jobApplicationId: job.id,
          status: status || 'Draft',
          remarks: 'Job application created in directory.',
          updatedBy: agentName || 'System'
        }
      });

      return job;
    });

    res.status(201).json(newJob);
  } catch (error: any) {
    console.error('Error creating job application:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateJobStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarks, agentName } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Missing status parameter.' });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const job = await tx.jobApplication.update({
        where: { id },
        data: { status }
      });

      await tx.jobHistory.create({
        data: {
          jobApplicationId: id,
          status,
          remarks: remarks || `Status updated to ${status}.`,
          updatedBy: agentName || 'System'
        }
      });

      return job;
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
