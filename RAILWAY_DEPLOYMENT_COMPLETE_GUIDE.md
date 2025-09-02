# Complete Railway Deployment Guide - Web Dashboard Method

## Current Situation
- ✅ Railway CLI authenticated
- ✅ Project linked (`talented-fascination`)
- ❌ CLI upload timing out (network issues)
- ⚠️  No services configured yet

## Solution: Use Railway Web Dashboard

### Step 1: Access Railway Dashboard
1. Open your browser and go to: https://railway.app/dashboard
2. Select your project: **talented-fascination**
3. You should see your production environment

### Step 2: Create Backend Service
1. Click **"+ New Service"**
2. Select **"GitHub Repo"**
3. Choose your repository: `llakterian/Adonai_Farm`
4. Name the service: `adonai-farm-backend`
5. Click **"Deploy"**

### Step 3: Configure Backend Service
Once the service is created:

1. **Go to Settings → Environment**
   - Add these environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=https://talented-fascination-production.up.railway.app
   ```

2. **Go to Settings → Build**
   - **Build Command**: `npm run railway:build`
   - **Start Command**: `npm run railway:start`
   - **Root Directory**: `/` (leave empty or set to root)

3. **Go to Settings → Networking**
   - Enable **"Generate Domain"** to get a public URL

### Step 4: Add PostgreSQL Database
1. Click **"+ New Service"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway will automatically create the database and set `DATABASE_URL`

### Step 5: Monitor Deployment
1. Go to the **Deployments** tab
2. Watch the build logs
3. Look for any errors during build/start process

### Step 6: Test Your Deployment
Once deployed:
1. Get your app URL from the service dashboard
2. Test the health endpoint: `https://your-app-url/api/health`
3. Try accessing the frontend

## Alternative: GitHub Integration Method

### Option A: Connect via GitHub Integration
1. In Railway dashboard, go to your project
2. Click **"Connect GitHub"**
3. Select your repository
4. Railway will auto-deploy on every push to main branch

### Option B: Manual Trigger
1. Go to your service in Railway dashboard
2. Click **"Deploy"** button
3. Select the latest commit from your main branch

## Environment Variables Checklist

Make sure these are set in Railway dashboard:

**Required:**
- `NODE_ENV=production`
- `JWT_SECRET=your-secret-key`
- `DATABASE_URL` (auto-set when you add PostgreSQL service)

**Optional:**
- `FRONTEND_URL=https://your-railway-url.railway.app`
- `SMTP_HOST=your-smtp-host`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`

## Troubleshooting Common Issues

### Build Fails
- Check build logs in Railway dashboard
- Ensure `package.json` scripts are correct
- Verify all dependencies are listed

### Database Connection Issues
- Ensure PostgreSQL service is running
- Check `DATABASE_URL` is set correctly
- Verify migration script runs successfully

### Frontend Not Loading
- Check if static files are being served correctly
- Verify build completed successfully
- Check CORS settings

## Expected Build Process

Your Railway deployment should:
1. Install backend dependencies
2. Install frontend dependencies  
3. Build frontend (creates `dist` folder)
4. Run database migration (if `DATABASE_URL` exists)
5. Start the Express server
6. Serve frontend from `dist` folder

## Next Steps After Successful Deployment

1. **Test all functionality:**
   - Login with admin credentials
   - Test CRUD operations
   - Verify file uploads work
   - Check database connectivity

2. **Security:**
   - Change default admin password
   - Review environment variables
   - Enable HTTPS (Railway provides this automatically)

3. **Monitoring:**
   - Set up health checks
   - Monitor application logs
   - Set up error alerting

## Quick Commands for Later

Once deployed, you can use these CLI commands:
```bash
# Check status
railway status

# View logs
railway logs

# Get app URL
railway url

# Open in browser
railway open
```

The web dashboard method is much more reliable than CLI uploads for large projects like yours!