# ─── Frontend Dockerfile (multi-stage) ──────────────────────────────────────
#
# Stage 1 — Build React app with Vite
# Stage 2 — Serve with Nginx (tiny alpine image, no Node runtime)
#
# VITE_BASE_URL is intentionally empty so all API calls are relative paths
# (e.g. /api/portfolios). Nginx proxies /api/* → backend:3000 internally,
# so the backend is never exposed on a public port.

# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build arg lets docker-compose override VITE_BASE_URL at build time.
# Leave empty so all API requests become relative → nginx proxies them.
ARG VITE_BASE_URL=""
ENV VITE_BASE_URL=$VITE_BASE_URL

RUN npm run build

# ── Stage 2: Nginx ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
