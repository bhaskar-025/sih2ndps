import { Router } from 'express';
import { ComplianceController } from '../controllers/compliance.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createComplianceSchema,
  updateComplianceSchema,
  updateComplianceStatusSchema,
  getComplianceParamsSchema,
  complianceQuerySchema,
} from '../validators/compliance.validator';

const router = Router();

// Protect all compliance routes with authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/compliance
 * @desc    Create a new compliance record
 * @access  Private
 */
router.post(
  '/',
  validateRequest(createComplianceSchema),
  ComplianceController.createCompliance
);

/**
 * @route   GET /api/v1/compliance
 * @desc    Get all compliances with filter, search, sort, pagination
 * @access  Private
 */
router.get(
  '/',
  validateRequest(complianceQuerySchema),
  ComplianceController.getCompliances
);

/**
 * @route   GET /api/v1/compliance/reminders
 * @desc    Get generated 30/15/7/1-day reminder objects across authorized compliances
 * @access  Private
 */
router.get('/reminders', ComplianceController.getAllReminders);

/**
 * @route   POST /api/v1/compliance/engine/evaluate
 * @desc    Trigger compliance engine evaluation
 * @access  Private
 */
router.post('/engine/evaluate', ComplianceController.triggerEngineEvaluation);

/**
 * @route   GET /api/v1/compliance/engine/upcoming-renewals
 * @desc    Get upcoming renewal compliances
 * @access  Private
 */
router.get('/engine/upcoming-renewals', ComplianceController.getUpcomingRenewals);

/**
 * @route   GET /api/v1/compliance/engine/due-30-days
 * @desc    Get compliances due in next 30 days
 * @access  Private
 */
router.get('/engine/due-30-days', ComplianceController.getDueIn30Days);

/**
 * @route   GET /api/v1/compliance/engine/expired
 * @desc    Get expired / overdue compliances
 * @access  Private
 */
router.get('/engine/expired', ComplianceController.getExpiredCompliances);

/**
 * @route   GET /api/v1/compliance/:id
 * @desc    Get single compliance details
 * @access  Private
 */
router.get(
  '/:id',
  validateRequest(getComplianceParamsSchema),
  ComplianceController.getComplianceById
);

/**
 * @route   PUT /api/v1/compliance/:id
 * @desc    Update compliance record
 * @access  Private
 */
router.put(
  '/:id',
  validateRequest(updateComplianceSchema),
  ComplianceController.updateCompliance
);

/**
 * @route   PATCH /api/v1/compliance/:id/status
 * @desc    Update compliance status (e.g. Completed, Renewal Pending, Overdue)
 * @access  Private
 */
router.patch(
  '/:id/status',
  validateRequest(updateComplianceStatusSchema),
  ComplianceController.updateComplianceStatus
);

/**
 * @route   DELETE /api/v1/compliance/:id
 * @desc    Soft delete compliance record
 * @access  Private
 */
router.delete(
  '/:id',
  validateRequest(getComplianceParamsSchema),
  ComplianceController.deleteCompliance
);

export default router;
