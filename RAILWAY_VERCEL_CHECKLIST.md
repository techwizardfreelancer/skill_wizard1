# ✅ Vercel + Railway Deployment Checklist

Complete this checklist before deploying to production.

---

## 🔍 Phase 1: Code Review

- [ ] Backend TypeScript compiles: `cd server && npm run build` ✅
- [ ] Frontend builds: `cd frontend && npm run build` ✅
- [ ] No hardcoded URLs in code (use environment variables)
- [ ] CORS configuration includes `process.env.FRONTEND_URL`
- [ ] `.env` files are in `.gitignore`
- [ ] Health check endpoint exists: `GET /api/health` ✅
- [ ] Authentication endpoints working locally
- [ ] Socket.io configured properly

---

## 📁 Phase 2: Configuration Files

### Backend Configuration

- [ ] `server/.env.example` created with all variables
- [ ] `server/package.json` has:
  - [ ] `"build": "tsc -p tsconfig.json"`
  - [ ] `"start": "node dist/index.js"`
- [ ] `server/src/index.ts` has:
  - [ ] CORS with `process.env.FRONTEND_URL`
  - [ ] MongoDB connection from `process.env.MONGO_URI`
  - [ ] Health check endpoint
- [ ] `railway.toml` created (or will use GitHub repo detection)
- [ ] `server/Procfile` exists with start command

### Frontend Configuration

- [ ] `frontend/.env.example` has `VITE_API_BASE_URL`
- [ ] `frontend/package.json` has `"build": "tsc --noEmit && vite build"`
- [ ] `frontend/vite.config.js` uses environment variables
- [ ] `frontend/src/services/api.js` uses `VITE_API_BASE_URL`
- [ ] `.gitignore` includes `.env` files

---

## 🌐 Phase 3: GitHub Setup

- [ ] Create GitHub account (if needed)
- [ ] Repository created: `skill-wizard-main`
- [ ] Code pushed to GitHub:

```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/skill-wizard.git
git branch -M main
git push -u origin main
```

- [ ] Repository is **public** (or Railway has access)
- [ ] Main branch is default

---

## 🚂 Phase 4: Railway Setup

### Create Account

