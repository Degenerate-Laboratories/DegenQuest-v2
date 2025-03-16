#!/bin/bash

# Use vercel-package.json for Vercel builds
cp vercel-package.json package.json

# Install with npm
echo "Installing dependencies with npm..."
npm install --no-package-lock --force

# Set correct environment variables
echo "GAME_SERVER_URL=ws://134.199.184.18" > .env
echo "NODE_ENV=production" >> .env

# Run the client build
echo "Building client..."
npm run client-build

# Show output directory contents for debugging
echo "Build output:"
ls -la dist/client 