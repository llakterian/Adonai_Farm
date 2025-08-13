# 🚂 Railway Deployment Guide

## Step 1: Sign Up for Railway
1. Go to [railway.app](https://railway.app)
2. Click **"Login"** 
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub repositories

## Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **"Lakterian9/adonai_farm"**
4. Railway will automatically detect your project structure

## Step 3: Configure Services

Railway will create two services automatically:
- **Backend** (Node.js app from `/backend` folder)
- **Frontend** (Static site from `/frontend` folder)

### Backend Configuration
1. Click on the **backend service**
2. Go to **"Variables"** tab
3. Add these environment variables:
   ```
   JWT_SECRET=adonai_farm_super_secure_secret_2024_change_this
   NODE_ENV=production
   PORT=4000
   ```

### Frontend Configuration
1. Click on the **frontend service**
2. Go to **"Variables"** tab
3. Add this environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (You'll get the backend URL after backend deploys)

## Step 4: Deploy
1. Railway will automatically start building and deploying
2. Wait for both services to show **"Success"** status
3. Click on each service to get their public URLs

## Step 5: Update Frontend API URL
1. Once backend is deployed, copy its URL (something like `https://adonai-farm-backend-production.railway.app`)
2. Go to frontend service → Variables
3. Update `VITE_API_URL` with the backend URL
4. Frontend will automatically redeploy

## Step 6: Test Your Application
1. Open the frontend URL
2. Login with: `admin` / `adonai123`
3. Test all features:
   - Add animals
   - Add workers
   - Clock in/out workers
   - Upload photos
   - Generate reports

## 🎯 Expected URLs
- **Frontend**: `https://adonai-farm-frontend-production.railway.app`
- **Backend**: `https://adonai-farm-backend-production.railway.app`

## 💰 Cost
- Railway offers generous free tier
- Should be $0/month for your usage
- Scales automatically if needed

## 🔧 Troubleshooting
- If build fails, check the logs in Railway dashboard
- Make sure all environment variables are set
- Backend must deploy successfully before frontend