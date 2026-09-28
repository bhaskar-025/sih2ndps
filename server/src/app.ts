import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import apiV1Router from './routes';
import knowledgeRoutes from './routes/knowledge.routes';
import approvalGuideRoutes from './routes/approvalGuide.routes';
import faqRoutes from './routes/faq.routes';
import regulationRoutes from './routes/regulation.routes';
import auditRoutes from './routes/audit.routes';
import workflowRoutes from './routes/workflow.routes';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware';

dotenv.config();

export const createApp = (): Application => {
  const app = express();

  // 1. Security middleware with cross-origin resource policy for document uploads preview
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 2. CORS configuration
  const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin: [clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 3. Performance compression middleware
  app.use(compression());

  // 4. Request parsing middleware
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Static uploads directory for prototype document serving
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


  // 5. HTTP Logger middleware
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Root welcome endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'MAITRI+ Backend API Service',
      description: 'Maharashtra AI-powered Industrial Registration & Tracking Intelligence (PS-26130)',
      documentation: '/api/v1/health',
      version: '1.0.0',
    });
  });

  // 6. Register versioned routes (/api/v1) and root regulatory aliases
  app.use('/api/v1', apiV1Router);

  // Root route aliases for regulatory knowledge and audit/workflow engine
  app.use('/knowledge', knowledgeRoutes);
  app.use('/approval-guides', approvalGuideRoutes);
  app.use('/faq', faqRoutes);
  app.use('/regulations', regulationRoutes);
  app.use('/audit', auditRoutes);
  app.use('/workflow', workflowRoutes);

  // 7. 404 Handler
  app.use(notFoundHandler);

  // 8. Global Error Handler
  app.use(globalErrorHandler);

  return app;
};

export default createApp;
