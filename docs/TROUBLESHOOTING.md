# DegenQuest Troubleshooting Guide

## Common Issues

### "Seat Reservation Expired" Error

**Symptoms:**
- Error in the server logs: `Error: seat reservation expired`
- Players unable to connect properly to the game server
- Game connections being dropped or failing to initialize

**Cause:**
This error occurs in multi-pod deployments when:
1. A client initially connects to one pod
2. The client receives a "seat reservation" (a temporary token)
3. When finalizing the connection, the client connects to a different pod
4. The second pod doesn't recognize the reservation because it was created on the first pod

**Solution:**
There are two main ways to fix this issue:

1. **Enable Session Affinity (Easier):**
   - Configure the Kubernetes Service to use `sessionAffinity: ClientIP`
   - This ensures that all requests from the same client IP are directed to the same pod
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: degen-server-service
   spec:
     # ... other configuration
     sessionAffinity: ClientIP
   ```

2. **Implement Shared State (More Robust):**
   - Use Redis or another external state store to share session data between pods
   - This requires modifying the Colyseus server configuration
   - Recommended for production environments with high traffic

### Game Client Connection Issues

**Symptoms:**
- Unable to connect to game server
- Errors in browser console
- Game loads but players/entities don't appear

**Solutions:**
1. Check that the client is connecting to the correct server IP and port:
   ```typescript
   // In Network.ts
   url = "ws://SERVER_IP:PORT";
   ```

2. Verify that the port is properly forwarded in the Kubernetes Service

3. Ensure WebSocket connections are allowed by any firewalls or proxy servers 