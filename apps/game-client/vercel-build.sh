#!/bin/bash
set -e

echo "🚀 Starting optimized Bun build process for Vercel..."

# Setup Python environment for node-gyp
echo "📦 Setting up Python for node-gyp..."
if command -v python3 &> /dev/null; then
  echo "Python 3 is installed."
  # Check Python version
  PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
  echo "Python version: $PYTHON_VERSION"
  
  # Install distutils if needed
  if ! python3 -c "import distutils" &> /dev/null; then
    echo "Installing distutils..."
    if command -v pip3 &> /dev/null; then
      pip3 install setuptools
    else
      echo "pip3 not found. Attempting to install pip..."
      if command -v apt-get &> /dev/null; then
        apt-get update -qq && apt-get install -qq -y python3-pip python3-setuptools
      elif command -v yum &> /dev/null; then
        yum install -y python3-pip python3-setuptools
      else
        echo "WARNING: Could not install pip. Native module builds may fail."
      fi
    fi
  fi
else
  echo "Python 3 not found. Installing..."
  if command -v apt-get &> /dev/null; then
    apt-get update -qq && apt-get install -qq -y python3 python3-pip python3-setuptools
  elif command -v yum &> /dev/null; then
    yum install -y python3 python3-pip python3-setuptools
  else
    echo "WARNING: Could not install Python. Native module builds may fail."
  fi
fi

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
  
  # Detect platform
  BUN_VERSION="1.0.25"
  PLATFORM="linux-x64"
  
  # Check if we're on macOS
  if [[ "$(uname)" == "Darwin" ]]; then
    echo "Detected macOS platform"
    PLATFORM="darwin-x64"
    
    # Check for Apple Silicon
    if [[ "$(uname -m)" == "arm64" ]]; then
      echo "Detected Apple Silicon"
      PLATFORM="darwin-aarch64"
    fi
  fi
  
  echo "Using platform: ${PLATFORM}"
  BUN_URL="https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-${PLATFORM}.zip"
  
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
  
  # Move contents based on platform
  if [[ "$(uname)" == "Darwin" ]]; then
    echo "Moving files for macOS..."
    mv ./bun_temp/bun-${PLATFORM}/* ./bun/ || {
      echo "Failed to move Bun files. Checking directories..."
      ls -la ./bun_temp
      exit 1
    }
  else
    echo "Moving files for Linux..."
    mv ./bun_temp/bun-${PLATFORM}/* ./bun/ || {
      echo "Failed to move Bun files. Checking directories..."
      ls -la ./bun_temp
      exit 1
    }
  fi
  
  # Clean up
  rm -rf ./bun_temp bun.zip
  
  echo "✅ Bun installed successfully!"
else
  echo "♻️ Using cached Bun installation"
fi

# Detect platform for correct executable name
BUN_EXECUTABLE="./bun/bun"

# Make sure Bun is executable
chmod +x ${BUN_EXECUTABLE} || {
  echo "Failed to make Bun executable. Checking directory structure:"
  find ./bun -type f -name "bun" -o -name "bun*"
  exit 1
}

# Echo Bun version for logs
echo "📋 Bun version:"
${BUN_EXECUTABLE} --version || {
  echo "Failed to run Bun. Check installation."
  exit 1
}

# Handle Node.js 22 compatibility issues with native modules
echo "🔧 Setting up environment for Node.js 22 compatibility..."

# Set environment variables for node-gyp
export NODE_GYP_FORCE_PYTHON="$(which python3)"

# Skip native compilation where possible
export NODE_OPTIONS="--max-old-space-size=4096"
export SKIP_NODE_GYP="1"
export NODE_GYP_SKIP="1" 
export NPM_CONFIG_BUILD_FROM_SOURCE="false"

# For node-sqlite3 and other problematic modules
export SQLITE_SKIP_GYPI="1"
export SKIP_SQLITE_BINARY="1"

# Create an .npmrc file to help with native module issues
echo "Creating .npmrc with node-gyp configuration..."
cat > .npmrc << EOL
node-gyp-force-python=python3
prefer-offline=true
legacy-peer-deps=true
build-from-source=false
python=$(which python3)
EOL

# Install only production dependencies to reduce compilation issues
echo "📚 Installing dependencies with Bun (production only)..."
${BUN_EXECUTABLE} install --production || {
  echo "Production install failed, trying with legacy-peer-deps..."
  ${BUN_EXECUTABLE} install --production --legacy-peer-deps || {
    echo "Failed to install dependencies with production flag, trying full install..."
    ${BUN_EXECUTABLE} install --legacy-peer-deps
  }
}

# Build the client with Bun
echo "🔨 Building the client with Bun..."
${BUN_EXECUTABLE} run vite build || {
  echo "Failed to build the client."
  exit 1
}

echo "✅ Build completed successfully!" 