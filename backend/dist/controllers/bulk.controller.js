"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBulkImport = exports.getBulkPreview = void 0;
const client_1 = require("@prisma/client");
const mail_service_1 = require("../services/mail.service");
const prisma = new client_1.PrismaClient();
// ─────────────────────────────────────────────────────────────────────────────
//  PLATFORM-SPECIFIC COMPANY POOLS
// ─────────────────────────────────────────────────────────────────────────────
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
const GOOGLE_MAPS_POOL = [
    { companyName: 'Dhaka Chamber of Commerce', industry: 'Trade & Commerce', website: 'https://dhaka-chamber.com', size: '500-1,000', headquarters: 'Motijheel, Dhaka', phone: '+880-2-9556231', email: 'info@dhaka-chamber.com', jobTitle: 'Business Development Manager', workMode: 'Onsite', jobType: 'Full Time', salary: '৳80,000/mo', requirements: 'Business Development, Networking, CRM', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'BRAC Enterprises', industry: 'Social Enterprise', website: 'https://brac.net', size: '10,000+', headquarters: 'Mohakhali, Dhaka', phone: '+880-2-8824051', email: 'contact@brac.net', jobTitle: 'Project Coordinator', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳60,000/mo', requirements: 'Project Management, NGO Experience, Excel', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Square Pharmaceuticals', industry: 'Pharmaceuticals', website: 'https://squarepharma.com.bd', size: '5,000-10,000', headquarters: 'Pabna, Bangladesh', phone: '+880-731-63542', email: 'info@squarepharma.com.bd', jobTitle: 'Medical Sales Representative', workMode: 'Onsite', jobType: 'Full Time', salary: '৳45,000/mo', requirements: 'Pharma Knowledge, Sales, Communication', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'Walton Hi-Tech Industries', industry: 'Consumer Electronics', website: 'https://waltonbd.com', size: '5,000-10,000', headquarters: 'Gazipur, Bangladesh', phone: '+880-2-9890755', email: 'info@waltonbd.com', jobTitle: 'Electronics Service Engineer', workMode: 'Onsite', jobType: 'Full Time', salary: '৳50,000/mo', requirements: 'Electronics Repair, Customer Service, Troubleshooting', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'ACI Limited', industry: 'FMCG & Healthcare', website: 'https://aci-bd.com', size: '5,000-10,000', headquarters: 'Tejgaon, Dhaka', phone: '+880-2-8857320', email: 'info@aci-bd.com', jobTitle: 'Area Sales Manager', workMode: 'Onsite', jobType: 'Full Time', salary: '৳70,000/mo', requirements: 'FMCG Sales, Team Leadership, Market Analysis', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Meghna Group of Industries', industry: 'Manufacturing & FMCG', website: 'https://meghnagroup.com', size: '10,000+', headquarters: 'Sonargaon, Narayanganj', phone: '+880-2-7660220', email: 'hr@meghnagroup.com', jobTitle: 'Factory Operations Manager', workMode: 'Onsite', jobType: 'Full Time', salary: '৳90,000/mo', requirements: 'Operations Management, Factory Management, Supply Chain', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'Bashundhara Group', industry: 'Real Estate & Paper', website: 'https://bashundharagroup.com', size: '10,000+', headquarters: 'Bashundhara, Dhaka', phone: '+880-2-8401039', email: 'info@bashundhara.com.bd', jobTitle: 'Real Estate Sales Executive', workMode: 'Onsite', jobType: 'Full Time', salary: '৳55,000/mo', requirements: 'Real Estate, Client Relations, Property Knowledge', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'Transcom Group', industry: 'Diversified Conglomerate', website: 'https://transcomgroup.com', size: '5,000-10,000', headquarters: 'Gulshan, Dhaka', phone: '+880-2-8833333', email: 'hr@transcomgroup.com', jobTitle: 'Supply Chain Analyst', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳65,000/mo', requirements: 'Supply Chain, ERP Systems, Logistics', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Pran-RFL Group', industry: 'Food & Beverage', website: 'https://prangroup.com', size: '10,000+', headquarters: 'Narsindi, Bangladesh', phone: '+880-2-8401400', email: 'info@prangroup.com', jobTitle: 'Brand Manager', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳85,000/mo', requirements: 'Brand Management, Marketing, FMCG', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Robi Axiata Limited', industry: 'Telecommunications', website: 'https://robi.com.bd', size: '5,000-10,000', headquarters: 'Dhaka, Bangladesh', phone: '+880-2-8802200', email: 'info@robi.com.bd', jobTitle: 'Network Engineer', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳75,000/mo', requirements: '4G/5G Networks, RF Engineering, Telecom Protocols', country: 'Bangladesh', icpMatch: 'High Fit' },
];
const FACEBOOK_POOL = [
    { companyName: 'ShajGoj', industry: 'Beauty & E-commerce', website: 'https://shajgoj.com', size: '100-500', headquarters: 'Dhanmondi, Dhaka', phone: '+880-17-00000011', email: 'hello@shajgoj.com', jobTitle: 'Social Media Marketing Manager', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳55,000/mo', requirements: 'Facebook Ads, Instagram Marketing, Content Strategy', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Chaldal', industry: 'Online Grocery', website: 'https://chaldal.com', size: '500-1,000', headquarters: 'Mohammadpur, Dhaka', phone: '+880-17-00000022', email: 'info@chaldal.com', jobTitle: 'Digital Marketing Specialist', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳50,000/mo', requirements: 'Facebook Ads, Google Ads, E-commerce Analytics', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Pathao', industry: 'Ride Sharing & Delivery', website: 'https://pathao.com', size: '500-1,000', headquarters: 'Banani, Dhaka', phone: '+880-17-00000033', email: 'hello@pathao.com', jobTitle: 'Growth Marketing Analyst', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳60,000/mo', requirements: 'Growth Hacking, Data Analytics, Digital Marketing', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Sheba.xyz', industry: 'Home Services Platform', website: 'https://sheba.xyz', size: '200-500', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-00000044', email: 'info@sheba.xyz', jobTitle: 'Community Manager', workMode: 'Onsite', jobType: 'Full Time', salary: '৳45,000/mo', requirements: 'Community Building, Facebook Groups, Content Creation', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'Shohoz', industry: 'Transport & Ticketing', website: 'https://shohoz.com', size: '200-500', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-00000055', email: 'support@shohoz.com', jobTitle: 'Performance Marketing Manager', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳65,000/mo', requirements: 'Paid Social, Facebook Blueprint, Attribution', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Bikroy.com', industry: 'Online Classifieds', website: 'https://bikroy.com', size: '200-500', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-00000066', email: 'contact@bikroy.com', jobTitle: 'Social Media Content Creator', workMode: 'Onsite', jobType: 'Full Time', salary: '৳40,000/mo', requirements: 'Video Editing, Facebook/Instagram Reels, Canva', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'Daraz Bangladesh', industry: 'E-commerce Marketplace', website: 'https://daraz.com.bd', size: '1,000-5,000', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-00000077', email: 'seller@daraz.com.bd', jobTitle: 'Seller Marketing Specialist', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳55,000/mo', requirements: 'E-commerce, Seller Relations, Facebook Shops', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Bkash Limited', industry: 'Mobile Financial Services', website: 'https://bkash.com', size: '1,000-5,000', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-00000088', email: 'info@bkash.com', jobTitle: 'Digital Channel Manager', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳80,000/mo', requirements: 'Digital Banking, Mobile Apps, Fintech Marketing', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Evaly', industry: 'E-commerce', website: 'https://evaly.com.bd', size: '200-500', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-00000099', email: 'info@evaly.com.bd', jobTitle: 'Campaign Manager', workMode: 'Onsite', jobType: 'Full Time', salary: '৳48,000/mo', requirements: 'Campaign Planning, Flash Sales, Facebook Events', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'SSL Wireless', industry: 'IT & Payment Gateway', website: 'https://sslcommerz.com', size: '200-500', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-00000100', email: 'info@sslcommerz.com', jobTitle: 'Business Development Executive', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳52,000/mo', requirements: 'Payment Systems, API Integration, B2B Sales', country: 'Bangladesh', icpMatch: 'High Fit' },
];
const BDJOBS_POOL = [
    { companyName: 'Grameenphone Ltd', industry: 'Telecommunications', website: 'https://grameenphone.com', size: '10,000+', headquarters: 'Bashundhara, Dhaka', phone: '+880-2-9882990', email: 'hr@grameenphone.com', jobTitle: 'Software Engineer - Backend', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳90,000/mo', requirements: 'Java, Spring Boot, Microservices, PostgreSQL', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Dutch-Bangla Bank Limited', industry: 'Banking & Finance', website: 'https://dutchbanglabank.com', size: '5,000-10,000', headquarters: 'Dhaka, Bangladesh', phone: '+880-2-9674415', email: 'hr@dutchbanglabank.com', jobTitle: 'IT Security Analyst', workMode: 'Onsite', jobType: 'Full Time', salary: '৳75,000/mo', requirements: 'Cybersecurity, Banking Systems, ISO 27001', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Brain Station 23', industry: 'Software Development', website: 'https://brainstation-23.com', size: '500-1,000', headquarters: 'Dhaka, Bangladesh', phone: '+880-2-9840010', email: 'hr@brainstation-23.com', jobTitle: 'Senior React Developer', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳85,000/mo', requirements: 'React, TypeScript, Node.js, REST APIs', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'BJIT Group', industry: 'IT Services & Consulting', website: 'https://bjitgroup.com', size: '500-1,000', headquarters: 'Dhaka, Bangladesh', phone: '+880-2-8833521', email: 'hr@bjitgroup.com', jobTitle: 'QA Engineer', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳60,000/mo', requirements: 'Selenium, Test Automation, JIRA, Agile', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Bangladesh Export Processing Zone', industry: 'Manufacturing & Export', website: 'https://bepza.gov.bd', size: '10,000+', headquarters: 'Dhaka, Bangladesh', phone: '+880-2-8828001', email: 'info@bepza.gov.bd', jobTitle: 'Export Documentation Officer', workMode: 'Onsite', jobType: 'Full Time', salary: '৳45,000/mo', requirements: 'Export/Import, L/C Documentation, Customs', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'Genex Infosys', industry: 'BPO & IT Services', website: 'https://genexinfosys.com', size: '1,000-5,000', headquarters: 'Dhaka, Bangladesh', phone: '+880-2-9841133', email: 'hr@genexinfosys.com', jobTitle: 'Customer Experience Manager', workMode: 'Onsite', jobType: 'Full Time', salary: '৳55,000/mo', requirements: 'CRM Systems, Call Center, Team Management', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'Leads Corporation Limited', industry: 'IT & Software', website: 'https://leadscorporation.com', size: '200-500', headquarters: 'Dhaka, Bangladesh', phone: '+880-2-9887712', email: 'hr@leadscorporation.com', jobTitle: 'Full Stack Developer', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳70,000/mo', requirements: 'Laravel, Vue.js, MySQL, Docker', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Nascenia IT', industry: 'Software Development', website: 'https://nascenia.com', size: '100-200', headquarters: 'Dhaka, Bangladesh', phone: '+880-2-9831100', email: 'hr@nascenia.com', jobTitle: 'Ruby on Rails Developer', workMode: 'Remote', jobType: 'Full Time', salary: '৳75,000/mo', requirements: 'Ruby on Rails, PostgreSQL, AWS, Agile', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Reve Systems', industry: 'Telecom Software', website: 'https://revesoft.com', size: '200-500', headquarters: 'Dhaka, Bangladesh', phone: '+880-2-9121121', email: 'hr@revesoft.com', jobTitle: 'VoIP Software Engineer', workMode: 'Onsite', jobType: 'Full Time', salary: '৳65,000/mo', requirements: 'VoIP, SIP Protocol, C++, Linux', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'TechnoNext Software Limited', industry: 'IT & Software', website: 'https://technonext.net', size: '200-500', headquarters: 'Dhaka, Bangladesh', phone: '+880-2-9552211', email: 'hr@technonext.net', jobTitle: 'Mobile App Developer', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳68,000/mo', requirements: 'Flutter, Dart, iOS, Android', country: 'Bangladesh', icpMatch: 'High Fit' },
];
const ALL_SITES_POOL = [
    { companyName: 'Google Bangladesh', industry: 'Technology', website: 'https://google.com', size: '10,000+', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-11223344', email: 'bd@google.com', jobTitle: 'Cloud Solutions Architect', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳1,50,000/mo', requirements: 'GCP, Kubernetes, Terraform, DevOps', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Microsoft Bangladesh', industry: 'Technology', website: 'https://microsoft.com', size: '10,000+', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-22334455', email: 'bd@microsoft.com', jobTitle: 'Azure Data Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '৳1,20,000/mo', requirements: 'Azure, SQL Server, Power BI, C#', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Samsung R&D Bangladesh', industry: 'Electronics & R&D', website: 'https://samsung.com', size: '500-1,000', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-33445566', email: 'bd.rd@samsung.com', jobTitle: 'Embedded Software Engineer', workMode: 'Onsite', jobType: 'Full Time', salary: '৳95,000/mo', requirements: 'C/C++, RTOS, Embedded Linux, ARM', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Huawei Technologies Bangladesh', industry: 'Telecom & Networking', website: 'https://huawei.com', size: '1,000-5,000', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-44556677', email: 'bd@huawei.com', jobTitle: '5G Network Consultant', workMode: 'Onsite', jobType: 'Full Time', salary: '৳1,10,000/mo', requirements: '5G/LTE, RF Planning, Huawei Tools', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Upwork Remote BD', industry: 'Freelance Platform', website: 'https://upwork.com', size: '100-500', headquarters: 'Remote', phone: '+880-17-55667788', email: 'bd@upwork.com', jobTitle: 'Remote Freelance Coordinator', workMode: 'Remote', jobType: 'Contract', salary: '$30/hr', requirements: 'Client Management, Agile, Remote Tools', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'Fiverr BD Studio', industry: 'Freelance Services', website: 'https://fiverr.com', size: '100-200', headquarters: 'Remote', phone: '+880-17-66778899', email: 'bd@fiverr.com', jobTitle: 'Graphic Design Lead', workMode: 'Remote', jobType: 'Part Time', salary: '$25/hr', requirements: 'Figma, Illustrator, Branding, Typography', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'Nagad Digital Financial Services', industry: 'Mobile Banking', website: 'https://nagad.com.bd', size: '500-1,000', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-77889900', email: 'hr@nagad.com.bd', jobTitle: 'Fintech Product Manager', workMode: 'Hybrid', jobType: 'Full Time', salary: '৳1,00,000/mo', requirements: 'Product Management, Fintech, Mobile Apps, UX', country: 'Bangladesh', icpMatch: 'High Fit' },
    { companyName: 'Tiger IT Bangladesh', industry: 'Government IT Solutions', website: 'https://tigeribd.com', size: '200-500', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-88990011', email: 'hr@tigeribd.com', jobTitle: 'Government IT Consultant', workMode: 'Onsite', jobType: 'Full Time', salary: '৳80,000/mo', requirements: 'e-Governance, Java, Oracle DB', country: 'Bangladesh', icpMatch: 'Medium Fit' },
    { companyName: 'Optimizely', industry: 'Digital Experience Platform', website: 'https://optimizely.com', size: '1,000-5,000', headquarters: 'New York, NY', phone: '+1-603-594-0249', email: 'bd@optimizely.com', jobTitle: 'A/B Testing Specialist', workMode: 'Remote', jobType: 'Full Time', salary: '$120,000/yr', requirements: 'A/B Testing, Analytics, JavaScript', country: 'USA', icpMatch: 'High Fit' },
    { companyName: 'Amarlab', industry: 'HealthTech & Diagnostics', website: 'https://amarlab.com', size: '100-200', headquarters: 'Dhaka, Bangladesh', phone: '+880-17-99001122', email: 'info@amarlab.com', jobTitle: 'HealthTech Operations Lead', workMode: 'Onsite', jobType: 'Full Time', salary: '৳60,000/mo', requirements: 'Operations, Healthcare IT, CRM', country: 'Bangladesh', icpMatch: 'Medium Fit' },
];
// ─────────────────────────────────────────────────────────────────────────────
//  Map platform name → pool
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_POOLS = {
    linkedin: LINKEDIN_POOL,
    google_maps: GOOGLE_MAPS_POOL,
    facebook: FACEBOOK_POOL,
    bdjobs: BDJOBS_POOL,
    all_sites: ALL_SITES_POOL,
};
const PLATFORM_META = {
    linkedin: { name: 'LinkedIn', type: 'Professional Network' },
    google_maps: { name: 'Google Maps', type: 'Local Business Directory' },
    facebook: { name: 'Facebook', type: 'Social Media' },
    bdjobs: { name: 'BDJobs', type: 'Job Board' },
    all_sites: { name: 'All Sites', type: 'Aggregated Web Capture' },
};
// ─────────────────────────────────────────────────────────────────────────────
//  PREVIEW API — returns preview data without saving to DB
// ─────────────────────────────────────────────────────────────────────────────
const getBulkPreview = async (req, res) => {
    try {
        const countParam = parseInt(req.query.count || '20', 10);
        const count = Math.min(Math.max(countParam, 10), 50);
        const platformKey = (req.query.platform || 'linkedin').toLowerCase().replace(' ', '_');
        const pool = PLATFORM_POOLS[platformKey] || LINKEDIN_POOL;
        // Return companies slice as preview (no DB operations)
        const preview = pool.slice(0, count).map((item, index) => ({
            previewId: `${platformKey}_${index}`,
            ...item,
        }));
        return res.json({
            success: true,
            platform: PLATFORM_META[platformKey] || PLATFORM_META['linkedin'],
            count: preview.length,
            companies: preview,
        });
    }
    catch (error) {
        console.error('Error fetching bulk preview:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getBulkPreview = getBulkPreview;
// ─────────────────────────────────────────────────────────────────────────────
//  BULK IMPORT — saves selected companies to DB
// ─────────────────────────────────────────────────────────────────────────────
const runBulkImport = async (req, res) => {
    try {
        const { platform = 'linkedin', selectedIds } = req.body;
        const countParam = parseInt(req.body.count || req.query.count || '20', 10);
        const count = Math.min(Math.max(countParam, 1), 50);
        const platformKey = platform.toLowerCase().replace(' ', '_');
        const pool = PLATFORM_POOLS[platformKey] || LINKEDIN_POOL;
        const platformMeta = PLATFORM_META[platformKey] || PLATFORM_META['linkedin'];
        const user = await prisma.user.findFirst();
        const userId = user ? user.id : null;
        if (!userId) {
            return res.status(500).json({ error: 'No active CRM agents/users found to assign captures.' });
        }
        // Find or create the source platform record
        let sourcePlatform = await prisma.sourcePlatform.findFirst({
            where: { platformName: platformMeta.name }
        });
        if (!sourcePlatform) {
            sourcePlatform = await prisma.sourcePlatform.create({
                data: {
                    platformName: platformMeta.name,
                    platformType: platformMeta.type,
                }
            });
        }
        // Determine which companies to process
        let targetPool;
        if (selectedIds && Array.isArray(selectedIds) && selectedIds.length > 0) {
            // Import only selected by index
            targetPool = selectedIds
                .map((id) => {
                const idx = parseInt(id.split('_').pop() || '0', 10);
                return pool[idx];
            })
                .filter(Boolean);
        }
        else {
            targetPool = pool.slice(0, count);
        }
        let addedCompaniesCount = 0;
        let addedJobsCount = 0;
        const addedDetails = [];
        for (const item of targetPool) {
            // Find or create company
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
            // Check if job already exists
            const existingJob = await prisma.jobApplication.findFirst({
                where: { jobTitle: item.jobTitle, companyId: company.id }
            });
            if (!existingJob) {
                await prisma.$transaction(async (tx) => {
                    const job = await tx.jobApplication.create({
                        data: {
                            companyId: company.id,
                            jobTitle: item.jobTitle,
                            position: item.jobTitle.split(' ').slice(1).join(' '),
                            department: 'General',
                            experience: '2+ Years',
                            salary: item.salary,
                            location: item.headquarters,
                            workMode: item.workMode,
                            jobType: item.jobType,
                            description: `Seeking a specialist proficient in: ${item.requirements}.`,
                            requirements: item.requirements,
                            benefits: 'Competitive package with performance bonuses.',
                            status: 'Draft',
                        }
                    });
                    await tx.document.create({
                        data: { jobApplicationId: job.id, resume: '', coverLetter: '', proposal: '', portfolio: '' }
                    });
                    await tx.jobHistory.create({
                        data: {
                            jobApplicationId: job.id,
                            status: 'Draft',
                            remarks: `Bulk captured via ${platformMeta.name} source.`,
                            updatedBy: 'LeadBond AI Bulk Engine',
                        }
                    });
                    await tx.captureLog.create({
                        data: {
                            companyId: company.id,
                            userId,
                            sourceId: sourcePlatform.id,
                            rawDataUrl: `https://${platformKey}.leadbond/capture/${job.id}`,
                        }
                    });
                });
                addedJobsCount++;
                addedDetails.push({
                    companyName: item.companyName,
                    jobTitle: item.jobTitle,
                    platform: platformMeta.name,
                    icpMatch: item.icpMatch,
                });
            }
        }
        // Send email notification to user about the bulk import
        if (user && user.email && (addedCompaniesCount > 0 || addedJobsCount > 0)) {
            const subject = `🔔 Bulk Import Notification: ${addedCompaniesCount} Companies Added`;
            const text = `Hi ${user.fullName},\n\nWe have successfully imported ${addedCompaniesCount} new companies and ${addedJobsCount} new job signals from ${platformMeta.name} to your pipeline.\n\nYou can review these details in your Leads and Jobs tracker.`;
            (0, mail_service_1.sendNotification)(user.email, subject, text).catch(err => {
                console.error('Failed to dispatch import email notification:', err);
            });
        }
        return res.json({
            success: true,
            message: `Bulk operation successful. Imported ${addedCompaniesCount} new companies and ${addedJobsCount} new job tickets from ${platformMeta.name}.`,
            summary: {
                companiesImported: addedCompaniesCount,
                jobsImported: addedJobsCount,
                platform: platformMeta.name,
            },
            details: addedDetails,
        });
    }
    catch (error) {
        console.error('Error during bulk import:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.runBulkImport = runBulkImport;
