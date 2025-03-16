# Use Node as the base image
FROM --platform=linux/arm64 node:18

# Set working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    python3 \
    python3-distutils \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Build the client
RUN npm run client-build

# Create a simple Express server to serve the client files
RUN mkdir -p dist/server
RUN echo 'const express = require("express");' > dist/server/index.js
RUN echo 'const path = require("path");' >> dist/server/index.js
RUN echo 'require("dotenv").config();' >> dist/server/index.js
RUN echo 'const app = express();' >> dist/server/index.js
RUN echo 'const PORT = process.env.PORT || 3000;' >> dist/server/index.js
RUN echo 'const clientPath = path.join(__dirname, "../client");' >> dist/server/index.js
RUN echo 'app.use(express.static(clientPath));' >> dist/server/index.js
RUN echo 'app.get("*", (req, res) => {' >> dist/server/index.js
RUN echo '  res.sendFile(path.join(clientPath, "index.html"));' >> dist/server/index.js
RUN echo '});' >> dist/server/index.js
RUN echo 'app.listen(PORT, () => {' >> dist/server/index.js
RUN echo '  console.log(`Server running on port ${PORT}`);' >> dist/server/index.js
RUN echo '  console.log(`Serving static files from ${clientPath}`);' >> dist/server/index.js
RUN echo '});' >> dist/server/index.js

# Create a .env file for the server
RUN echo "GAME_SERVER_URL=ws://134.199.184.18:3000" > .env
RUN echo "PORT=3000" >> .env
RUN echo "NODE_ENV=production" >> .env

# Expose server port
EXPOSE 3000

# Start the server
CMD ["node", "dist/server/index.js"] 