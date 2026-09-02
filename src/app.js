import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { env } from './config/env.js';
import { requestId } from './middlewares/requestId.js';
import { httpLogger } from './middlewares/httpLogger.js';
import { apiRateLimiter } from './middlewares/rateLimiter.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler.js';
import apiRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles and Swagger UI assets
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Tracing and Logging
app.use(requestId);
app.use(httpLogger);

// Static Dashboard Assets
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));

// Swagger OpenAPI Documentation
try {
  const swaggerPath = path.resolve(__dirname, './docs/swagger.yaml');
  const swaggerDocument = YAML.load(swaggerPath);
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'NexusCRUD Pro API Documentation',
      customCss: '.swagger-ui .topbar { display: none } body { background: #0b0f19; color: #f3f4f6; }',
      swaggerOptions: {
        docExpansion: 'list',
        filter: true,
      },
    })
  );
} catch (err) {
  console.warn('Swagger docs initialization warning:', err.message);
}

// API Routes with Rate Limiter
app.use(env.API_PREFIX, apiRateLimiter, apiRouter);

// Fallback for root single page app
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// 404 and Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
