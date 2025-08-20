# 🌾 Adonai Farm Management System

A comprehensive farm management system built with React, Node.js, and SQLite. Manage livestock, workers, time tracking, photo gallery, and generate reports - all with a beautiful, mobile-responsive interface.

![Farm Management Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![SQLite](https://img.shields.io/badge/Database-SQLite-lightblue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ Features

### 🐄 Livestock Management
- Add, edit, and delete animals
- Track animal details (type, age, sex, notes)
- Support for multiple animal types (cattle, goats, sheep, poultry)
- Export data to CSV

### 👷 Worker Management & Time Tracking
- Employee management with roles and hourly rates
- **Clock in/out system** for workers
- **Automatic salary calculation** based on hours worked
- Real-time work status tracking
- Payroll reports with date filtering

### 📸 Photo Gallery
- Upload farm photos with drag-and-drop
- Image validation and compression
- Beautiful gallery with modal view
- Farm showcase with pre-loaded images

### 📊 Reports & Analytics
- Animal statistics and insights
- Worker payroll calculations
- Time tracking reports
- Export capabilities

### 📱 Mobile-First Design
- Fully responsive on all devices
- Touch-friendly interface
- Mobile navigation menu
- Optimized for farm workers using phones

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/Lakterian9/adonai_farm.git
cd adonai_farm

# Run with Docker
./deploy.sh
```

### Option 2: Manual Setup
```bash
# Backend setup
cd backend
npm install
npm run migrate  # Initialize database
npm start

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

## 🌐 Live Demo

**Demo Credentials:**
- Username: `admin`
- Password: `adonai123`

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Custom responsive styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **JWT** - Authentication
- **Multer** - File images
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Railway** - Deployment platform

## 📁 Project Structure

```
adonai_farm/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── styles.css       # Global styles
│   │   └── App.jsx          # Main app component
│   ├── public/              # Static assets
│   └── Dockerfile
├── backend/                 # Node.js backend
│   ├── index.js            # Main server file
│   ├── migrate_and_seed.js # Database setup
│   ├── data/               # SQLite database
│   ├── images/            # Photo images
│   └── Dockerfile
├── docker-compose.yml      # Multi-container setup
├── deploy.sh              # Quick deployment script
└── README.md
```

## 🔧 Environment Variables

### Backend
```env
JWT_SECRET=your_secure_jwt_secret
PORT=4000
NODE_ENV=production
```

### Frontend
```env
VITE_API_URL=http://localhost:4000
```

## 🚀 Deployment

### Railway.app (Recommended)
1. Fork this repository
2. Sign up at [railway.app](https://railway.app)
3. Connect your GitHub repository
4. Railway will auto-deploy both frontend and backend
5. Set environment variables in Railway dashboard

### DigitalOcean App Platform
1. Connect repository to DigitalOcean
2. Configure build settings:
   - Backend: Node.js app
   - Frontend: Static site
3. Deploy with one click

### Manual VPS Deployment
```bash
# On your server
git clone https://github.com/Lakterian9/adonai_farm.git
cd adonai_farm
./deploy.sh
```

## 📊 Database Schema

### Tables
- **users** - Authentication
- **animals** - Livestock records
- **workers** - Employee information
- **time_entries** - Clock in/out records
- **photos** - Gallery images

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- File upload restrictions

## 🎯 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `PUT /auth/update` - Update credentials

### Livestock
- `GET /api/livestock` - Get all animals
- `POST /api/livestock` - Add new animal
- `PUT /api/livestock/:id` - Update animal
- `DELETE /api/livestock/:id` - Delete animal

### Workers
- `GET /api/workers` - Get all workers
- `POST /api/workers` - Add new worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker

### Time Tracking
- `GET /api/time-entries` - Get time entries
- `POST /api/time-entries/clock-in` - Clock in worker
- `POST /api/time-entries/clock-out` - Clock out worker
- `GET /api/reports/payroll` - Generate payroll report

### Gallery
- `GET /api/gallery` - Get all photos
- `POST /api/gallery/upload` - Upload photo

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Adonai Farm management needs
- Designed with modern farming practices in mind
- Mobile-first approach for field workers
- Sustainable farming through technology

## 📞 Support

For support, email [your-email] or create an issue in this repository.

---

**Made with ❤️ for sustainable farming** 🌱