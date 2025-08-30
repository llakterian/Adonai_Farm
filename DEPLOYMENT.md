# Adonai Farm - Deployment Guide

## 🚀 Live Deployments

### Primary Deployment (Railway)
- **URL**: https://adonaifarm-production.up.railway.app
- **Status**: ✅ Active
- **Features**: Full-stack application with database
- **Auto-deploy**: Enabled on `main` branch pushes

### Static Deployment (GitHub Pages)
- **URL**: https://adonaifarm.co.ke (when configured)
- **Status**: ⏳ Pending GitHub Pages setup
- **Features**: Static frontend only, connects to Railway API
- **Auto-deploy**: Enabled on `main` branch pushes

## 📋 Deployment Status

### ✅ Railway Deployment
- [x] Backend server running
- [x] Database connected (PostgreSQL)
- [x] Frontend built and served
- [x] Static files served correctly
- [x] API endpoints functional
- [x] Admin panel accessible

### ⏳ GitHub Pages Deployment
- [x] Workflow configured
- [x] Build process working
- [ ] GitHub Pages enabled in repository settings
- [ ] Custom domain configured

## 🔧 Configuration

### Railway Environment Variables
The following environment variables are automatically set by Railway:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (auto-assigned)

Optional environment variables:
- `SMTP_USER` - Email service username
- `SMTP_PASS` - Email service password

### GitHub Pages Setup
To enable GitHub Pages deployment:

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy on the next push

### Custom Domain Setup
For the custom domain `adonaifarm.co.ke`:

1. Configure DNS records to point to GitHub Pages
2. Enable GitHub Pages in repository settings
3. The CNAME file is already configured

## 🏗️ Build Process

### Railway Build
1. Install root dependencies
2. Build frontend (`npm run build`)
3. Install backend dependencies
4. Run database migrations
5. Start server (`node backend/server.js`)

### GitHub Pages Build
1. Install frontend dependencies
2. Set API URL to Railway deployment
3. Build static frontend
4. Deploy to GitHub Pages

## 🔍 Monitoring

### Health Checks
- Railway: Built-in health monitoring
- API Health: `GET /api/health`
- Frontend: Automatic error boundary

### Logs
- Railway: `npx @railway/cli logs`
- GitHub Actions: Available in Actions tab

## 🚨 Troubleshooting

### Common Issues

1. **Railway deployment fails**
   - Check build logs in Railway dashboard
   - Verify all dependencies are in root package.json
   - Ensure database migrations run successfully

2. **GitHub Pages deployment fails**
   - Verify GitHub Pages is enabled in repository settings
   - Check Actions tab for build errors
   - Ensure workflow has proper permissions

3. **Frontend not loading**
   - Check if build process completed successfully
   - Verify API URL is correctly configured
   - Check browser console for errors

### Quick Fixes

```bash
# Redeploy Railway
git commit --allow-empty -m "Trigger Railway redeploy"
git push origin main

# Check Railway logs
npx @railway/cli logs

# Test local build
npm run build
npm start
```

## 📞 Support

For deployment issues or questions:
- Check the logs first
- Review this documentation
- Contact: triolinkl@gmail.com