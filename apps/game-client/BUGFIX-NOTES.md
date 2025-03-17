# Server Bug Fixes

## Fixed Issues

1. **TypeError in GameRoomState update method**
   - Added null checking for `entityCTRL` and `spawnCTRL` in the update method
   - Previously crashed with: `TypeError: Cannot read properties of undefined (reading 'hasEntities')`

2. **Game Data Initialization**
   - Fixed `gameDataCTRL` to initialize directly from `GameData` instead of making API calls
   - Removed dependency on localhost API calls which don't work in Kubernetes

3. **Database Connectivity**
   - Added improved logging for database connection
   - Added support for `DB_PATH` environment variable
   - Added file existence checking for database file
   - Moved database initialization before game state initialization in GameRoom

4. **Docker Configuration**
   - Updated Dockerfile to create a data directory and properly handle database file
   - Set proper permissions for database file
   - Added DB_PATH environment variable

## Deployment Instructions

1. **Build the Docker image**
   - Use the provided build scripts: `./build-local.sh` (for local testing) or `./build-and-push.sh` (for deployment)
   - The scripts will tag the image with the current date/time and "latest"

2. **Update Kubernetes deployment**
   - After pushing the new image, update the deployment with:
   ```
   kubectl set image deployment/degen-server degen-server=your-registry/degen-server:latest
   ```

3. **Verify deployment**
   - Check logs to ensure database is connecting properly:
   ```
   kubectl logs -f deployment/degen-server
   ```
   - Ensure you see messages like "[database] Connected to database: /data/database.db"

## Database Changes

- SQLite database is now included in the Docker image
- Database is stored in `/data/database.db` inside the container
- If using persistent storage, mount the volume to `/data` 