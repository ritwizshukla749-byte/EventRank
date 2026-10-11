import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

const app = createApp();

async function startServer() {
  console.log(`[EventRank Server] Starting in ${config.env} mode...`);

  // Attempt database connection
  await connectDB(config.mongodbUri);

  const server = app.listen(config.port, () => {
    console.log(`[EventRank Server] API listening on http://localhost:${config.port}`);
    console.log(`[EventRank Server] Health check available at http://localhost:${config.port}/api/v1/health`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[EventRank Server] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      console.log('[EventRank Server] HTTP server closed.');
      await disconnectDB();
      console.log('[EventRank Server] Database connection closed. Exiting process.');
      process.exit(0);
    });

    // Force exit after 10s if connections refuse to close
    setTimeout(() => {
      console.error('[EventRank Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[EventRank Server] Fatal server startup error:', err);
  process.exit(1);
});
