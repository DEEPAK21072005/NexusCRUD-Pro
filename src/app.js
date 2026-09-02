import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { requestId } from './middlewares/requestId.js';
import { httpLogger } from './middlewares/httpLogger.js';
import { apiRateLimiter } from './middlewares/rateLimiter.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler.js';
import { swaggerSpec } from './docs/swaggerSpec.js';
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

// Swagger JSON Spec Endpoint
app.get('/api-docs/swagger.json', (req, res) => {
  return res.json(swaggerSpec);
});

// CDN-Powered Standalone Swagger UI (100% Reliable on Vercel Serverless)
app.get(['/api-docs', '/api-docs/'], (req, res) => {
  const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexusCRUD Pro — Interactive API Documentation</title>
  <link rel="icon" type="image/jpeg" href="/assets/logo.jpg">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07090e;
      --surface: #0f1524;
      --border: rgba(255, 255, 255, 0.1);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #6366f1;
    }
    body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
    }
    .custom-nav {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 14px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 1.1rem;
      color: #fff;
      text-decoration: none;
    }
    .brand img {
      width: 32px;
      height: 32px;
      border-radius: 6px;
    }
    .nav-links {
      display: flex;
      gap: 16px;
    }
    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .nav-link:hover {
      color: #fff;
      background: rgba(255,255,255,0.06);
    }
    .nav-link.active {
      color: #818cf8;
      background: rgba(99, 102, 241, 0.12);
    }
    
    /* Swagger UI Dark Overrides */
    .swagger-ui {
      max-width: 1300px;
      margin: 0 auto;
      padding: 20px 24px;
      color: var(--text);
    }
    .swagger-ui .topbar { display: none !important; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #fff !important; font-size: 1.8rem; }
    .swagger-ui .info p, .swagger-ui .info li { color: var(--text-muted) !important; font-size: 0.95rem; }
    .swagger-ui .scheme-container { background: transparent !important; box-shadow: none !important; padding: 10px 0 !important; border-bottom: 1px solid var(--border); }
    .swagger-ui .opblock-tag { color: #fff !important; border-bottom: 1px solid var(--border) !important; font-size: 1.2rem; }
    .swagger-ui .opblock { border-radius: 10px !important; margin-bottom: 14px !important; box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important; }
    .swagger-ui .opblock .opblock-summary { padding: 10px 16px !important; }
    .swagger-ui .opblock .opblock-summary-method { border-radius: 6px !important; font-family: monospace !important; font-weight: 700 !important; }
    .swagger-ui .opblock .opblock-summary-path { color: #fff !important; font-family: monospace !important; }
    .swagger-ui .opblock .opblock-summary-description { color: var(--text-muted) !important; font-size: 0.85rem; }
    .swagger-ui .opblock-body { background: #0c101d !important; color: #fff !important; }
    .swagger-ui table thead tr td, .swagger-ui table thead tr th { color: var(--text-muted) !important; border-bottom: 1px solid var(--border) !important; }
    .swagger-ui .parameter__name { color: #fff !important; font-family: monospace !important; }
    .swagger-ui .parameter__type { color: #818cf8 !important; }
    .swagger-ui select, .swagger-ui input[type=text], .swagger-ui textarea { background: #07090e !important; color: #fff !important; border: 1px solid var(--border) !important; border-radius: 6px !important; }
    .swagger-ui .btn.execute { background-color: var(--primary) !important; color: #fff !important; border-color: var(--primary) !important; border-radius: 6px !important; }
    .swagger-ui .btn.try-out__btn { border-radius: 6px !important; color: #818cf8 !important; border-color: #818cf8 !important; }
    .swagger-ui .btn.cancel { border-radius: 6px !important; }
    .swagger-ui .responses-inner { background: transparent !important; }
    .swagger-ui .response-col_status { color: #34d399 !important; font-family: monospace !important; }
    .swagger-ui pre { background: #05070d !important; color: #38bdf8 !important; border-radius: 6px !important; border: 1px solid var(--border) !important; }
    .swagger-ui .model-box { background: #07090e !important; }
    .swagger-ui .model-title { color: #fff !important; }
    .swagger-ui .prop-type { color: #a855f7 !important; }
  </style>
</head>
<body>
  <nav class="custom-nav">
    <a href="/" class="brand">
      <img src="/assets/logo.jpg" alt="Logo" />
      <span>NexusCRUD <span style="color:#6366f1">PRO</span> API Docs</span>
    </a>
    <div class="nav-links">
      <a href="/" class="nav-link">← Live Dashboard</a>
      <a href="/api/v1/health" target="_blank" class="nav-link">Health Probe</a>
      <a href="/api-docs/swagger.json" target="_blank" class="nav-link">OpenAPI JSON</a>
    </div>
  </nav>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/api-docs/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        displayRequestDuration: true,
        filter: true,
        docExpansion: "list"
      });
    };
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.send(swaggerHtml);
});

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
