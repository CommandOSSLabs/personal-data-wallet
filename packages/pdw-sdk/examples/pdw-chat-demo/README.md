# PDW Chat Demo

Minimal chat experience showcasing `@personal-data-wallet/sdk` alongside Sui wallet auth, Gemini Flash responses, and Walrus-backed memory storage.

## Structure

```text
examples/pdw-chat-demo/
  backend/        # Express + TypeScript API (Postgres, Gemini, PDW integration)
  frontend/       # Next.js app with wallet connect and PDW tabs
  docker/         # Railway-ready Docker & compose manifests
```

## Prerequisites

This demo only runs against live infrastructure. Before touching the code, gather real credentials for each integration:

- **Postgres** – provision a database you can reach from your machine; the backend migration must run against it before the API starts handling traffic.
- **Google Gemini** – supply an API key with access to the chosen `GEMINI_MODEL` and `GEMINI_EMBEDDING_MODEL`.
- **Sui RPC** – point `SUI_RPC_URL` at a reliable fullnode (testnet recommended for development).
- **Personal Data Wallet (PDW)** – record the deployed `PDW_PACKAGE_ID` and optional backend `PDW_API_URL`/`PDW_CONTEXT_APP_ID` you want to target.
- **Walrus** – use the testnet upload relay (`https://upload-relay.testnet.walrus.space`); SSL certificates have been renewed, so uploads/downloads should succeed again. Keep monitoring in case certificates expire in the future.

Without these live services the server will launch, but any request that touches them will fail.

## Quick start (local)

1. Copy the environment templates:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env.local`
2. Install dependencies for both frontend and backend: `npm install`
3. Start Postgres locally (e.g. via Docker) or provision a Railway database.
4. From `backend`, run the database migration and start the API:

   - `npm run migrate`
   - `npm run dev`

5. (Optional but recommended) Before starting the API, run `npm run check:prereqs` to verify Postgres, Sui RPC, Gemini, and Walrus connectivity with your credentials.

6. In `frontend`, run the dev server and be ready to paste a Sui address into the chat UI (wallet auth flow is not wired yet).

### Environment essentials

Backend `.env` keys you must set before the app will work:

- `SUI_RPC_URL`, `PDW_PACKAGE_ID`, optionally `PDW_API_URL` and `PDW_CONTEXT_APP_ID`
- `GEMINI_API_KEY` plus `GEMINI_MODEL` / `GEMINI_EMBEDDING_MODEL`
- `DATABASE_URL` pointing at your Postgres instance
- `WALRUS_UPLOAD_RELAY` (testnet relay) and storage tuning knobs if desired

Frontend `.env.local` keys:

- `NEXT_PUBLIC_PDW_BACKEND_URL` → defaults to `http://localhost:4000` when omitted

Full instructions will be fleshed out as the implementation lands.

## Railway deployment

The backend ships with a production-ready Docker image and `railway.json` manifest. The container runs migrations on boot and exposes the API on the platform-provided `PORT` variable (Railway will inject this automatically).

### 1. Authenticate and link the project

```powershell
railway login
railway init --service pdw-chat-backend
# or, if the project already exists:
railway link
```

Run the CLI from the repository root so the Dockerfile path resolves correctly.

### 2. Provision Postgres

```powershell
railway add --service pdw-chat-backend postgresql
```

This attaches a managed PostgreSQL instance and injects `DATABASE_URL` (and friends) into the service environment. No extra SSL flags are required—production builds default to enabling TLS when the variable is present.

### 3. Configure required environment variables

```powershell
railway variables set \`\
   NODE_ENV=production \`\
   SUI_RPC_URL=<https://fullnode-url> \`\
   PDW_PACKAGE_ID=0x... \`\
   PDW_ACCESS_REGISTRY_ID=0x... \`\
   GEMINI_API_KEY=<your-gemini-key> \`\
   GEMINI_MODEL=gemini-2.5-flash \`\
   GEMINI_EMBEDDING_MODEL=text-embedding-004 \`\
   WALRUS_UPLOAD_RELAY=https://upload-relay.testnet.walrus.space
```

Add any optional values you rely on locally (`PDW_API_URL`, `PDW_CONTEXT_APP_ID`, `PDW_CONSENT_STORAGE_PATH`, etc.).

### 4. Deploy the backend

```powershell
railway up --service pdw-chat-backend --environment production --dir packages/pdw-sdk/examples/pdw-chat-demo/backend
```

The CLI builds the Docker image using `packages/pdw-sdk/examples/pdw-chat-demo/backend/Dockerfile`, pushes it to Railway, and starts the container. The entrypoint automatically runs `dist/db/migrate.js` before launching the server, so tables stay up to date.

### 5. Verify deployment

```powershell
railway status --service pdw-chat-backend
railway logs --service pdw-chat-backend --environment production
```

Once healthy, the `/health` endpoint should return a JSON payload similar to the local environment. Point the frontend’s `NEXT_PUBLIC_PDW_BACKEND_URL` at the deployed Railway domain to drive the UI against the hosted API.

### Usage notes

- After migrations complete, the backend listens on the configured `PORT` and immediately begins issuing real network calls to Sui, Gemini, PDW, and Walrus when chat requests arrive.
- The `npm run check:prereqs` command provides a quick health check to make sure the live services are reachable before you start the dev server.
- The Next.js UI does not perform wallet authentication; enter any 0x-prefixed Sui address you control (or a testnet address from your PDW deployment) to scope retrieved memories.
- If any integration fails (timeouts, auth errors, Walrus outages), expect 5xx responses until the upstream service is healthy again. Consult the backend logs for the exact error message.
