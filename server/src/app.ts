import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
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

  // Security headers & CORS middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(
    cors({
      origin: true,
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

  // Serve static client assets if built (for high-efficiency cloud deployments)
  const clientDist = path.resolve(process.cwd(), 'client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(
      express.static(clientDist, {
        maxAge: '1y',
        etag: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        }
      })
    );
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

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
