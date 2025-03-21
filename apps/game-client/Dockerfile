# Use Bun runtime with AMD64 architecture
FROM --platform=linux/amd64 oven/bun:latest

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
RUN bun install --legacy-peer-deps

# Copy the rest of the app
COPY ./apps/game-client/ ./

# Create data directory
RUN mkdir -p /data && chmod 777 /data

# Create an empty database file instead of copying one
RUN touch /data/database.db && chmod 666 /data/database.db

# Expose port 8888
EXPOSE 8888

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8888
ENV DB_PATH=/data/database.db

# Start the server with Bun
CMD ["bun", "run", "server-start"] 