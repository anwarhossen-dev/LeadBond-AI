"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesForecast = exports.createCampaign = exports.getCampaigns = exports.createActivity = exports.getActivities = exports.updateTaskStatus = exports.createTask = exports.getTasks = exports.createOpportunity = exports.getOpportunities = exports.updateContact = exports.createContact = exports.getContacts = exports.deleteDeal = exports.updateDeal = exports.createDeal = exports.getDeals = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const mail_service_1 = require("../services/mail.service");
// ─── Deals ─────────────────────────────────────────────────────────────────
const getDeals = async (req, res) => {
    try {
        const deals = await prisma_1.default.deal.findMany({
            include: { company: { select: { companyName: true, industry: true } }, assignee: { select: { fullName: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(deals);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getDeals = getDeals;
const createDeal = async (req, res) => {
    try {
        const { companyId, title, value, currency, stage, probability, expectedClose, assignedTo, notes } = req.body;
        if (!companyId || !title || !value || !assignedTo)
            return res.status(400).json({ error: 'Missing required fields' });
        const deal = await prisma_1.default.deal.create({
            data: { companyId, title, value, currency: currency || 'USD', stage: stage || 'Discovery', probability: probability || 10, expectedClose: expectedClose ? new Date(expectedClose) : null, assignedTo, notes }
        });
        res.status(201).json(deal);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createDeal = createDeal;
const updateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const deal = await prisma_1.default.deal.update({ where: { id }, data: req.body });
        res.json(deal);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updateDeal = updateDeal;
const deleteDeal = async (req, res) => {
    try {
        await prisma_1.default.deal.delete({ where: { id: req.params.id } });
        res.json({ message: 'Deal deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteDeal = deleteDeal;
// ─── Contacts ──────────────────────────────────────────────────────────────
const getContacts = async (req, res) => {
    try {
        const { search } = req.query;
        const where = {};
        if (search)
            where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
        const contacts = await prisma_1.default.contact.findMany({
            where,
            include: { company: { select: { companyName: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(contacts);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getContacts = getContacts;
const createContact = async (req, res) => {
    try {
        const { companyId, name, designation, email, phone, isDecisionMaker, department, linkedin, notes } = req.body;
        if (!companyId || !name)
            return res.status(400).json({ error: 'companyId and name required' });
        const contact = await prisma_1.default.contact.create({ data: { companyId, name, designation: designation || '', email: email || '', phone: phone || '', isDecisionMaker: !!isDecisionMaker, department, linkedin, notes } });
        res.status(201).json(contact);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createContact = createContact;
const updateContact = async (req, res) => {
    try {
        const contact = await prisma_1.default.contact.update({ where: { id: req.params.id }, data: req.body });
        res.json(contact);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updateContact = updateContact;
// ─── Opportunities ─────────────────────────────────────────────────────────
const getOpportunities = async (req, res) => {
    try {
        const opps = await prisma_1.default.opportunity.findMany({
            include: { company: { select: { companyName: true } }, contact: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(opps);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getOpportunities = getOpportunities;
const createOpportunity = async (req, res) => {
    try {
        const { companyId, contactId, title, description, expectedRevenue, probability, source, closeDate } = req.body;
        if (!companyId || !title || !expectedRevenue)
            return res.status(400).json({ error: 'Missing required fields' });
        const opp = await prisma_1.default.opportunity.create({ data: { companyId, contactId, title, description, expectedRevenue, probability: probability || 50, source, closeDate: closeDate ? new Date(closeDate) : null } });
        res.status(201).json(opp);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createOpportunity = createOpportunity;
// ─── Tasks ─────────────────────────────────────────────────────────────────
const getTasks = async (req, res) => {
    try {
        const tasks = await prisma_1.default.crmTask.findMany({
            include: { assignee: { select: { fullName: true } }, company: { select: { companyName: true } } },
            orderBy: { dueDate: 'asc' }
        });
        res.json(tasks);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res) => {
    try {
        const { title, description, type, priority, dueDate, assignedTo, companyId } = req.body;
        if (!title || !assignedTo)
            return res.status(400).json({ error: 'title and assignedTo required' });
        const task = await prisma_1.default.crmTask.create({ data: { title, description, type: type || 'Task', priority: priority || 'Medium', dueDate: dueDate ? new Date(dueDate) : null, assignedTo, companyId } });
        res.status(201).json(task);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createTask = createTask;
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await prisma_1.default.crmTask.update({ where: { id: req.params.id }, data: { status } });
        res.json(task);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updateTaskStatus = updateTaskStatus;
// ─── Activities ────────────────────────────────────────────────────────────
const getActivities = async (req, res) => {
    try {
        const { companyId } = req.query;
        const where = {};
        if (companyId)
            where.companyId = companyId;
        const activities = await prisma_1.default.crmActivity.findMany({
            where,
            include: { user: { select: { fullName: true } }, company: { select: { companyName: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(activities);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getActivities = getActivities;
const createActivity = async (req, res) => {
    try {
        const { type, title, description, companyId, dealId, userId } = req.body;
        if (!type || !title || !userId)
            return res.status(400).json({ error: 'type, title, userId required' });
        const activity = await prisma_1.default.crmActivity.create({ data: { type, title, description, companyId, dealId, userId } });
        res.status(201).json(activity);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createActivity = createActivity;
// ─── Email Campaigns ───────────────────────────────────────────────────────
const getCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma_1.default.emailCampaign.findMany({
            include: { creator: { select: { fullName: true } }, _count: { select: { recipients: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(campaigns);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getCampaigns = getCampaigns;
const createCampaign = async (req, res) => {
    try {
        const { name, subject, body, createdBy, recipientIds, toEmail } = req.body;
        if (!name || !subject || !body || !createdBy)
            return res.status(400).json({ error: 'Missing required fields' });
        // 1. Create campaign record (initial status Sending)
        const campaign = await prisma_1.default.emailCampaign.create({
            data: { name, subject, body, createdBy, status: 'Sending' }
        });
        let sentCount = 0;
        if (toEmail) {
            // 2a. Send to a single manual email address
            try {
                const html = `
          <div style="font-family: sans-serif; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto;">
            <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.7; color: #334155;">${body}</div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">Sent via LeadBond AI Sales CRM. To unsubscribe, reply with 'Remove'.</p>
          </div>
        `;
                await (0, mail_service_1.sendEmail)(toEmail, subject, html);
                // Try to associate with an existing contact if email matches
                const contact = await prisma_1.default.contact.findFirst({ where: { email: toEmail } });
                if (contact) {
                    await prisma_1.default.campaignRecipient.create({
                        data: {
                            campaignId: campaign.id,
                            contactId: contact.id,
                            status: 'Sent',
                            sentAt: new Date()
                        }
                    });
                }
                sentCount = 1;
            }
            catch (err) {
                console.error(`Failed to send manual campaign email to ${toEmail}:`, err);
            }
        }
        else {
            // 2b. Send to multiple contacts from DB
            let contacts;
            if (recipientIds && Array.isArray(recipientIds) && recipientIds.length > 0) {
                contacts = await prisma_1.default.contact.findMany({
                    where: { id: { in: recipientIds } }
                });
            }
            else {
                contacts = await prisma_1.default.contact.findMany();
            }
            for (const contact of contacts) {
                if (!contact.email)
                    continue;
                try {
                    const html = `
            <div style="font-family: sans-serif; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto;">
              <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.7; color: #334155;">${body}</div>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="font-size: 11px; color: #94a3b8; text-align: center;">Sent via LeadBond AI Sales CRM. To unsubscribe, reply with 'Remove'.</p>
            </div>
          `;
                    await (0, mail_service_1.sendEmail)(contact.email, subject, html);
                    await prisma_1.default.campaignRecipient.create({
                        data: {
                            campaignId: campaign.id,
                            contactId: contact.id,
                            status: 'Sent',
                            sentAt: new Date()
                        }
                    });
                    sentCount++;
                }
                catch (err) {
                    console.error(`Failed to send campaign email to ${contact.email}:`, err);
                    await prisma_1.default.campaignRecipient.create({
                        data: {
                            campaignId: campaign.id,
                            contactId: contact.id,
                            status: 'Failed'
                        }
                    });
                }
            }
        }
        // 4. Update campaign status and sent totals
        const updatedCampaign = await prisma_1.default.emailCampaign.update({
            where: { id: campaign.id },
            data: {
                status: sentCount > 0 ? 'Sent' : 'Failed',
                sentAt: new Date(),
                totalSent: sentCount
            },
            include: { creator: { select: { fullName: true } } }
        });
        res.status(201).json(updatedCampaign);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createCampaign = createCampaign;
// ─── Sales Forecast (simple aggregate) ────────────────────────────────────
const getSalesForecast = async (req, res) => {
    try {
        const deals = await prisma_1.default.deal.findMany();
        const totalPipeline = deals.reduce((s, d) => s + Number(d.value), 0);
        const weighted = deals.reduce((s, d) => s + Number(d.value) * (d.probability / 100), 0);
        const wonDeals = deals.filter(d => d.stage === 'Won');
        const wonRevenue = wonDeals.reduce((s, d) => s + Number(d.value), 0);
        const byStage = deals.reduce((acc, d) => { acc[d.stage] = (acc[d.stage] || 0) + Number(d.value); return acc; }, {});
        res.json({ totalPipeline, weightedForecast: Math.round(weighted), wonRevenue, dealCount: deals.length, wonCount: wonDeals.length, byStage });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getSalesForecast = getSalesForecast;
