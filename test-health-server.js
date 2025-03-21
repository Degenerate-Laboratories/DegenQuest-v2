const http = require('http');
const express = require('express');

const app = express();
const PORT = 3001; // Use a different port to avoid conflicts

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Health endpoint is working!'
  });
});
//bump
// Start server
const server = app.listen(PORT, () => {
  console.log(`Test health server running on http://localhost:${PORT}`);
  console.log(`Try accessing http://localhost:${PORT}/health`);
});

// Keep the server running for 2 minutes
setTimeout(() => {
  console.log('Shutting down test server...');
  server.close();
  process.exit(0);
}, 2 * 60 * 1000); 