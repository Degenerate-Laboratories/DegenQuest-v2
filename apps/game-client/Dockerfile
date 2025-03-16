# Use Node as the base image with ARM64 architecture
FROM --platform=linux/arm64 node:18

# Set working directory
WORKDIR /app

# Install SQLite dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    python3 \
    python3-distutils \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies - skip sqlite3 for now
RUN npm install --legacy-peer-deps --ignore-scripts
RUN npm install @colyseus/playground@0.15.4 --legacy-peer-deps

# Now install sqlite3 separately with forced rebuild
RUN npm uninstall sqlite3
RUN npm install sqlite3 --build-from-source --legacy-peer-deps

# Copy source files
COPY . .

# Expose a high port for local testing
EXPOSE 8888

# Set environment variables
ENV NODE_ENV=development
ENV PORT=8888

# Start the server in development mode
CMD ["npm", "run", "server-dev"] 