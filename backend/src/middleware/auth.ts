import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' });

  try {
    const token = auth.replace('Bearer ', '');
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string; role: 'USER' | 'ADMIN' };
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
