import morgan from 'morgan';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

const stream = {
  write: (message) => logger.http(message.trim()),
};

const skip = () => env.NODE_ENV === 'test';

export const httpLogger = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms (reqId: :req[x-request-id])',
  { stream, skip }
);
