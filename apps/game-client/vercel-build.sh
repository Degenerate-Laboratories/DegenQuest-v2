#!/bin/bash
set -e

echo "🚀 Starting optimized Bun build process for Vercel..."

# Check if we already have a cached Bun installation
if [ ! -d "./bun" ]; then
  echo "📦 Installing Bun (first deployment)..."
  # Create a directory to install Bun into
  mkdir -p ./bun
  
  # Make sure unzip is installed (use sudo only if available)
  if ! command -v unzip &> /dev/null; then
    echo "Installing unzip..."
    if command -v sudo &> /dev/null; then
      sudo apt-get update -qq && sudo apt-get install -qq -y unzip
    else
      apt-get update -qq && apt-get install -qq -y unzip || {
        echo "Failed to install unzip and sudo is not available. Continuing anyway, hoping unzip is already installed."
      }
    fi
  fi
  
  # Download Bun directly with a specific version (using 1.0.25 as an example)
  BUN_VERSION="1.0.25"
  BUN_URL="https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-linux-x64.zip"
  
  echo "Downloading Bun from: ${BUN_URL}"
  curl -fsSL ${BUN_URL} -o bun.zip || {
    echo "Failed to download Bun. Check the URL and network connection."
    exit 1
  }
  
  # Extract Bun with debugging information
  echo "Extracting Bun..."
  unzip -o bun.zip -d ./bun_temp || {
    echo "Failed to extract Bun. Check if the zip file is valid."
    ls -la bun.zip
    file bun.zip
    exit 1
  }
  
  # Move contents from the extraction directory to our bun directory
  mv ./bun_temp/bun-linux-x64/* ./bun/ || {
    echo "Failed to move Bun files. Checking directories..."
    ls -la ./bun_temp
    exit 1
  }
  
  # Clean up
  rm -rf ./bun_temp bun.zip
  
  echo "✅ Bun installed successfully!"
else
  echo "♻️ Using cached Bun installation"
fi

# Make sure Bun is executable
chmod +x ./bun/bun || {
  echo "Failed to make Bun executable. Checking directory structure:"
  find ./bun -type f -name "bun" -o -name "bun*"
  exit 1
}

# Echo Bun version for logs
echo "📋 Bun version:"
./bun/bun --version || {
  echo "Failed to run Bun. Check installation."
  exit 1
}

# Install dependencies with Bun
echo "📚 Installing dependencies with Bun..."
./bun/bun install || {
  echo "Failed to install dependencies."
  exit 1
}

# Build the client with Bun
echo "🔨 Building the client with Bun..."
./bun/bun run vite build || {
  echo "Failed to build the client."
  exit 1
}

echo "✅ Build completed successfully!" 