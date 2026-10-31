import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import taskRoutes from './routes/task.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import aiRoutes from './routes/ai.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

export function createApp(): Express {
  const app = express();

  // Security headers & basic middleware
  app.use(helmet());
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'celebration-event-planner-api',
      timestamp: new Date().toISOString()
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/events/:eventId/expenses', expenseRoutes);
  app.use('/api/events/:eventId/tasks', taskRoutes);
  app.use('/api/events/:eventId/vendors', vendorRoutes);
  app.use('/api/events/:eventId/ai', aiRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 404 handler for unmatched routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Resource not found at ${req.method} ${req.originalUrl}`
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
