import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export const notFoundHandler = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'fail',
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  if (err.type === 'entity.parse.failed') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Malformed JSON in request body';
  }

  if (statusCode >= 500) {
    logger.error(`[UNCAUGHT_ERROR] ${err.message}`, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      reqId: req.id,
    });
  }

  const responsePayload = {
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    statusCode,
    message,
    ...(details ? { details } : {}),
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId: req.id,
  };

  return res.status(statusCode).json(responsePayload);
};
