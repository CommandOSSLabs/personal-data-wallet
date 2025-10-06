# PDW Chat Demo - Deployment Troubleshooting Guide

This guide helps you diagnose and fix common deployment issues with the PDW Chat Demo application.

## Quick Diagnosis

### Health Check Endpoint
First, check the backend health endpoint:
```bash
curl http://localhost:4000/health
# or for Railway deployment:
curl https://personal-data-wallet-backend-production.up.railway.app/health
```

Expected healthy response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-06T...",
  "nodeEnv": "production",
  "version": "1.0.0",
  "uptime": 123.45,
  "services": {
    "database": "connected",
    "pdw": "initialized",
    "gemini": "configured",
    "walrus": "configured"
  }
}
```

## Common Issues and Solutions

### 1. Backend Won't Start

#### Symptoms:
- Container exits immediately
- "Failed to start backend server" in logs
- Health endpoint returns 503 or connection refused

#### Diagnosis:
```bash
# Check container logs
docker-compose logs backend

# Or for Railway:
railway logs --service personal-data-wallet-backend
```

#### Solutions:

**A. Missing Environment Variables**
```bash
# Error: "Required environment variable X is not set"
# Solution: Check your .env file or Railway variables
```

**B. Database Connection Failed**
```bash
# Error: "Database connection failed"
# Local solution: Ensure PostgreSQL is running
docker-compose up postgres

# Railway solution: Check DATABASE_URL is correctly set
```

**C. PDW Client Creation Failed**
```bash
# Error: "PDW client creation failed"
# Solutions:
# 1. Verify PDW_PACKAGE_ID and PDW_ACCESS_REGISTRY_ID
# 2. Check SUI_RPC_URL is accessible
# 3. Ensure GEMINI_API_KEY is valid
```

**D. File Permission Issues**
```bash
# Error: "Permission denied" or storage directory issues
# Solution: Check Docker user permissions
# The fixed Dockerfile should handle this automatically
```

### 2. Database Migration Issues

#### Symptoms:
- "Database migrations failed" in logs
- Tables don't exist errors
- Migration files not found

#### Solutions:

**A. Migration Files Missing**
```bash
# Check if migration files are copied correctly
docker-compose exec backend ls -la src/db/migrations/
```

**B. Database Not Ready**
```bash
# Ensure database is fully started before backend
docker-compose restart postgres
sleep 10
docker-compose restart backend
```

**C. Migration Permissions**
```bash
# Check database user has CREATE permissions
# For local development, this should work by default
```

### 3. API Integration Issues

#### Symptoms:
- 500 errors when calling `/pdw/memories`
- Gemini API errors
- Walrus upload failures

#### Solutions:

**A. Gemini API Issues**
```bash
# Check API key is valid and has quota
curl -H "Authorization: Bearer ${GEMINI_API_KEY}" \
  "https://generativelanguage.googleapis.com/v1/models"
```

**B. Walrus Service Issues**
```bash
# Check Walrus relay is accessible
curl -f https://upload-relay.testnet.walrus.space
```

**C. Sui RPC Issues**
```bash
# Check Sui RPC is responding
curl -X POST ${SUI_RPC_URL} \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getLatestSuiSystemState","params":[]}'
```

### 4. Frontend Issues

#### Symptoms:
- Blank page or build errors
- API connection errors
- "Failed to fetch" errors

#### Solutions:

**A. Backend URL Configuration**
```bash
# Check NEXT_PUBLIC_PDW_BACKEND_URL is correct
# Local: http://localhost:4000
# Railway: https://your-backend-url.up.railway.app
```

**B. CORS Issues**
```bash
# Backend should have CORS enabled by default
# Check backend logs for CORS errors
```

**C. Build Issues**
```bash
# Check frontend build logs
docker-compose logs frontend
```

### 5. Docker/Container Issues

#### Symptoms:
- "No such file or directory" errors
- Build failures
- Container won't start

#### Solutions:

**A. Build Context Issues**
```bash
# Ensure you're building from the correct directory
# The Dockerfile expects to be built from the project root
cd /path/to/personal-data-wallet
docker-compose -f packages/pdw-sdk/examples/pdw-chat-demo/docker-compose.yml build
```

**B. Memory/Resource Issues**
```bash
# Increase Docker memory allocation
# On Windows/Mac: Docker Desktop → Settings → Resources
# Recommended: 4GB+ RAM, 2GB+ Swap
```

**C. Port Conflicts**
```bash
# Check if ports are already in use
netstat -an | grep :4000
netstat -an | grep :3000
netstat -an | grep :5432

