# 🚂 Railway Deployment Guide for Adonai Farm Management System

## 🎯 Overview
Deploy your Adonai Farm Management System to Railway with custom domain `adonaifarm.co.ke`

## 📋 Prerequisites
- Railway account (free tier available)
- GitHub repository
- Domain `adonaifarm.co.ke` with DNS access
- Neon Postgres database (already set up)

## 🚀 Step-by-Step Deployment

### 1. **Prepare Repository**
```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for Railway deployment with Postgres"
git push origin main
```

### 2. **Deploy to Railway**

#### Option A: Railway CLI (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Option B: Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your Adonai repository
5. Railway will auto-detect your configuration

### 3. **Configure Environment Variables**

In Railway Dashboard, set these variables for your backend service:

```env
NODE_ENV=production
JWT_SECRET=adonai_farm_super_secure_secret_2024_production
DATABASE_URL=postgresql://neondb_owner:npg_Mx84qTlYGiSB@ep-little-brook-ab90jz5e-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
PORT=4000
```

### 4. **Configure Custom Domain**

#### A. In Railway Dashboard:
1. Go to your frontend service
2. Click "Settings" → "Domains"
3. Click "Custom Domain"
4. Enter: `adonaifarm.co.ke`
5. Railway will provide DNS records

#### B. Configure DNS (at your domain registrar):
Add these DNS records for `adonaifarm.co.ke`:

```dns
Type: CNAME
Name: @
Value: [railway-provided-domain].up.railway.app

Type: CNAME  
Name: www
Value: [railway-provided-domain].up.railway.app
```

### 5. **Update Frontend API URL**

Update your frontend to use the custom domain:

```javascript
// In frontend/src/config.js
const API_BASE_URL = 'https://api.adonaifarm.co.ke';
```

### 6. **SSL Certificate**
Railway automatically provides SSL certificates for custom domains.

## 🔧 Configuration Files

### railway.toml (Already configured)
```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[[services]]
name = "adonai-backend"
source = "backend"

[services.build]
buildCommand = "npm install"
startCommand = "node server.js"

[services.variables]
NODE_ENV = "production"
JWT_SECRET = "adonai_farm_super_secure_secret_2024_production"
DATABASE_URL = "${{Postgres.DATABASE_URL}}"

[[services]]
name = "adonai-frontend"
source = "frontend"

[services.build]
buildCommand = "npm install && npm run build"
startCommand = "npx serve -s dist -l $PORT"

[services.variables]
VITE_API_URL = "https://adonai-backend-production.up.railway.app"
```

## 🌐 Domain Configuration Options

### Option 1: Subdomain Setup
- Frontend: `adonaifarm.co.ke`
- Backend API: `api.adonaifarm.co.ke`

### Option 2: Single Domain (Recommended)
- Everything: `adonaifarm.co.ke`
- API routes: `adonaifarm.co.ke/api/*`

## ✅ Post-Deployment Checklist

1. **Test Health Check**: `https://adonaifarm.co.ke/api/health`
2. **Test Login**: Use admin/adonai123
3. **Test API Endpoints**: Livestock, Workers, etc.
4. **Test File Uploads**: Photo gallery functionality
5. **Test Mobile Responsiveness**
6. **Verify SSL Certificate**

## 🔍 Monitoring & Logs

```bash
# View logs
railway logs

# Check service status
railway status

# Open deployed app
railway open
```

## 💰 Cost Estimate
- **Railway Free Tier**: $0/month
  - 500 hours of usage
  - 1GB RAM
  - 1GB storage
  - Custom domains included

## 🆘 Troubleshooting

### Common Issues:
1. **Build Fails**: Check package.json scripts
2. **Database Connection**: Verify DATABASE_URL
3. **CORS Issues**: Update frontend API URL
4. **Domain Not Working**: Check DNS propagation (24-48 hours)

### Debug Commands:
```bash
# Check deployment status
railway status

# View build logs
railway logs --service adonai-backend

# Connect to database
railway connect Postgres
```

## 🎉 Success!
Once deployed, your Adonai Farm Management System will be live at:
- **Website**: https://adonaifarm.co.ke
- **API**: https://adonaifarm.co.ke/api/health

Login with: `admin` / `adonai123`