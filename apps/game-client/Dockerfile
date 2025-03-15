# Use Node.js LTS as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app/apps/game-client

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src/

# Expose the port the server runs on
EXPOSE 3000

# Start the server in development mode
CMD ["npm", "run", "server-dev"] 