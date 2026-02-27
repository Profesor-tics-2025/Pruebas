import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

export const VIDEO_QUEUE = 'video-processing';

export const videoQueue = new Queue(VIDEO_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: 50,
    removeOnFail: 100
  }
});
