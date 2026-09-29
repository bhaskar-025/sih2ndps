import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import applicationRoutes from './application.routes';
import approvalRoutes from './approval.routes';
import documentRoutes from './document.routes';
import departmentRoutes from './department.routes';
import inspectionRoutes from './inspection.routes';
import schemeRoutes from './scheme.routes';
import complianceRoutes from './compliance.routes';
import analyticsRoutes from './analytics.routes';
import knowledgeRoutes from './knowledge.routes';
import approvalGuideRoutes from './approvalGuide.routes';
import faqRoutes from './faq.routes';
import regulationRoutes from './regulation.routes';
import auditRoutes from './audit.routes';
import workflowRoutes from './workflow.routes';
import aiRoutes from './ai.routes';
import officerRoutes from './officer.routes';
import reportsRoutes from './reports.routes';
import copilotRoutes from './copilot.routes';
import notificationRoutes from './notification.routes';
import { getDatabaseStatus } from '../config/database';

const apiV1Router = Router();

// Health check endpoint
apiV1Router.get('/health', (_req, res) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'healthy',
    project: 'MAITRI+ (Maharashtra AI-powered Industrial Registration & Tracking Intelligence)',
    problemStatement: 'PS-26130',
    apiVersion: 'v1',
    database: dbStatus.isConnected ? 'Connected' : 'Disconnected / Standby',
    timestamp: new Date().toISOString(),
  });
});

// Register all route groups under /api/v1/
apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/projects', projectRoutes);
apiV1Router.use('/applications', applicationRoutes);
apiV1Router.use('/approvals', approvalRoutes);
apiV1Router.use('/documents', documentRoutes);
apiV1Router.use('/departments', departmentRoutes);
apiV1Router.use('/inspections', inspectionRoutes);
apiV1Router.use('/schemes', schemeRoutes);
apiV1Router.use('/compliance', complianceRoutes);
apiV1Router.use('/analytics', analyticsRoutes);
apiV1Router.use('/notifications', notificationRoutes);

// Regulatory Knowledge Engine route groups
apiV1Router.use('/knowledge', knowledgeRoutes);
apiV1Router.use('/approval-guides', approvalGuideRoutes);
apiV1Router.use('/faq', faqRoutes);
apiV1Router.use('/regulations', regulationRoutes);

// Audit & Workflow State Transition routes
apiV1Router.use('/audit', auditRoutes);
apiV1Router.use('/workflow', workflowRoutes);

// AI Approval Intelligence Engine routes
apiV1Router.use('/ai', aiRoutes);
apiV1Router.use('/ai/copilot', copilotRoutes);

// Government Officer Workspace & Reporting routes
apiV1Router.use('/officer', officerRoutes);
apiV1Router.use('/reports', reportsRoutes);

export default apiV1Router;
