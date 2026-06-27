# Full Codebase Architecture Analysis

## 📊 Project Overview

Skill Wizard is a full-stack educational platform with:
- **Online coding assessments**
- **Real-time code compilation**
- **Admin dashboard** for question management
- **Student portal** for taking assessments
- **Socket.io** for real-time updates

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│  (Chrome, Firefox, Safari on Desktop/Mobile)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTPS/WS
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼──────┐  ┌──────▼────┐  ┌──────▼────┐
   │  Vercel   │  │  Vercel   │  │  Vercel   │
   │ (Frontend)│  │   CDN     │  │  Cache    │
   │  React    │  │  Static   │  │ (Gzip)    │
   │   Vite    │  │  Assets   │  │           │
   └────┬──────┘  └───────────┘  └───────────┘
        │
        │ API Calls + WebSocket
        │ (to api.railway.app)
        │
   ┌────▼─────────────────────────────┐
   │   RAILWAY DEPLOYMENT              │
   │                                   │
   │  ┌──────────────────────────────┐ │
   │  │  Node.js Server (Port 5000)  │ │
   │  │  Express.js Framework        │ │
   │  │                              │ │
   │  │  ├─ AuthController.ts        │ │
   │  │  │  ├─ login()               │ │
   │  │  │  ├─ logout()              │ │
   │  │  │  └─ googleLogin()         │ │
   │  │  │                           │ │
   │  │  ├─ CompilerController.ts    │ │
   │  │  │  ├─ compileCode()         │ │
   │  │  │  └─ submitAssessment()    │ │
   │  │  │                           │ │
   │  │  ├─ Socket.io Server        │ │
   │  │  │  └─ Broadcast events     │ │
   │  │  │                           │ │
   │  │  ├─ BullMQ Job Queue        │ │
   │  │  │  └─ Process submissions  │ │
   │  │  │                           │ │
   │  │  └─ Redis (Job Storage)     │ │
   │  └──────────────┬───────────────┘ │
   │                 │                  │
   │  ┌──────────────▼───────────────┐ │
   │  │   MongoDB Database           │ │
   │  │   (Managed by Railway)       │ │
   │  │                              │ │
   │  │  Collections:                │ │
   │  │  ├─ users                    │ │
   │  │  ├─ questions                │ │
   │  │  ├─ submissions              │ │
   │  │  ├─ assessments              │ │
   │  │  ├─ courses                  │ │
   │  │  └─ codereview               │ │
   │  └──────────────────────────────┘ │
   │                                   │
   └───────────────────────────────────┘
