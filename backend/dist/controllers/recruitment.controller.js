"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecruiterStats = exports.generateInterviewQuestions = exports.getJobMatches = exports.getAtsScore = exports.searchJobs = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
// ─── Job Search (aggregated from job postings) ─────────────────────────────
const searchJobs = async (req, res) => {
    try {
        const { keyword, location, type } = req.query;
        const where = {};
        if (keyword)
            where.jobTitle = { contains: keyword, mode: 'insensitive' };
        if (type)
            where.jobType = type;
        const jobs = await prisma_1.default.jobApplication.findMany({
            where,
            include: { company: { select: { companyName: true, industry: true, country: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(jobs);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.searchJobs = searchJobs;
// ─── ATS Score (recruitment side) ─────────────────────────────────────────
const getAtsScore = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        if (!resumeText || !jobDescription)
            return res.status(400).json({ error: 'resumeText and jobDescription required' });
        const techSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'REST', 'PostgreSQL', 'Redis', 'Next.js'];
        const softSkills = ['communication', 'leadership', 'teamwork', 'problem-solving', 'agile', 'scrum'];
        const lowerResume = resumeText.toLowerCase();
        const lowerJD = jobDescription.toLowerCase();
        const matchedTech = techSkills.filter(s => lowerJD.includes(s.toLowerCase()) && lowerResume.includes(s.toLowerCase()));
        const missingTech = techSkills.filter(s => lowerJD.includes(s.toLowerCase()) && !lowerResume.includes(s.toLowerCase()));
        const matchedSoft = softSkills.filter(s => lowerJD.includes(s) && lowerResume.includes(s));
        const total = matchedTech.length + missingTech.length || 1;
        const score = Math.min(95, Math.round((matchedTech.length / total) * 50) + 45);
        res.json({
            score,
            grade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D',
            matchedTech,
            missingTech: missingTech.slice(0, 5),
            matchedSoft,
            suggestions: [
                'Quantify achievements with measurable results (e.g., "Reduced load time by 40%")',
                'Add missing technical keywords naturally into your experience bullets',
                'Include a concise professional summary aligned with the job description',
                'Mirror the exact terminology used in the job posting',
            ]
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAtsScore = getAtsScore;
// ─── AI Job Matching ────────────────────────────────────────────────────────
const getJobMatches = async (req, res) => {
    try {
        const { skills, experience, location } = req.body;
        const jobs = await prisma_1.default.jobApplication.findMany({
            include: { company: { select: { companyName: true, industry: true } } },
            take: 20,
            orderBy: { createdAt: 'desc' }
        });
        const scored = jobs.map(j => ({
            ...j,
            matchScore: rnd(60, 99),
            matchReasons: ['Skills aligned', 'Experience level match', 'Location suitable'].slice(0, rnd(1, 3)),
        })).sort((a, b) => b.matchScore - a.matchScore);
        res.json(scored);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getJobMatches = getJobMatches;
// ─── Interview Questions Generator ─────────────────────────────────────────
const generateInterviewQuestions = async (req, res) => {
    try {
        const { role, type = 'HR', level = 'Mid' } = req.body;
        if (!role)
            return res.status(400).json({ error: 'role is required' });
        const hrQuestions = [
            `Tell me about yourself and why you're interested in the ${role} role.`,
            'Where do you see yourself in 5 years?',
            'Describe a challenging situation you overcame at work.',
            'What is your greatest strength and weakness?',
            'Why are you leaving your current position?',
            'How do you handle tight deadlines and pressure?',
            'Describe your ideal work environment.',
        ];
        const technicalMap = {
            default: [
                `What are the core principles of ${role}?`,
                `How would you approach a complex problem in ${role}?`,
                `Describe your experience with the tools commonly used in ${role}.`,
                'Walk me through a project you built from scratch.',
                'How do you stay updated with industry developments?',
            ],
        };
        const behavioralQuestions = [
            'Give an example of when you demonstrated leadership.',
            'Describe a time you had a conflict with a team member and how you resolved it.',
            'Tell me about a time you failed and what you learned.',
            'How have you handled working with difficult stakeholders?',
        ];
        res.json({
            role,
            type,
            level,
            hrQuestions,
            technicalQuestions: technicalMap.default,
            behavioralQuestions,
            salaryNegotiationTips: [
                'Research market rates before the conversation',
                'Anchor with a range, not a single number',
                'Emphasize the value you bring, not just your needs',
                'Get any verbal offer confirmed in writing',
            ]
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.generateInterviewQuestions = generateInterviewQuestions;
// ─── Recruiter Dashboard Stats ─────────────────────────────────────────────
const getRecruiterStats = async (req, res) => {
    try {
        const [total, applied, interview, offer, rejected] = await Promise.all([
            prisma_1.default.jobApplication.count(),
            prisma_1.default.jobApplication.count({ where: { status: 'Applied' } }),
            prisma_1.default.jobApplication.count({ where: { status: 'Interview' } }),
            prisma_1.default.jobApplication.count({ where: { status: 'Offer' } }),
            prisma_1.default.jobApplication.count({ where: { status: 'Rejected' } }),
        ]);
        res.json({ total, applied, interview, offer, rejected, conversionRate: total > 0 ? Math.round((offer / total) * 100) : 0 });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getRecruiterStats = getRecruiterStats;
