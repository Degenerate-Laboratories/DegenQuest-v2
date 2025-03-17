# Use Node as the base image with ARM64 architecture
FROM --platform=linux/amd64 node:18-slim

# Set working directory
WORKDIR /app

# Install SQLite dependencies (combined into one RUN to reduce layers)
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    python3 \
    python3-distutils \
    build-essential \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first (for better layer caching)
COPY package.json package-lock.json ./

# Split npm installs to leverage caching
# Install dependencies except sqlite3 (which needs special handling)
RUN npm ci --legacy-peer-deps --ignore-scripts --only=production && \
    npm install @colyseus/playground@0.15.4 --legacy-peer-deps --only=production && \
    npm install sqlite3 --build-from-source --legacy-peer-deps

# Copy only necessary source files (exclude node_modules, .git, etc)
COPY apps ./apps
COPY config ./config
COPY tsconfig.json ./

# Expose a high port for local testing
EXPOSE 8888

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8888

# Start the server in development mode
CMD ["npm", "run", "server-dev"] 