```

---

## 📂 Directory Structure

```
skill_wizard-main/
│
├── frontend/                          # React/Vite App (deployed to Vercel)
│   ├── src/
│   │   ├── App.jsx                   # Main app router
│   │   ├── main.jsx                  # Entry point
│   │   ├── index.css                 # Global styles
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         # 🔐 Auth UI
│   │   │   ├── admin/                # 👨‍💼 Admin Pages (20+ files)
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ManageQuestionsPage.jsx
│   │   │   │   ├── CreateQuestionPage.jsx
│   │   │   │   ├── ManageStudentsPage.jsx
│   │   │   │   ├── ManageAssessmentsPage.jsx
│   │   │   │   ├── CreateAssessmentPage.jsx
│   │   │   │   ├── AdminAssessmentsPage.jsx
│   │   │   │   ├── AdminAttemptsPage.jsx
│   │   │   │   ├── ManageCodeReviewsPage.jsx
│   │   │   │   └── ... (more admin pages)
│   │   │   │
│   │   │   └── student/              # 👤 Student Pages (17+ files)
│   │   │       ├── StudentDashboard.jsx
│   │   │       ├── AssessmentsPage.jsx
│   │   │       ├── CodeEditorPage.jsx
│   │   │       ├── AssignmentsPage.jsx
│   │   │       ├── StudentCoursesPage.jsx
│   │   │       ├── MyCoursesPage.jsx
│   │   │       ├── PerformanceAnalyticsPage.jsx
│   │   │       ├── ProfilePage.jsx
│   │   │       └── ... (more student pages)
│   │   │
│   │   ├── components/
│   │   │   ├── admin/                # Admin-specific components
│   │   │   │   ├── AdminSidebar.jsx
│   │   │   │   └── AdminTopbar.jsx
│   │   │   │
│   │   │   ├── student/              # Student-specific components
│   │   │   │   ├── StudentSidebar.jsx
│   │   │   │   ├── StudentTopbar.jsx
│   │   │   │   └── SubmissionStatusBanner.jsx
│   │   │   │
│   │   │   └── ui/                   # Shared UI components
│   │   │       └── StatCard.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # 🔑 Global auth state
│   │   │
│   │   ├── hooks/
│   │   │   └── useSocket.js          # 🔌 WebSocket hook
│   │   │
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx       # Admin page wrapper
│   │   │   └── StudentLayout.jsx     # Student page wrapper
│   │   │
│   │   └── services/
│   │       ├── api.js                # 🌐 Axios instance (API calls)
│   │       ├── socketService.js      # 🔌 Socket.io client
│   │       └── codeService.js        # 💾 Code execution API
│   │
│   ├── public/                       # Static assets
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── vite.config.js                # Vite build config
│   ├── tailwind.config.js            # Tailwind CSS
│   ├── postcss.config.js             # PostCSS config
│   └── .env.example                  # Environment template
│
├── server/                           # Express/Node.js Backend (deployed to Railway)
│   ├── src/
│   │   ├── index.ts                  # 🚀 Server entry point
│   │   │   - Express setup
│   │   │   - CORS configuration
│   │   │   - MongoDB connection
│   │   │   - Socket.io initialization
│   │   │   - Error handling middleware
│   │   │
│   │   ├── config/
│   │   │   └── db.ts                 # MongoDB connection
│   │   │
│   │   ├── controllers/
│   │   │   ├── AuthController.ts     # 🔐 Authentication logic
│   │   │   │   - login(username, password)
│   │   │   │   - me() - Get current user
│   │   │   │   - googleLogin(idToken)
│   │   │   │   - logout()
│   │   │   │
│   │   │   └── CompilerController.ts # 🔨 Code compilation
│   │   │       - compileCode()
│   │   │       - submitAssessment()
│   │   │       - getSubmissionStatus()
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts               # User data model
│   │   │   ├── Question.ts           # Question model
│   │   │   ├── Submission.ts         # Code submission
│   │   │   ├── Assessment.ts         # Assessment
│   │   │   ├── Course.ts             # Course
│   │   │   └── CodeReview.ts         # Code review
│   │   │
│   │   ├── services/
│   │   │   ├── CompilerService.ts    # 🔨 Compiler orchestration
│   │   │   ├── SubmissionService.ts  # 📝 Submission processing
│   │   │   ├── QuestionRepository.ts # Question database access
│   │   │   └── SubmissionRepository.ts # Submission DB access
│   │   │
│   │   ├── compiler/                 # 🔨 Code compilation engine
│   │   │   ├── index.ts              # Main compiler entry
│   │   │   ├── languages/            # Language-specific configs
│   │   │   │   ├── python.ts
│   │   │   │   ├── javascript.ts
│   │   │   │   ├── cpp.ts
│   │   │   │   ├── java.ts
│   │   │   │   ├── go.ts
│   │   │   │   ├── csharp.ts
│   │   │   │   ├── rust.ts
│   │   │   │   └── c.ts
│   │   │   │
│   │   │   └── sandbox/              # 🐳 Docker sandbox
│   │   │       ├── SandboxManager.ts
│   │   │       ├── DockerRunner.ts
│   │   │       ├── ContainerPool.ts
│   │   │       └── ResourceTracker.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.ts         # 🔐 /api/auth endpoints
│   │   │   │   - POST /login
│   │   │   │   - POST /google-login
│   │   │   │   - GET /me
│   │   │   │   - POST /logout
│   │   │   │
│   │   │   └── compilerRoutes.ts     # 🔨 /api/compiler endpoints
│   │   │       - POST /compile
│   │   │       - POST /submit
│   │   │       - GET /status
│   │   │
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts       # Error handling
│   │   │   └── validateRequest.ts    # Input validation
│   │   │
│   │   ├── sockets/
│   │   │   └── socketServer.ts       # 🔌 Socket.io server
│   │   │       - Compilation events
│   │   │       - Submission events
│   │   │       - Code review events
│   │   │
│   │   └── workers/
│   │       └── SubmissionWorker.ts   # 📋 Background job processor
│   │           - Process queue jobs
│   │           - Run hidden test cases
│   │           - Broadcast results
│   │
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── Dockerfile                    # Docker container
│   ├── docker-compose.yml            # Docker compose setup
│   ├── Procfile                      # Railway/Heroku config
│   ├── .env.example                  # Environment template
│   └── dist/                         # 🔨 Compiled JavaScript
│
├── RAILWAY_VERCEL_DEPLOYMENT.md      # 📖 Deployment guide (Vercel + Railway)
├── RAILWAY_VERCEL_QUICK_START.md     # ⚡ Quick 20-min setup
├── RAILWAY_VERCEL_CHECKLIST.md       # ✅ Pre-deployment checklist
├── TECHNICAL_ANALYSIS.md             # 📊 Full code analysis
├── railway.toml                      # 🚂 Railway config
├── vercel.json                       # ▲ Vercel config
├── render.yaml                       # 📦 Render config (alternative)
├── package.json                      # Workspace root config
└── .gitignore                        # Git ignore patterns
```

---

## 🔄 Data Flow Architecture

### 1️⃣ Authentication Flow

```
User Browser
    │
    ├─→ Enter Credentials (username/password)
    │
    └─→ POST /api/auth/login
         │
         ├─→ AuthController.login()
         │   │
         │   └─→ Validate credentials (dev: admin/Admin123!, student/Student123!)
         │
         ├─→ Create JWT payload
         │
         ├─→ Set HTTP-only cookie
         │   └─→ skill_wizard_user cookie (7 days expiry)
         │
         └─→ Return user object
              {
                "id": "admin-1",
                "username": "admin",
                "role": "admin",
                "email": "admin@college.edu"
              }

