#!/bin/bash
set -e

echo "🚀 Starting optimized Bun build process for Vercel..."

# Check if we already have a cached Bun installation
if [ ! -d "./bun" ]; then
  echo "📦 Installing Bun (first deployment)..."
  # Create a directory to install Bun into
  mkdir -p ./bun
  # Download and install Bun to the project directory for caching
  curl -fsSL https://bun.sh/install | bash -s -- --install-dir ./bun
  echo "✅ Bun installed successfully!"
else
  echo "♻️ Using cached Bun installation"
fi

# Make sure Bun is executable
chmod +x ./bun/bin/bun

# Echo Bun version for logs
echo "📋 Bun version:"
./bun/bin/bun --version

# Install dependencies with Bun
echo "📚 Installing dependencies with Bun..."
./bun/bin/bun install

# Build the client with Bun
echo "🔨 Building the client with Bun..."
./bun/bin/bun run vite build

echo "✅ Build completed successfully!" 