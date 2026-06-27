# Skill Wizard - Comprehensive Technical Analysis

**Project**: Skill Development Platform for college students and administrators  
**Date**: 2026-06-27  
**Tech Stack**: React.js + Vite (Frontend) | Node.js + Express (Backend) | MongoDB | Docker | Socket.io

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Key Integrations](#key-integrations)
5. [External Dependencies](#external-dependencies)
6. [Data Flow & Communication](#data-flow--communication)
7. [File Structure & Statistics](#file-structure--statistics)

---

## Project Overview

Skill Wizard is a full-stack educational platform designed to facilitate coding assessments and skill evaluation for college students. It provides:

- **Admin Portal**: Manage students, courses, assessments, code reviews, and questions
- **Student Portal**: Enroll in courses, take assessments, submit code, track progress
- **Real-time Features**: Socket.io-based real-time submission tracking and notifications
- **Code Execution**: Integrated compiler service supporting multiple programming languages
- **Authentication**: Google OAuth (college Gmail restricted) + JWT tokens + Cookie-based session management

---

## Frontend Architecture

### Entry Point & Configuration

**[frontend/src/main.jsx](frontend/src/main.jsx)** (30 lines)
- React 18 entry point using ReactDOM.createRoot
- Providers setup: ThemeProvider (Material-UI), BrowserRouter, AuthProvider
- Material-UI theme initialization with CssBaseline reset

**[frontend/src/App.jsx](frontend/src/App.jsx)** (50 lines)
- Main routing layer using React Router v6
- Route structure:
  - `/login` → LoginPage
  - `/admin/*` → AdminLayout (role-protected, admin only)
  - `/student/*` → StudentLayout (role-protected, student only)
  - `/` → Redirect to login
  - `*` → NotFoundPage
- ProtectedRoute wrapper component handling authentication and role-based authorization

### Layout Structure

**[frontend/src/layouts/AdminLayout.jsx](frontend/src/layouts/AdminLayout.jsx)** (70+ lines)
- Flex-based layout with sidebar + main content area
- Nested routing for 20+ admin routes:
  - Dashboard, Students, Courses, Code Reviews
  - Assessments (manage, create, view, edit)
  - Questions (courses, levels, create, manage, detail)
  - Attempts, Password change
  - Submissions and Results
- Components: AdminSidebar, AdminTopbar

**[frontend/src/layouts/StudentLayout.jsx]**
- Similar structure for student-specific routes
- Nested routing for student pages

### Pages Structure

#### Admin Pages (20+ pages)
Located in [frontend/src/pages/admin/](frontend/src/pages/admin/):

| Page | Purpose |
|------|---------|
| AdminDashboard | Overview & analytics |
| ManageStudentsPage | CRUD operations for students |
| ManageCoursesPage | Course management |
| ManageCodeReviewsPage | Code review workflows |
| AdminAssessmentsPage | View all assessments |
| ManageAssessmentsPage | Assessment CRUD |
| CreateAssessmentPage | Create/edit assessments (with styling) |
| AssignQuestionsPage | Link questions to assessments |
| ViewSubmissionsPage | View student submissions |
| SubmissionDetailPage | Detailed submission analysis |
| AdminQuestionManagementPage | Manage question library |
| CreateQuestionPage | Create/edit questions |
| QuestionCoursesPage | Question organization by course |
| QuestionLevelsPage | Filter questions by difficulty |
| QuestionDetailPage | View/edit question details |
| AdminAttemptsPage | Track student attempts |
| AssessmentDetailPage | Assessment details & analytics |
| ChangePasswordPage | Admin password change |

#### Student Pages (17 pages)
Located in [frontend/src/pages/student/](frontend/src/pages/student/):

| Page | Purpose |
|------|---------|
| StudentDashboard | Student overview & quick access |
| CoursesPage | Browse all available courses |
| MyCoursesPage | Enrolled courses |
| CourseDetailPage | Course details & content |
| CourseLevelPage | Courses filtered by level |
| AssessmentPage | Active assessments list |
| AssessmentStartPage | Start assessment flow |
| CodingPage | Code editor & submission interface |
| AssessmentTestingPage | Test code with sample cases |
| AssessmentDetailPage | Assessment details & progress |
| AssessmentResultPage | Final results & scoring |
| AssessmentHistoryPage | Past assessment history |
| AssessmentPerformancePage | Performance analytics |
| AssessmentModulePage | Module-based assessments |
| CodeReviewPage | Submit for code review |
| ProfilePage | Student profile management |
| ChangePasswordPage | Password management |

#### Authentication
**[frontend/src/pages/LoginPage.jsx]** (NA)
- Google OAuth login flow
- College email domain validation
- JWT token handling

**[frontend/src/pages/NotFoundPage.jsx]** (NA)
- 404 error page

### Context & State Management

**[frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)** (45 lines)
- Context: `AuthContext`
- Provider: `AuthProvider`
- Hook: `useAuth()`
- State:
  - `user`: Current authenticated user object
  - `loading`: Auth status loading state
- Methods:
  - `login(userData)`: Set authenticated user
  - `logout()`: Clear session and user
  - `fetchUser()`: Called on mount to restore session from `/api/auth/me`

**Authentication Flow**:
```
1. App mounts → AuthProvider fetches `/api/auth/me`
2. Backend returns user from cookie/JWT
3. User set in context
4. ProtectedRoute checks user.role
5. Redirects if unauthorized
```

### Hooks

**[frontend/src/hooks/useSocket.js](frontend/src/hooks/useSocket.js)** (60 lines)
- `useSocketEvent(event, handler)`: Listen to socket events
  - Registers listener on mount
  - Cleans up on unmount
- `useSocketEmit()`: Returns emitSocketEvent function
- Usage: Real-time submission tracking, code execution status updates

### Services

**[frontend/src/services/api.js](frontend/src/services/api.js)** (15 lines)
- Axios instance with:
  - Base URL: `import.meta.env.VITE_API_BASE_URL` or `/api`
  - Credentials enabled: `withCredentials: true`
  - CSRF protection: XSRF-TOKEN cookie handling
- Used by all API calls throughout frontend

**[frontend/src/services/socketService.js](frontend/src/services/socketService.js)** (25 lines)
- Socket.io client initialization
- Socket URL: `import.meta.env.VITE_SOCKET_URL` or `window.location.origin`
- Transport: WebSocket
- Auto-connect enabled
- Exported functions:
  - `onSocketEvent(event, callback)`: Register listener
  - `offSocketEvent(event, callback)`: Unregister listener
  - `emitSocketEvent(event, payload)`: Emit event
- Events broadcasted:
  - `submission-created`, `compilation-started`, `compilation-finished`
  - `execution-started`, `execution-finished`, `submission-completed`

**[frontend/src/services/codeService.js](frontend/src/services/codeService.js)** (45 lines)
- API wrapper for code execution
- Functions:
  - `runCodeSubmission({ code, language, assessmentId, questionId, compileOnly })`: Execute code (test run)
    - Endpoint: `POST /api/assessments/run-code`
    - Returns: Execution results with test case outputs
  - `submitCodeAnswer({ assessmentId, questionId, code, language })`: Submit final answer
    - Endpoint: `POST /api/assessments/{assessmentId}/submit`
  - `getCurrentSubmission(assessmentId)`: Fetch current submission
    - Endpoint: `GET /api/assessments/{assessmentId}/submission`

### Components

Located in [frontend/src/components/](frontend/src/components/):

**Admin Components**:
- `AdminSidebar`: Navigation sidebar
- `AdminTopbar`: Top navigation bar with user menu

**Student Components**:
- `StudentSidebar`: Student navigation
- `StudentTopbar`: Student top bar

**UI Components**:
- `StatCard`: Reusable statistics display card

### Styling & Configuration

**[frontend/src/theme.js](frontend/src/theme.js)** (80+ lines)
- Material-UI custom theme with:
  - **Primary Color**: #5b21b6 (Purple)
  - **Secondary**: #2563eb (Blue)
  - **Status Colors**: Success (#16a34a), Warning (#f59e0b), Error (#dc2626), Info (#0284c7)
  - **Background**: Light mode (#f8fafc / #ffffff)
  - **Typography**: Inter font family with custom heading weights
  - **Border Radius**: 20px (rounded design system)

**[frontend/src/index.css](frontend/src/index.css)**
- Global styles and CSS variables
- Tailwind CSS base utilities

**[frontend/tailwind.config.js](frontend/tailwind.config.js)**
- Tailwind CSS configuration for utility-first styling

**[frontend/postcss.config.js](frontend/postcss.config.js)**
- PostCSS configuration for Tailwind processing

**[frontend/vite.config.js](frontend/vite.config.js)** (40 lines)
- Vite build configuration:
  - React plugin via `@vitejs/plugin-react`
  - Dev server proxies:
    - `/api` → `http://localhost:5000`
    - `/uploads` → `http://localhost:5000`
    - `/socket.io` → `ws://localhost:5000` (WebSocket)

**[frontend/tsconfig.json](frontend/tsconfig.json)**
- TypeScript configuration:
  - Target: ES2020
  - JSX: react-jsx
  - Module: ESNext
  - Module resolution: bundler
  - Strict mode enabled

### Build & Dependencies

**[frontend/package.json](frontend/package.json)** (100+ lines)

**Key Dependencies**:
- **UI Framework**: `@mui/material` (v9.1.2), `@mui/icons-material` (v9.1.1)
- **State & Forms**: `react-hook-form` (v7.80.0)
- **Routing**: `react-router-dom` (v6.16.0)
- **HTTP Client**: `axios` (v1.5.0)
- **Real-time**: `socket.io-client` (v4.8.3)
- **Code Editor**: `@monaco-editor/react` (v4.7.0), `monaco-editor` (v0.55.1)
- **Charts**: `recharts` (v3.9.0)
- **Icons**: `react-icons` (v4.11.0)
- **Styling**: `@emotion/react` (v11.14.0), `@emotion/styled` (v11.14.1)
- **Keyboard Shortcuts**: `react-hotkeys-hook` (v5.3.3)

**Dev Dependencies**:
- **Build**: `vite` (v5.4.1), `@vitejs/plugin-react` (v4.3.1)
- **Type Checking**: `typescript` (v5.5.4), `@types/react` (v18.3.4), `@types/react-dom` (v18.3.1)
- **Styling**: `tailwindcss` (v3.4.4), `postcss` (v8.4.35), `autoprefixer` (v10.4.19)

**Scripts**:
- `npm run dev`: Start Vite dev server
- `npm run build`: Build (with TypeScript type checking)
- `npm run preview`: Preview production build

---

## Backend Architecture

### Entry Point

**[server/src/index.ts](server/src/index.ts)** (60 lines)

**Server Initialization**:
1. Express app creation + HTTP server wrapping
2. Socket.io initialization with CORS
3. Database connection to MongoDB
4. Submission worker instantiation
5. Server listening on PORT (default 5000)

**CORS Configuration** (allow localhost variants + frontend URL):
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`
- Environment-specified FRONTEND_URL

**Middleware Stack**:
```typescript
app.use(cors({...}))
app.use(express.json())
app.get('/api/health', ...) // Health check
app.use('/api/auth', authRoutes)
app.use('/api/compiler', compilerRoutes)
app.use(errorHandler)
```

**Environment**:
- `PORT`: 5000
- `MONGO_URI`: `mongodb://127.0.0.1:27017/skill_wizard`
- `REDIS_URL`: For BullMQ job queue

### Database Configuration

**[server/src/config/db.ts](server/src/config/db.ts)** (15 lines)

**MongoDB Connection**:
```typescript
mongoose.connect(uri, {
  autoIndex: false,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
```
- Connection pooling enabled
- Strict query mode
- 5-second server selection timeout
- 45-second socket timeout

### Controllers

**[server/src/controllers/AuthController.ts](server/src/controllers/AuthController.ts)** (100+ lines)

**Authentication Methods**:
1. `login(email, password)`: Credential-based login
   - Default users: admin@college.edu, student@college.edu
   - Validates against environment-specified passwords
   - Returns JWT token + sets HTTP-only cookie
2. `googleLogin(googleToken)`: Google OAuth flow
   - Validates OAuth token
   - Restricts to college email domain
   - Creates or updates user
3. `me()`: Get current authenticated user
   - Extracts user from cookie/JWT
   - Returns user object
4. `logout()`: Clear session
   - Removes cookie
   - Returns success message

**Cookie Management**:
- Name: `skill_wizard_user`
- HTTP-only: true
- SameSite: lax
- Secure: false (development)
- Max-Age: 7 days

**JWT Parsing**:
- Manual JWT decoding (3-part structure)
- Base64 payload extraction
- Error handling for malformed tokens

**[server/src/controllers/CompilerController.ts](server/src/controllers/CompilerController.ts)** (60+ lines)

**Compiler Methods**:
1. `run(req, res)`: Execute code with sample test cases
   - Generates UUID for submission
   - Extracts: language, questionId, code, testCases
   - Calls `submissionService.processRun()`
   - Returns: submissionId + execution results
   - Endpoint: `POST /api/compiler/run`
2. `submit(req, res)`: Submit final answer for grading
   - Generates UUID for submission
   - Enqueues to BullMQ job queue
   - Emits socket event: `submission-created`
   - Returns: 202 Accepted with submissionId + status
   - Endpoint: `POST /api/compiler/submit`
3. `result(req, res)`: Fetch submission results
   - Endpoint: `GET /api/compiler/result/:id`
4. `status(req, res)`: Check submission status
   - Endpoint: `GET /api/compiler/status/:id`

**[server/src/controllers/healthCheck.ts](server/src/controllers/healthCheck.ts)**
- Health endpoint: `GET /api/health`
- Returns: `{ status: 'ok', timestamp: ISO8601 }`
- Used for monitoring (UptimeRobot)

### Routes

**[server/src/routes/authRoutes.ts](server/src/routes/authRoutes.ts)** (20 lines)
```
POST   /api/auth/login         → AuthController.login
POST   /api/auth/google-login  → AuthController.googleLogin
GET    /api/auth/me            → AuthController.me
POST   /api/auth/logout        → AuthController.logout
```

**[server/src/routes/compilerRoutes.ts](server/src/routes/compilerRoutes.ts)** (20 lines)
```
POST   /api/compiler/run       → CompilerController.run (with validation)
POST   /api/compiler/submit    → CompilerController.submit (with validation)
GET    /api/compiler/result/:id  → CompilerController.result
GET    /api/compiler/status/:id  → CompilerController.status
```

### Middleware

**[server/src/middleware/errorHandler.ts](server/src/middleware/errorHandler.ts)** (8 lines)
- Express error handler middleware
- Catches all errors
- Logs error
- Returns: `{ message: 'Internal server error', error: error.message }` with 500 status

**[server/src/middleware/validateRequest.ts](server/src/middleware/validateRequest.ts)** (15 lines)
- Request validation middleware
- Validates: `language`, `questionId`, `code` required fields
- Returns 400 if validation fails
- Used on: `/api/compiler/run`, `/api/compiler/submit`

### Models & Data Structures

**[server/src/models/Question.ts](server/src/models/Question.ts)** (20 lines)

```typescript
interface QuestionDocument {
  _id: string
  title: string
  description: string
  language: string
  visibleTestCases: TestCase[]
  hiddenTestCases: TestCase[]
  sampleTestCases: TestCase[]
  timeLimitSeconds: number
  memoryLimitMb: number
}
```

**[server/src/models/Submission.ts](server/src/models/Submission.ts)** (65+ lines)

```typescript
interface TestCase {
  input: string
  expectedOutput: string
  weight?: number
}

interface SubmissionRequest {
  id: string
  language: string
  questionId: string
  code: string
  testCases: TestCase[]
}

interface TestCaseResult {
  input: string
  expectedOutput: string
  output: string
  error: string
  passed: boolean
  executionTimeMs: number
  memoryUsageMb: number
}

interface ExecutionResult {
  status: string
  success: boolean
  compileOutput: string
  runtimeOutput: string
  results: TestCaseResult[]
  executionTimeMs: number
  memoryUsageMb: number
  passedCount?: number
  failedCount?: number
  error?: string
}
```

**[server/src/models/QuestionEntity.ts]** & **[server/src/models/SubmissionEntity.ts]**
- Mongoose schema definitions
- Database entity models

### Services

**[server/src/services/CompilerService.ts](server/src/services/CompilerService.ts)** (15 lines)
```typescript
class CompilerService {
  private sandboxManager: SandboxManager
  
  run(submission: SubmissionRequest): ExecutionResult
    → Delegates to sandboxManager.runSubmission()
}
```

**[server/src/services/SubmissionService.ts](server/src/services/SubmissionService.ts)** (100+ lines)
```typescript
class SubmissionService {
  private submissionRepository: SubmissionRepository
  private questionRepository: QuestionRepository
  private compilerService: CompilerService
  private queueService: QueueService

  processRun(submission): ExecutionResult
    1. Save submission to DB (status: pending)
    2. Fetch visible test cases
    3. Run compiler
    4. Update DB with results
    5. Return results

  processSubmit(submission): ExecutionResult
    1. Update status to 'running'
    2. Emit socket: 'submission-started'
    3. Fetch hidden test cases
    4. Run compiler
    5. Update DB with results
    6. Emit socket: 'submission-completed' with score
    7. Handle errors & emit failure event

  enqueueSubmission(submission): { status, message }
    1. Save submission to DB
    2. Push to BullMQ queue
    3. Return pending status

  getSubmissionById(submissionId): Submission
}
```

**[server/src/services/QuestionRepository.ts]**
- Database queries for questions
- Methods: findVisibleTestCases(), findHiddenTestCases(), etc.

**[server/src/services/SubmissionRepository.ts]**
- Database operations for submissions
- Methods: create(), updateResult(), updateStatus(), getById(), computeScore()

**[server/src/services/QueueService.ts]**
- BullMQ job queue integration
- Methods: enqueue() for submission processing

### Compiler Infrastructure

**[server/src/compiler/index.ts](server/src/compiler/index.ts)** (5 lines)
- Barrel exports for compiler module:
  - SandboxManager
  - DockerRunner
  - ContainerPool
  - ExecutionEngine
  - CompilerFactory

**[server/src/compiler/sandbox/SandboxManager.ts]**
- Main orchestrator for code execution
- Manages container lifecycle
- Delegates to DockerRunner for execution

**[server/src/compiler/sandbox/DockerRunner.ts]**
- Docker container execution engine
- Spawns containers for code execution
- Handles stdout/stderr capture

**[server/src/compiler/sandbox/ContainerPool.ts]**
- Connection pool management for Docker
- Reuses containers for performance
- Lifecycle management

**[server/src/compiler/sandbox/ExecutionEngine.ts]**
- Low-level code execution
- Test case input/output handling
- Timeout management

**[server/src/compiler/sandbox/CompilerFactory.ts]**
- Factory pattern for language-specific compilers
- Returns appropriate compiler for language

**Supported Languages** ([server/src/compiler/languages/](server/src/compiler/languages/)):
- Python (c.ts, python.ts)
- C (c.ts)
- C++ (cpp.ts)
- Java (java.ts)
- JavaScript (javascript.ts)
- Go (go.ts)
- C# (csharp.ts)
- Rust (rust.ts)
- types.ts: Shared interfaces

### Socket.io Server

**[server/src/sockets/socketServer.ts](server/src/sockets/socketServer.ts)** (50 lines)

**Initialization**:
```typescript
new IOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})
```

**Socket Events** (broadcast to all connected clients):
1. `submission-created`: Triggered when new submission created
   - Payload: { submissionId, questionId, language, status: 'pending' }
2. `compilation-started`: When code compilation begins
3. `compilation-finished`: When compilation completes
4. `execution-started`: When test case execution starts
5. `execution-finished`: When test execution completes
6. `submission-completed`: Final submission result
   - Payload: { submissionId, status, score, error }

**Event Broadcasting Pattern**:
```typescript
ioServer.on('connection', (socket) => {
  socket.on('event-name', (payload) => {
    socket.broadcast.emit('event-name', payload)
  })
})
```

### Background Workers

**[server/src/workers/SubmissionWorker.ts](server/src/workers/SubmissionWorker.ts)** (40 lines)

**Job Queue Processing**:
```typescript
class SubmissionWorker {
  private worker: Worker // BullMQ Worker
  
  constructor() {
    // Listen to 'submissions' queue
    // For each job: call submissionService.processSubmit()
    // Handle failures with logging
  }
}
```

**Configuration**:
- Queue Name: 'submissions'
- Redis URL: `process.env.REDIS_URL || 'redis://127.0.0.1:6379'`
- Error handling: Logs failed jobs with context
- Graceful shutdown: `worker.close()`

**Job Flow**:
1. Submission enqueued via CompilerController.submit()
2. SubmissionWorker picks up job from queue
3. Calls processSubmit() for grading with hidden test cases
4. Emits completion event via Socket.io
5. Updates database

---

## Key Integrations

### Frontend-Backend Communication

#### 1. **Authentication Flow**
```
User clicks "Login" (Google OAuth)
  ↓
LoginPage redirects to Google auth
  ↓
OAuth callback → AuthController.googleLogin()
  ↓
Backend validates token & college email domain
  ↓
Sets HTTP-only cookie + JWT
  ↓
Frontend fetches /api/auth/me via AuthProvider
  ↓
User set in AuthContext
  ↓
ProtectedRoute allows access
```

#### 2. **Code Execution Flow - Test Run**
```
Student clicks "Run Code" on CodingPage
  ↓
codeService.runCodeSubmission() calls POST /api/compiler/run
  ↓
CompilerController.run() generates UUID submission
  ↓
SubmissionService.processRun():
  - Saves submission to DB
  - Fetches visible test cases
  - Calls CompilerService.run()
  - Runs code in Docker sandbox
  - Updates DB with results
  ↓
Returns ExecutionResult with test outputs
  ↓
Frontend displays results in code editor
```

#### 3. **Code Submission Flow - Final Submission**
```
Student clicks "Submit Answer" on CodingPage
  ↓
codeService.submitCodeAnswer() calls POST /api/compiler/submit
  ↓
CompilerController.submit():
  - Generates UUID
  - Saves submission to DB
  - Enqueues to BullMQ queue (Redis)
  - Emits socket: submission-created
  - Returns 202 Accepted immediately
  ↓
useSocketEvent listens for events
  ↓
SubmissionWorker picks up job asynchronously
  ↓
SubmissionService.processSubmit():
  - Updates status to 'running'
  - Emits socket: submission-started
  - Fetches hidden test cases
  - Runs code with hidden test cases
  - Calculates score
  - Updates DB
  - Emits socket: submission-completed
  ↓
Frontend receives completion event via Socket.io
  ↓
Updates UI with final results
```

#### 4. **Real-time Updates via Socket.io**
```
Frontend (socketService.js):
  - Connects to ws://localhost:5000
  - Listens to events: 'submission-created', 'submission-completed', etc.

useSocketEvent hook:
  - Wraps socket event listeners
  - Registers on mount, cleans up on unmount
  - Triggers component re-renders

Backend (socketServer.ts):
  - Broadcasts events to all connected clients
  - Events: compilation-started, execution-finished, submission-completed

Data Flow:
  CompilerController → SubmissionService → getSocketServer().emit()
                                        ↓
                                   Frontend useSocketEvent
                                        ↓
                                   Component re-renders
```

### Database Schema Integration

```
Questions:
  - _id, title, description, language
  - visibleTestCases, hiddenTestCases, sampleTestCases
  - timeLimitSeconds, memoryLimitMb

Submissions:
  - id, questionId, language, code
  - status: pending|running|completed|failed
  - results: TestCaseResult[]
  - score, createdAt, updatedAt

Students (implied):
  - id, name, email, role: 'student'
  - enrolledCourses, submissions

Admins (implied):
  - id, name, email, role: 'admin'
  - createdAssessments, createdQuestions
```

---

## External Dependencies

### Frontend Stack

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI library |
| react-dom | ^18.3.1 | React rendering |
| react-router-dom | ^6.16.0 | Client-side routing |
| @mui/material | ^9.1.2 | UI component library |
| @mui/icons-material | ^9.1.1 | Material icons |
| axios | ^1.5.0 | HTTP client |
| socket.io-client | ^4.8.3 | WebSocket client |
| @monaco-editor/react | ^4.7.0 | Monaco editor component |
| monaco-editor | ^0.55.1 | Monaco editor core |
| recharts | ^3.9.0 | Charting library |
| react-hook-form | ^7.80.0 | Form state management |
| react-hotkeys-hook | ^5.3.3 | Keyboard shortcuts |
| react-icons | ^4.11.0 | Icon library |
| @emotion/react | ^11.14.0 | CSS-in-JS styling |
| @emotion/styled | ^11.14.1 | Styled components |
| vite | ^5.4.1 | Build tool |
| tailwindcss | ^3.4.4 | Utility CSS framework |
| typescript | ^5.5.4 | Type safety |

### Backend Stack

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| mongoose | ^7.6.1 | MongoDB ODM |
| socket.io | ^4.8.0 | Real-time communication |
| cors | ^2.8.5 | CORS middleware |
| bullmq | ^5.79.1 | Job queue (Redis) |
| ioredis | ^5.11.1 | Redis client |
| dotenv | ^16.3.1 | Environment variables |
| uuid | ^9.0.0 | UUID generation |
| winston | ^3.9.0 | Logger |
| ajv | ^8.12.0 | JSON schema validator |
| typescript | ^5.5.0 | Type safety |
| ts-node-dev | ^2.0.0 | Dev server with TypeScript |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | MongoDB | Data persistence |
| Cache/Queue | Redis + BullMQ | Job queue management |
| Containerization | Docker | Code execution sandbox |
| Web Server | Express.js | HTTP server |
| Real-time | Socket.io | WebSocket communication |
| Build | Vite | Frontend bundler |

---

## Data Flow & Communication

### Request/Response Pattern

```
Frontend (Vite/React)
        ↓
Axios HTTP Request
        ↓
Vite Dev Proxy (port 5173)
        ↓
Express API (port 5000)
        ↓
Controller → Service → Repository → MongoDB
        ↓
Response (JSON)
        ↓
Vite Dev Proxy
        ↓
Frontend State Update
```

### WebSocket Pattern

```
Frontend (Socket.io Client)
        ↓
WebSocket Connection
        ↓
Socket.io Server (port 5000)
        ↓
Backend Service Emits Event
        ↓
Socket.io Broadcasting
        ↓
Frontend useSocketEvent Hook
        ↓
Component Re-render
```

### Asynchronous Job Queue

```
POST /api/compiler/submit
        ↓
CompilerController enqueues to BullMQ
        ↓
SubmissionWorker monitors Redis queue
        ↓
Worker picks up job
        ↓
SubmissionService.processSubmit()
        ↓
Socket.io emits 'submission-completed'
        ↓
Frontend receives via useSocketEvent
```

### Code Execution Pipeline

```
POST /api/compiler/run (with code)
        ↓
CompilerController.run()
        ↓
CompilerService.run()
        ↓
SandboxManager.runSubmission()
        ↓
DockerRunner spawns container
        ↓
ExecutionEngine runs code
        ↓
CompilerFactory selects language handler
        ↓
Language-specific compiler processes
        ↓
Test case input/output capture
        ↓
Results collection (time, memory, output, errors)
        ↓
Response with ExecutionResult
```

---

## File Structure & Statistics

### Frontend

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── main.jsx                 (30 lines) - React entry
│   ├── App.jsx                  (50 lines) - Main routes
│   ├── index.css                - Global styles
│   ├── theme.js                 (80+ lines) - Material-UI theme
│   ├── context/
│   │   └── AuthContext.jsx      (45 lines) - Auth state
│   ├── hooks/
│   │   └── useSocket.js         (60 lines) - Socket.io hook
│   ├── services/
│   │   ├── api.js               (15 lines) - Axios config
│   │   ├── socketService.js     (25 lines) - Socket.io client
│   │   └── codeService.js       (45 lines) - Code API wrapper
│   ├── layouts/
│   │   ├── AdminLayout.jsx      (70+ lines) - Admin routing
│   │   └── StudentLayout.jsx    - Student routing
│   ├── pages/
│   │   ├── LoginPage.jsx        - Google OAuth
│   │   ├── NotFoundPage.jsx     - 404 page
│   │   ├── admin/               (20+ pages)
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ManageStudentsPage.jsx
│   │   │   ├── ManageCoursesPage.jsx
│   │   │   ├── CreateAssessmentPage.jsx
│   │   │   ├── ManageQuestionsPage.jsx
│   │   │   └── ... (15+ more)
│   │   └── student/             (17+ pages)
│   │       ├── StudentDashboard.jsx
│   │       ├── CodingPage.jsx
│   │       ├── AssessmentPage.jsx
│   │       └── ... (14+ more)
│   └── components/
│       ├── admin/
│       │   ├── AdminSidebar.jsx
│       │   └── AdminTopbar.jsx
│       ├── student/
│       │   ├── StudentSidebar.jsx
│       │   ├── StudentTopbar.jsx
│       │   └── SubmissionStatusBanner.jsx
│       └── ui/
│           └── StatCard.jsx
├── package.json                 - Dependencies
├── tsconfig.json               - TypeScript config
├── tsconfig.node.json          - Node TypeScript config
├── vite.config.js              - Vite config with proxies
├── tailwind.config.js          - Tailwind CSS config
└── postcss.config.js           - PostCSS config
```

**Frontend Total**: ~50 component/page files, 40+ KB of code

### Backend

```
server/
├── src/
│   ├── index.ts                (60 lines) - Server entry
│   ├── config/
│   │   └── db.ts               (15 lines) - MongoDB config
│   ├── controllers/
│   │   ├── AuthController.ts   (100+ lines) - Auth logic
│   │   ├── CompilerController.ts (60+ lines) - Compiler routes
│   │   └── healthCheck.ts      - Health endpoint
│   ├── routes/
│   │   ├── authRoutes.ts       (20 lines) - Auth routes
│   │   └── compilerRoutes.ts   (20 lines) - Compiler routes
│   ├── middleware/
│   │   ├── errorHandler.ts     (8 lines) - Error handling
│   │   └── validateRequest.ts  (15 lines) - Request validation
│   ├── models/
│   │   ├── Question.ts         (20 lines) - Question interface
│   │   ├── QuestionEntity.ts   - Question schema
│   │   ├── Submission.ts       (65+ lines) - Submission interfaces
│   │   └── SubmissionEntity.ts - Submission schema
│   ├── services/
│   │   ├── CompilerService.ts  (15 lines) - Compilation
│   │   ├── SubmissionService.ts (100+ lines) - Submission logic
│   │   ├── QuestionRepository.ts - Question queries
│   │   ├── SubmissionRepository.ts - Submission queries
│   │   └── QueueService.ts     - BullMQ integration
│   ├── sockets/
│   │   └── socketServer.ts     (50 lines) - Socket.io setup
│   ├── workers/
│   │   └── SubmissionWorker.ts (40 lines) - Job worker
│   └── compiler/
│       ├── index.ts            (5 lines) - Barrel exports
│       ├── languages/          (8 files)
│       │   ├── python.ts
│       │   ├── c.ts
│       │   ├── cpp.ts
│       │   ├── java.ts
│       │   ├── javascript.ts
│       │   ├── go.ts
│       │   ├── csharp.ts
│       │   ├── rust.ts
│       │   └── types.ts
│       └── sandbox/            (5 files)
│           ├── SandboxManager.ts
│           ├── DockerRunner.ts
│           ├── ContainerPool.ts
│           ├── ExecutionEngine.ts
│           └── CompilerFactory.ts
├── package.json                - Dependencies
├── tsconfig.json              - TypeScript config
├── Dockerfile                 - Docker image config
└── docker-compose.yml         - Docker compose
```

**Backend Total**: ~25 TypeScript files, 60+ KB of code

### Configuration Files

```
skill_wizard-main/
├── package.json                - Root scripts
├── vite.config.js             - Vite configuration
├── .env                        - Environment variables (Git-ignored)
├── .env.example               - Environment template
├── README.md                   - Project documentation
├── DEPLOYMENT_GUIDE.md        - Deployment instructions
├── DEPLOYMENT_CHECKLIST.md    - Pre-launch checklist
├── DEPLOYMENT_SUMMARY.md      - Deployment summary
├── render.yaml                - Render.com deployment config
├── vercel.json                - Vercel deployment config
└── docker-compose.yml         - Local Docker setup
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Frontend Pages | 40+ |
| Admin Pages | 20+ |
| Student Pages | 17+ |
| Backend Controllers | 3 |
| API Routes | 8 |
| Socket Events | 6 |
| Supported Languages | 8 |
| Frontend Dependencies | 20+ |
| Backend Dependencies | 12+ |
| Total TypeScript/JSX Files | 75+ |
| Total Lines of Code | 15,000+ |

---

## Architecture Highlights

### Strengths
1. **Clean Separation of Concerns**: Clear frontend/backend separation with defined API contracts
2. **Real-time Architecture**: Socket.io integration for instant feedback on submissions
3. **Asynchronous Job Processing**: Redis + BullMQ for handling long-running compilation tasks
4. **Multi-language Support**: 8 programming languages via compiler factory pattern
5. **Docker Sandboxing**: Secure code execution in isolated containers
6. **Type Safety**: Full TypeScript implementation on both frontend and backend
7. **Responsive UI**: Material-UI + Tailwind CSS for consistent styling
8. **Authentication**: Multiple auth methods (OAuth, JWT, cookies)

### Design Patterns Used
- **Factory Pattern**: CompilerFactory for language selection
- **Repository Pattern**: Data access layer (QuestionRepository, SubmissionRepository)
- **Observer Pattern**: Socket.io event broadcasting
- **Middleware Pattern**: Express middleware stack
- **Provider Pattern**: React Context for state management
- **Queue Pattern**: BullMQ for async job processing

---

**Document Generated**: 2026-06-27  
**Analysis Scope**: Complete project structure analysis  
**Next Steps**: Review deployment guides, environment setup, and database schema design
