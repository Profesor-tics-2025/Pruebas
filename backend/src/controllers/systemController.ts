import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const health = async (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

export const logs = async (_req: Request, res: Response) => {
  const events = await prisma.systemEventLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  res.json(events);
};
