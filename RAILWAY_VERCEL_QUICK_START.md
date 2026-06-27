# 🚀 Skill Wizard - Railway + Vercel: Quick Start (20 minutes)

## 🎯 Your Mission

Get Skill Wizard live with:
- **Frontend**: Vercel (React/Vite)
- **Backend**: Railway (Express/Node.js)
- **Database**: Railway (MongoDB)
- **Cost**: $5/month

## ⏱️ Timeline

- Step 1: GitHub (2 min)
- Step 2: Railway Backend (5 min)
- Step 3: Vercel Frontend (5 min)
- Step 4: Connect URLs (2 min)
- Step 5: Test (6 min)

---

## 📋 Prerequisites

Before starting, you need:

✅ GitHub account (free at github.com)  
✅ Your code pushed to GitHub  
✅ Vercel account (free)  
✅ Railway account (free, $5 credit included)  

---

## 🚀 Step 1: Push Code to GitHub (2 min)

```bash
# Navigate to project
cd skill_wizard-main

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/skill-wizard.git
git branch -M main
git push -u origin main
```

**✅ Status**: Code is now on GitHub

---

## 🚂 Step 2: Deploy Backend on Railway (5 min)

### 2.1 Create Railway Account

1. Go to **[railway.app](https://railway.app)**
2. Click **"Start a new project"**
3. **Sign up with GitHub**
4. Authorize Railway

### 2.2 Deploy Backend

1. Click **"New Project"**
2. **Deploy from GitHub repo**
3. Select `skill-wizard-main`
4. Railway auto-detects Node.js project
5. Wait for deployment (3-5 min)

### 2.3 Add MongoDB

1. In Railway dashboard, click **"+ Add Service"**
2. Select **"MongoDB"**
3. MongoDB deploys automatically ✅
4. Your backend can now access MongoDB!

### 2.4 Get Your Backend URL

1. Click your **Node.js service**
2. Go to **Settings** → **Domains**
3. Click **"Generate Domain"**
4. Copy your URL (example: `https://skill-wizard-prod.railway.app`)
5. **Save this URL!** You need it for Vercel.

**✅ Status**: Backend is live at `https://your-api.railway.app`

---

## 🎨 Step 3: Deploy Frontend on Vercel (5 min)

### 3.1 Create Vercel Account

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"**
3. **Sign up with GitHub**
4. Authorize Vercel

### 3.2 Import Project

1. Click **"Add New"** → **"Project"**
2. **Import Git Repository**
3. Find `skill-wizard-main`
4. Click **"Import"**

### 3.3 Configure

On the "Configure Project" screen:

- **Framework**: Select `Vite`
- **Root Directory**: `./frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.4 Add API URL

Under **Environment Variables**:

- **Name**: `VITE_API_BASE_URL`
- **Value**: `https://YOUR-RAILWAY-URL.railway.app/api`
  - (Replace with your actual Railway URL from Step 2.4)

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. You'll get a Vercel URL (example: `https://skill-wizard.vercel.app`)
4. **Save this URL!** You need it for Railway.

**✅ Status**: Frontend is live at `https://your-app.vercel.app`

---

## 🔄 Step 4: Connect the URLs (2 min)

### 4.1 Update Railway with Vercel URL

1. Go to **Railway dashboard**
2. Click your **Node.js service**
3. Go to **Variables** tab
4. Click **"New Variable"**
   - Name: `FRONTEND_URL`
   - Value: `https://skill-wizard.vercel.app` (your Vercel URL)
5. Save
6. Railway auto-redeploys ✅

**✅ Status**: Frontend and Backend connected

---

## ✅ Step 5: Test Everything (6 min)

### Test 1: Open Frontend

1. Go to `https://skill-wizard.vercel.app/login`
2. You should see the login page
3. ✅ If page loads → **WORKS!**

### Test 2: Login as Admin

1. Enter Username: `admin`
2. Enter Password: `Admin123!`
3. Click "Sign In"
4. Should see admin dashboard ✅

### Test 3: Login as Student

1. Go back to login page
2. Username: `student`
3. Password: `Student123!`
4. Should see student dashboard ✅

### Test 4: Check API

```bash
# Run this in terminal
curl https://YOUR-RAILWAY-URL.railway.app/api/health

# You should see:
# {"status":"ok","timestamp":"2024-01-01T..."}
```

If all tests pass → **🎉 YOU'RE LIVE!**

---

## 📊 Your Live URLs

```
Frontend:  https://skill-wizard.vercel.app
Backend:   https://YOUR-APP-XXXXX.railway.app
Database:  MongoDB (managed by Railway)
```

---

## 💰 Cost

- **Vercel**: $0 (free forever)
- **Railway**: $5/month (includes generous free credit)
- **Total**: **$5/month**

---

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| "Cannot GET /" | Frontend not built. Check Vercel logs. |
| CORS error | Make sure `FRONTEND_URL` is set in Railway |
| Login fails | Check Railway logs for backend errors |
| API connection refused | Verify Railway backend is running (green status) |

---

## 🎓 What Happened?

1. ✅ Pushed code to GitHub
2. ✅ Railway deployed backend (Express + MongoDB)
3. ✅ Vercel deployed frontend (React)
4. ✅ Connected frontend to backend via URL
5. ✅ Set up authentication
6. ✅ Configured CORS

**Result**: Your app is live! 🚀

---

## 📱 Share Your App

Your live URL:
```
https://skill-wizard.vercel.app
```

Send this link to anyone to use your app!

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **GitHub Help**: https://docs.github.com

---

## ✨ Congratulations!

Your Skill Wizard app is now **LIVE** and accessible worldwide! 🌍

**Next Steps:**
- Monitor performance
- Gather user feedback
- Plan new features
- Celebrate! 🎉