Frontend
    │
    └─→ Store in AuthContext
        │
        └─→ Check user.role
            ├─→ role === "admin" → Redirect to /admin/dashboard
            └─→ role === "student" → Redirect to /student/dashboard
```

### 2️⃣ Code Compilation Flow

```
Student clicks "Run Code"
    │
    └─→ POST /api/compiler/compile
         │
         ├─→ CompilerController.compileCode()
         │
         ├─→ Extract code + language + test cases
         │
         ├─→ CompilerService.compile()
         │
         ├─→ DockerRunner
         │   │
         │   ├─→ Create Docker container
         │   ├─→ Mount code volume
         │   ├─→ Run compiler
         │   ├─→ Run visible test cases
         │   ├─→ Capture output
         │   └─→ Clean up container
         │
         └─→ Return results to frontend
              {
                "status": "success",
                "output": "...",
                "testResults": [...]
              }

Frontend (Socket.io)
    │
    ├─→ Listen for socket event 'compilation:result'
    │
    └─→ Display results to student
```

### 3️⃣ Code Submission Flow

```
Student clicks "Submit Assessment"
    │
    └─→ POST /api/compiler/submit
         │
         ├─→ Save submission to MongoDB
         │
         ├─→ Create BullMQ job
         │
         ├─→ Return submission ID immediately
         │
         └─→ Socket.io: "submission:queued"

Backend Job Queue (BullMQ)
    │
    ├─→ SubmissionWorker processes job
    │
    ├─→ Run hidden test cases
    │
    ├─→ Calculate score
    │
    ├─→ Update submission status
    │
    └─→ Socket.io: "submission:completed"
         │
         └─→ Broadcast to student browser
              │
              └─→ Frontend displays score + results
```

### 4️⃣ Socket.io Real-time Events

```
Frontend (Socket.io Client)
    │
    ├─→ Connect to backend
    │   └─→ Establish WebSocket
    │
    ├─→ Listen for events:
    │   │
    │   ├─ 'compilation:start' → Show loading spinner
    │   ├─ 'compilation:complete' → Display results
    │   ├─ 'submission:queued' → Show "In queue"
    │   ├─ 'submission:running' → Show "Running tests"
    │   ├─ 'submission:completed' → Show final score
    │   └─ 'error' → Show error message
    │
    └─→ Emit events:
        ├─ 'join:assessment' → Join assessment room
        └─ 'subscribe:submission' → Subscribe to updates
```

---

## 🛠️ Technology Stack

### Frontend (Vercel)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| React Router | 6.16.0 | Page routing |
| Vite | 5.4.1 | Build tool |
| Material-UI | 9.1.2 | UI components |
| Tailwind CSS | 3.4.1 | Styling |
| Axios | 1.7.0 | HTTP client |
| Socket.io-client | 4.7.0 | Real-time client |
| Monaco Editor | 4.7.0 | Code editor |
| Recharts | 2.10.0 | Charts/graphs |
| TypeScript | 5.5.0 | Type safety |

### Backend (Railway)

| Technology | Version | Purpose |
|------------|---------|---------|
| Express | 4.18.2 | Web framework |
| Node.js | Latest | Runtime |
| TypeScript | 5.5.0 | Type safety |
| Mongoose | 7.6.1 | MongoDB ORM |
| Socket.io | 4.8.0 | Real-time server |
| BullMQ | 5.79.1 | Job queue |
| Docker | Latest | Container sandbox |
| Winston | 3.9.0 | Logging |

### Database (Railway MongoDB)

| Technology | Version | Purpose |
|------------|---------|---------|
| MongoDB | 7.x | NoSQL database |
| Mongoose | 7.6.1 | ODM/Schema |

---

## 📡 API Endpoints

### Authentication Routes

```
POST /api/auth/login
├─ Body: { username, password }
└─ Returns: { user, sessionId }

POST /api/auth/google-login
├─ Body: { idToken }
└─ Returns: { user, sessionId }

GET /api/auth/me
├─ Headers: Cookie (skill_wizard_user)
└─ Returns: { user }

