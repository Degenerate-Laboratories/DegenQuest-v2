# Game Server Deployment Playbook

This playbook outlines the steps for deploying the DegenQuest game server with proper versioning and health monitoring.

## Prerequisites

- Access to the Git repository
- Docker installed (for local testing only)
- kubectl configured for the target Kubernetes cluster

## Deployment Steps

### 1. Prepare for Deployment

```bash
# Clone the repository if not already done
git clone https://github.com/Degenerate-Laboratories/DegenQuest-v2.git
cd DegenQuest-v2/apps/game-client

# Make sure you're on the main branch
git checkout master
git pull
```

### 2. Bump Version

```bash
# Navigate to playbooks directory
cd playbooks

# Bump version (options: patch, minor, major)
# patch: for bug fixes (0.0.X)
# minor: for new features (0.X.0)
# major: for breaking changes (X.0.0)
bash bump-version.sh patch
```

> **IMPORTANT**: Never build and push Docker images for production locally. All production builds should be handled by CircleCI jobs to ensure consistency and security. The following steps are for documentation purposes only or for local testing.

### 3. Push Changes to Trigger CI Build

```bash
# Push changes to the master branch to trigger the CI pipeline
git push origin master
git push origin --tags

# This will automatically trigger the CircleCI pipeline that will:
# 1. Build the Docker image
# 2. Push it to the DigitalOcean Container Registry
# 3. Update the Kubernetes deployment
```

### 4. Test Locally (Development Only)

If you need to test locally before pushing:

```bash
# Run the container locally using the development tag
docker run --rm -p 3002:8888 degen-server:dev

# In a new terminal, test the health endpoint
curl http://localhost:3002/health | jq
```

### 5. Monitor CircleCI Build

Go to the CircleCI dashboard to monitor the build and deployment process:
https://app.circleci.com/pipelines/github/Degenerate-Laboratories/DegenQuest-v2

### 6. Verify Deployment

```bash
# Get the external IP/domain
GAME_SERVER_URL=$(kubectl get service degen-server-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Check the health endpoint
curl http://$GAME_SERVER_URL:8888/health | jq

# Verify version matches what we deployed
DEPLOYED_VERSION=$(curl -s http://$GAME_SERVER_URL:8888/health | jq -r .version)
VERSION=$(grep -o '"version": "[^"]*"' ../package.json | cut -d'"' -f4)
if [ "$DEPLOYED_VERSION" = "$VERSION" ]; then
  echo "✅ Deployment successful! Version $VERSION is running."
else
  echo "⚠️ Version mismatch! Deployed: $DEPLOYED_VERSION, Expected: $VERSION"
fi
```

### 7. Monitor for Issues

- Check server logs: `kubectl logs -f deployment/degen-server-3ug51ux1`
- Monitor for increased error rates
- Test client connectivity

### 8. Rollback (if needed)

```bash
# If problems are detected, rollback to the previous version
kubectl rollout undo deployment/degen-server-3ug51ux1

# Verify rollback
kubectl rollout status deployment/degen-server-3ug51ux1
```

## Key Performance Indicators

The health endpoint provides the following KPIs:

- **Version Number**: Shows the current game version from package.json
- **DB Health**: Status of the database connection and file size
- **DB Schema Version**: Current database schema version
- **E2E Tests Pass**: Status of end-to-end tests
- **System Metrics**: Memory usage, CPU load, uptime
- **Git Info**: Current commit and branch

Monitor these metrics to ensure the server is functioning correctly.

## Versioning Strategy

- **Patch (0.0.X)**: Bug fixes, minor improvements
- **Minor (0.X.0)**: New features, non-breaking changes
- **Major (X.0.0)**: Breaking changes, major updates

Always tag releases in Git to maintain a clear history of deployments. 