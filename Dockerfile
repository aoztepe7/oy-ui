# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Image hosts are baked into next.config at build time.
ARG NEXT_PUBLIC_MEDIA_HOST=""
# Used in canonical/OpenGraph URLs of pages prerendered at build time.
ARG SITE_URL=https://okulumyeryuzu.com
ENV SITE_URL=$SITE_URL
ENV NEXT_PUBLIC_MEDIA_HOST=$NEXT_PUBLIC_MEDIA_HOST
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The API is not reachable here; pages are prerendered with fallback content
# and refresh from the API at runtime.
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    API_URL=http://localhost:8080 \
    SITE_URL=https://okulumyeryuzu.com \
    REVALIDATE_SECRET=""

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