# Stop conflicting services or change ports in docker-compose.yml
```

## Railway-Specific Issues

### 1. Build Failures

```bash
# Check build logs in Railway dashboard
# Common issues:
# - Dockerfile path incorrect
# - Build context too large
# - Missing environment variables during build
```

### 2. Database SSL Issues

```bash
# Railway PostgreSQL requires SSL in production
# This should be handled automatically by the updated config
# If issues persist, explicitly set: DATABASE_SSL=true
```

### 3. Storage Path Issues

```bash
# Railway uses ephemeral filesystem
# PDW_CONSENT_STORAGE_PATH is automatically set to /app/storage
# Ensure storage directory is created in Dockerfile
```

### 4. Environment Variable Propagation

```bash
# Check variables are set in Railway dashboard
railway variables

# Common missing variables:
# - GEMINI_API_KEY
# - PDW_PACKAGE_ID
# - PDW_ACCESS_REGISTRY_ID
```

## Debugging Commands

### Local Development
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d pdw_chat_demo

# Check container status
docker-compose ps

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Railway Deployment
```bash
# View logs
railway logs --service personal-data-wallet-backend

# Check status
railway status

# View variables
railway variables

# Deploy specific service
railway up --service personal-data-wallet-backend
```

### Database Debugging
```bash
# Connect to local database
docker-compose exec postgres psql -U postgres -d pdw_chat_demo

# Check tables
\dt

# Check migrations
SELECT * FROM migrations;

# Manual migration (if needed)
docker-compose exec backend node dist/db/migrate.js
```

## Performance Optimization

### 1. Reduce Startup Time
```bash
# Skip optional operations in development
# Add to .env:
SKIP_BLOCKCHAIN_OPERATIONS=true
SKIP_ENCRYPTION=true
```

### 2. Memory Usage
```bash
# Monitor container memory usage
docker stats

# Adjust memory limits in docker-compose.yml if needed
```

### 3. Build Optimization
```bash
# Use Docker layer caching
docker-compose build --no-cache  # Only when needed

# For faster development builds, consider using volume mounts
# See docker-compose.dev.yml
```

## Emergency Recovery

### Complete Reset (Local)
```bash
# Stop everything
docker-compose down --volumes --remove-orphans

# Clean Docker system
docker system prune -f

# Remove all related images
docker images | grep pdw-chat | awk '{print $3}' | xargs docker rmi -f

# Start fresh
docker-compose build --no-cache
docker-compose up -d
```

### Railway Redeploy
```bash
# Trigger new deployment
railway up --service personal-data-wallet-backend

# Or redeploy from dashboard
# Go to Railway dashboard → Service → Deploy → Redeploy
```

## Getting Help

1. **Check the health endpoint first**: Always start with `/health`
2. **Review logs**: Use `docker-compose logs` or Railway dashboard
3. **Verify environment**: Ensure all required variables are set
4. **Test connectivity**: Check database, API keys, and external services
5. **Use debugging tools**: Container shell access, database queries, etc.

For persistent issues:
- Check the main README.md for setup instructions
- Review the Railway deployment guide
- Ensure all prerequisites are installed and configured
- Consider testing with a minimal configuration first