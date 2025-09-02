# Railway Web Deployment Guide

Since you're experiencing connection issues with the CLI, here's how to deploy using Railway's web interface:

## Option 1: Try CLI with Retry Logic

First, try the simple deployment script with retry logic:

```bash
./railway-deploy-simple.sh
```

## Option 2: Web Dashboard Deployment

If CLI continues to fail, use the web interface:

### Step 1: Open Railway Dashboard
1. Go to https://railway.app/dashboard
2. Select your project: `talented-fascination`
3. Select the `adonai-farm-backend` service

### Step 2: Deploy from GitHub
1. In your service settings, go to "Source"
2. Make sure it's connected to your GitHub repository
3. Set the branch to `main`
4. Click "Deploy"

### Step 3: Configure Build Settings
If needed, set these in the service settings:

**Build Command:**
```
npm run railway:build
```

**Start Command:**
```
npm run railway:start
```

**Root Directory:**
```
/
```

### Step 4: Environment Variables
Ensure these are set in Railway dashboard:

- `NODE_ENV=production`
- `JWT_SECRET=your-secret-key`
- `DATABASE_URL` (should be auto-set if you have PostgreSQL service)
- `FRONTEND_URL=https://your-app-url.railway.app`

### Step 5: Monitor Deployment
1. Watch the build logs in the Railway dashboard
2. Check for any errors during build/deployment
3. Test the deployed application

## Option 3: Manual Git Push Trigger

Since your code is already pushed to GitHub, Railway should automatically detect the changes and trigger a deployment. Check your Railway dashboard to see if a deployment is already in progress.

## Troubleshooting Network Issues

The "Connection reset by peer" error is usually temporary. Try:

1. **Wait and retry**: Network issues often resolve themselves
2. **Check Railway status**: Visit https://status.railway.app/
3. **Use different network**: Try mobile hotspot if on WiFi
4. **Clear Railway cache**: `railway logout && railway login --browserless`

## Current Status Check

Run these commands to check your current status:

```bash
# Check Railway connection
railway status

# Check if deployment is already running
railway logs

# Get your app URL (if deployed)
railway url
```

Your code is already committed and pushed to GitHub, so Railway might automatically deploy it even if the CLI upload failed.