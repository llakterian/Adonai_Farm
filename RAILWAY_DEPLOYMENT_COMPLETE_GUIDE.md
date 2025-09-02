# Railway Deployment Complete Guide

## Overview
This guide provides step-by-step instructions for deploying the Adonai Farm Management System to Railway with PostgreSQL database support.

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository with your code
- Basic understanding of environment variables

## Deployment Steps

### Step 1: Prepare Your Repository
1. Ensure all code is committed and pushed to GitHub
2. Run the deployment readiness check:
   ```bash
   node deployment-readiness-check.js
   ```
3. All checks should pass before proceeding

### Step 2: Create Railway Project
1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect the project structure

### Step 3: Add PostgreSQL Database
1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically set

### Step 4: Configure Environment Variables
Go to your service settings and add these environment variables:

#### Required Variables
```
NODE_ENV=production
PORT=4000
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long
```

#### Optional Variables (for full functionality)
```
# Email Configuration (for contact forms)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Adonai Farm <your-email@gmail.com>

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 5: Deploy
1. Railway will automatically start the deployment
2. Monitor the build logs for any issues
3. The deployment process will:
   - Install dependencies
   - Build the frontend
   - Run database migrations
   - Start the server

### Step 6: Verify Deployment
1. Once deployed, visit your Railway app URL
2. Check the health endpoint: `https://your-app.up.railway.app/api/health`
3. You should see a JSON response with database status
4. Try logging in with default credentials: `admin` / `admin123`

## Troubleshooting

### Common Issues

#### Build Failures
- Check that all dependencies are listed in package.json
- Ensure Node.js version is compatible (>=18.0.0)
- Review build logs for specific error messages

#### Database Connection Issues
- Verify DATABASE_URL is set automatically by Railway
- Check that PostgreSQL service is running
- Review migration logs in the deployment output

#### Frontend Not Loading
- Ensure frontend build completed successfully
- Check that static files are being served from `/frontend/dist`
- Verify CORS configuration allows your domain

#### Authentication Issues
- Verify JWT_SECRET is set and secure (minimum 32 characters)
- Check that admin user was created during migration
- Try resetting with default credentials: admin/admin123

### Monitoring
- Use Railway's built-in logging to monitor application health
- Health check endpoint: `/api/health`
- Monitor database performance in Railway dashboard

## Post-Deployment

### Security Checklist
- [ ] Change default admin password immediately
- [ ] Verify JWT_SECRET is secure and unique
- [ ] Enable HTTPS (Railway provides this automatically)
- [ ] Review CORS settings for production
- [ ] Set up proper backup strategy for database

### Performance Optimization
- [ ] Monitor memory usage and scale if needed
- [ ] Set up database connection pooling (already configured)
- [ ] Consider CDN for static assets if needed
- [ ] Monitor response times and optimize queries

## Environment Variables Reference

### Required for Basic Functionality
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `4000` |
| `JWT_SECRET` | JWT signing secret | `your_secure_secret_32_chars_min` |
| `DATABASE_URL` | PostgreSQL connection | Auto-set by Railway |

### Optional for Enhanced Features
| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASS` | Email password/app password | `your-app-password` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |

## Support
If you encounter issues during deployment:
1. Check Railway deployment logs
2. Verify all environment variables are set correctly
3. Test database connectivity using the health endpoint
4. Review this guide for common troubleshooting steps

## Success Indicators
✅ Deployment completes without errors
✅ Health check endpoint returns status "ok"
✅ Frontend loads correctly
✅ Admin login works with default credentials
✅ Database tables are created and populated
✅ All API endpoints respond correctly

Your Adonai Farm Management System is now successfully deployed on Railway!