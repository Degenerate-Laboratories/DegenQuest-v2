#!/bin/bash
set -e

echo "=== DEBUGGING INFO ==="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Copy our simplified package.json to avoid pnpm issues
echo "=== SETUP PACKAGE.JSON ==="
cp vercel-package.json package.json

# Copy production env variables
echo "=== SETUP ENV VARIABLES ==="
cp .env.production .env
cat .env

# Install dependencies
echo "=== INSTALLING DEPENDENCIES ==="
npm install --no-package-lock --force

# Show environment before building
echo "=== ENVIRONMENT VARIABLES ==="
# Important: This reveals env vars, but only build-time ones
env | grep -v "TOKEN\|SECRET\|PASSWORD\|KEY" | sort

# Run the client build with timeout to prevent Vercel from killing the build
echo "=== BUILDING CLIENT (TIMEOUT: 5m) ==="
npm run client-build || {
  echo "Build failed! Error code: $?"
  echo "Webpack may have stalled - check dependencies and configuration"
  exit 1
}

# Create the output directory if it doesn't exist
echo "=== CREATING OUTPUT DIRECTORY ==="
mkdir -p dist/client

# Copy necessary files if they don't exist
echo "=== CHECKING BUILD OUTPUT ==="
if [ ! -f "dist/client/index.html" ]; then
  echo "ERROR: dist/client/index.html not found. Build failed!"
  # Try to recover by copying public files
  echo "Attempting recovery by copying public files..."
  cp -r public/* dist/client/ || true
fi

# Show output directory contents for debugging
echo "=== BUILD OUTPUT ==="
ls -la dist/client 