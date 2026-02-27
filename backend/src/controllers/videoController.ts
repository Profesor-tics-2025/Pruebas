import type { TaskType, VideoStatus } from '@prisma/client';
import { Request, Response } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { recommendProvider } from '../services/recommendationService.js';
import { videoQueue } from '../services/queue.js';

const taskSchema = z.object({
  taskType: z.enum(['TRANSCRIPTION', 'OBJECT_DETECTION', 'FACE_RECOGNITION'])
});

export const uploadVideo = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });

  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) {
    await fs.unlink(req.file.path);
    return res.status(400).json({ error: 'taskType inválido' });
  }

  const taskType = parsed.data.taskType as TaskType;
  const recommendation = recommendProvider(taskType);

  const video = await prisma.video.create({
    data: {
      originalName: req.file.originalname,
      storagePath: req.file.path,
      sizeBytes: req.file.size,
      taskType,
      status: 'QUEUED' as any,
      userId: req.user!.id
    }
  });

  const job = await prisma.processingJob.create({
    data: {
      videoId: video.id,
      recommendedAi: recommendation.primary,
      fallbackChain: JSON.stringify(recommendation.fallbacks)
    }
  });

  const queueJob = await videoQueue.add('process-video', {
    videoId: video.id,
    providers: [recommendation.primary, ...recommendation.fallbacks],
    taskType,
    filePath: path.resolve(req.file.path),
    processingJobId: job.id
  });

  await prisma.processingJob.update({ where: { id: job.id }, data: { queueJobId: String(queueJob.id) } });

  res.status(201).json({ videoId: video.id, jobId: job.id, recommendation });
};

export const listVideos = async (req: Request, res: Response) => {
  const videos = await prisma.video.findMany({
    where: { userId: req.user!.id },
    include: { jobs: true, result: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json(videos);
};

export const getMetrics = async (req: Request, res: Response) => {
  const base = { userId: req.user!.id };
  const [total, completed, failed, processing] = await Promise.all([
    prisma.video.count({ where: base }),
    prisma.video.count({ where: { ...base, status: 'COMPLETED' as any } }),
    prisma.video.count({ where: { ...base, status: 'FAILED' as any } }),
    prisma.video.count({ where: { ...base, status: 'PROCESSING' as any } })
  ]);

  res.json({ total, completed, failed, processing });
};
