#!/bin/bash

# Define variables
IMAGE_NAME="degen-server"
VERSION=$(date +"%Y%m%d-%H%M%S")
FULL_TAG="$IMAGE_NAME:$VERSION"
LATEST_TAG="$IMAGE_NAME:latest"

echo "Building Docker image: $FULL_TAG"
docker build -t "$FULL_TAG" -t "$LATEST_TAG" -f Dockerfile ..

echo "Image built successfully:"
echo "  - $FULL_TAG"
echo "  - $LATEST_TAG"

echo "You can run the image with:"
echo "docker run -p 8888:8888 $LATEST_TAG" 