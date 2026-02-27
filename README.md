# AI Video Processing Platform

Aplicación full-stack para subir videos y procesarlos con IA usando colas asíncronas, recomendaciones automáticas de proveedor y dashboard con métricas.

## Stack
- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript + Prisma + BullMQ
- DB: PostgreSQL
- Queue: Redis
- Storage: Local (extensible a S3/MinIO)

## Inicio rápido
1. Copiar variables:
   ```bash
   cp .env.example .env
   ```
2. Levantar infraestructura:
   ```bash
   docker compose up -d postgres redis
   ```
3. Backend:
   ```bash
   cd backend
   npm install
   npm run prisma:migrate
   npm run dev
   ```
4. Worker (nueva terminal):
   ```bash
   cd backend
   npm run worker
   ```
5. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Módulos incluidos
- Autenticación JWT (registro/login/perfil)
- Upload y gestión de videos
- Sistema de colas asíncrono con reintentos
- Recomendador de modelo/proveedor IA
- Adaptadores para OpenAI, Google Vision, AWS Rekognition, Hugging Face (stubs listos para key real)
- Logs estructurados y endpoint de salud
- Dashboard responsive, métricas y documentación in-app