POST /api/auth/logout
├─ Headers: Cookie
└─ Returns: { success: true }
```

### Compiler Routes

```
POST /api/compiler/compile
├─ Body: { code, language, testCases }
└─ Returns: { output, testResults, executionTime }

POST /api/compiler/submit
├─ Body: { assessmentId, code, language }
└─ Returns: { submissionId, status }

GET /api/compiler/status/:submissionId
├─ Query: submissionId
└─ Returns: { status, score, results }
```

---

## 🔐 Authentication & Security

### Session Management

```
1. User logs in
   ├─ POST /api/auth/login
   ├─ AuthController creates JWT
   └─ Sets HTTP-only cookie
      └─ Name: skill_wizard_user
      └─ Max-Age: 7 days
      └─ HttpOnly: true
      └─ SameSite: lax

2. Subsequent requests
   ├─ Browser auto-includes cookie
   ├─ Backend validates JWT
   └─ Allows request if valid

3. User logs out
   ├─ POST /api/auth/logout
   ├─ Backend clears cookie
   └─ Frontend clears context
```

### Role-Based Access Control (RBAC)

```
AuthContext checks user.role:

├─ Admin (role: "admin")
│  └─ Can access: /admin/*
│     ├─ Create questions
│     ├─ Manage assessments
│     ├─ View all submissions
│     └─ Manage students
│
└─ Student (role: "student")
   └─ Can access: /student/*
      ├─ Take assessments
      ├─ View submissions
      ├─ Check scores
      └─ View performance
```

---

## 🌐 Environment Configuration

### Development

```
Frontend: http://localhost:5173
Backend: http://localhost:5000
Database: mongodb://localhost:27017/skill_wizard
WebSocket: ws://localhost:5000
```

### Production (Railway + Vercel)

```
Frontend: https://skill-wizard.vercel.app
Backend: https://your-api.railway.app
Database: mongodb+srv://user:pass@cluster.mongodb.net/skill_wizard
WebSocket: wss://your-api.railway.app
```

---

## 📊 Database Schema (MongoDB Collections)

### Users Collection

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  role: String ("admin" | "student"),
  profile: {
    firstName: String,
    lastName: String,
    photo: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Questions Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  difficulty: String ("easy" | "medium" | "hard"),
  language: String ("python" | "javascript" | "cpp" | ...),
  functionSignature: String,
  code: String,
  visibleTestCases: Array,
  hiddenTestCases: Array,
  createdBy: ObjectId (Admin),
  createdAt: Date
}
```

### Submissions Collection

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  assessmentId: ObjectId,
  questionId: ObjectId,
  code: String,
  language: String,
  status: String ("pending" | "running" | "completed" | "error"),
  score: Number,
  testResults: Array,
  submittedAt: Date,
  completedAt: Date
}
```

---

## 🚀 Deployment Pipeline

### GitHub Push

```
git push origin main
    │
    ├─→ Vercel Webhook
    │   ├─ Clone repo
    │   ├─ npm install in frontend/
    │   ├─ npm run build
    │   └─ Deploy to CDN
    │
    └─→ Railway Webhook
        ├─ Clone repo
        ├─ npm install in server/
        ├─ npm run build
        ├─ Start app with Procfile
        └─ Health check passed → Live
```

---

## 📈 Performance Considerations

### Frontend Optimization

✅ Code splitting with React Router  
✅ Lazy loading for admin/student pages  
✅ Vite fast refresh during dev  
✅ Build minification + gzip  
✅ CDN delivery via Vercel  
✅ Monaco editor lazy loaded  

### Backend Optimization

✅ BullMQ job queue for async tasks  
✅ Socket.io for real-time (no polling)  
✅ MongoDB indexes on queries  
✅ Docker container pooling  
✅ Resource limits per compilation  
✅ Caching frequently used queries  

---

## 🔄 Deployment Steps Summary

```
1. Code Ready?
   ├─ ✅ Compiles without errors
   ├─ ✅ .env files excluded from git
   └─ ✅ All environment variables defined

2. Push to GitHub
   └─ git push origin main

3. Railway Auto-Deploy
   ├─ ✅ Backend compiles
   ├─ ✅ MongoDB connects
   └─ ✅ Health check passes

4. Vercel Auto-Deploy
   ├─ ✅ Frontend builds
   ├─ ✅ API URL configured
   └─ ✅ CDN ready

5. Testing
   ├─ ✅ Frontend loads
   ├─ ✅ Login works
   ├─ ✅ API responds
   └─ ✅ Socket.io connects

6. Live! 🎉
```

---

## 🎓 Learning Resources

- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/
- **MongoDB**: https://docs.mongodb.com/
- **Docker**: https://docs.docker.com/
- **Socket.io**: https://socket.io/docs/
- **Vite**: https://vitejs.dev/

---

**Last Updated**: 2024
**Status**: Production Ready ✅
