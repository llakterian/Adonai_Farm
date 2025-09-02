# 🚂 Railway Deployment Guide (Optimized)

## Overview

This guide covers the optimized Railway deployment process for the Adonai Farm Management System with improved build process, environment variable handling, and error recovery.

## Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **Railway Account**: Sign up at [railway.app](https://railway.app)
3. **Railway CLI** (optional): `npm install -g @railway/cli`

## Quick Deployment (Recommended)

### Option 1: Automated Script

```bash
# Run the optimized deployment script
./railway-deploy-complete.sh
```

### Option 2: Manual Railway Dashboard

1. **Create Railway Project**
   - Go to [railway.app/dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Services**
   - Railway will auto-detect the Node.js application
   - Add a PostgreSQL database service

3. **Set Environment Variables**
   ```
   JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
   NODE_ENV=production
   PORT=4000
   FRONTEND_URL=https://your-frontend-domain.railway.app
   ```

## Environment Variables

### Required Variables
- `JWT_SECRET`: Secure secret for JWT tokens (minimum 32 characters)
- `NODE_ENV`: Set to "production"
- `PORT`: Set to "4000" (or Railway will auto-assign)

### Auto-Provided Variables
- `DATABASE_URL`: Automatically provided when you add PostgreSQL service

### Optional Variables
- `FRONTEND_URL`: For CORS configuration
- `SMTP_*`: For email notifications
- `CLOUDINARY_*`: For image uploads

## Build Process Optimization

The optimized build process includes:

1. **Environment Validation**: Checks all required variables
2. **Dependency Installation**: Uses `npm ci` for faster, reliable installs
3. **Frontend Build**: Compiles React application
4. **Database Migration**: Runs PostgreSQL migration if DATABASE_URL exists
5. **Health Checks**: Validates server startup

## Configuration Files

### `railway.json`
- Optimized build commands
- Health check configuration
- Environment variable templates
- Watch patterns for auto-deployment

### `backend/railway.toml`
- Service-specific configuration
- Health check endpoints
- Resource allocation

## Troubleshooting

### Build Failures

1. **Check Build Logs**
   ```bash
   railway logs --service backend
   ```

2. **Common Issues**
   - Missing environment variables
   - Dependency installation failures
   - Database connection issues

### Runtime Issues

1. **Database Connection**
   - Ensure PostgreSQL service is added
   - Check DATABASE_URL is set
   - Verify migration completed

2. **Environment Variables**
   ```bash
   # Validate environment
   railway run node backend/scripts/validate_env.js
   ```

3. **Health Check Failures**
   - Check `/api/health` endpoint
   - Verify server is listening on correct port
   - Check database connectivity

## Monitoring

### Health Checks
- Endpoint: `/api/health`
- Timeout: 300 seconds
- Checks database connectivity

### Logging
```bash
# View real-time logs
railway logs --follow

# View specific service logs
railway logs --service backend --follow
```

### Status Monitoring
```bash
# Check deployment status
railway status

# Check service health
railway ps
```

## Production Checklist

- [ ] JWT_SECRET is set and secure (32+ characters)
- [ ] DATABASE_URL is configured (PostgreSQL service added)
- [ ] FRONTEND_URL matches your frontend domain
- [ ] Health check endpoint responds successfully
- [ ] Database migration completed without errors
- [ ] Admin user can log in (admin/adonai123)
- [ ] All core features work (animals, workers, gallery)

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **JWT Secret**: Use a strong, unique secret
3. **Database**: Railway PostgreSQL includes SSL by default
4. **CORS**: Configure FRONTEND_URL properly

## Cost Optimization

- **Free Tier**: Railway offers generous free tier
- **Sleep Mode**: Disabled for production reliability
- **Resource Limits**: Configured for optimal performance
- **Auto-scaling**: Enabled based on traffic

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Community**: [Railway Discord](https://discord.gg/railway)
- **Status**: [status.railway.app](https://status.railway.app)

## Advanced Configuration

### Custom Domains
1. Add domain in Railway dashboard
2. Configure DNS records
3. SSL certificates are auto-managed

### Multiple Environments
- Use Railway's environment feature
- Separate staging and production
- Environment-specific variables

### Database Backups
- Railway PostgreSQL includes automatic backups
- Manual backups available via dashboard
- Point-in-time recovery supported