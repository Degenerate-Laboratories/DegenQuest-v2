#!/bin/bash

# Define variables
IMAGE_NAME="degen-server"
VERSION=$(date +"%Y%m%d-%H%M%S")
REGISTRY="your-docker-registry" # Replace with your actual registry
FULL_TAG="$REGISTRY/$IMAGE_NAME:$VERSION"
LATEST_TAG="$REGISTRY/$IMAGE_NAME:latest"

echo "Building Docker image: $FULL_TAG"
docker build -t "$FULL_TAG" -t "$LATEST_TAG" -f Dockerfile .

echo "Pushing Docker image to registry..."
docker push "$FULL_TAG"
docker push "$LATEST_TAG"

echo "Image built and pushed successfully:"
echo "  - $FULL_TAG"
echo "  - $LATEST_TAG"

echo "You can update your Kubernetes deployment with:"
echo "kubectl set image deployment/degen-server degen-server=$FULL_TAG" 