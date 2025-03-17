# Use Node as the base image with AMD64 architecture
FROM --platform=linux/amd64 node:18-slim

# Set working directory
WORKDIR /app

# Install SQLite dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    python3 \
    python3-distutils \
    build-essential \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# First copy just package files to leverage Docker cache
COPY ./apps/game-client/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps && \
    npm install sqlite3 --build-from-source --legacy-peer-deps

# Copy the rest of the app
COPY ./apps/game-client/ ./

# Expose port 8888
EXPOSE 8888

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8888

# Start the server
CMD ["npm", "run", "server-dev"] 