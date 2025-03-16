# Use Node.js 20 as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy the game-client package.json
COPY apps/game-client/package.json ./apps/game-client/

# Install dependencies first
RUN pnpm install

# Copy all other necessary files
COPY apps ./apps
COPY packages ./packages
COPY public ./public
COPY content ./content

# Rebuild dependencies with all source files present
RUN pnpm install --force

# Build the client and server
RUN cd apps/game-client && pnpm run client-build && pnpm run server-build

# Expose the default port (adjust if needed)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the server
CMD ["pnpm", "--filter", "t5c", "run", "server-start"] 