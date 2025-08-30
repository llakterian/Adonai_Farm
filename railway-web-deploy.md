# 🚂 Railway Web Deployment Instructions

## Your Project Details
- **Project Name**: Adonai FArm
- **Project URL**: https://railway.com/project/f2fc4c2a-54e1-4e2c-b400-94ce8478b36d
- **GitHub Repo**: https://github.com/llakterian/Adonai_Farm
- **Account**: lakterian9@gmail.com

## 🚀 Deployment Steps

### 1. Open Railway Dashboard
Go to: https://railway.com/project/f2fc4c2a-54e1-4e2c-b400-94ce8478b36d

### 2. Add New Service
- Click **"+ New"** button
- Select **"GitHub Repo"**
- Connect GitHub account if needed
- Select repository: **llakterian/Adonai_Farm**

### 3. Configure Environment Variables
Add these variables to your service:

```
DATABASE_URL=postgresql://neondb_owner:npg_Mx84qTlYGiSB@ep-little-brook-ab90jz5e-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=adonai_farm_super_secure_secret_2024_production
NODE_ENV=production
PORT=4000
```

### 4. Deploy Settings
Railway will auto-detect:
- **Build Command**: `npm install`
- **Start Command**: `node server.js` (from your railway.toml)
- **Port**: 4000

### 5. Custom Domain Setup
1. Go to service **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter: `adonaifarm.co.ke`
4. Add DNS records at your domain registrar:
   ```
   Type: CNAME
   Name: @
   Value: [your-railway-domain].up.railway.app
   ```

## 🎯 Expected Result
- **Railway URL**: https://[service-name].up.railway.app
- **Custom Domain**: https://adonaifarm.co.ke (after DNS setup)
- **Login**: admin / adonai123

## 🔧 If Issues Occur
1. Check build logs in Railway dashboard
2. Verify environment variables are set
3. Ensure GitHub repository is accessible
4. Check that railway.toml is in root directory

Your code is ready and pushed to GitHub! 🎉