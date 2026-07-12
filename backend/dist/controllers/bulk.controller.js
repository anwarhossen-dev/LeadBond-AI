"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBulkImport = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Pool of 50 mock companies and jobs for bulk lead generation
const BULK_COMPANIES_POOL = [
    { companyName: 'Adobe', industry: 'Software & Cloud', website: 'https://adobe.com', size: '10,000+', headquarters: 'San Jose, CA', phone: '+1-408-536-6000', email: 'corporate@adobe.com', jobTitle: 'Senior UI/UX Designer', workMode: 'Remote', jobType: 'Full Time', salary: '$140,000/yr', requirements: 'Figma, Design Systems, Adobe Creative Suite' },
    { companyName: 'Intel', industry: 'Hardware & Semiconductors', website: 'https://intel.com', size: '10,000+', headquarters: 'Santa Clara, CA', phone: '+1-408-765-8080', email: 'support@intel.com', jobTitle: 'Embedded Systems Engineer', workMode: 'Onsite', jobType: 'Full Time', salary: '$130,000/yr', requirements: 'C/C++, Microcontrollers, FPGA, RTOS' },
    { companyName: 'Cisco Systems', industry: 'Networking & Telecom', website: 'https://cisco.com', size: '10,000+', headquarters: 'San Jose, CA', phone: '+1-408-526-4000', email: 'info@cisco.com', jobTitle: 'Network Automation Specialist', workMode: 'Hybrid', jobType: 'Full Time', salary: '$125,000/yr', requirements: 'Python, Cisco CCNA/CCNP, Ansible, NetDevOps' },
    { companyName: 'Oracle', industry: 'Database & Cloud', website: 'https://oracle.com', size: '10,000+', headquarters: 'Austin, TX', phone: '+1-737-867-1000', email: 'enterprise@oracle.com', jobTitle: 'Database Cloud Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$150,000/yr', requirements: 'Oracle DB, SQL, OCI Cloud, PL/SQL' },
    { companyName: 'VMware', industry: 'Virtualization & Cloud', website: 'https://vmware.com', size: '10,000+', headquarters: 'Palo Alto, CA', phone: '+1-650-427-5000', email: 'sales@vmware.com', jobTitle: 'Kubernetes Systems Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$155,000/yr', requirements: 'Kubernetes, Tanzu, Go, Linux Kernels' },
    { companyName: 'Dell Technologies', industry: 'Computer Hardware', website: 'https://dell.com', size: '10,000+', headquarters: 'Round Rock, TX', phone: '+1-512-728-7100', email: 'contact@dell.com', jobTitle: 'Hardware QA Engineer', workMode: 'Onsite', jobType: 'Full Time', salary: '$95,000/yr', requirements: 'Hardware testing, QA cycles, Oscilloscopes' },
    { companyName: 'HP Inc.', industry: 'Computer Hardware', website: 'https://hp.com', size: '10,000+', headquarters: 'Palo Alto, CA', phone: '+1-650-857-1501', email: 'corporate@hp.com', jobTitle: 'Firmware Developer', workMode: 'Hybrid', jobType: 'Full Time', salary: '$110,000/yr', requirements: 'C, Assembly, Hardware interfaces, RTOS' },
    { companyName: 'NVIDIA', industry: 'Graphics & AI Hardware', website: 'https://nvidia.com', size: '10,000+', headquarters: 'Santa Clara, CA', phone: '+1-408-486-2000', email: 'careers@nvidia.com', jobTitle: 'CUDA Performance Engineer', workMode: 'Onsite', jobType: 'Full Time', salary: '$185,000/yr', requirements: 'C++, CUDA, GPU Computing, Parallel Algorithms' },
    { companyName: 'AMD', industry: 'Semiconductors', website: 'https://amd.com', size: '10,000+', headquarters: 'Santa Clara, CA', phone: '+1-408-749-4000', email: 'sales@amd.com', jobTitle: 'Silicon Verification Engineer', workMode: 'Onsite', jobType: 'Full Time', salary: '$145,000/yr', requirements: 'SystemVerilog, UVM, Verilog, ASIC' },
    { companyName: 'Qualcomm', industry: 'Mobile & Wireless', website: 'https://qualcomm.com', size: '10,000+', headquarters: 'San Diego, CA', phone: '+1-858-587-1121', email: 'info@qualcomm.com', jobTitle: '5G Protocol Engineer', workMode: 'Hybrid', jobType: 'Full Time', salary: '$135,000/yr', requirements: 'LTE/5G Protocols, C++, Wireshark, Qualcomm Tools' },
    { companyName: 'Red Hat', industry: 'Open Source Software', website: 'https://redhat.com', size: '5,000-10,000', headquarters: 'Raleigh, NC', phone: '+1-919-754-3700', email: 'partners@redhat.com', jobTitle: 'Linux Support Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$105,000/yr', requirements: 'RedHat Certified (RHCE), Bash scripting, System Admin' },
    { companyName: 'Slack Technologies', industry: 'Collaboration Software', website: 'https://slack.com', size: '1,000-5,000', headquarters: 'San Francisco, CA', phone: '+1-415-555-0199', email: 'press@slack.com', jobTitle: 'Integrations Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$130,000/yr', requirements: 'Node.js, APIs, Webhooks, Slack SDK' },
    { companyName: 'Zoom Video', industry: 'Telecommunications', website: 'https://zoom.us', size: '5,000-10,000', headquarters: 'San Jose, CA', phone: '+1-888-799-9666', email: 'sales@zoom.us', jobTitle: 'WebRTC Systems Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$160,000/yr', requirements: 'WebRTC, C++, Network streaming protocols' },
    { companyName: 'Dropbox', industry: 'Cloud Storage', website: 'https://dropbox.com', size: '1,000-5,000', headquarters: 'San Francisco, CA', phone: '+1-415-857-7000', email: 'support@dropbox.com', jobTitle: 'Backend Rust Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$170,000/yr', requirements: 'Rust, Systems Programming, Distributed Databases' },
    { companyName: 'Atlassian', industry: 'Developer Tools', website: 'https://atlassian.com', size: '5,000-10,000', headquarters: 'Sydney, Australia', phone: '+61-2-9290-3000', email: 'corporate@atlassian.com', jobTitle: 'Jira Software Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$140,000/yr', requirements: 'Java, Spring Boot, React, Microservices' },
    { companyName: 'GitHub', industry: 'Developer Platforms', website: 'https://github.com', size: '1,000-5,000', headquarters: 'San Francisco, CA', phone: '+1-415-890-4484', email: 'support@github.com', jobTitle: 'GitHub Actions Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$150,000/yr', requirements: 'Ruby on Rails, Go, CI/CD pipelines, Git' },
    { companyName: 'GitLab', industry: 'DevSecOps Platform', website: 'https://gitlab.com', size: '1,000-5,000', headquarters: 'Remote', phone: '+1-415-555-0210', email: 'sales@gitlab.com', jobTitle: 'Ruby Backend Architect', workMode: 'Remote', jobType: 'Full Time', salary: '$160,000/yr', requirements: 'Ruby, PostgreSQL, Redis, DevSecOps' },
    { companyName: 'Shopify', industry: 'E-commerce Platforms', website: 'https://shopify.com', size: '5,000-10,000', headquarters: 'Ottawa, Canada', phone: '+1-613-241-2828', email: 'support@shopify.com', jobTitle: 'Ruby Rails Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$130,000/yr', requirements: 'Ruby on Rails, E-commerce, GraphQL' },
    { companyName: 'Spotify', industry: 'Digital Streaming', website: 'https://spotify.com', size: '5,000-10,000', headquarters: 'Stockholm, Sweden', phone: '+46-8-555-0300', email: 'office@spotify.com', jobTitle: 'Data Engineer - Recommendations', workMode: 'Remote', jobType: 'Full Time', salary: '$150,000/yr', requirements: 'Python, Scala, Apache Spark, Hadoop, SQL' },
    { companyName: 'Netflix', industry: 'Entertainment & SaaS', website: 'https://netflix.com', size: '5,000-10,000', headquarters: 'Los Gatos, CA', phone: '+1-408-540-3700', email: 'corporate@netflix.com', jobTitle: 'Streaming Server Specialist', workMode: 'Hybrid', jobType: 'Full Time', salary: '$195,000/yr', requirements: 'C++, FreeBSD, Content Delivery Networks' },
    { companyName: 'Uber Technologies', industry: 'Ride Sharing & Tech', website: 'https://uber.com', size: '10,000+', headquarters: 'San Francisco, CA', phone: '+1-415-802-4000', email: 'support@uber.com', jobTitle: 'Realtime Dispatch Engineer', workMode: 'Hybrid', jobType: 'Full Time', salary: '$160,000/yr', requirements: 'Go, Kafka, Cassandra, Map Matching' },
    { companyName: 'Lyft', industry: 'Ride Sharing', website: 'https://lyft.com', size: '1,000-5,000', headquarters: 'San Francisco, CA', phone: '+1-844-313-3987', email: 'press@lyft.com', jobTitle: 'Geospatial Developer', workMode: 'Hybrid', jobType: 'Full Time', salary: '$140,000/yr', requirements: 'Python, GIS systems, Route optimization' },
    { companyName: 'Airbnb', industry: 'Travel & Hospitality', website: 'https://airbnb.com', size: '5,000-10,000', headquarters: 'San Francisco, CA', phone: '+1-415-800-5959', email: 'contact@airbnb.com', jobTitle: 'Search Ranking Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$175,000/yr', requirements: 'Java, Elasticsearch, Machine Learning' },
    { companyName: 'Stripe', industry: 'Fintech Payments', website: 'https://stripe.com', size: '5,000-10,000', headquarters: 'San Francisco, CA', phone: '+1-415-555-0399', email: 'billing@stripe.com', jobTitle: 'API Integrations Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$165,000/yr', requirements: 'Ruby, Go, API Standards, Security compliance' },
    { companyName: 'Square (Block)', industry: 'Fintech & POS', website: 'https://squareup.com', size: '5,000-10,000', headquarters: 'San Francisco, CA', phone: '+1-415-375-3176', email: 'merchant@square.com', jobTitle: 'POS Systems Engineer', workMode: 'Hybrid', jobType: 'Full Time', salary: '$135,000/yr', requirements: 'Java, Kotlin, Mobile architectures' },
    { companyName: 'PayPal', industry: 'Fintech Payments', website: 'https://paypal.com', size: '10,000+', headquarters: 'San Jose, CA', phone: '+1-408-967-1000', email: 'corporate@paypal.com', jobTitle: 'Risk Analytics Engineer', workMode: 'Hybrid', jobType: 'Full Time', salary: '$130,000/yr', requirements: 'Python, SQL, Risk models, fraud detection' },
    { companyName: 'Robinhood', industry: 'Fintech Trading', website: 'https://robinhood.com', size: '1,000-5,000', headquarters: 'Menlo Park, CA', phone: '+1-888-555-0122', email: 'support@robinhood.com', jobTitle: 'Crypto Backend Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$170,000/yr', requirements: 'Go, Blockchain nodes, WebSockets' },
    { companyName: 'Coinbase', industry: 'Cryptocurrency Exchange', website: 'https://coinbase.com', size: '1,000-5,000', headquarters: 'Remote', phone: '+1-888-908-7930', email: 'support@coinbase.com', jobTitle: 'Smart Contract Auditor', workMode: 'Remote', jobType: 'Contract', salary: '$200,000/yr', requirements: 'Solidity, Rust, Security audits, EVM' },
    { companyName: 'Twilio', industry: 'Communications API', website: 'https://twilio.com', size: '5,000-10,000', headquarters: 'San Francisco, CA', phone: '+1-415-390-2337', email: 'sales@twilio.com', jobTitle: 'SMS Gateway Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$140,000/yr', requirements: 'Java, Scala, Telecom Protocols' },
    { companyName: 'SendGrid', industry: 'Email Delivery API', website: 'https://sendgrid.com', size: '500-1,000', headquarters: 'Denver, CO', phone: '+1-888-985-7920', email: 'billing@sendgrid.com', jobTitle: 'MTA Systems Administrator', workMode: 'Remote', jobType: 'Full Time', salary: '$120,000/yr', requirements: 'Postfix, PowerMTA, DNS records, SPF/DKIM' },
    { companyName: 'HubSpot', industry: 'CRM Software', website: 'https://hubspot.com', size: '5,000-10,000', headquarters: 'Cambridge, MA', phone: '+1-888-482-7768', email: 'sales@hubspot.com', jobTitle: 'Frontend Engineer - Marketing Hub', workMode: 'Remote', jobType: 'Full Time', salary: '$130,000/yr', requirements: 'React, TypeScript, CSS layout modules' },
    { companyName: 'Asana', industry: 'Project Management', website: 'https://asana.com', size: '1,000-5,000', headquarters: 'San Francisco, CA', phone: '+1-415-528-5800', email: 'press@asana.com', jobTitle: 'Workflows Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$135,000/yr', requirements: 'TypeScript, Node.js, Graph Databases' },
    { companyName: 'Trello', industry: 'Collaboration Boards', website: 'https://trello.com', size: '100-500', headquarters: 'New York, NY', phone: '+1-212-555-0188', email: 'support@trello.com', jobTitle: 'React Native Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$120,000/yr', requirements: 'React Native, Javascript, Offline sync architectures' },
    { companyName: 'Monday.com', industry: 'Workflow Management', website: 'https://monday.com', size: '1,000-5,000', headquarters: 'Tel Aviv, Israel', phone: '+972-3-555-0999', email: 'sales@monday.com', jobTitle: 'Core Engine Developer', workMode: 'Hybrid', jobType: 'Full Time', salary: '$135,000/yr', requirements: 'React, Ruby, Webpack, Database sharding' },
    { companyName: 'ClickUp', industry: 'Productivity Software', website: 'https://clickup.com', size: '500-1,000', headquarters: 'San Diego, CA', phone: '+1-888-555-0455', email: 'billing@clickup.com', jobTitle: 'Angular UI Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$115,000/yr', requirements: 'Angular, RxJS, state management libraries' },
    { companyName: 'Notion', industry: 'Connected Workspace', website: 'https://notion.so', size: '500-1,000', headquarters: 'San Francisco, CA', phone: '+1-415-555-0980', email: 'sales@notion.so', jobTitle: 'Text Editor Specialist', workMode: 'Hybrid', jobType: 'Full Time', salary: '$160,000/yr', requirements: 'TypeScript, ProseMirror, Slate, Rich Text APIs' },
    { companyName: 'Grammarly', industry: 'AI Writing Assistant', website: 'https://grammarly.com', size: '500-1,000', headquarters: 'San Francisco, CA', phone: '+1-415-555-0810', email: 'corporate@grammarly.com', jobTitle: 'NLP Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$170,000/yr', requirements: 'Python, PyTorch, Transformers, Large Language Models' },
    { companyName: 'Canva', industry: 'Graphic Design Platforms', website: 'https://canva.com', size: '1,000-5,000', headquarters: 'Sydney, Australia', phone: '+61-2-5555-0120', email: 'press@canva.com', jobTitle: 'Web Graphics Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$125,000/yr', requirements: 'WebGL, WebGL2, Canvas 2D, Javascript' },
    { companyName: 'Figma', industry: 'Collaborative Design Tools', website: 'https://figma.com', size: '500-1,000', headquarters: 'San Francisco, CA', phone: '+1-415-555-0144', email: 'sales@figma.com', jobTitle: 'WebAssembly Specialist', workMode: 'Hybrid', jobType: 'Full Time', salary: '$180,000/yr', requirements: 'C++, WebAssembly, WebGL, Rust' },
    { companyName: 'Miro', industry: 'Visual Workspaces', website: 'https://miro.com', size: '1,000-5,000', headquarters: 'San Francisco, CA', phone: '+1-415-555-0125', email: 'support@miro.com', jobTitle: 'Canvas Render Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$130,000/yr', requirements: 'HTML5 Canvas, PixiJS, Javascript performance profiling' },
    { companyName: 'InVision', industry: 'Prototyping Software', website: 'https://invisionapp.com', size: '500-1,000', headquarters: 'New York, NY', phone: '+1-888-555-0160', email: 'sales@invision.com', jobTitle: 'System Architect', workMode: 'Remote', jobType: 'Full Time', salary: '$140,000/yr', requirements: 'Microservices, AWS, Docker' },
    { companyName: 'Sketch', industry: 'Vector Design Tools', website: 'https://sketch.com', size: '100-500', headquarters: 'The Hague, Netherlands', phone: '+31-70-555-0111', email: 'info@sketch.com', jobTitle: 'macOS Swift Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$110,000/yr', requirements: 'Swift, Objective-C, Cocoa, AppStore submission' },
    { companyName: 'Auth0', industry: 'Identity Management API', website: 'https://auth0.com', size: '500-1,000', headquarters: 'Bellevue, WA', phone: '+1-888-555-0177', email: 'security@auth0.com', jobTitle: 'OAuth Integration Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$145,000/yr', requirements: 'OAuth2.0, SAML, JWT, Node.js security' },
    { companyName: 'Okta', industry: 'Identity & Access Management', website: 'https://okta.com', size: '5,000-10,000', headquarters: 'San Francisco, CA', phone: '+1-888-722-7871', email: 'sales@okta.com', jobTitle: 'Access Governance Specialist', workMode: 'Hybrid', jobType: 'Full Time', salary: '$135,000/yr', requirements: 'IAM Protocols, Active Directory, LDAP, Java' },
    { companyName: 'OneLogin', industry: 'Single Sign On (SSO)', website: 'https://onelogin.com', size: '200-500', headquarters: 'San Francisco, CA', phone: '+1-855-426-7688', email: 'sales@onelogin.com', jobTitle: 'Security Auditing Engineer', workMode: 'Onsite', jobType: 'Full Time', salary: '$115,000/yr', requirements: 'Ruby, LDAP, SAML, ISO-27001' },
    { companyName: 'CrowdStrike', industry: 'Cybersecurity SaaS', website: 'https://crowdstrike.com', size: '5,000-10,000', headquarters: 'Austin, TX', phone: '+1-888-512-8906', email: 'sales@crowdstrike.com', jobTitle: 'Falcon Agent C++ Engineer', workMode: 'Remote', jobType: 'Full Time', salary: '$165,000/yr', requirements: 'C++, Windows Internals, Kernel drivers, cybersecurity' },
    { companyName: 'Splunk', industry: 'Data Analytics & Security', website: 'https://splunk.com', size: '5,000-10,000', headquarters: 'San Francisco, CA', phone: '+1-866-438-7758', email: 'sales@splunk.com', jobTitle: 'Logs ingestion Engineer', workMode: 'Hybrid', jobType: 'Full Time', salary: '$140,000/yr', requirements: 'Python, C++, Big Data, Syslog, Regex parser' },
    { companyName: 'Datadog', industry: 'Cloud Monitoring SaaS', website: 'https://datadoghq.com', size: '1,000-5,000', headquarters: 'New York, NY', phone: '+1-866-328-2364', email: 'support@datadoghq.com', jobTitle: 'APM Agent Rust Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$160,000/yr', requirements: 'Rust, APM architectures, System metrics' },
    { companyName: 'New Relic', industry: 'APM Software', website: 'https://newrelic.com', size: '1,000-5,000', headquarters: 'San Francisco, CA', phone: '+1-888-643-8735', email: 'sales@newrelic.com', jobTitle: 'Telemetry Ingestion Developer', workMode: 'Remote', jobType: 'Full Time', salary: '$130,000/yr', requirements: 'Go, Kafka, OpenTelemetry protocols' },
    { companyName: 'Dynatrace', industry: 'APM & Observability', website: 'https://dynatrace.com', size: '1,000-5,000', headquarters: 'Waltham, MA', phone: '+1-781-530-1000', email: 'info@dynatrace.com', jobTitle: 'AI Operations Scientist', workMode: 'Hybrid', jobType: 'Full Time', salary: '$150,000/yr', requirements: 'Python, AIops, anomaly detection algorithms' }
];
const runBulkImport = async (req, res) => {
    try {
        const countParam = parseInt(req.body.count || req.query.count || '20', 10);
        const count = Math.min(Math.max(countParam, 1), 50); // limit to 1-50
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
        let addedCompaniesCount = 0;
        let addedJobsCount = 0;
        const addedDetails = [];
        // Slice pool based on requested count
        const targetPool = BULK_COMPANIES_POOL.slice(0, count);
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
                        icpMatch: Math.random() > 0.4 ? 'High Fit' : 'Medium Fit',
                        pipelineStage: 'Captured',
                        capturedBy: userId,
                        companySize: item.size,
                        headquarters: item.headquarters,
                        phone: item.phone,
                        email: item.email
                    }
                });
                addedCompaniesCount++;
            }
            // Check if job already exists
            const existingJob = await prisma.jobApplication.findFirst({
                where: {
                    jobTitle: item.jobTitle,
                    companyId: company.id
                }
            });
            if (!existingJob) {
                await prisma.$transaction(async (tx) => {
                    // Create job application (ticket)
                    const job = await tx.jobApplication.create({
                        data: {
                            companyId: company.id,
                            jobTitle: item.jobTitle,
                            position: item.jobTitle.split(' ').slice(1).join(' '),
                            department: 'Engineering',
                            experience: '3+ Years',
                            salary: item.salary,
                            location: item.headquarters,
                            workMode: item.workMode,
                            jobType: item.jobType,
                            description: `Looking for a specialist with solid proficiency in: ${item.requirements}.`,
                            requirements: item.requirements,
                            benefits: 'Competitive package with equity benefits.',
                            status: 'Draft'
                        }
                    });
                    // Document placeholder
                    await tx.document.create({
                        data: {
                            jobApplicationId: job.id,
                            resume: '',
                            coverLetter: '',
                            proposal: '',
                            portfolio: ''
                        }
                    });
                    // History record
                    await tx.jobHistory.create({
                        data: {
                            jobApplicationId: job.id,
                            status: 'Draft',
                            remarks: 'Bulk captured via AI lead generation processor.',
                            updatedBy: 'LeadBond AI Bulk Engine'
                        }
                    });
                    // Capture log
                    await tx.captureLog.create({
                        data: {
                            companyId: company.id,
                            userId,
                            sourceId: platform.id,
                            rawDataUrl: `https://www.linkedin.com/jobs/view/bulk-${job.id}`
                        }
                    });
                });
                addedJobsCount++;
                addedDetails.push({ companyName: item.companyName, jobTitle: item.jobTitle });
            }
        }
        res.json({
            success: true,
            message: `Bulk operation successful. Imported ${addedCompaniesCount} new companies and ${addedJobsCount} new job opportunity tickets.`,
            summary: {
                companiesImported: addedCompaniesCount,
                jobsImported: addedJobsCount
            },
            details: addedDetails
        });
    }
    catch (error) {
        console.error('Error during bulk import:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.runBulkImport = runBulkImport;
