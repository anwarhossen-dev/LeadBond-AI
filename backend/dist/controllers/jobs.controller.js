"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobStatus = exports.createJob = exports.getJobById = exports.getJobs = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getJobs = async (req, res) => {
    try {
        const { search, status, workMode } = req.query;
        const whereClause = {};
        if (search) {
            whereClause.OR = [
                { jobTitle: { contains: search, mode: 'insensitive' } },
                { company: { companyName: { contains: search, mode: 'insensitive' } } }
            ];
        }
        if (status && status !== 'All') {
            whereClause.status = status;
        }
        if (workMode && workMode !== 'All') {
            whereClause.workMode = workMode;
        }
        const applications = await prisma_1.default.jobApplication.findMany({
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
    }
    catch (error) {
        console.error('Error fetching job applications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getJobs = getJobs;
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await prisma_1.default.jobApplication.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching job application details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getJobById = getJobById;
const createJob = async (req, res) => {
    try {
        const { companyId, companyName, jobTitle, position, department, experience, salary, location, workMode, jobType, datePosted, deadline, applyMethod, applyLink, description, requirements, benefits, status, agentName // for logging update
         } = req.body;
        let resolvedCompanyId = companyId;
        if (!resolvedCompanyId && companyName) {
            const company = await prisma_1.default.company.findFirst({
                where: { companyName: { equals: companyName, mode: 'insensitive' } }
            });
            if (company) {
                resolvedCompanyId = company.id;
            }
            else {
                const user = await prisma_1.default.user.findFirst();
                const userId = user ? user.id : "";
                const newComp = await prisma_1.default.company.create({
                    data: {
                        companyName: companyName,
                        industry: 'Software & Technology',
                        website: `https://www.google.com/search?q=${encodeURIComponent(companyName)}`,
                        licenseNo: 'LIC-' + Math.floor(100000 + Math.random() * 900000),
                        icpMatch: 'Low Fit',
                        pipelineStage: 'Captured',
                        capturedBy: userId
                    }
                });
                resolvedCompanyId = newComp.id;
            }
        }
        if (!resolvedCompanyId || !jobTitle) {
            return res.status(400).json({ error: 'companyId (or companyName) and jobTitle are required.' });
        }
        const newJob = await prisma_1.default.$transaction(async (tx) => {
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
    }
    catch (error) {
        console.error('Error creating job application:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createJob = createJob;
const updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks, agentName } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'Missing status parameter.' });
        }
        const application = await prisma_1.default.jobApplication.findUnique({
            where: { id }
        });
        if (!application) {
            return res.status(404).json({ error: 'Job application not found' });
        }
        const updated = await prisma_1.default.$transaction(async (tx) => {
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
    }
    catch (error) {
        console.error('Error updating job status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updateJobStatus = updateJobStatus;
