"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatforms = exports.getUsers = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            orderBy: { fullName: 'asc' }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getUsers = getUsers;
const getPlatforms = async (req, res) => {
    try {
        const platforms = await prisma_1.default.sourcePlatform.findMany({
            orderBy: { platformName: 'asc' }
        });
        res.json(platforms);
    }
    catch (error) {
        console.error('Error fetching platforms:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getPlatforms = getPlatforms;
