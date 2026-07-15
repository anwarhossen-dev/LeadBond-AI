"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const JWT_SECRET = process.env.JWT_SECRET || 'leadbond_super_secret_key';
const register = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'Full name, email, and password are required' });
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                fullName,
                email,
                password: passwordHash,
                role: role || 'SalesRep'
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        // Auto-hash password for seeded users who don't have it set yet
        if (!user.password) {
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: { password: passwordHash }
            });
        }
        else {
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getProfile = getProfile;
