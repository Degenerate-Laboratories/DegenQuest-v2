# Kubernetes Deployment Guide

## Overview

The DegenQuest game server is deployed on DigitalOcean Kubernetes using Pulumi for infrastructure as code. This document outlines the deployment architecture, debugging procedures, and common operations.

## Deployment Architecture

The deployment consists of several key components:

- **degen-server**: The main game server deployment
- **Persistent Volume Claims (PVC)**: For database persistence
- **Services**: Exposing the deployment with LoadBalancer

### Configuration Management

The deployment is controlled through the `deploy/config.ts` file, which allows toggling services on and off:

```typescript
export const services = {
    // Currently deployed services
    DegenServer: true,
    pioneerServer: true,
    // Other services...
    
    // Disabled services
    keepkeySupport: false,
    // Other disabled services...
};
```

## Common Operations

### Viewing Deployments

```bash
kubectl get deployments
```

### Checking Pod Status

```bash
kubectl get pods | grep degen-server
```

### Getting Pod Logs

```bash
# Get logs from a specific pod
kubectl logs <pod-name>

# Stream logs from a pod
kubectl logs -f <pod-name>

# Get logs with timestamps
kubectl logs --timestamps=true <pod-name>
```

### Restarting a Deployment

```bash
kubectl rollout restart deployment degen-server-3ug51ux1
```

### Scaling a Deployment

```bash
# Scale to 0 replicas (turn off)
kubectl scale deployment <deployment-name> --replicas=0

# Scale to 1 replica (turn on)
kubectl scale deployment <deployment-name> --replicas=1
```

## Database Management

The game server uses SQLite stored in a persistent volume claim:

### View PVCs

```bash
kubectl get pvc
```

### Examine Database

```bash
# Copy the database locally
kubectl cp <pod-name>:/data/database.db ./database.db

# Examine the database
sqlite3 ./database.db "SELECT * FROM characters;"
```

### Recreate Database (Data Reset)

To completely reset the database:

```bash
# Delete the existing PVC
kubectl delete pvc degen-server-db-pvc --force --grace-period=0

# Create a new PVC
echo 'apiVersion: v1;kind: PersistentVolumeClaim;metadata:;  name: degen-server-db-pvc;spec:;  accessModes:;    - ReadWriteOnce;  resources:;    requests:;      storage: 1Gi;  storageClassName: do-block-storage' | tr ';' '\n' | kubectl apply -f -

# Restart the deployment
kubectl rollout restart deployment degen-server-3ug51ux1
```

## Debug and Troubleshooting

### Inspecting Pod Details

```bash
kubectl describe pod <pod-name>
```

### Common Issues and Solutions

#### Pods Stuck in Pending State

Check the pod events:
```bash
kubectl describe pod <pod-name>
```

Common reasons:
- Missing PVC
- Resource constraints
- Node scheduling issues

#### Database Type Mismatches

The game uses a type-sensitive schema. If encountering type errors:

1. Check schema definition in code
2. Examine database values
3. Update code or database to ensure type consistency

#### Accessing Container Shell

```bash
kubectl exec -it <pod-name> -- /bin/bash
```

### Viewing Deployment Details

```bash
kubectl get deployment <deployment-name> -o yaml
```

## Updating the Deployment

### Using Pulumi

```bash
cd deploy
pulumi update
```

## Log Collection Strategy

For debugging complex issues:

1. Get server logs
   ```bash
   kubectl logs <pod-name> > server-logs.txt
   ```

2. Compare with local development logs
   ```bash
   # Run locally and capture logs
   npm run dev > local-logs.txt
   ```

3. Run a diff to identify discrepancies
   ```bash
   diff server-logs.txt local-logs.txt
   ```

## Environment Differences

When debugging issues that occur in Kubernetes but not locally, consider:

1. Database persistence and schema differences
2. Network latency effects
3. Container resource limitations
4. Environment variable differences

## Performance Monitoring

```bash
# CPU and memory usage
kubectl top pods

# Detailed resource usage
kubectl describe pod <pod-name> | grep -A 10 "Resources"
```

This documentation should help with managing, debugging, and maintaining the Kubernetes deployment. 