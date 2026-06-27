# 🚀 Skill Wizard - Free Deployment Guide

Deploy your app completely free using Vercel, Render, and MongoDB Atlas.

---

## Phase 1: Prepare Code for Deployment

### 1.1 Update Backend Configuration

Create `server/.env` file:
```
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/skill_wizard
NODE_ENV=production
PORT=5000
```

Update `server/src/index.ts` CORS to accept frontend URL:
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://your-vercel-domain.vercel.app'],
  credentials: true
}));
```

### 1.2 Update Frontend Configuration

Create `frontend/.env.production`:
```
VITE_API_URL=https://your-render-backend.onrender.com
```

Update `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});
```

Update `frontend/vite.config.js` for production:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  },
  // Remove proxy in production build
});
```

---

## Phase 2: Set Up MongoDB Atlas (Free Database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Sign up** with email
3. **Create Organization** → **Create Project**
4. **Build a Database** → Select **Free (M0)** tier
5. **Region**: Select closest to your users
6. **Create Cluster** (wait 2-3 minutes)
7. **Security** → **Database Access**:
   - Add new database user
   - Username: `skill_wizard_user`
   - Password: Generate strong password (save it!)
   - Select "Read and write to any database"
8. **Network Access**:
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ✅ Confirm
9. **Connect**:
   - Click "Drivers" → Node.js
   - Copy connection string
   - Replace `<username>` and `<password>` with your credentials
   - Example: `mongodb+srv://skill_wizard_user:YourPassword123@cluster.mongodb.net/skill_wizard`

**Save this connection string** — you'll need it for Render.

---

## Phase 3: Deploy Backend to Render.com (Free)

1. Go to [render.com](https://render.com)
2. **Sign up** with GitHub account (easier!)
3. **New +** → **Web Service**
4. **Connect Repository**:
   - Authorize GitHub
   - Select `skill_wizard-main` repo
   - Branch: `main`
5. **Configure Web Service**:
   - **Name**: `skill-wizard-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Plan**: Free
6. **Environment Variables**:
   - Click **Add Environment Variable**
   - Key: `MONGO_URI`
   - Value: `mongodb+srv://skill_wizard_user:YourPassword@cluster.mongodb.net/skill_wizard`
   - Key: `NODE_ENV`
   - Value: `production`
   - Key: `PORT`
   - Value: `5000`
7. **Deploy** (wait 3-5 minutes)
8. **Get your URL**:
   - Copy the URL from dashboard (example: `https://skill-wizard-backend.onrender.com`)
   - Save this — you need it for frontend!

---

## Phase 4: Deploy Frontend to Vercel (Free)

1. Go to [vercel.com](https://vercel.com)
2. **Sign up** with GitHub account
3. **Import Project**:
   - Select `skill_wizard-main` repo
   - Root directory: `./frontend`
4. **Build Settings**:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://your-render-backend.onrender.com` (from Phase 3)
6. **Deploy** (1-2 minutes)
7. **Get your URL**:
   - Vercel gives you a live URL (example: `https://skill-wizard.vercel.app`)

---

## Phase 5: Update Backend CORS for Production

After you have both URLs:

Update `server/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://skill-wizard.vercel.app',  // Your Vercel frontend URL
  ],
  credentials: true
}));
```

Push to GitHub → Render auto-redeploys.

---

## Phase 6: Keep Backend Awake (Optional)

To prevent Render spin-down on free tier, use a monitoring service:

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. **Sign up** (free)
3. **Create Monitor**:
   - Type: HTTP(s)
   - URL: `https://your-render-backend.onrender.com/api/health`
   - Interval: 5 minutes
4. This pings your backend every 5 min → keeps it warm

---

## Testing Your Live Deployment

✅ **Test Frontend**: Visit `https://your-app.vercel.app/login`
✅ **Test Login**: Use `admin`/`Admin123!` or `student`/`Student123!`
✅ **Test API**: Visit `https://your-render-backend.onrender.com/api/health`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Check `origin` in server/src/index.ts includes your Vercel URL |
| "Cannot connect to MongoDB" | Verify MongoDB Atlas connection string in Render env vars |
| Render backend slow first request | Normal on free tier — it spins down after 15 min inactivity |
| Vercel build fails | Check `frontend/vite.config.js` — ensure no hardcoded localhost URLs |

---

## Cost Breakdown

- ✅ **Vercel Frontend**: $0 (free forever)
- ✅ **Render Backend**: $0 (free tier)
- ✅ **MongoDB Database**: $0 (free tier, 512MB)
- ✅ **UptimeRobot Monitoring**: $0 (free tier)

**Total: $0/month** 🎉

---

## Next Steps

1. Create GitHub account if you don't have one
2. Push your code to GitHub
3. Follow Phase 2-5 above
4. Share your live URL!
