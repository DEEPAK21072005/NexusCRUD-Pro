# ⚡ NexusCRUD Pro — Enterprise RESTful Engine & Real-Time Dashboard

<div align="center">

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%20%7C%20v20%20%7C%20v22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Zod Validation](https://img.shields.io/badge/Zod-TypeSafe%20Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![OpenAPI / Swagger](https://img.shields.io/badge/OpenAPI%203.0-Interactive%20Docs-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:5000/api-docs)
[![Vitest](https://img.shields.io/badge/Vitest-Automated%20Tests%20Passing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Multi--Stage%20Container-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A state-of-the-art, production-ready RESTful CRUD platform and Glassmorphic analytics dashboard built with Node.js, Express 5, Clean Layered Architecture, Zod schema validation, and OpenAPI 3.0.**

[Explore API Docs](http://localhost:5000/api-docs) • [Live Dashboard](http://localhost:5000) • [Architecture](#-architecture) • [Getting Started](#-quick-start) • [Docker Deployment](#-docker-deployment)

</div>

---

## 🌟 Executive Overview

**NexusCRUD Pro** transforms a standard CRUD API into an enterprise-grade backend platform. Engineered following **Clean Layered Architecture** principles, it provides total separation of concerns across transport, business logic, data persistence, and security layers.

Whether used as a microservice template, production data service, or full-stack reference architecture, NexusCRUD Pro delivers out-of-the-box reliability, type safety, observability, and visual excellence.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXUSCRUD PRO PLATFORM                          │
├────────────────────────────────┬───────────────────────────────────────┤
│ 🌐 Glassmorphic UI Dashboard   │ 📚 Interactive Swagger Docs (/api-docs)│
│ 🛡️ Helmet, CORS & Rate-Limiter │ 🔍 Full-Text Search, Multi-Filters    │
│ ⚡ Zod Schema Validation       │ 📊 Aggregate Analytics & CSV Exports  │
│ 🪵 Winston & Morgan Logging    │ 🧪 100% Passing Vitest Test Suite     │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 🏗️ Clean Layered Architecture

The project adheres to strict modular decoupling:

```
nexus-crud-pro/
├── src/
│   ├── app.js               # Express application configuration & pipeline
│   ├── server.js            # Server entrypoint with graceful shutdown
│   ├── config/
│   │   └── env.js           # Type-safe environment config (Zod validated)
│   ├── constants/
│   │   ├── httpStatusCodes.js
│   │   └── itemCategories.js
│   ├── controllers/         # HTTP transport layer & response handling
│   │   ├── healthController.js
│   │   └── itemController.js
│   ├── docs/
│   │   └── swagger.yaml     # OpenAPI 3.0 specification
│   ├── middlewares/         # Pipeline filters, security & observability
│   │   ├── errorHandler.js  # RFC 7807 problem details handler
│   │   ├── httpLogger.js    # Morgan HTTP logger stream to Winston
│   │   ├── rateLimiter.js   # Distributed-ready IP rate limiter
│   │   ├── requestId.js     # NanoID request tracing header
│   │   └── validate.js      # Zod request schema validation middleware
│   ├── models/
│   │   └── itemSchema.js    # Zod schemas for entity, queries & mutations
│   ├── repositories/        # Persistence abstraction (Atomic JSON store)
│   │   └── itemRepository.js
│   ├── routes/              # Express route declarations
│   │   ├── healthRoutes.js
│   │   ├── itemRoutes.js
│   │   └── index.js
│   ├── services/            # Core business logic, search, stats & export
│   │   └── itemService.js
│   └── utils/               # AppError classes, logger, response wrappers
│       ├── appError.js
│       ├── asyncHandler.js
│       ├── logger.js
│       ├── pagination.js
│       └── response.js
├── public/                  # Modern Glassmorphic SPA Dashboard
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── tests/                   # Vitest integration test suite
│   └── items.test.js
├── Dockerfile               # Multi-stage production container
├── docker-compose.yml       # Instant compose orchestration
├── .github/workflows/ci.yml # Automated CI pipeline
└── README.md
```

---

## ⚡ Key Highlights & Features

### 🚀 Production-Ready REST API
- **Complete CRUD Operations**: Create, Read (paginated/filtered/searched), Single fetch, Full update (`PUT`), Partial update (`PATCH`), and Deletion (`DELETE`).
- **Batch Processing**: Bulk deletion (`POST /api/v1/items/bulk-delete`) and bulk creation (`POST /api/v1/items/bulk-create`).
- **Full-Text Search & Multi-Filters**: Instant keyword matching across name, description, and tags with category, status, priority, and price range filters.
- **Dynamic Sorting & Pagination**: Configurable page offsets, limit bounds, and sorting fields with rich pagination metadata.
- **Optimistic Concurrency Control**: Entity versioning (`version` increments on updates).
- **Data Export Engine**: Stream entire datasets as formatted **CSV** or **JSON** with one click.
- **Aggregate Analytics**: Real-time inventory metrics, total valuation, average pricing, and category distributions.

### 🛡️ Enterprise Security & Hardening
- **Helmet Security Headers**: Protection against XSS, clickjacking, and MIME sniffing.
- **Granular CORS**: Configurable allowed origins and headers.
- **Rate Limiting**: Configurable request limits per window to prevent brute force and DDoS.
- **Zod Request Validation**: Validates `body`, `query`, and `params` before executing business logic, returning formatted RFC 7807 validation errors.
- **Unified Error Handling**: Operational vs. programmer error isolation with sanitized outputs in production.

### 📊 Observability & Diagnostics
- **Structured Logging**: Winston logging with color-coded log levels, timestamps, and Morgan HTTP traffic monitoring.
- **Request Tracing**: Automated `x-request-id` header assignment on every incoming request.
- **Health Diagnostics**: `/api/v1/health` endpoint reporting uptime, memory usage (`rss`, `heapUsed`), Node version, and timestamp.
- **Graceful Shutdown**: Listens to `SIGTERM` and `SIGINT` to cleanly close open connections and flush persistence.

### 🎨 Glassmorphic Real-Time Dashboard
- **Dark-Mode-First UI**: Ambient glow backdrops, frosted glass panels (`backdrop-filter: blur(16px)`), neon accents, and responsive typography.
- **Live Inventory Cards**: Real-time stats reflecting total count, active items, valuation, and starred favorites.
- **Dual View Modes**: Seamless toggle between interactive **Data Table** and responsive **Card Grid**.
- **Interactive Modals**: Form validation, tag management, JSON payload inspector, and instant copy-to-clipboard.
- **Keyboard Shortcuts**: `Ctrl + K` to search, `N` to create a new item, `Esc` to close modals.

---

## 📖 API Specification

Base Endpoint: `/api/v1`

| Method | Endpoint | Description | Auth / Validation |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | System health check & memory diagnostics | Public |
| **GET** | `/items` | Paginated items with search & filter parameters | Zod Query Schema |
| **GET** | `/items/:id` | Fetch single item by ID | ID Params Schema |
| **POST** | `/items` | Create a new item | Zod Body Schema |
| **PUT** | `/items/:id` | Full item update | Zod Body + ID Schema |
| **PATCH** | `/items/:id` | Partial item update | Zod Body + ID Schema |
| **DELETE** | `/items/:id` | Delete item by ID | ID Params Schema |
| **POST** | `/items/bulk-delete` | Batch delete multiple items | Array of IDs |
| **POST** | `/items/bulk-create` | Bulk import items | Array of Item Objects |
| **GET** | `/items/stats/summary`| Aggregate business metrics & valuations | Summary Object |
| **GET** | `/items/export` | Export data as CSV (`?format=csv`) or JSON | Attachment Stream |
| **POST** | `/items/reset` | Seed database with demo items | Reset Confirmation |

---

## 🛠️ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/DEEPAK21072005/express-crud-experiment.git
cd express-crud-experiment

# Install dependencies
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```

The server will be running at **http://localhost:5000**
- 🌐 **Web Dashboard**: [http://localhost:5000](http://localhost:5000)
- 📚 **Swagger OpenAPI Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- 🩺 **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🐳 Docker Deployment

Run NexusCRUD Pro anywhere inside a container with zero dependencies:

### Using Docker Compose (Recommended)
```bash
docker compose up -d --build
```

### Using Docker CLI
```bash
# Build the production image
docker build -t nexus-crud-pro:latest .

# Run the container
docker run -d -p 5000:5000 --name nexus-crud-app nexus-crud-pro:latest
```

---

## 🧪 Automated Testing

NexusCRUD Pro includes an integration test suite powered by **Vitest** and **Supertest** testing all REST endpoints, schema validations, query filtering, pagination, error states, and bulk actions.

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with code coverage report
npm run test:coverage
```

---

## ⚙️ Environment Variables

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | `5000` | HTTP server listening port |
| `NODE_ENV` | String | `development` | Environment mode (`development`, `production`, `test`) |
| `API_PREFIX` | String | `/api/v1` | Base route prefix for API endpoints |
| `CORS_ORIGIN` | String | `*` | Allowed CORS origins (comma-separated or `*`) |
| `RATE_LIMIT_WINDOW_MS` | Number | `900000` | Rate limiting window in milliseconds (15 mins) |
| `RATE_LIMIT_MAX` | Number | `200` | Max requests per IP per window |
| `LOG_LEVEL` | String | `info` | Winston logging level (`error`, `warn`, `info`, `http`, `debug`) |

---

## 👨‍💻 Author

**DEEPAK POLISETTI**
- **GitHub**: [@DEEPAK21072005](https://github.com/DEEPAK21072005)
- **Email**: [polisettideepak14348@gmail.com](mailto:polisettideepak14348@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
