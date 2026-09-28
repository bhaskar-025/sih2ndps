import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { workflowParamsSchema } from '../validators/audit.validator';

const router = Router();

/**
 * @route   GET /api/v1/workflow/:applicationId or /workflow/:applicationId
 * @desc    Complete lifecycle state transitions and audit history for an application
 * @access  Public / Authenticated
 */
router.get(
  '/:applicationId',
  validateRequest(workflowParamsSchema),
  AuditController.getWorkflowHistory
);

export default router;
