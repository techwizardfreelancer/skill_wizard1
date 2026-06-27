import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import compilerRoutes from './routes/compilerRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';
import { initializeSocketServer } from './sockets/socketServer';
import { connectDatabase } from './config/db';
import { SubmissionWorker } from './workers/SubmissionWorker';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = initializeSocketServer(server);

// CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

// Add frontend URL from environment if provided
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health check endpoint (for monitoring services like UptimeRobot)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/compiler', compilerRoutes);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skill_wizard';

async function startServer(): Promise<void> {
  await connectDatabase(MONGO_URI);
  new SubmissionWorker();

  server.listen(PORT, () => {
    console.log(`Compiler service running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start compiler service:', error);
  process.exit(1);
});

export { app, server, io };
