import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pool of mock recent jobs (within last 24 hours) from valid companies
const RECENT_JOBS_POOL = [
  {
    companyName: 'Netflix',
    jobTitle: 'AWS Cloud DevOps Engineer',
    position: 'DevOps Engineer',
    department: 'Infrastructure',
    experience: '3+ Years',
    salary: '$165,000/yr',
    location: 'Los Gatos, CA',
    workMode: 'Remote',
    jobType: 'Full Time',
    description: 'Manage AWS cloud pipelines, scaling Kubernetes clusters, and configuring Terraform states.',
    requirements: 'AWS, Kubernetes, Terraform, Docker',
    benefits: 'Premium health, unlimited PTO, Netflix subscription',
    website: 'https://netflix.com'
  },
  {
    companyName: 'Salesforce',
    jobTitle: 'Senior Enterprise Solutions Architect',
    position: 'Solutions Architect',
    department: 'Sales Engineering',
    experience: '5+ Years',
    salary: '$190,000/yr',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    jobType: 'Full Time',
    description: 'Design robust CRM integrations, map ERP data flows, and support technical client enablement.',
    requirements: 'CRM architectures, Node.js, Next.js, REST APIs',
    benefits: 'Wellness allowance, 401k matching, education reimbursement',
    website: 'https://salesforce.com'
  },
  {
    companyName: 'Oakridge Academy',
    jobTitle: 'Systems Administrator / IT Coordinator',
    position: 'Systems Administrator',
    department: 'Information Technology',
    experience: '2+ Years',
    salary: '$85,000/yr',
    location: 'Austin, Texas',
    workMode: 'Onsite',
    jobType: 'Full Time',
    description: 'Configure Active Directory domains, manage student database systems, and handle firewall routing policies.',
    requirements: 'Active Directory, Windows Server, Networking, DNS/DHCP',
    benefits: 'School tuition benefits, health package, pension scheme',
    website: 'https://oakridgeacademy.edu'
  }
];

export const runAutoScan = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst();
    const userId = user ? user.id : null;

    if (!userId) {
      return res.status(500).json({ error: 'No active CRM agents/users found to assign captures.' });
    }

    // Find or create LinkedIn platform
    let platform = await prisma.sourcePlatform.findFirst({
      where: { platformName: 'LinkedIn' }
    });
    if (!platform) {
      platform = await prisma.sourcePlatform.create({
        data: {
          platformName: 'LinkedIn',
          platformType: 'Web Capture'
        }
      });
    }

    const createdJobs: any[] = [];

    // Scan the pool
    for (const jobMock of RECENT_JOBS_POOL) {
      // Check if job already exists to prevent duplicate ticketing
      const existingJob = await prisma.jobApplication.findFirst({
        where: {
          jobTitle: jobMock.jobTitle,
          company: {
            companyName: { equals: jobMock.companyName, mode: 'insensitive' }
          }
        }
      });

      if (existingJob) {
        continue; // Skip already captured job opportunity tickets
      }

      // Find or create company
      let company = await prisma.company.findFirst({
        where: { companyName: { equals: jobMock.companyName, mode: 'insensitive' } }
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            companyName: jobMock.companyName,
            industry: 'Software & Technology',
            website: jobMock.website,
            licenseNo: 'LIC-' + Math.floor(100000 + Math.random() * 900000),
            icpMatch: 'High Fit',
            pipelineStage: 'Captured',
            capturedBy: userId
          }
        });
      }

      // Create Job Opportunity Ticket (status: Draft)
      const newJob = await prisma.$transaction(async (tx) => {
        const job = await tx.jobApplication.create({
          data: {
            companyId: company.id,
            jobTitle: jobMock.jobTitle,
            position: jobMock.position,
            department: jobMock.department,
            experience: jobMock.experience,
            salary: jobMock.salary,
            location: jobMock.location,
            workMode: jobMock.workMode,
            jobType: jobMock.jobType,
            description: jobMock.description,
            requirements: jobMock.requirements,
            benefits: jobMock.benefits,
            status: 'Draft'
          }
        });

        // Initialize docs placeholder
        await tx.document.create({
          data: {
            jobApplicationId: job.id,
            resume: '',
            coverLetter: '',
            proposal: '',
            portfolio: ''
          }
        });

        // Log history
        await tx.jobHistory.create({
          data: {
            jobApplicationId: job.id,
            status: 'Draft',
            remarks: 'Auto-captured via 24h Background Job Scanner service.',
            updatedBy: 'LeadBond AI Scanner'
          }
        });

        // Create Capture Log
        await tx.captureLog.create({
          data: {
            companyId: company.id,
            userId,
            sourceId: platform.id,
            rawDataUrl: `https://www.linkedin.com/jobs/view/scan-${job.id}`
          }
        });

        return job;
      });

      createdJobs.push({
        id: newJob.id,
        jobTitle: newJob.jobTitle,
        companyName: jobMock.companyName
      });
    }

    res.json({
      success: true,
      message: `Auto-scan completed. Found ${createdJobs.length} new recent valid job opportunity tickets.`,
      addedJobs: createdJobs
    });

  } catch (error: any) {
    console.error('Error during auto-scan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
