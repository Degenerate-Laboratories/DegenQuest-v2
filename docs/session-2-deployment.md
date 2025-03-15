# DegenQuest Deployment Documentation

## Docker Setup

### Prerequisites
- Docker installed
- Node.js and npm installed
- Access to DigitalOcean container registry

### Local Development Environment

#### Building the Docker Image
```bash
# From the game server directory
docker build -t degenquest/game-server:latest .
```

#### Running Locally
```bash
# Run the container with environment variables
docker run -p 3000:3000 --env-file=.env degenquest/game-server:latest
```

### Environment Variables
Required environment variables for the game server:
```
PORT=3000
NODE_ENV=development
# Add other required environment variables
```

### Client Configuration
The game client needs to be configured to connect to the correct server URL:

- Development: `http://localhost:3000`
- Production: `https://[your-domain]`

## Deployment Process

### 1. Local Testing
1. Build Docker image
2. Run container locally
3. Test game client connection
4. Verify multiplayer functionality

### 2. Cloud Deployment
1. Tag image for DigitalOcean registry
2. Push image to registry
3. Deploy container
4. Configure domain and SSL

### Docker Commands Reference
```bash
# Build image
docker build -t degenquest/game-server:latest .

# Tag for DigitalOcean
docker tag degenquest/game-server:latest registry.digitalocean.com/pioneer/degenquest/game-server:latest

# Push to registry
docker push registry.digitalocean.com/pioneer/degenquest/game-server:latest

# Run locally
docker run --env-file=.env degenquest/game-server:latest
```

## Troubleshooting

### Common Issues
1. Connection refused
   - Check if container is running
   - Verify port mapping
   - Check firewall settings

2. Environment variables missing
   - Verify .env file exists
   - Check environment variable names
   - Ensure Docker has access to env file

3. Client can't connect
   - Verify server URL configuration
   - Check CORS settings
   - Confirm network connectivity

## Monitoring and Maintenance

### Health Checks
- Container status
- Server response time
- Active connections
- Memory usage

### Backup Strategy
- Container registry backups
- Database backups (if applicable)
- Configuration backups

### Scaling Considerations
- Container orchestration
- Load balancing
- Resource monitoring 