import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old database records...');
  await prisma.weeklyReport.deleteMany();
  await prisma.captureLog.deleteMany();
  await prisma.followup.deleteMany();
  await prisma.document.deleteMany();
  await prisma.jobHistory.deleteMany();
  await prisma.networking.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.pipelineHistory.deleteMany();
  await prisma.leadScore.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.sourcePlatform.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding source platforms...');
  const linkedin = await prisma.sourcePlatform.create({
    data: { platformName: 'LinkedIn', platformType: 'Professional Network' },
  });
  const indeed = await prisma.sourcePlatform.create({
    data: { platformName: 'Indeed', platformType: 'Job Board' },
  });
  const crunchbase = await prisma.sourcePlatform.create({
    data: { platformName: 'Crunchbase', platformType: 'Company Directory' },
  });
  const wellfound = await prisma.sourcePlatform.create({
    data: { platformName: 'Wellfound', platformType: 'Startup Network' },
  });

  console.log('Seeding sales/outreach agents...');
  const user1 = await prisma.user.create({
    data: {
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@leadbond.ai',
      role: 'Sales Director',
      joinedAt: new Date('2025-01-15'),
    },
  });
  const user2 = await prisma.user.create({
    data: {
      fullName: 'Alex Riverstone',
      email: 'alex.riverstone@leadbond.ai',
      role: 'Senior Sales Representative',
      joinedAt: new Date('2025-06-01'),
    },
  });
  const user3 = await prisma.user.create({
    data: {
      fullName: 'David Vance',
      email: 'david.vance@leadbond.ai',
      role: 'Business Development Representative',
      joinedAt: new Date('2026-02-10'),
    },
  });

  console.log('Seeding companies across multiple sectors...');
  // 1. Manufacturing
  const comp1 = await prisma.company.create({
    data: {
      companyName: 'Apex Precision Steel',
      industry: 'Manufacturing',
      website: 'https://apexsteel.example.com',
      licenseNo: 'LIC-M-99238',
      icpMatch: 'Strong Fit',
      pipelineStage: 'Qualified',
      capturedBy: user2.id,
      companySize: 'Medium',
      headquarters: 'Chicago, IL',
      country: 'USA',
      city: 'Chicago',
      phone: '+1-312-555-0199',
      email: 'info@apexsteel.example.com',
      linkedin: 'https://linkedin.com/company/apexprecisionsteel',
      contactPage: 'https://apexsteel.example.com/contact',
      foundedYear: 1998,
      employeesCount: 250,
      annualRevenue: '$45M',
      createdAt: new Date('2026-07-01T10:00:00Z'),
    },
  });

  // 2. Hospital / Healthcare
  const comp2 = await prisma.company.create({
    data: {
      companyName: 'Metro Healthcare Group',
      industry: 'Hospital',
      website: 'https://metrohealth.example.com',
      licenseNo: 'LIC-H-23114',
      icpMatch: 'Strong Fit',
      pipelineStage: 'Proposal Sent',
      capturedBy: user2.id,
      companySize: 'Enterprise',
      headquarters: 'Boston, MA',
      country: 'USA',
      city: 'Boston',
      phone: '+1-617-555-2281',
      email: 'partnerships@metrohealth.example.com',
      linkedin: 'https://linkedin.com/company/metrohealthgroup',
      careerPage: 'https://metrohealth.example.com/careers',
      foundedYear: 2005,
      employeesCount: 1200,
      annualRevenue: '$280M',
      createdAt: new Date('2026-06-15T09:00:00Z'),
    },
  });

  // 3. School / Education
  const comp3 = await prisma.company.create({
    data: {
      companyName: 'Oakridge Academy',
      industry: 'School',
      website: 'https://oakridge.example.edu',
      licenseNo: 'LIC-E-88329',
      icpMatch: 'Moderate Fit',
      pipelineStage: 'Meeting',
      capturedBy: user3.id,
      companySize: 'Small',
      headquarters: 'Austin, TX',
      country: 'USA',
      city: 'Austin',
      phone: '+1-512-555-0819',
      email: 'admissions@oakridge.example.edu',
      linkedin: 'https://linkedin.com/company/oakridgeacademy',
      foundedYear: 1985,
      employeesCount: 85,
      annualRevenue: '$8M',
      createdAt: new Date('2026-07-05T14:30:00Z'),
    },
  });

  // 4. Retail
  const comp4 = await prisma.company.create({
    data: {
      companyName: 'LuxeWear Boutiques',
      industry: 'Retail',
      website: 'https://luxewear.example.com',
      licenseNo: 'LIC-R-55418',
      icpMatch: 'Low Fit',
      pipelineStage: 'New Lead',
      capturedBy: user3.id,
      companySize: 'Medium',
      headquarters: 'New York, NY',
      country: 'USA',
      city: 'New York',
      phone: '+1-212-555-4491',
      email: 'office@luxewear.example.com',
      linkedin: 'https://linkedin.com/company/luxewearboutiques',
      foundedYear: 2018,
      employeesCount: 140,
      annualRevenue: '$15M',
      createdAt: new Date('2026-07-08T11:00:00Z'),
    },
  });

  // 5. Software & Technology
  const comp5 = await prisma.company.create({
    data: {
      companyName: 'FintechFlow Inc.',
      industry: 'Software & Technology',
      website: 'https://fintechflow.example.com',
      licenseNo: 'LIC-S-44810',
      icpMatch: 'Strong Fit',
      pipelineStage: 'Won',
      capturedBy: user3.id,
      companySize: 'Medium',
      headquarters: 'San Francisco, CA',
      country: 'USA',
      city: 'San Francisco',
      phone: '+1-415-555-3810',
      email: 'growth@fintechflow.example.com',
      linkedin: 'https://linkedin.com/company/fintechflow',
      contactPage: 'https://fintechflow.example.com/support',
      careerPage: 'https://fintechflow.example.com/careers',
      foundedYear: 2021,
      employeesCount: 180,
      annualRevenue: '$28M',
      createdAt: new Date('2026-07-11T16:00:00Z'),
    },
  });

  console.log('Seeding contact persons with extended detail fields...');
  await prisma.contact.createMany({
    data: [
      {
        companyId: comp1.id,
        name: 'John Miller',
        designation: 'Director of Operations',
        email: 'john.miller@apexsteel.example.com',
        phone: '+1-312-555-0191',
        isDecisionMaker: true,
        department: 'Operations',
        linkedin: 'https://linkedin.com/in/john-miller-ops',
        notes: 'Pre-existing relationship with Sarah. Main champion.',
      },
      {
        companyId: comp2.id,
        name: 'Dr. Elizabeth Blackwell',
        designation: 'Chief Procurement Officer',
        email: 'e.blackwell@metrohealth.example.com',
        phone: '+1-617-555-2283',
        isDecisionMaker: true,
        department: 'Procurement',
        linkedin: 'https://linkedin.com/in/elizabeth-blackwell-cpo',
      },
      {
        companyId: comp3.id,
        name: 'Susan Vance',
        designation: 'Headmistress / IT Lead',
        email: 's.vance@oakridge.example.edu',
        phone: '+1-512-555-0812',
        isDecisionMaker: true,
        department: 'Administration',
        notes: 'Takes decisions on school software licenses.',
      },
      {
        companyId: comp5.id,
        name: 'Alice Chang',
        designation: 'VP of Engineering',
        email: 'alice.chang@fintechflow.example.com',
        phone: '+1-415-555-3811',
        isDecisionMaker: true,
        department: 'Engineering',
        linkedin: 'https://linkedin.com/in/alice-chang-eng',
      },
    ],
  });

  console.log('Seeding networking records...');
  await prisma.networking.createMany({
    data: [
      {
        companyId: comp1.id,
        platform: 'LinkedIn',
        profileUrl: 'https://linkedin.com/in/john-miller-ops',
        connectionStatus: 'Connected',
        connectedDate: new Date('2026-07-03'),
        lastMessage: 'Let\'s schedule the demo call this coming Wednesday.',
        notes: 'Followed up via message, scheduling next steps.',
      },
      {
        companyId: comp2.id,
        platform: 'LinkedIn',
        profileUrl: 'https://linkedin.com/in/elizabeth-blackwell-cpo',
        connectionStatus: 'Pending Response',
        lastMessage: 'Sent introductory message proposing software trial.',
      },
    ],
  });

  console.log('Seeding AI scores...');
  await prisma.leadScore.createMany({
    data: [
      { companyId: comp1.id, aiScore: 88, scoreReason: 'Strong manufacturing ICP fit, active steel production scaling, direct connection established with operations head John Miller.' },
      { companyId: comp2.id, aiScore: 92, scoreReason: 'Enterprise size healthcare client. Long sales cycles but high annual revenue opportunities. RFP requested.' },
      { companyId: comp3.id, aiScore: 65, scoreReason: 'Moderate school fit. Decision maker contact info complete, budget constraints likely exist.' },
      { companyId: comp4.id, aiScore: 40, scoreReason: 'Retail boutqiues model does not fit standard ERP software client targets. Low potential size.' },
      { companyId: comp5.id, aiScore: 95, scoreReason: 'Won contract. 95 match due to technology stack overlaps and immediate SaaS subscription sign-off.' },
    ],
  });

  console.log('Seeding job postings (Hiring signals)...');
  await prisma.jobPosting.createMany({
    data: [
      { companyId: comp1.id, jobTitle: 'Plant Operations Supervisor', platform: 'Indeed', postedDate: new Date('2026-06-25'), hiringSignalType: 'Operations Expansion' },
      { companyId: comp2.id, jobTitle: 'SaaS Integration Engineer', platform: 'LinkedIn', postedDate: new Date('2026-06-28'), hiringSignalType: 'Technical Integration Need' },
      { companyId: comp5.id, jobTitle: 'Senior Frontend Developer (Next.js)', platform: 'Wellfound', postedDate: new Date('2026-07-10'), hiringSignalType: 'Product Scaling' },
    ],
  });

  console.log('Seeding Job Applications (CRM Tracker)...');
  // Job App 1: Full stack post at FintechFlow (Interview Stage)
  const app1 = await prisma.jobApplication.create({
    data: {
      companyId: comp5.id,
      jobTitle: 'Senior React/Next.js Engineer',
      position: 'Senior Software Engineer',
      department: 'Engineering',
      experience: '5+ Years',
      salary: '$140k - $160k',
      location: 'San Francisco, CA',
      workMode: 'Hybrid',
      jobType: 'Full Time',
      datePosted: new Date('2026-07-01'),
      deadline: new Date('2026-07-31'),
      applyMethod: 'LinkedIn',
      applyLink: 'https://linkedin.com/jobs/view/12345',
      jobLink: 'https://fintechflow.example.com/careers/nextjs-dev',
      description: 'Looking for a Next.js engineer to build enterprise CRM dashboards.',
      requirements: 'Experience with React, Next.js, TypeScript, TailindCSS, and Prisma ORM.',
      status: 'Interview',
    },
  });

  // Job App 2: Medtech integrations at Metro Healthcare (Applied Stage)
  const app2 = await prisma.jobApplication.create({
    data: {
      companyId: comp2.id,
      jobTitle: 'SaaS Integration Engineer',
      position: 'Integration Specialist',
      department: 'IT & Digital Systems',
      experience: '3+ Years',
      salary: '$110k',
      location: 'Boston, MA',
      workMode: 'Onsite',
      jobType: 'Full Time',
      datePosted: new Date('2026-06-29'),
      applyMethod: 'Website',
      applyLink: 'https://metrohealth.example.com/careers/it-integration',
      status: 'Applied',
    },
  });

  console.log('Seeding Application Documents (Resume, Cover Letter)...');
  await prisma.document.create({
    data: {
      jobApplicationId: app1.id,
      resume: 'MD_Anwar_Hossen_Resume_v2.pdf',
      coverLetter: 'Tailored_Cover_Letter_FintechFlow.docx',
      portfolio: 'https://anwarhossen.example.dev',
    },
  });
  await prisma.document.create({
    data: {
      jobApplicationId: app2.id,
      resume: 'MD_Anwar_Hossen_General_Resume.pdf',
      coverLetter: 'General_Healthcare_Cover_Letter.docx',
    },
  });

  console.log('Seeding Job Application history records...');
  await prisma.jobHistory.createMany({
    data: [
      { jobApplicationId: app1.id, status: 'Draft', remarks: 'Application prepared and reviewed by agent.', updatedBy: user3.fullName },
      { jobApplicationId: app1.id, status: 'Applied', remarks: 'Submitted resume via LinkedIn Easy Apply.', updatedBy: user3.fullName, updatedAt: new Date('2026-07-02T10:00:00Z') },
      { jobApplicationId: app1.id, status: 'Interview', remarks: 'Recruiter screen scheduled for Wednesday at 3 PM.', updatedBy: user3.fullName, updatedAt: new Date('2026-07-05T14:00:00Z') },
      { jobApplicationId: app2.id, status: 'Draft', remarks: 'Scraped from website via Chrome Extension.', updatedBy: user3.fullName },
      { jobApplicationId: app2.id, status: 'Applied', remarks: 'Submitted via portal. Awaiting confirmation.', updatedBy: user3.fullName, updatedAt: new Date('2026-06-30T09:00:00Z') },
    ],
  });

  console.log('Seeding Follow-ups for both Leads & Jobs...');
  await prisma.followup.createMany({
    data: [
      // Followup for Lead comp1
      {
        companyId: comp1.id,
        userId: user2.id,
        note: 'Followup regarding metal fabrication CRM demo feedback.',
        followUpDate: new Date('2026-07-16'),
        status: 'Pending',
      },
      // Followup for Job app1
      {
        jobApplicationId: app1.id,
        userId: user3.id,
        note: 'Prepare for technical panel round. Review system design questions.',
        followUpDate: new Date('2026-07-15'),
        status: 'Pending',
      },
      // Completed followup
      {
        jobApplicationId: app2.id,
        userId: user3.id,
        note: 'Send follow-up note to Boston HR contact regarding receipt of application.',
        followUpDate: new Date('2026-07-05'),
        status: 'Completed',
      },
    ],
  });

  console.log('Seeding capture logs...');
  await prisma.captureLog.createMany({
    data: [
      { companyId: comp1.id, userId: user2.id, sourceId: indeed.id, capturedAt: new Date('2026-07-01T10:00:00Z'), rawDataUrl: 'https://s3.amazonaws.com/leadbond-data/raw/indeed-capture.json' },
      { companyId: comp2.id, userId: user2.id, sourceId: crunchbase.id, capturedAt: new Date('2026-06-15T09:00:00Z'), rawDataUrl: 'https://s3.amazonaws.com/leadbond-data/raw/cb-hospital.json' },
      { companyId: comp5.id, userId: user3.id, sourceId: linkedin.id, capturedAt: new Date('2026-07-11T16:00:00Z'), rawDataUrl: 'https://s3.amazonaws.com/leadbond-data/raw/li-tech.json' },
    ],
  });

  console.log('Seeding weekly productivity reports...');
  await prisma.weeklyReport.createMany({
    data: [
      { userId: user2.id, weekStart: new Date('2026-07-06'), leadsCaptured: 4, leadsQualified: 2, followupsDone: 3 },
      { userId: user3.id, weekStart: new Date('2026-07-06'), leadsCaptured: 6, leadsQualified: 3, followupsDone: 5 },
    ],
  });

  console.log('Database seeding completely successful!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
