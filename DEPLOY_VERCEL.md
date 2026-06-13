# Vercel Deployment Guide for MicroAgent

## Prerequisites
- Vercel account (https://vercel.com)
- Backend deployed somewhere (see Backend Deployment section)

---

## 1. Deploy Backend First

The frontend needs a backend API to function. Deploy the backend to one of:

### Option A: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend and deploy
cd backend
railway init
railway up

# Get the URL (e.g., https://microagent-backend.up.railway.app)
```

### Option B: Render
```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Create web service
cd backend
render create service

# Set environment variables in Render Dashboard
```

### Option C: Fly.io
```bash
# Install Fly CLI
brew install flyctl

# Login
fly auth login

# Create and deploy
cd backend
fly launch
fly deploy
```

---

## 2. Configure Backend Environment Variables

In your backend hosting provider, set these environment variables:

```
OPENAI_BASE_URL=https://your-router.example/v1
OPENAI_API_KEY=sk-your-actual-key
OPENAI_MODEL=cx/gpt-5.5
OPENAI_TIMEOUT_SECONDS=120
CORS_ORIGINS=https://your-frontend.vercel.app

# Optional: Web Search
FIRECRAWL_API_KEY=fc-your-key
TAVILY_API_KEY=tv-your-key

# Optional: MongoDB for status persistence
MONGO_URL=mongodb+srv://...
DB_NAME=microagent
```

---

## 3. Deploy Frontend to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import this repository
4. Configure project:
   - **Root Directory**: `.` (root, not frontend)
   - **Build Command**: `npm run build` (or use vercel.json)
   - **Output Directory**: `frontend/build`
5. Add Environment Variables:
   ```
   REACT_APP_API_URL = https://your-backend-url.railway.app
   ```
6. Click "Deploy"

### Option B: Via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? microagent
# - Directory? ./
# - Override settings? N

# For production deployment
vercel --prod
```

### Option C: GitHub Integration (Recommended for CI/CD)

1. Push code to GitHub
2. In Vercel Dashboard → "Add New" → "Project"
3. Import from GitHub
4. Select repository
5. Configure:
   - **Root Directory**: `.`
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/build`
6. Add Environment Variables (Production):
   ```
   REACT_APP_API_URL = https://your-backend-url.railway.app
   ```
7. Click "Deploy"

---

## 4. Set Environment Variables in Vercel Dashboard

1. Go to your project on Vercel
2. Click **Settings** tab
3. Click **Environment Variables**
4. Add:
   | Name | Value | Environments |
   |------|-------|--------------|
   | `REACT_APP_API_URL` | `https://your-backend-url.railway.app` | Production, Preview, Development |

---

## 5. Update vercel.json

Edit `vercel.json` and replace `YOUR-BACKEND-URL` with your actual backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://microagent-backend.up.railway.app/api/$1"
    }
  ]
}
```

**Note**: The `/api` proxy is optional. If you set `REACT_APP_API_URL` directly, the frontend will call the backend URL directly. The rewrite is only needed if you want `/api` requests proxied.

---

## 6. Security Checklist

### ✅ Do This
- [ ] Backend API key stored ONLY in backend hosting (Railway/Render)
- [ ] `REACT_APP_` prefix used for frontend env vars
- [ ] CORS configured with specific origins (not `*` in production)
- [ ] API keys never committed to Git
- [ ] Use `.env` files locally, env vars in Vercel

### ⚠️ Never Do This
- [ ] Commit `.env` files to Git
- [ ] Put backend API keys in frontend code
- [ ] Use `*` for CORS in production
- [ ] Log sensitive environment variables

---

## 7. Verify Deployment

1. Open your Vercel deployment URL
2. Try sending a message
3. Check browser console for errors
4. Check backend logs for incoming requests

---

## Troubleshooting

### CORS Errors
```
Access-Control-Allow-Origin missing
```
**Fix**: Update `CORS_ORIGINS` in backend to include your Vercel domain:
```
CORS_ORIGINS=https://microagent.vercel.app
```

### API Not Found (404)
**Fix**: Verify `REACT_APP_API_URL` is set correctly and backend is running.

### Build Failed
**Fix**: Check that you're in the project root, not the frontend folder.

---

## Useful Commands

```bash
# Check Vercel deployment
vercel ls

# View deployment logs
vercel logs microagent

# Redeploy
vercel --prod

# Environment variables
vercel env add REACT_APP_API_URL
vercel env ls
```
