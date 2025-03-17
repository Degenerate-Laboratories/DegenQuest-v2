# DegenQuest Deployment Documentation

## CI/CD Setup with CircleCI

### Prerequisites
- GitHub repository connected to CircleCI
- Access to DigitalOcean Kubernetes cluster
- Access to DigitalOcean container registry

### Automated Deployment Process

The deployment process is fully automated through CircleCI:

1. Code is pushed to specified branches (master, local-works, begin-pull-master)
2. CircleCI automatically builds and pushes Docker images
3. Kubernetes deployments are updated automatically

### Environment Variables
Required environment variables for the game server:
```
PORT=3000
NODE_ENV=production
# Add other required environment variables
```

### Client Configuration
The game client connects to the production server URL:
```typescript
// Network.ts
const url = "ws://134.199.184.144:80";
const httpBase = "http://134.199.184.144:80";
```

## Deployment Infrastructure

### 1. CircleCI Pipeline
CircleCI handles the build and deployment pipeline:
- Builds Docker images
- Pushes to DigitalOcean Container Registry
- Updates Kubernetes deployments

### 2. Kubernetes Cluster
- Manages container orchestration
- Ensures high availability
- Handles scaling and load balancing

### 3. Services
- Uses SessionAffinity for client connections
- Exposes game server via LoadBalancer

## Troubleshooting

### Common Issues
1. Connection refused
   - Check if pods are running
   - Verify service configuration
   - Check network policies

2. Environment variables missing
   - Verify environment variables in Kubernetes deployment
   - Check for ConfigMaps and Secrets

3. Client can't connect
   - Verify server URL configuration
   - Check CORS settings
   - Confirm WebSocket connectivity

4. Seat reservation expired
   - Verify session affinity is enabled
   - Check for multiple server instances
   - Consider Redis-based state sharing

## Monitoring and Maintenance

### Health Checks
- Pod status
- Server response time
- Active connections
- Memory usage

### Backup Strategy
- Container registry backups
- Database backups (if applicable)
- Configuration backups

### Scaling Considerations
- Horizontal pod autoscaling
- Resource monitoring 