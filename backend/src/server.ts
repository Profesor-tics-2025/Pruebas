import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
// @ts-ignore
app.use(pinoHttp({ logger }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use('/api', routes);
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`API lista en http://localhost:${env.PORT}`);
});