- [ ] GitHub account ready
- [ ] Visit [railway.app](https://railway.app)
- [ ] Click "Start a new project"
- [ ] Sign up with GitHub
- [ ] Authorize Railway

### Deploy Backend

- [ ] New Project → Deploy from GitHub repo
- [ ] Select `skill_wizard-main` repository
- [ ] Railway detects Node.js project
- [ ] Build Command: `cd server && npm install && npm run build`
- [ ] Start Command: `node dist/index.js`
- [ ] Build completes successfully (check logs)

### Add MongoDB

- [ ] Click `+ Add Service`
- [ ] Select **MongoDB**
- [ ] MongoDB deployed and running
- [ ] `MONGO_URI` automatically added to environment
- [ ] Test MongoDB connection in logs

### Get Backend URL

- [ ] Backend deployment complete
- [ ] Go to Node.js service Settings
- [ ] Under Domains, click "Generate Domain"
- [ ] Copy domain: `https://YOUR-APP-XXXXX.railway.app`
- [ ] Save this URL for Vercel setup

### Environment Variables Set

- [ ] `NODE_ENV`: `production`
- [ ] `PORT`: `5000`
- [ ] `MONGO_URI`: Auto-provided by Railway
- [ ] `FRONTEND_URL`: (Will set after Vercel)

---

## 🎨 Phase 5: Vercel Setup

### Create Account

- [ ] Visit [vercel.com](https://vercel.com)
- [ ] Sign up with GitHub
- [ ] Authorize GitHub access

### Import Project

- [ ] Click "Add New" → "Project"
- [ ] Select "Import Git Repository"
- [ ] Find and select `skill_wizard-main`
- [ ] Click "Import"

### Configure

- [ ] **Framework**: Vite
- [ ] **Root Directory**: `./frontend`
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`
- [ ] **Install Command**: `npm install`

### Environment Variables

- [ ] **Key**: `VITE_API_BASE_URL`
- [ ] **Value**: `https://YOUR-RAILWAY-URL.railway.app/api` (from Phase 4)
- [ ] Click "Deploy"

### Deployment

- [ ] Build completes successfully
- [ ] Logs show successful deployment
- [ ] Get Vercel URL: `https://skill-wizard.vercel.app`
- [ ] Save this URL for Railway update

---

## 🔄 Phase 6: Final Configuration

### Update Railway CORS

- [ ] Go to Railway dashboard
- [ ] Select Node.js service
- [ ] Go to Variables tab
- [ ] Update `FRONTEND_URL`: `https://skill-wizard.vercel.app`
- [ ] Railway auto-redeploys with new URL
- [ ] Verify backend starts successfully

### Update Backend Code (Optional)

If you want to hardcode the Vercel URL as a fallback:

- [ ] Edit `server/src/index.ts`
- [ ] Add `'https://skill-wizard.vercel.app'` to `allowedOrigins`
- [ ] Commit and push to GitHub
- [ ] Railway auto-redeploys

```bash
git add .
git commit -m "Update CORS for production"
git push
```

---

## ✅ Phase 7: Testing

### Test Frontend Access

- [ ] Open `https://skill-wizard.vercel.app` in browser
- [ ] Page loads without errors
- [ ] See login page

### Test Login - Admin

- [ ] Username: `admin`
- [ ] Password: `Admin123!`
- [ ] Should redirect to `/admin/dashboard`
- [ ] Dashboard loads with data

### Test Login - Student

- [ ] Username: `student`
- [ ] Password: `Student123!`
- [ ] Should redirect to `/student/dashboard`
- [ ] Dashboard loads with data

### Test API Connection

```bash
# Check backend health
curl https://YOUR-RAILWAY-URL.railway.app/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Test Authentication API

```bash
# Test login endpoint
curl -X POST https://YOUR-RAILWAY-URL.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'

# Should return: {"user":{"id":"admin-1","username":"admin",...}}
```

### Test Real-time (Socket.io)

- [ ] Open DevTools → Network tab
- [ ] Filter by "WS" (WebSockets)
- [ ] Check for socket.io connection to Railway backend
- [ ] Connection should be secure (wss://)

### Test Across Browsers

- [ ] Chrome/Edge: Login works
- [ ] Firefox: Login works
- [ ] Safari: Login works
- [ ] Mobile: Login works

---

## 🔐 Phase 8: Security Verification

- [ ] HTTPS enabled on both Vercel and Railway ✅
- [ ] CORS restricted to known domains:
  - [ ] `https://skill-wizard.vercel.app`
  - [ ] Localhost only for development
- [ ] No API keys in frontend code
- [ ] No secrets in environment files
- [ ] `.env` in `.gitignore`
- [ ] MongoDB credentials secured
- [ ] Session cookies are `httpOnly`
- [ ] CORS allows `credentials: true`

---

## 📊 Phase 9: Monitoring Setup (Optional)

### Health Check Monitoring

- [ ] Go to [uptimerobot.com](https://uptimerobot.com)
- [ ] Create monitor:
  - [ ] Type: HTTP(s)
  - [ ] URL: `https://YOUR-RAILWAY-URL.railway.app/api/health`
  - [ ] Interval: 5 minutes
- [ ] Receive alerts if backend goes down

### View Logs

**Vercel:**
- [ ] Dashboard → Deployments → Select deployment
- [ ] View build and runtime logs

**Railway:**
- [ ] Dashboard → Node.js service
- [ ] Logs tab shows real-time logs
- [ ] Check for errors or warnings

---

## 🚀 Phase 10: Go Live!

### Pre-Launch Checklist

- [ ] All tests pass
- [ ] CORS working
- [ ] Authentication working
- [ ] Real-time features working
- [ ] Database connection working
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile responsive

### Share Your URLs

- [ ] Frontend: `https://skill-wizard.vercel.app` ✅
- [ ] Backend: `https://your-api.railway.app` ✅
- [ ] Status: 🟢 LIVE

---

## 📱 What's Deployed

- ✅ React Frontend on Vercel
- ✅ Express Backend on Railway
- ✅ MongoDB Database on Railway
- ✅ Socket.io Real-time
- ✅ Job Queue (BullMQ)
- ✅ Authentication (Cookies + Session)

---

## 💰 Monthly Cost

| Service | Cost |
|---------|------|
| Vercel | $0 |
| Railway | $5/month |
| **Total** | **$5/month** |

---

## 🎉 Deployment Complete!

Your app is now live and accessible worldwide! 🌍

### Next Steps

1. Monitor performance and logs
2. Gather user feedback
3. Plan future features
4. Scale infrastructure as needed

---

## 📞 Support

| Issue | Resource |
|-------|----------|
| Vercel help | https://vercel.com/docs |
| Railway help | https://docs.railway.app |
| MongoDB help | https://docs.mongodb.com |
| Git help | https://git-scm.com/doc |

---

## 🔗 Quick Links

- GitHub Repo: `https://github.com/YOUR_USERNAME/skill-wizard`
- Vercel Dashboard: `https://vercel.com/dashboard`
- Railway Dashboard: `https://railway.app/dashboard`
- Frontend URL: `https://skill-wizard.vercel.app`
- Backend URL: `https://YOUR-APP.railway.app`

---

**Last Updated**: 2024
**Status**: Ready for Deployment ✅
