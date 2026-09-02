import { sendSuccess } from '../utils/response.js';

export const getHealth = (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptimeSeconds / 60)}m ${Math.floor(uptimeSeconds % 60)}s`,
    uptimeSeconds,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    },
  };

  return sendSuccess(res, {
    message: 'System is healthy and responsive',
    data: healthData,
  });
};
