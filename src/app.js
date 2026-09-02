import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import fs from 'fs';
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
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: '*',
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

// Static Dashboard Assets with multi-path discovery
const possiblePublicDirs = [
  path.resolve(process.cwd(), 'public'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../../public'),
];
const publicDir = possiblePublicDirs.find((d) => fs.existsSync(d)) || possiblePublicDirs[0];

app.use(express.static(publicDir));
app.use('/assets', express.static(path.join(publicDir, 'assets')));

// Swagger OpenAPI Documentation
try {
  const possibleSwaggerPaths = [
    path.resolve(__dirname, './docs/swagger.yaml'),
    path.resolve(process.cwd(), 'src/docs/swagger.yaml'),
  ];
  const swaggerPath = possibleSwaggerPaths.find((p) => fs.existsSync(p)) || possibleSwaggerPaths[0];
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
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: 'NexusCRUD Pro API Online' });
  }
});

// 404 and Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
