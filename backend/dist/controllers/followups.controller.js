"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFollowupStatus = exports.createFollowup = exports.getFollowups = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getFollowups = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = {};
        if (status && status !== 'All') {
            whereClause.status = status;
        }
        const followups = await prisma_1.default.followup.findMany({
            where: whereClause,
            include: {
                company: {
                    select: { companyName: true }
                },
                jobApplication: {
                    select: { jobTitle: true }
                },
                user: {
                    select: { fullName: true }
                }
            },
            orderBy: {
                followUpDate: 'asc'
            }
        });
        const result = followups.map(f => ({
            id: f.id,
            companyId: f.companyId,
            companyName: f.company?.companyName || f.jobApplication?.jobTitle || 'General Followup',
            agentName: f.user.fullName,
            note: f.note,
            followUpDate: f.followUpDate,
            status: f.status
        }));
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching followups:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getFollowups = getFollowups;
const createFollowup = async (req, res) => {
    try {
        const { companyId, jobApplicationId, userId, note, followUpDate } = req.body;
        if (!userId || !note || !followUpDate) {
            return res.status(400).json({ error: 'userId, note, and followUpDate are required.' });
        }
        const newFollowup = await prisma_1.default.followup.create({
            data: {
                companyId: companyId || null,
                jobApplicationId: jobApplicationId || null,
                userId,
                note,
                followUpDate: new Date(followUpDate),
                status: 'Pending'
            },
            include: {
                company: { select: { companyName: true } },
                jobApplication: { select: { jobTitle: true } },
                user: { select: { fullName: true } }
            }
        });
        res.status(201).json({
            id: newFollowup.id,
            companyId: newFollowup.companyId,
            companyName: newFollowup.company?.companyName || newFollowup.jobApplication?.jobTitle || 'General Followup',
            agentName: newFollowup.user.fullName,
            note: newFollowup.note,
            followUpDate: newFollowup.followUpDate,
            status: newFollowup.status
        });
    }
    catch (error) {
        console.error('Error creating followup:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createFollowup = createFollowup;
const updateFollowupStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'Missing status parameter.' });
        }
        const followup = await prisma_1.default.followup.findUnique({
            where: { id }
        });
        if (!followup) {
            return res.status(404).json({ error: 'Followup not found' });
        }
        const updated = await prisma_1.default.followup.update({
            where: { id },
            data: { status }
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating followup status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updateFollowupStatus = updateFollowupStatus;
