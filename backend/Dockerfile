FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS production-deps
RUN npm ci --omit=dev

FROM base AS build
RUN npm ci
COPY src ./src

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package*.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

CMD ["node", "src/server.js"]
