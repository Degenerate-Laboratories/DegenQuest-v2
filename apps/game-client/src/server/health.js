import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current file and directory info for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json for version info
const packageJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
);

/**
 * Initialize health endpoint for the Express app
 * @param {Express} app - Express application instance
 * @param {Object} options - Configuration options
 */
export function initHealthEndpoint(app, options = {}) {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.db');
  
  // Main health endpoint with all details
  app.get('/health', async (req, res) => {
    try {
      // Basic system information
      const systemInfo = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
        cpuUsage: os.loadavg(),
        hostname: os.hostname(),
        platform: os.platform(),
      };

      // Database information
      let dbInfo = {};
      try {
        if (fs.existsSync(dbPath)) {
          const stats = fs.statSync(dbPath);
          dbInfo = {
            exists: true,
            size: stats.size,
            lastModified: stats.mtime,
            path: dbPath,
          };
        } else {
          dbInfo = {
            exists: false,
            error: 'Database file not found',
          };
        }
      } catch (error) {
        dbInfo = {
          exists: false,
          error: error.message,
        };
      }

      // Git information (if available)
      let gitInfo = {};
      try {
        gitInfo = {
          commit: execSync('git rev-parse HEAD').toString().trim(),
          branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
        };
      } catch (error) {
        gitInfo = {
          error: 'Git information not available',
        };
      }

      // Return health response
      res.json({
        status: 'ok',
        version: packageJson.version,
        name: packageJson.name,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        system: systemInfo,
        database: dbInfo,
        git: gitInfo,
        // Include e2e test status if available
        e2eTestStatus: options.e2eTestStatus || 'unknown',
        // Database schema version (would come from your db system)
        dbSchemaVersion: options.dbSchemaVersion || '1.0',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      });
    }
  });

  // Simple version-only endpoint for monitoring tools
  app.get('/version', async (req, res) => {
    res.json({
      version: packageJson.version,
      status: 'ok'
    });
  });

  // Additional dedicated health endpoint for API only - no HTML pages
  app.get('/api/health', async (req, res) => {
    res.json({
      status: 'ok',
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  console.log(`Health endpoint available at /health - Version: ${packageJson.version}`);
  console.log(`Simple version endpoint at /version - Version: ${packageJson.version}`);
  console.log(`API health endpoint at /api/health - Version: ${packageJson.version}`);
} 