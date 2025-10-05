# PDW Chat Demo - Railway Deployment Guide

## ✅ Backend Deployment (IN PROGRESS)

### Backend Service: `personal-data-wallet-backend`
- **URL**: https://personal-data-wallet-backend-production.up.railway.app
- **Dockerfile**: `packages/pdw-sdk/examples/pdw-chat-demo/Dockerfile`
- **Status**: Deploying with consent repository fix

### Environment Variables (Already Set):
```
PORT=4000
NODE_ENV=production
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
PDW_PACKAGE_ID=0xa1b4bf8b2fe86b5de5aadc0e60690f0352081ec53e8754d40cc24a27a3e3a9bd
PDW_ACCESS_REGISTRY_ID=0x6d006a5a8d094cc8f92fa17ea48495ad5d5e4f775a4f5c063df1413c2ff2f2ca
PDW_API_URL=https://personal-data-wallet-backend-production.up.railway.app/pdw
PDW_CONTEXT_APP_ID=pdw-chat-demo
PDW_CONSENT_STORAGE_PATH=/app/storage/consents/requests.json
WALRUS_UPLOAD_RELAY=https://upload-relay.testnet.walrus.space
WALRUS_STORAGE_EPOCHS=3
WALRUS_STORAGE_TIMEOUT=60000
SEAL_KEY_SERVER_IDS=0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75,0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8
SEAL_PACKAGE_ID=0xa1b4bf8b2fe86b5de5aadc0e60690f0352081ec53e8754d40cc24a27a3e3a9bd
SEAL_MODULE_NAME=seal_access_control
GEMINI_API_KEY=AIzaSyBUmLkn4M7ZfZvZIRHAx7yGv2K63MDpPaI
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
LOG_LEVEL=debug
SKIP_BLOCKCHAIN_OPERATIONS=false
SKIP_ENCRYPTION=false
DATABASE_URL=postgresql://postgres:***@postgres-359l.railway.internal:5432/railway
```

---

## 🚀 Frontend Deployment (NEXT STEP)

### Setup Instructions:

1. **Create Frontend Service in Railway Dashboard**:
   - Go to: https://railway.app/project/7c541ac5-535d-4240-9bad-4ad9804c2dd7
   - Click "+ New Service"
   - Select "Empty Service"
   - Name it: `pdw-chat-frontend`

2. **Configure Frontend Service**:
   - **Settings → Source**:
     - Connect to same GitHub repository
     - Set root directory: `packages/pdw-sdk/examples/pdw-chat-demo/frontend`
     - Or manually deploy using Railway CLI

   - **Settings → Variables**:
     Add this environment variable:
     ```
     NEXT_PUBLIC_PDW_BACKEND_URL=https://personal-data-wallet-backend-production.up.railway.app
     ```

   - **Settings → Build**:
     - Builder: Docker
     - Dockerfile Path: `packages/pdw-sdk/examples/pdw-chat-demo/frontend/Dockerfile`

3. **Deploy Frontend**:
   ```powershell
   cd c:\Users\DrBrand\project\CommandOSS\personal_data_wallet\packages\pdw-sdk\examples\pdw-chat-demo\frontend
   railway link
   # Select the pdw-chat-frontend service
   railway up --environment production
   ```

---

## 📊 PostgreSQL Connection

### Database Already Configured:
- **Service**: Railway Postgres (already provisioned)
- **Connection**: Automatic via `DATABASE_URL` environment variable
- **Backend**: Already configured to use `DATABASE_URL`
- **Migrations**: Run automatically via `docker-entrypoint.sh`

### Database Details:
```
Host: postgres-359l.railway.internal
Port: 5432
Database: railway
User: postgres
Password: (injected via DATABASE_URL)
```

**No additional setup needed!** The backend is already connected to PostgreSQL through the `DATABASE_URL` variable that Railway automatically injects.

---

## 🔍 Verification Steps

### 1. Check Backend Health:
```bash
curl https://personal-data-wallet-backend-production.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-06T...",
  "services": {
    "database": "connected",
    "pdw": "initialized"
  }
}
```

### 2. Check Frontend (after deployment):
- Visit: `https://pdw-chat-frontend-production.up.railway.app`
- Should see the chat interface
- Test creating a chat session
- Verify messages are saved and retrieved

### 3. Check Database Migrations:
```bash
railway logs --service personal-data-wallet-backend
```

Look for:
```
Running database migrations...
No migrations were executed. Database is up to date.
OR
Migrations executed successfully: [list of migrations]
```

---

## 📝 Files Created/Modified:

### Backend:
- ✅ `packages/pdw-sdk/examples/pdw-chat-demo/Dockerfile` - Multi-stage Docker build with SDK compilation
- ✅ `packages/pdw-sdk/examples/pdw-chat-demo/backend/src/services/pdw-client.ts` - Fixed consent repository initialization

### Frontend:
- ✅ `packages/pdw-sdk/examples/pdw-chat-demo/frontend/Dockerfile` - Next.js standalone build
- ✅ `packages/pdw-sdk/examples/pdw-chat-demo/frontend/next.config.js` - Added `output: 'standalone'`
- ✅ `packages/pdw-sdk/examples/pdw-chat-demo/frontend/railway.json` - Railway configuration

---

## 🐛 Troubleshooting

### Backend Issues:
- **Module not found**: Fixed by copying entire `/app/packages` directory
- **Python/build tools missing**: Fixed by using `node:20` image with apt-get install
- **Consent repository error**: Fixed by removing `setConsentRepository()` call

### Frontend Issues (if any):
- **Build failures**: Check Next.js build logs in Railway dashboard
- **API connection**: Verify `NEXT_PUBLIC_PDW_BACKEND_URL` is set correctly
- **Runtime errors**: Check browser console and Railway logs

### Database Issues:
- **Connection refused**: Verify DATABASE_URL is injected (Railway does this automatically)
- **Migration failures**: Check `docker-entrypoint.sh` execution in logs
- **Permission errors**: Ensure migrations directory is copied correctly in Dockerfile

---

## 🎉 Next Steps

1. **Wait for backend deployment to complete** (current status check in Railway dashboard)
2. **Create frontend service** following instructions above
3. **Deploy frontend** using Railway CLI or dashboard
4. **Test end-to-end** by creating a chat session and verifying data persistence
5. **Set up custom domains** (optional) in Railway dashboard

---

## 📞 Support

If deployment fails:
1. Check Railway build logs: Click on the deployment in Railway dashboard
2. Check runtime logs: `railway logs --service [service-name]`
3. Verify all environment variables are set correctly
4. Ensure PostgreSQL service is running (should be automatic)
