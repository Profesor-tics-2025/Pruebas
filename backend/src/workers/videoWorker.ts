import type { VideoStatus } from '@prisma/client';
import { Worker } from 'bullmq';
import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { executeWithRetry } from '../services/aiProviders.js';
import { VIDEO_QUEUE } from '../services/queue.js';

new Worker(
  VIDEO_QUEUE,
  async (job) => {
    const { videoId, providers, taskType, filePath, processingJobId } = job.data as {
      videoId: string;
      providers: string[];
      taskType: string;
      filePath: string;
      processingJobId: string;
    };

    await prisma.video.update({ where: { id: videoId }, data: { status: 'PROCESSING' as any } });
    await prisma.processingJob.update({ where: { id: processingJobId }, data: { attempts: job.attemptsStarted, startedAt: new Date() } });

    try {
      const result = await executeWithRetry(providers, filePath, taskType);

      await prisma.processingResult.upsert({
        where: { videoId },
        update: {
          providerUsed: result.provider,
          confidenceScore: result.confidenceScore,
          payloadJson: result.payload as any
        },
        create: {
          videoId,
          providerUsed: result.provider,
          confidenceScore: result.confidenceScore,
          payloadJson: result.payload as any
        }
      });

      await prisma.video.update({ where: { id: videoId }, data: { status: 'COMPLETED' as any } });
      await prisma.processingJob.update({ where: { id: processingJobId }, data: { finishedAt: new Date(), lastError: null } });
      await prisma.systemEventLog.create({
        data: { level: 'info', message: 'Video procesado', context: { videoId, provider: result.provider } }
      });
    } catch (error) {
      const errMsg = (error as Error).message;
      await prisma.video.update({ where: { id: videoId }, data: { status: 'FAILED' as any } });
      await prisma.processingJob.update({ where: { id: processingJobId }, data: { lastError: errMsg, finishedAt: new Date() } });
      await prisma.systemEventLog.create({
        data: { level: 'error', message: 'Error de procesamiento', context: { videoId, error: errMsg } }
      });
      throw error;
    }
  },
  { connection: redis, concurrency: 4 }
);

console.log('Worker iniciado');
