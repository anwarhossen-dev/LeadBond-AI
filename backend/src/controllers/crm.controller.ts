import { Request, Response } from 'express';
import prisma from '../prisma';

// ─── Deals ─────────────────────────────────────────────────────────────────

export const getDeals = async (req: Request, res: Response) => {
  try {
    const deals = await prisma.deal.findMany({
      include: { company: { select: { companyName: true, industry: true } }, assignee: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(deals);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const createDeal = async (req: Request, res: Response) => {
  try {
    const { companyId, title, value, currency, stage, probability, expectedClose, assignedTo, notes } = req.body;
    if (!companyId || !title || !value || !assignedTo) return res.status(400).json({ error: 'Missing required fields' });
    const deal = await prisma.deal.create({
      data: { companyId, title, value, currency: currency || 'USD', stage: stage || 'Discovery', probability: probability || 10, expectedClose: expectedClose ? new Date(expectedClose) : null, assignedTo, notes }
    });
    res.status(201).json(deal);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const updateDeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deal = await prisma.deal.update({ where: { id }, data: req.body });
    res.json(deal);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const deleteDeal = async (req: Request, res: Response) => {
  try {
    await prisma.deal.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deal deleted' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── Contacts ──────────────────────────────────────────────────────────────

export const getContacts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) where.OR = [{ name: { contains: search as string, mode: 'insensitive' } }, { email: { contains: search as string, mode: 'insensitive' } }];
    const contacts = await prisma.contact.findMany({
      where,
      include: { company: { select: { companyName: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(contacts);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const { companyId, name, designation, email, phone, isDecisionMaker, department, linkedin, notes } = req.body;
    if (!companyId || !name) return res.status(400).json({ error: 'companyId and name required' });
    const contact = await prisma.contact.create({ data: { companyId, name, designation: designation || '', email: email || '', phone: phone || '', isDecisionMaker: !!isDecisionMaker, department, linkedin, notes } });
    res.status(201).json(contact);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const contact = await prisma.contact.update({ where: { id: req.params.id }, data: req.body });
    res.json(contact);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── Opportunities ─────────────────────────────────────────────────────────

export const getOpportunities = async (req: Request, res: Response) => {
  try {
    const opps = await prisma.opportunity.findMany({
      include: { company: { select: { companyName: true } }, contact: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(opps);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const createOpportunity = async (req: Request, res: Response) => {
  try {
    const { companyId, contactId, title, description, expectedRevenue, probability, source, closeDate } = req.body;
    if (!companyId || !title || !expectedRevenue) return res.status(400).json({ error: 'Missing required fields' });
    const opp = await prisma.opportunity.create({ data: { companyId, contactId, title, description, expectedRevenue, probability: probability || 50, source, closeDate: closeDate ? new Date(closeDate) : null } });
    res.status(201).json(opp);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── Tasks ─────────────────────────────────────────────────────────────────

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.crmTask.findMany({
      include: { assignee: { select: { fullName: true } }, company: { select: { companyName: true } } },
      orderBy: { dueDate: 'asc' }
    });
    res.json(tasks);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, type, priority, dueDate, assignedTo, companyId } = req.body;
    if (!title || !assignedTo) return res.status(400).json({ error: 'title and assignedTo required' });
    const task = await prisma.crmTask.create({ data: { title, description, type: type || 'Task', priority: priority || 'Medium', dueDate: dueDate ? new Date(dueDate) : null, assignedTo, companyId } });
    res.status(201).json(task);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const task = await prisma.crmTask.update({ where: { id: req.params.id }, data: { status } });
    res.json(task);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── Activities ────────────────────────────────────────────────────────────

export const getActivities = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const activities = await prisma.crmActivity.findMany({
      where,
      include: { user: { select: { fullName: true } }, company: { select: { companyName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(activities);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const createActivity = async (req: Request, res: Response) => {
  try {
    const { type, title, description, companyId, dealId, userId } = req.body;
    if (!type || !title || !userId) return res.status(400).json({ error: 'type, title, userId required' });
    const activity = await prisma.crmActivity.create({ data: { type, title, description, companyId, dealId, userId } });
    res.status(201).json(activity);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── Email Campaigns ───────────────────────────────────────────────────────

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.emailCampaign.findMany({
      include: { creator: { select: { fullName: true } }, _count: { select: { recipients: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const { name, subject, body, createdBy } = req.body;
    if (!name || !subject || !body || !createdBy) return res.status(400).json({ error: 'Missing required fields' });
    const campaign = await prisma.emailCampaign.create({ data: { name, subject, body, createdBy } });
    res.status(201).json(campaign);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};

// ─── Sales Forecast (simple aggregate) ────────────────────────────────────

export const getSalesForecast = async (req: Request, res: Response) => {
  try {
    const deals = await prisma.deal.findMany({ where: { deletedAt: null } });
    const totalPipeline = deals.reduce((s, d) => s + Number(d.value), 0);
    const weighted = deals.reduce((s, d) => s + Number(d.value) * (d.probability / 100), 0);
    const wonDeals = deals.filter(d => d.stage === 'Won');
    const wonRevenue = wonDeals.reduce((s, d) => s + Number(d.value), 0);
    const byStage = deals.reduce((acc: any, d) => { acc[d.stage] = (acc[d.stage] || 0) + Number(d.value); return acc; }, {});
    res.json({ totalPipeline, weightedForecast: Math.round(weighted), wonRevenue, dealCount: deals.length, wonCount: wonDeals.length, byStage });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal Server Error' }); }
};
