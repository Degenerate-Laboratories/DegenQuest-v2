# Use Bun as the base image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy everything at once
COPY . .

# Install dependencies using Bun
RUN cd apps/game-client && bun install

# Build the client using Bun directly
RUN cd apps/game-client && \
    bun build src/client/index.ts --outdir dist/client --target browser && \
    bun run server-build && \
    mkdir -p dist/client && \
    cp -r public/* dist/client/

# Expose the default port (adjust if needed)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the server
CMD ["bun", "run", "--cwd", "apps/game-client", "server-start"] 