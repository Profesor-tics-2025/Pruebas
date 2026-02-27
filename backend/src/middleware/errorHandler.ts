import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger.js';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Error interno' });
};
