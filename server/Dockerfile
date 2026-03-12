# ─── Backend Dockerfile ──────────────────────────────────────────────────────
# Node.js 20 Alpine — small image, production-only deps
FROM node:20-alpine

# Install dumb-init for proper signal handling (graceful shutdown)
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy dependency manifests first so Docker layer cache is reused
# when only source files change
COPY package*.json ./

# Install production deps only (no nodemon etc.)
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

# App listens on 3000
EXPOSE 3000

# Run as non-root user for security
USER node

# dumb-init ensures signals (SIGTERM) propagate to node correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
