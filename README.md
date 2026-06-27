# Skill Development Platform

A modern full-stack Skill Development Platform for college students and administrators.

## Tech Stack

- Frontend: React.js + Vite
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: Google OAuth + JWT
- UI Framework: Material UI
- State Management: Context API
- Icons: React Icons
- Charts: Recharts

## Features

- Admin panel with student management, course management, test and code review workflows
- Student portal with course discovery, enrollments, progress tracking, code review requests, and profile
- Google OAuth login restricted to college Gmail accounts
- JWT-based protected APIs and role-based authorization
- Responsive design with modern dashboard UI

## Folder Structure

- `backend/` - Express API, models, controllers, routes, middleware
- `frontend/` - Vite React app, pages, components, context, service layer

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# update .env with your MongoDB URI and Google OAuth credentials
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Backend `.env` should include:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/skill_wizard?sslmode=require&connection_limit=10
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
MONGO_URI=mongodb://localhost:27017/skill_wizard
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
COLLEGE_EMAIL_DOMAIN=college.edu
```

## Seed Data

Run the Prisma seed script from backend to populate sample admins, students, courses, questions, and tests.

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run seed:prisma
```

## Code Execution API

The backend exposes a code execution endpoint at:

```http
POST /api/assessments/run-code
```

Example request body:

```json
{
  "code": "print(\"Hello, world!\")",
  "language": "python",
  "assessmentId": "<assessmentId>",
  "questionId": "<questionId>"
}
```

Response example:

```json
{
  "compilationSuccess": true,
  "compilationOutput": "Compilation successful",
  "passedCount": 1,
  "failedCount": 0,
  "totalTests": 1,
  "executionTimeMs": 0,
  "memoryUsage": "N/A",
  "testResults": [
    {
      "input": "2 7",
      "expectedOutput": "9",
      "output": "9",
      "error": "",
      "passed": true,
      "executionTimeMs": 0,
      "memoryUsage": "N/A"
    }
  ],
  "output": "Test 1: PASSED"
}
```

### Frontend Example

If you are using the existing frontend API helper in `frontend/src/services/api.js`, a request to run code looks like this:

```js
import api from '../services/api';

async function runCodeSubmission({ code, language, assessmentId, questionId }) {
  const response = await api.post('/assessments/run-code', {
    code,
    language,
    assessmentId,
    questionId,
  });

  return response.data;
}
```

If you prefer a plain `fetch` example:

```js
async function runCodeSubmission({ code, language, assessmentId, questionId }) {
  const response = await fetch('/api/assessments/run-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ code, language, assessmentId, questionId }),
  });

  return response.json();
}
```
