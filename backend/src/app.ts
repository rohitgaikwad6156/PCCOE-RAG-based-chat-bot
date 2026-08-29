import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import documentRoutes from './routes/documentRoutes';
import collectionRoutes from './routes/collectionRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import adminRoutes from './routes/adminRoutes';
import diagnosticsRoutes from './routes/diagnosticsRoutes';
import healthRoutes from './routes/healthRoutes';
import { healthController } from './controllers/healthController';

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS - Supports configured FRONTEND_URL, Vercel deployments, and localhost
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin === env.FRONTEND_URL ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate Limiting (100 requests per 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// Serve uploaded files statically
const uploadDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// Root Status & Health Endpoints
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'PCCOE RAG Assistant Backend API',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      auth: '/api/auth',
      documents: '/api/documents',
      admin: '/api/admin',
    },
  });
});

app.get('/health', (req, res) => healthController.checkHealth(req, res));

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin/diagnostics', diagnosticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', healthRoutes);

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
