# 🚀 Skill Wizard - Vercel + Railway Deployment Guide

Deploy your full-stack app to **Vercel** (Frontend) and **Railway** (Backend + Database)

---

## 📊 Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                     Your Users                              │
└─────────────────────┬──────────────────────────────────────┘
                      │
          ┌───────────▼────────────┐
          │  VERCEL (Frontend)     │
          │  React/Vite App        │
          │  https://app.vercel.app│
          └───────────┬────────────┘
                      │ API Calls
          ┌───────────▼────────────────────┐
          │  RAILWAY (Backend + DB)        │
          │  Express.js + MongoDB          │
          │  https://api.railway.app       │
          │  ┌─────────────────────────┐   │
          │  │ Node.js Server (Port    │   │
          │  │ 5000)                   │   │
          │  └──────────────┬──────────┘   │
          │                 │              │
          │  ┌──────────────▼──────────┐   │
          │  │ MongoDB Database        │   │
          │  │ (included in Railway)   │   │
          │  └─────────────────────────┘   │
          └────────────────────────────────┘
```

---

## 🎯 Why Vercel + Railway?

| Feature | Vercel | Railway |
|---------|--------|---------|
| **Frontend** | ✅ Perfect | N/A |
| **Backend** | ❌ Not ideal | ✅ Great |
| **Database** | N/A | ✅ Included |
| **Free Tier** | ✅ Always free | ✅ $5 credit/month |
| **Cold Starts** | ✅ None | ⚡ Very fast |
| **Real-time** | - | ✅ Socket.io ready |
| **Scaling** | ✅ Automatic | ✅ Automatic |

---

## 📋 Phase 1: Prepare Your Code

### 1.1 Update Backend Configuration

**Create `server/.env.example`:**
```bash
# MongoDB (Railway provides this automatically)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skill_wizard

# Server
NODE_ENV=production
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app

# Optional: Redis (if using BullMQ)
REDIS_URL=redis://localhost:6379
```

### 1.2 Update Frontend Configuration

**Create `frontend/.env.production`:**
```bash
# Your Railway backend URL (will be provided after deployment)
VITE_API_BASE_URL=https://your-api.railway.app/api
```

### 1.3 Verify Build Scripts

**Backend `server/package.json`:**
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
  }
}
```

**Frontend `frontend/package.json`:**
```json
{
  "scripts": {
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview"
  }
}
```

---

## 📊 Phase 2: Set Up Railway

Railway is simpler than Render and includes MongoDB!

### 2.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a new project"**
3. **Sign up with GitHub** (easier!)
4. Authorize Railway to access your repos

### 2.2 Deploy Backend to Railway

1. **New Project** → **Deploy from GitHub repo**
2. Select your `skill_wizard-main` repository
3. Railway automatically detects Node.js project
4. **Build Configuration**:
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `node dist/index.js`
   - Root Directory: Leave empty (Railway handles it)

5. **Environment Variables**:
   - Click **Variables** tab
   - Add:
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `FRONTEND_URL`: (Will update later)
   
   ⚠️ **Don't add `MONGO_URI` yet** - Railway provides it!

### 2.3 Add MongoDB to Railway

1. In Railway dashboard, click **+ Add Service**
2. Select **MongoDB**
3. Railway auto-generates connection string as `MONGO_URI` environment variable
4. Your backend automatically connects! 🎉

### 2.4 Get Your Railway Backend URL

1. After deployment, click your **Node.js service**
2. Go to **Settings** tab
3. Under **Domains**, click **Generate Domain**
4. You'll get: `https://YOUR-APP-XXXXXX.railway.app`
5. **Copy this URL** - you'll need it for Vercel

### 2.5 Update Railway Environment

1. Go back to **Variables** tab
2. Edit `FRONTEND_URL`: (will update after Vercel deployment)

---

## 🎨 Phase 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. **Sign up with GitHub**
3. Grant access to your repositories

### 3.2 Import Project

1. Click **Add New** → **Project**
2. **Import Git Repository**
3. Find `skill_wizard-main` repo
4. Click **Import**

### 3.3 Configure Project

On the Configuration screen:

**Project Settings:**
- Framework: **Vite**
- Root Directory: `./frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
- Key: `VITE_API_BASE_URL`
- Value: `https://YOUR-RAILWAY-URL.railway.app/api` (from Phase 2.4)

### 3.4 Deploy

1. Click **Deploy**
2. Wait for build to complete (1-2 minutes)
3. You'll get a Vercel URL: `https://skill-wizard.vercel.app`
4. **Copy this URL**

---

## 🔄 Phase 4: Final Configuration

### 4.1 Update Railway CORS

Now that you have your Vercel URL:

