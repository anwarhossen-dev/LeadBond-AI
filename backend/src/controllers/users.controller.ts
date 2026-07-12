import { Request, Response } from 'express';
import prisma from '../prisma';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { fullName: 'asc' }
    });
    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPlatforms = async (req: Request, res: Response) => {
  try {
    const platforms = await prisma.sourcePlatform.findMany({
      orderBy: { platformName: 'asc' }
    });
    res.json(platforms);
  } catch (error: any) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
