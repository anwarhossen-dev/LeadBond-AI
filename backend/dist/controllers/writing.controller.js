"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentTypes = exports.generateAiReply = exports.generateDocument = void 0;
// Shared tone-aware text generator helper
const buildDoc = (type, ctx) => {
    const { name = '[Your Name]', target = 'the company', role = 'the position', skills = '', tone = 'professional' } = ctx;
    const intros = {
        resume: `RESUME\n\n${name}\n${'─'.repeat(50)}\n\nPROFESSIONAL SUMMARY\nResults-driven professional with expertise in ${skills || 'relevant industry skills'}. Proven ability to deliver high-impact outcomes.`,
        cover_letter: `Dear Hiring Team at ${target},\n\nI am writing to express my strong interest in the ${role} position.`,
        email: `Subject: ${role} Opportunity — ${name}\n\nHi [Recipient],\n\nI hope this message finds you well.`,
        proposal: `BUSINESS PROPOSAL\n\nPrepared for: ${target}\nPrepared by: ${name}\nDate: ${new Date().toLocaleDateString()}\n\n${'═'.repeat(50)}\n\nEXECUTIVE SUMMARY`,
        business_letter: `${name}\n${new Date().toLocaleDateString()}\n\nTo: ${target}\n\nDear Sir/Madam,\n\nRe: ${role}`,
        contract: `SERVICE AGREEMENT\n\nThis Agreement is entered into between ${name} ("Service Provider") and ${target} ("Client") effective ${new Date().toLocaleDateString()}.`,
        meeting_agenda: `MEETING AGENDA\n\nDate: ${new Date().toLocaleDateString()}\nMeeting: ${role}\nOrganized by: ${name}\n\n${'─'.repeat(50)}\n\n1. Opening & Introductions (5 mins)\n2. Review of Previous Action Items (10 mins)\n3. Main Discussion: ${role} (20 mins)\n4. Key Decisions & Resolutions (10 mins)\n5. Next Steps & Action Items (10 mins)\n6. AOB & Close`,
        meeting_summary: `MEETING SUMMARY\n\nDate: ${new Date().toLocaleDateString()}\nMeeting: ${role}\nFacilitator: ${name}\n\n${'─'.repeat(50)}\n\nKEY DISCUSSION POINTS\n• ${skills || 'Key topics discussed during the session'}\n\nDECISIONS MADE\n• [Decision 1]\n• [Decision 2]\n\nACTION ITEMS\n• [Owner] — [Action] — Due: [Date]\n\nNEXT MEETING: [Date & Time]`,
        report: `${role.toUpperCase()} REPORT\n\nPrepared by: ${name}\nDate: ${new Date().toLocaleDateString()}\n\n${'═'.repeat(50)}\n\nEXECUTIVE SUMMARY\n[Summary of key findings and recommendations]\n\nKEY METRICS\n• [Metric 1]\n• [Metric 2]\n\nANALYSIS\n[Detailed analysis section]\n\nCONCLUSION\n[Final conclusion and next steps]`,
        blog: `BLOG POST\n\n${role}\nBy ${name}\n\n${'─'.repeat(50)}\n\nINTRODUCTION\n[Hook the reader with a compelling opening statement about ${role}.]\n\nMAIN CONTENT\n[Detailed exploration of the topic with supporting points]\n\nKEY TAKEAWAYS\n• [Point 1]\n• [Point 2]\n\nCONCLUSION\n[Summary and call to action]`,
        linkedin_post: `🚀 ${role}\n\nHere's what I've learned about ${skills || 'this topic'}...\n\n${target ? `Working with ${target} has taught me` : 'My experience has shown'} that the key to success is:\n\n✅ [Key insight 1]\n✅ [Key insight 2]\n✅ [Key insight 3]\n\nWhat are your thoughts? Drop a comment below! 👇\n\n#${(role || 'career').replace(/\s+/g, '')} #ProfessionalGrowth #LeadBondAI`,
    };
    const bodies = {
        resume: `\n\nEXPERIENCE\n[Company Name] | [Role] | [Dates]\n• [Achievement with quantified impact]\n• [Key responsibility]\n\nEDUCATION\n[Degree] | [Institution] | [Year]\n\nSKILLS\n${skills || '[Technical & soft skills]'}`,
        cover_letter: `\n\nWith ${skills ? `expertise in ${skills}` : 'strong industry experience'}, I am confident in my ability to make a meaningful contribution to ${target}.\n\nMy key strengths relevant to this role include:\n• Strong analytical and communication skills\n• Proven track record of delivering results\n• Passion for innovation and continuous improvement\n\nI would welcome the opportunity to discuss how I can contribute to your team.\n\nSincerely,\n${name}`,
        email: `\n\nI am reaching out regarding the ${role} opportunity at ${target}. My background in ${skills || 'relevant skills'} aligns closely with your requirements.\n\nI would welcome the opportunity to discuss this further.\n\nBest regards,\n${name}`,
        proposal: `\n\nWe are pleased to present this proposal for ${role}. This document outlines our approach, deliverables, and investment required.\n\nSCOPE OF WORK\n• [Deliverable 1]\n• [Deliverable 2]\n\nTIMELINE\nPhase 1: [Duration]\nPhase 2: [Duration]\n\nINVESTMENT\n[Pricing details]\n\nWhy Choose Us:\n• ${skills || 'Proven expertise and reliability'}\n\nWe look forward to partnering with ${target}.`,
        business_letter: `\n\nI am writing on behalf of ${name} regarding ${role}.\n\n[Body of letter]\n\nYours faithfully,\n${name}`,
        contract: `\n\n1. SERVICES\nService Provider agrees to provide the following services: ${skills || '[Services description]'}\n\n2. PAYMENT\nClient agrees to pay [Amount] within [Payment terms].\n\n3. TERM\nThis agreement commences on [Start Date] and continues for [Duration].\n\n4. CONFIDENTIALITY\nBoth parties agree to maintain confidentiality of all shared information.\n\n5. TERMINATION\nEither party may terminate with [Notice period] written notice.\n\nSIGNATURES\n___________________          ___________________\n${name}                          ${target}`,
        meeting_agenda: '',
        meeting_summary: '',
        report: '',
        blog: '',
        linkedin_post: '',
    };
    return (intros[type] || `[${type.toUpperCase()} DOCUMENT]`) + (bodies[type] !== undefined ? bodies[type] : '');
};
const generateDocument = async (req, res) => {
    try {
        const { docType, name, target, role, skills, tone } = req.body;
        if (!docType)
            return res.status(400).json({ error: 'docType is required' });
        const content = buildDoc(docType, { name, target, role, skills, tone });
        res.json({ content, docType, generatedAt: new Date().toISOString() });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.generateDocument = generateDocument;
const generateAiReply = async (req, res) => {
    try {
        const { originalEmail, tone = 'professional' } = req.body;
        if (!originalEmail)
            return res.status(400).json({ error: 'originalEmail is required' });
        const reply = `Hi [Recipient],\n\nThank you for your email. I've reviewed the details and would like to respond as follows:\n\n[AI-generated ${tone} reply based on the original email content]\n\nPlease let me know if you need any additional information.\n\nBest regards,\n[Your Name]`;
        res.json({ reply, tone });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.generateAiReply = generateAiReply;
const getDocumentTypes = async (_req, res) => {
    res.json([
        { id: 'resume', label: 'AI Resume Builder', icon: '📄', category: 'Career' },
        { id: 'cover_letter', label: 'AI Cover Letter', icon: '✉️', category: 'Career' },
        { id: 'email', label: 'AI Email Writer', icon: '📧', category: 'Communication' },
        { id: 'proposal', label: 'AI Proposal Writer', icon: '📋', category: 'Business' },
        { id: 'business_letter', label: 'AI Business Letter', icon: '🏢', category: 'Business' },
        { id: 'contract', label: 'AI Contract Draft', icon: '⚖️', category: 'Legal' },
        { id: 'meeting_agenda', label: 'AI Meeting Agenda', icon: '📅', category: 'Productivity' },
        { id: 'meeting_summary', label: 'AI Meeting Summary', icon: '📝', category: 'Productivity' },
        { id: 'report', label: 'AI Report Generator', icon: '📊', category: 'Analytics' },
        { id: 'blog', label: 'AI Blog Writer', icon: '✍️', category: 'Marketing' },
        { id: 'linkedin_post', label: 'AI LinkedIn Post', icon: '💼', category: 'Social' },
    ]);
};
exports.getDocumentTypes = getDocumentTypes;
