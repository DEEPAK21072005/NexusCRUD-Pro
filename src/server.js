import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`==================================================`);
  logger.info(`🚀 NexusCRUD Pro Server is running on port ${PORT}`);
  logger.info(`📍 Mode: ${env.NODE_ENV}`);
  logger.info(`🌐 Web Dashboard: http://localhost:${PORT}`);
  logger.info(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  logger.info(`🩺 Health Probe: http://localhost:${PORT}${env.API_PREFIX}/health`);
  logger.info(`==================================================`);
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  logger.warn(`Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed successfully. Process exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
  process.exit(1);
});
