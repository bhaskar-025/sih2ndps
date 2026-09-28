import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { auditQuerySchema, createAuditLogSchema } from '../validators/audit.validator';

const router = Router();

/**
 * @route   GET /api/v1/audit or /audit
 * @desc    Retrieve filtered and paginated audit logs across all system entities
 * @access  Public / Officer / Admin
 */
router.get('/', validateRequest(auditQuerySchema), AuditController.getAuditLogs);

/**
 * @route   GET /api/v1/audit/stats or /audit/stats
 * @desc    High-level audit statistics and distribution by entity
 * @access  Public / Officer / Admin
 */
router.get('/stats', AuditController.getAuditStats);

/**
 * @route   POST /api/v1/audit or /audit
 * @desc    Create a custom audit entry
 * @access  Public / Authenticated
 */
router.post('/', validateRequest(createAuditLogSchema), AuditController.createAuditLog);

export default router;
