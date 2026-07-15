'use server';

import { PrismaClient } from '@prisma/client';

// In a real-world scenario, your Prisma client would be instantiated in a shared lib file.
const prisma = new PrismaClient();

// NOTE: The data pools are copied from your backend controller for this example.
// Ideally, this data would come from a shared source or a database.
const LINKEDIN_POOL = [
  { companyName: 'Adobe', industry: 'Software & Cloud', website: 'https://adobe.com', size: '10,000+', headquarters: 'San Jose, CA', phone: '+1-408-536-6000', email: 'corporate@adobe.com', jobTitle: 'Senior UI/UX Designer', workMode: 'Remote', jobType: 'Full Time', salary: '$140,000/yr', requirements: 'Figma, Design Systems, Adobe Creative Suite', country: 'USA', icpMatch: 'High Fit' },
  { companyName: 'Intel', industry: 'Hardware & Semiconductors', website: 'https://intel.com', size: '10,000+', headquarters: 'Santa Clara, CA', phone: '+1-408-765-8080', email: 'support@intel.com', jobTitle: 'Embedded Systems Engineer', workMode: 'Onsite', jobType: 'Full Time', salary: '$130,000/yr', requirements: 'C/C++, Microcontrollers, FPGA, RTOS', country: 'USA', icpMatch: 'High Fit' },
  { companyName: 'Cisco Systems', industry: 'Networking & Telecom', website: 'https://cisco.com', size: '10,000+', headquarters: 'San Jose, CA', phone: '+1-408-526-4000', email: 'info@cisco.com', jobTitle: 'Network Automation Specialist', workMode: 'Hybrid', jobType: 'Full Time', salary: '$125,000/yr', requirements: 'Python, Cisco CCNA/CCNP, Ansible, NetDevOps', country: 'USA', icpMatch: 'High Fit' },
  { companyName: 'Oracle', industry: 'Database & Cloud', website: 'https://oracle.com', size: '10,000+', headquarters: 'Austin, TX', phone: '+1-737-867-1000', email: 'enterprise@oracle.com', jobTitle: 'Database Cloud Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$150,000/yr', requirements: 'Oracle DB, SQL, OCI Cloud, PL/SQL', country: 'USA', icpMatch: 'High Fit' },
  { companyName: 'VMware', industry: 'Virtualization & Cloud', website: 'https://vmware.com', size: '10,000+', headquarters: 'Palo Alto, CA', phone: '+1-650-427-5000', email: 'sales@vmware.com', jobTitle: 'Kubernetes Systems Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$155,000/yr', requirements: 'Kubernetes, Tanzu, Go, Linux Kernels', country: 'USA', icpMatch: 'High Fit' },
  { companyName: 'NVIDIA', industry: 'Graphics & AI Hardware', website: 'https://nvidia.com', size: '10,000+', headquarters: 'Santa Clara, CA', phone: '+1-408-486-2000', email: 'careers@nvidia.com', jobTitle: 'CUDA Performance Engineer', workMode: 'Onsite', jobType: 'Full Time', salary: '$185,000/yr', requirements: 'C++, CUDA, GPU Computing, Parallel Algorithms', country: 'USA', icpMatch: 'High Fit' },
  { companyName: 'Shopify', industry: 'E-commerce Platforms', website: 'https://shopify.com', size: '5,000-10,000', headquarters: 'Ottawa, Canada', phone: '+1-613-241-2828', email: 'support@shopify.com', jobTitle: 'Ruby Rails Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$130,000/yr', requirements: 'Ruby on Rails, E-commerce, GraphQL', country: 'Canada', icpMatch: 'Medium Fit' },
  { companyName: 'Stripe', industry: 'Fintech Payments', website: 'https://stripe.com', size: '5,000-10,000', headquarters: 'San Francisco, CA', phone: '+1-415-555-0399', email: 'billing@stripe.com', jobTitle: 'API Integrations Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$165,000/yr', requirements: 'Ruby, Go, API Standards, Security compliance', country: 'USA', icpMatch: 'High Fit' },
  { companyName: 'GitHub', industry: 'Developer Platforms', website: 'https://github.com', size: '1,000-5,000', headquarters: 'San Francisco, CA', phone: '+1-415-890-4484', email: 'support@github.com', jobTitle: 'GitHub Actions Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$150,000/yr', requirements: 'Ruby on Rails, Go, CI/CD pipelines, Git', country: 'USA', icpMatch: 'High Fit' },
  { companyName: 'Notion', industry: 'Connected Workspace', website: 'https://notion.so', size: '500-1,000', headquarters: 'San Francisco, CA', phone: '+1-415-555-0980', email: 'sales@notion.so', jobTitle: 'Text Editor Specialist', workMode: 'Hybrid', jobType: 'Full Time', salary: '$160,000/yr', requirements: 'TypeScript, ProseMirror, Slate, Rich Text APIs', country: 'USA', icpMatch: 'Medium Fit' },
];
const GOOGLE_MAPS_POOL = [ { companyName: 'Dhaka Chamber of Commerce', industry: 'Trade & Commerce', website: 'https://dhaka-chamber.com', size: '500-1,000', headquarters: 'Motijheel, Dhaka', phone: '+880-2-9556231', email: 'info@dhaka-chamber.com', jobTitle: 'Business Development Manager', workMode: 'Onsite', jobType: 'Full Time', salary: '৳80,000/mo', requirements: 'Business Development, Networking, CRM', country: 'Bangladesh', icpMatch: 'High Fit' }, /* ... */ ];
const FACEBOOK_POOL = [ { companyName: 'ShajGoj', industry: 'Beauty & E-commerce', website: 'https://shajgoj.com', size: '100-500', headquarters: 'Dhanmondi, Dhaka', phone: '+880-17-00000011', email: 'hello@shajgoj.com', jobTitle: 'Social Media Marketing Manager', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳55,000/mo', requirements: 'Facebook Ads, Instagram Marketing, Content Strategy', country: 'Bangladesh', icpMatch: 'High Fit' }, /* ... */ ];
const BDJOBS_POOL = [ { companyName: 'Grameenphone Ltd', industry: 'Telecommunications', website: 'https://grameenphone.com', size: '10,000+', headquarters: 'Bashundhara, Dhaka', phone: '+880-2-9882990', email: 'hr@grameenphone.com', jobTitle: 'Software Engineer - Backend', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳90,000/mo', requirements: 'Java, Spring Boot, Microservices, PostgreSQL', country: 'Bangladesh', icpMatch: 'High Fit' }, /* ... */ ];
const ALL_SITES_POOL = [ { companyName: 'Google Bangladesh', industry: 'Technology', website: 'https://google.com', size: '10,000+', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-11223344', email: 'bd@google.com', jobTitle: 'Cloud Solutions Architect', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳1,50,000/mo', requirements: 'GCP, Kubernetes, Terraform, DevOps', country: 'Bangladesh', icpMatch: 'High Fit' }, /* ... */ ];

const PLATFORM_POOLS: Record<string, any[]> = {
  linkedin: LINKEDIN_POOL,
  google_maps: GOOGLE_MAPS_POOL,
  facebook: FACEBOOK_POOL,
  bdjobs: BDJOBS_POOL,
  all_sites: ALL_SITES_POOL,
};

const PLATFORM_META: Record<string, { name: string; type: string }> = {
  linkedin: { name: 'LinkedIn', type: 'Professional Network' },
  google_maps: { name: 'Google Maps', type: 'Local Business Directory' },
  facebook: { name: 'Facebook', type: 'Social Media' },
  bdjobs: { name: 'BDJobs', type: 'Job Board' },
  all_sites: { name: 'All Sites', type: 'Aggregated Web Capture' },
};

interface ImportPayload {
  platform: string;
  selectedIds: string[];
  count: number;
}

export async function bulkImportAction(payload: ImportPayload) {
  const { platform, selectedIds, count } = payload;

  const platformKey = (platform as string).toLowerCase().replace(' ', '_');
  const pool = PLATFORM_POOLS[platformKey] || LINKEDIN_POOL;
  const platformMeta = PLATFORM_META[platformKey] || PLATFORM_META['linkedin'];

  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No active CRM agents/users found to assign captures.');
  }
  const userId = user.id;

  let sourcePlatform = await prisma.sourcePlatform.findFirst({
    where: { platformName: platformMeta.name }
  });
  if (!sourcePlatform) {
    sourcePlatform = await prisma.sourcePlatform.create({
      data: { platformName: platformMeta.name, platformType: platformMeta.type }
    });
  }

  let targetPool: typeof pool;
  if (selectedIds && Array.isArray(selectedIds) && selectedIds.length > 0) {
    targetPool = selectedIds.map((id: string) => pool[parseInt(id.split('_').pop() || '0', 10)]).filter(Boolean);
  } else {
    targetPool = pool.slice(0, count);
  }

  let addedCompaniesCount = 0;
  let addedJobsCount = 0;

  for (const item of targetPool) {
    let company = await prisma.company.findFirst({
      where: { companyName: { equals: item.companyName, mode: 'insensitive' } }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          companyName: item.companyName,
          industry: item.industry,
          website: item.website,
          licenseNo: 'LIC-' + Math.floor(100000 + Math.random() * 900000),
          icpMatch: item.icpMatch,
          pipelineStage: 'Captured',
          capturedBy: userId,
          companySize: item.size,
          headquarters: item.headquarters,
          country: item.country,
          phone: item.phone,
          email: item.email,
        }
      });
      addedCompaniesCount++;
    }

    const existingJob = await prisma.jobApplication.findFirst({
      where: { jobTitle: item.jobTitle, companyId: company.id }
    });

    if (!existingJob) {
      await prisma.$transaction(async (tx) => {
        const job = await tx.jobApplication.create({
          data: {
            companyId: company.id, jobTitle: item.jobTitle, position: item.jobTitle.split(' ').slice(1).join(' '), department: 'General', experience: '2+ Years', salary: item.salary, location: item.headquarters, workMode: item.workMode, jobType: item.jobType, description: `Seeking a specialist proficient in: ${item.requirements}.`, requirements: item.requirements, benefits: 'Competitive package with performance bonuses.', status: 'Draft',
          }
        });
        await tx.document.create({ data: { jobApplicationId: job.id, resume: '', coverLetter: '', proposal: '', portfolio: '' } });
        await tx.jobHistory.create({ data: { jobApplicationId: job.id, status: 'Draft', remarks: `Bulk captured via ${platformMeta.name} source.`, updatedBy: 'LeadBond AI Bulk Engine' } });
        await tx.captureLog.create({ data: { companyId: company.id, userId, sourceId: sourcePlatform.id, rawDataUrl: `https://${platformKey}.leadbond/capture/${job.id}` } });
      });
      addedJobsCount++;
    }
  }

  return {
    companiesImported: addedCompaniesCount,
    jobsImported: addedJobsCount,
    platform: platformMeta.name,
  };
}