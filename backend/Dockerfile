FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy sources and generate Prisma client
COPY . .
RUN npm run prisma:generate
RUN npm run build

# Production image - use debian-based instead of alpine for better OpenSSL compatibility
FROM node:20-slim AS runtime
WORKDIR /app

COPY package*.json ./
RUN npm install --production
COPY prisma ./prisma# copy Prisma client and engine from build stage
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/clientCOPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/dist ./dist

EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
