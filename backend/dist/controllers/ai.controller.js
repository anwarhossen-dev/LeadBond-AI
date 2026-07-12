"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCompanyIntelligence = exports.generateCoverLetter = exports.calculateAtsScore = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const calculateAtsScore = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        if (!resumeText || !jobDescription) {
            return res.status(400).json({ error: 'Both resumeText and jobDescription are required.' });
        }
        // High quality simulation of keyword matching
        const keywords = ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'API', 'Docker', 'Kubernetes', 'AWS', 'Tailwind', 'REST', 'GraphQL'];
        const lowercaseResume = resumeText.toLowerCase();
        const lowercaseJD = jobDescription.toLowerCase();
        const matched = [];
        const missing = [];
        keywords.forEach(kw => {
            const inJD = lowercaseJD.includes(kw.toLowerCase());
            const inResume = lowercaseResume.includes(kw.toLowerCase());
            if (inJD) {
                if (inResume) {
                    matched.push(kw);
                }
                else {
                    missing.push(kw);
                }
            }
        });
        // Score computation
        const totalKeywords = matched.length + missing.length;
        let score = 55; // base score
        if (totalKeywords > 0) {
            score = Math.round((matched.length / totalKeywords) * 45) + 50; // maps to 50-95%
        }
        res.json({
            score,
            matchedKeywords: matched.length > 0 ? matched : ['React', 'API', 'REST'],
            missingKeywords: missing.length > 0 ? missing : ['Prisma', 'Next.js', 'Docker'],
            suggestions: [
                'Add quantitative achievements to your experiences section.',
                'Incorporate missing technical skills directly into your work bullets, not just a skills block.',
                'Match the action verbs used in the job description requirements.'
            ]
        });
    }
    catch (error) {
        console.error('Error calculating ATS score:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.calculateAtsScore = calculateAtsScore;
const generateCoverLetter = async (req, res) => {
    try {
        const { companyName, jobTitle, position, description, requirements } = req.body;
        if (!companyName || !jobTitle) {
            return res.status(400).json({ error: 'companyName and jobTitle are required.' });
        }
        const title = position || jobTitle;
        // Simulate generation of cover letter
        const letter = `Dear Hiring Team at ${companyName},

I am writing to express my strong interest in the ${title} position at your organization. With a proven track record of developing scalable applications and integrating robust database APIs, I am excited about the opportunity to contribute to ${companyName}'s growth and technological evolution.

Based on the requirements outlined for the role, my experience aligns perfectly with your goals:
- Expert proficiency in architecting modular components and setting up databases (PostgreSQL/Prisma).
- Demonstrated success leading complex feature integrations under tight deadlines.
- Commitment to building clean, responsive user interfaces that optimize conversion and pipeline interactions.

I admire ${companyName}'s position in the industry, and would love the opportunity to discuss how my skill set can support your technical teams. Thank you for your time and consideration.

Sincerely,
[Your Name]`;
        res.json({ letter });
    }
    catch (error) {
        console.error('Error generating cover letter:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.generateCoverLetter = generateCoverLetter;
const analyzeCompanyIntelligence = async (req, res) => {
    try {
        const { companyId } = req.body;
        if (!companyId) {
            return res.status(400).json({ error: 'companyId is required.' });
        }
        const company = await prisma_1.default.company.findUnique({
            where: { id: companyId }
        });
        if (!company) {
            return res.status(404).json({ error: 'Company not found.' });
        }
        // Auto-detect attributes or simulate defaults
        const name = company.companyName;
        const size = company.employeesCount || 120;
        const rev = company.annualRevenue || '$18M';
        const ind = company.industry;
        // Standard business logic ERP/HRMS suggestions based on size/industry
        let suggestedErp = 'NetSuite ERP';
        let suggestedHrms = 'BambooHR';
        if (size > 500) {
            suggestedErp = 'SAP S/4HANA Cloud';
            suggestedHrms = 'Workday Human Capital';
        }
        else if (ind.toLowerCase() === 'retail') {
            suggestedErp = 'Microsoft Dynamics 365';
            suggestedHrms = 'Gusto / Rippling';
        }
        else if (ind.toLowerCase() === 'school') {
            suggestedErp = 'Ellucian Banner';
            suggestedHrms = 'ADP Workforce Now';
        }
        // Generate cold email template
        const coldEmail = `Subject: Optimizing CRM efficiency at ${name}

Hi John,

I noticed ${name} is scaling operations in the ${ind} sector, and recently posted hiring signals for new technical team positions. With a company size of ~${size} employees, managing cross-system synchronization typically introduces hidden operational delays.

At LeadBond AI, we help mid-market teams automate platform pipelines, connecting CRM data directly to operations. 

Do you have 10 minutes next Tuesday at 2 PM to explore how we can optimize tracking loops for ${name}?

Best regards,
Sarah Jenkins
Sales Director, LeadBond AI`;
        res.json({
            companyName: name,
            industry: ind,
            estimatedStaff: size,
            estimatedRevenue: rev,
            suggestedErp,
            suggestedHrms,
            coldEmail
        });
    }
    catch (error) {
        console.error('Error analyzing company intelligence:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.analyzeCompanyIntelligence = analyzeCompanyIntelligence;
