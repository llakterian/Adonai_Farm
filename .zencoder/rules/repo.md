---
description: Repository Information Overview
alwaysApply: true
---

# Adonai Farm Management System Information

## Summary
A comprehensive farm management system built with React, Node.js, and SQLite. Manages livestock, workers, time tracking, photo gallery, and generates reports with a mobile-responsive interface.

## Structure
- **frontend/**: React frontend application built with Vite
- **backend/**: Node.js Express backend with SQLite database
- **netlify/**: Serverless functions for Netlify deployment
- **api/**: API health check endpoint
- **netlify-build/**: Pre-built frontend for Netlify deployment
- **.github/**: CI/CD workflows for GitHub Actions

## Language & Runtime
**Language**: JavaScript (Node.js backend, React frontend)
**Version**: Node.js >= 18.0.0
**Build System**: npm
**Package Manager**: npm

## Dependencies
**Backend Dependencies**:
- express: ^4.18.2 (Web framework)
- better-sqlite3: ^8.0.1 (Database)
- bcrypt: ^5.1.0 (Authentication)
- jsonwebtoken: ^9.0.0 (Authentication)
- multer: ^1.4.5-lts.1 (File uploads)
- cors: ^2.8.5 (Cross-origin resource sharing)

**Frontend Dependencies**:
- react: ^18.2.0 (UI framework)
- react-dom: ^18.2.0 (DOM manipulation)
- react-router-dom: ^6.14.1 (Routing)
- axios: ^1.4.0 (HTTP client)
- vite: ^5.0.0 (Build tool)

## Build & Installation
```bash
# Install all dependencies
npm run install-all

# Start development environment
npm run dev

# Build frontend
npm run build

# Start production server
npm start
```

## Docker
**Main Dockerfile**: Dockerfile (Multi-stage build)
**Docker Compose**: docker-compose.yml
**Images**:
- Backend: Node.js 18 Alpine
- Frontend: Node.js 18 Alpine for build, served via static file server
**Deployment**:
```bash
# Deploy with Docker
./deploy.sh
```

## Testing
**Framework**: Custom test scripts
**Test Files**:
- integration-test-suite.js (Integration tests)
- test-auth.js (Authentication tests)
- test-user-flows.js (User flow tests)
- cross-device-test.js (Cross-device compatibility)
- mobile-performance-test.js (Mobile performance)
**Run Command**:
```bash
# Run integration tests
node integration-test-suite.js
```

## Project Components

### Backend API
**Main File**: backend/index.js
**Database**: SQLite (backend/data/adonai.db)
**API Endpoints**:
- Authentication: /auth/login, /auth/update
- Livestock: /api/livestock
- Workers: /api/workers
- Time Tracking: /api/time-entries
- Gallery: /api/gallery

### Frontend Application
**Main File**: frontend/src/App.jsx
**Entry Point**: frontend/src/main.jsx
**Build Tool**: Vite
**Key Features**:
- Livestock management
- Worker management & time tracking
- Photo gallery
- Reports & analytics
- Mobile-first design

### Deployment Options
**Platforms**:
- Railway.app (Recommended)
- Netlify (Static frontend)
- Docker (Self-hosted)
**Configuration Files**:
- railway.json, railway.toml
- netlify.toml
- docker-compose.yml
- render.yaml