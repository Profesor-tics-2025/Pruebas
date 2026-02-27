import * as Redis from 'ioredis';
import { env } from './env.js';

// @ts-ignore
export const redis = new Redis.default(env.REDIS_URL, { maxRetriesPerRequest: null });
