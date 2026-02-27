import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { login, me, register } from '../controllers/authController.js';
import { health, logs } from '../controllers/systemController.js';
import { getMetrics, listVideos, uploadVideo } from '../controllers/videoController.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const uploadDir = path.resolve(env.UPLOAD_DIR);
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_VIDEO_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) return cb(null, true);
    cb(new Error('Solo videos permitidos'));
  }
});

const router = Router();

router.get('/health', health);
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', requireAuth, me);
router.get('/videos', requireAuth, listVideos);
router.get('/videos/metrics', requireAuth, getMetrics);
router.post('/videos/upload', requireAuth, upload.single('video'), uploadVideo);
router.get('/admin/logs', requireAuth, logs);

router.get('/docs/user', (_req, res) => {
  res.json({
    title: 'Guía de usuario',
    steps: [
      '1. Regístrate o inicia sesión.',
      '2. Sube un video y elige la tarea de IA.',
      '3. Revisa estado y resultados en el dashboard.',
      '4. Si falla un proveedor, el sistema reintenta automáticamente.'
    ]
  });
});

export default router;
