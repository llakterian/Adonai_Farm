# 🌾 Adonai Farm Management System

A complete farm management system built with React (Vite) and Node.js (Express) with SQLite. Manage livestock, workers, time tracking, a photo gallery, and reports in a mobile‑friendly UI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React 18](https://img.shields.io/badge/React-18.2.0-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## ✨ Features

- **Livestock Management**: CRUD for animals, CSV export
- **Worker Management & Time Tracking**: Staff profiles, clock in/out, payroll calculations
- **Photo Gallery**: Upload and serve images
- **Reports**: Animals CSV, payroll summaries (client-side)
- **Mobile‑First UI**: Responsive, touch‑friendly

---

## 🧩 Tech Stack

- **Frontend**: React 18, Vite, React Router, Axios, CSS
- **Backend**: Node.js, Express, better-sqlite3, JWT, bcrypt, Multer
- **DevOps**: Docker, Docker Compose, Netlify (static), Railway (recommended)

---

## 📁 Monorepo Structure

```
Adonai_Farm/
├─ frontend/           # React app (Vite)
│  ├─ src/
│  ├─ public/
│  └─ Dockerfile
├─ backend/            # Express API + SQLite
│  ├─ index.js
│  ├─ migrate_and_seed.js
│  ├─ data/            # SQLite DB (persisted)
│  ├─ images/          # Uploaded photos (persisted)
│  └─ Dockerfile
├─ docker-compose.yml  # Local containers
├─ start-dev.sh        # Starts both dev servers
└─ package.json        # Root scripts
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 18
- npm

### One‑command setup
1. Install deps for both apps
   ```bash
   npm run install-all
   ```
2. Start dev environment (backend + frontend)
   ```bash
   npm run dev
   ```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

Alternatively, you can use the helper script:
```bash
./start-dev.sh
```

### Default Admin (seeded)
- Username: `admin`
- Password: `adonai123`

> The backend seeds demo data on first run via `backend/migrate_and_seed.js`.

---

## 🔧 Environment Variables

Create a `.env` in `backend/` (optional but recommended):
```env
JWT_SECRET=your_secure_jwt_secret
PORT=4000
# Optional email notifications (contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=alerts@example.com
# CORS
FRONTEND_URL=http://localhost:5173
```

Frontend (if needed for builds):
```env
VITE_API_URL=http://localhost:4000
```

---

## 🐳 Run with Docker (Recommended for local demo)

Using Docker Compose from repo root:
```bash
docker-compose up --build
# Or in background
docker-compose up -d --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

Volumes persist DB and uploaded images.

---

## 📜 NPM Scripts

Root `package.json`:
- `npm run install-all` — Install backend and frontend deps
- `npm run dev` — Start backend (nodemon) and keep running from backend script
- `npm run build` — Build frontend
- `npm start` — Install backend deps, run DB migrate/seed, then start backend

Backend `package.json`:
- `npm run migrate` — Run SQLite migrations and seed admin/demo data
- `npm run dev` — Start API with nodemon

Frontend `package.json`:
- `npm run dev` — Vite dev server
- `npm run build` — Production build

---

## 🔌 API Overview

Base URL (dev): `http://localhost:4000`

- **Auth**
  - `POST /auth/login` — Login, returns JWT
  - `PUT /auth/update` — Update username/password (Bearer token)

- **Livestock** (Bearer token)
  - `GET /api/livestock`
  - `POST /api/livestock`
  - `PUT /api/livestock/:id`
  - `DELETE /api/livestock/:id`
  - `GET /api/reports/animals.csv` — CSV export

- **Workers** (Bearer token)
  - `GET /api/workers`
  - `POST /api/workers`
  - `PUT /api/workers/:id`
  - `DELETE /api/workers/:id`

- **Time Tracking** (Bearer token)
  - `GET /api/time-entries`
  - `POST /api/time-entries/clock-in`
  - `POST /api/time-entries/clock-out`

- **Gallery** (Bearer token)
  - `GET /api/gallery`
  - `POST /api/gallery/upload` (multipart/form-data)

Static images are served from: `GET /images/...`

---

## 🌐 Deployment

### Railway (Recommended)
- Connect the GitHub repo to Railway and deploy
- Configure environment variables in Railway dashboard

### Netlify (Static Frontend)
- Build frontend (`npm run build`) and deploy the build output as needed
- Optionally use `netlify/functions` for serverless endpoints

### Docker (Self‑hosted)
- Use `docker-compose.yml` as provided or adapt images for your infra

---

## 📄 License

MIT

---

## 🧭 Repository

GitHub: https://github.com/llakterian/Adonai_Farm