1. Go to Railway dashboard
2. Select **Node.js service**
3. Go to **Variables** tab
4. Update `FRONTEND_URL`: `https://skill-wizard.vercel.app`
5. **Deploy** (Railway auto-redeploys)

### 4.2 Update Backend CORS in Code

**Edit `server/src/index.ts`:**

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://skill-wizard.vercel.app',  // Your Vercel URL
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

### 4.3 Push Changes

```bash
git add .
git commit -m "Update CORS for production deployment"
git push
```

Railway and Vercel automatically redeploy! 🚀

---

## ✅ Phase 5: Verification

### 5.1 Test Frontend

1. Open `https://skill-wizard.vercel.app/login`
2. Should see login page

### 5.2 Test Login

**Admin Account:**
- Username: `admin`
- Password: `Admin123!`

**Student Account:**
- Username: `student`
- Password: `Student123!`

### 5.3 Test API Connection

```bash
# Check if backend is running
curl https://YOUR-RAILWAY-URL.railway.app/api/health

# Should return:
# {"status":"ok","timestamp":"2024-01-01T00:00:00Z"}
```

### 5.4 Test Socket.io (Real-time)

If you're using Socket.io:
1. Open DevTools → Network tab
2. Filter by "WS" (WebSockets)
3. Check for socket.io connection

---

## 🛠️ Advanced Configuration

### A. Custom Domain (Optional)

**For Vercel:**
1. Go to Vercel dashboard → Project Settings
2. Add your domain
3. Update DNS records (Vercel provides instructions)

**For Railway:**
1. Similar process in Railway dashboard
2. Add custom domain to Node.js service

### B. SSL/HTTPS (Automatic)

✅ Both Vercel and Railway provide free SSL certificates

### C. Monitoring & Logs

**Vercel:**
- Dashboard → Deployments → View logs

**Railway:**
- Dashboard → Service → Logs tab
- Real-time logs visible here

---

## 💰 Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel Frontend | Always free | $0 |
| Railway Backend | $5 credit/month | $5/month |
| Railway MongoDB | Included | Included |
| **Total** | - | **$5/month** |

💡 Railway's $5 credit covers most dev/testing scenarios!

---

## 🆘 Troubleshooting

### CORS Error in Browser

**Problem:** `Access to XMLHttpRequest blocked by CORS`

**Solution:**
1. Check `VITE_API_BASE_URL` is correct in Vercel
2. Verify `FRONTEND_URL` in Railway environment
3. Check `allowedOrigins` in `server/src/index.ts`
4. Redeploy both services

### API Returns 502 Bad Gateway

**Problem:** Railway backend not responding

**Solution:**
1. Check Railway logs: Dashboard → Logs
2. Verify `MONGO_URI` is set
3. Check `NODE_ENV=production`
4. Verify build command succeeded

### MongoDB Connection Failed

**Problem:** "Cannot connect to MongoDB"

**Solution:**
1. Railway should auto-provide `MONGO_URI`
2. Check Variables tab for `MONGO_URI`
3. If missing, manually add MongoDB service
4. Redeploy backend

### Socket.io Connection Refused

**Problem:** Real-time features not working

**Solution:**
1. Verify `socket.io` is listening on same port as API
2. Check CORS allows WebSocket upgrades
3. Verify `/socket.io` proxy in vite.config (dev only)

---

## 📚 Key Files Updated

| File | Change |
|------|--------|
| `server/src/index.ts` | CORS configured for Vercel URL |
| `frontend/.env.production` | API base URL points to Railway |
| `server/package.json` | Build & start scripts ready |
| `frontend/package.json` | Vite build ready |

---

## 🔐 Security Checklist

- [ ] `.env` files added to `.gitignore` ✅
- [ ] No hardcoded secrets in code ✅
- [ ] Environment variables set via dashboards ✅
- [ ] CORS restricted to known domains ✅
- [ ] HTTPS enabled (automatic) ✅
- [ ] MongoDB credentials secured ✅

---

## 📱 What's Deployed

### Frontend (Vercel)
- ✅ React App
- ✅ All 40+ pages
- ✅ Authentication UI
- ✅ Real-time components

### Backend (Railway)
- ✅ Express API
- ✅ Authentication endpoints
- ✅ Compiler service
- ✅ Submission processing
- ✅ Socket.io server
- ✅ Job queue (BullMQ)

### Database (Railway MongoDB)
- ✅ User data
- ✅ Questions
- ✅ Submissions
- ✅ Assessments

---

## 🚀 Your Live URLs

After following all phases:

```
🌐 Frontend: https://skill-wizard.vercel.app
🔗 Backend: https://api.railway.app (exact URL from Railway)
🗄️ Database: MongoDB (managed by Railway)
💰 Cost: $5/month
```

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **MongoDB Docs**: https://docs.mongodb.com

---

**Ready? Start with Phase 1 and work through each phase!** 🎉
