# ✅ Pre-Deployment Checklist

Use this checklist before pushing to GitHub and deploying to Vercel/Render.

## 1️⃣ Code Preparation

- [ ] Backend: Update `server/.env.example` ✅ Done
- [ ] Frontend: Update `frontend/.env.example` ✅ Done  
- [ ] Backend: CORS configuration updated ✅ Done
- [ ] Backend: Health check endpoint added ✅ Done
- [ ] Frontend: API service uses `VITE_API_BASE_URL` ✅ Done

## 2️⃣ GitHub Setup

- [ ] Create free account at [github.com](https://github.com)
- [ ] Create new repository `skill-wizard` (or any name)
- [ ] Clone to your machine or push existing code:

```bash
# Option A: Push existing code
cd skill_wizard-main
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/skill-wizard.git
git branch -M main
git push -u origin main
```

## 3️⃣ MongoDB Atlas (Database)

- [ ] Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Create account → Organization → Project → Free M0 cluster
- [ ] Create database user: `skill_wizard_user`
- [ ] Save password securely
- [ ] Network Access: Allow from anywhere (0.0.0.0/0)
- [ ] Get connection string (save it!)
  - Format: `mongodb+srv://skill_wizard_user:PASSWORD@cluster.mongodb.net/skill_wizard`

## 4️⃣ Deploy Backend to Render.com

- [ ] Go to [render.com](https://render.com)
- [ ] Sign up with GitHub
- [ ] New → Web Service
- [ ] Connect your GitHub repo
- [ ] Configure:
  - Name: `skill-wizard-backend`
  - Build Command: `cd server && npm install && npm run build`
  - Start Command: `node dist/index.js`
  - Plan: **Free**

- [ ] Add Environment Variables:
  - `MONGO_URI`: Your MongoDB connection string from step 3
  - `NODE_ENV`: `production`
  - `PORT`: `5000`
  - `FRONTEND_URL`: (Add after step 5)

- [ ] Deploy (wait 3-5 minutes)
- [ ] Copy your Render URL: `https://skill-wizard-backend.onrender.com`

## 5️⃣ Deploy Frontend to Vercel

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign up with GitHub
- [ ] Import Project → Select your GitHub repo
- [ ] Configure:
  - Root Directory: `./frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

- [ ] Add Environment Variable:
  - `VITE_API_BASE_URL`: Your Render URL from step 4
    - Format: `https://skill-wizard-backend.onrender.com/api`

- [ ] Deploy (1-2 minutes)
- [ ] Copy your Vercel URL: `https://skill-wizard.vercel.app`

## 6️⃣ Final Configuration

- [ ] Update `server/src/index.ts` to add Vercel URL to CORS allowed origins
- [ ] Push changes to GitHub (Render auto-redeploys)
- [ ] Add Vercel URL to Render environment variable `FRONTEND_URL`

## 7️⃣ Optional: Keep Backend Warm

- [ ] Go to [uptimerobot.com](https://uptimerobot.com)
- [ ] Sign up (free)
- [ ] Create Monitor:
  - Type: HTTP(s)
  - URL: `https://skill-wizard-backend.onrender.com/api/health`
  - Interval: 5 minutes
- [ ] ✅ Backend stays warm (prevents Render spin-down)

## 8️⃣ Testing

- [ ] Open `https://your-vercel-url.vercel.app/login`
- [ ] Test login with `admin`/`Admin123!`
- [ ] Verify redirect to `/admin/dashboard`
- [ ] Test login with `student`/`Student123!`
- [ ] Verify redirect to `/student/dashboard`
- [ ] Verify backend `/api/health` returns 200

## 🎉 You're Live!

Share your URL:
```
🔗 Frontend: https://your-app.vercel.app
🔗 Backend: https://your-backend.onrender.com
🔗 Database: MongoDB Atlas (free tier)
💰 Cost: $0/month
```

---

## Troubleshooting

**Issue: "CORS error" in browser console**
- Solution: Verify Vercel URL is in `FRONTEND_URL` env var on Render

**Issue: "Cannot connect to MongoDB"**
- Solution: Check MongoDB connection string in Render env vars
- Verify MongoDB user password is correct
- Verify Network Access allows 0.0.0.0/0

**Issue: Render backend slow on first request**
- Solution: This is normal on free tier (spins down after 15 min)
- Use UptimeRobot to keep it warm

**Issue: "404" when accessing frontend routes**
- Solution: Vercel automatically handles Vite SPA routing (no config needed)

---

## Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com/atlas/
