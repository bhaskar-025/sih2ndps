import { Router } from 'express';
import { InspectionController } from '../controllers/inspection.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createInspectionSchema,
  updateInspectionSchema,
  updateInspectionStatusSchema,
  rescheduleInspectionSchema,
  cancelInspectionSchema,
  assignInspectorSchema,
  inspectionParamsSchema,
  inspectionQuerySchema,
} from '../validators/inspection.validator';

const router = Router();

// Protect all inspection routes with authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/inspections
 * @desc    Schedule a new field inspection
 * @access  Private (Officer, Admin, Entrepreneur)
 */
router.post(
  '/',
  validateRequest(createInspectionSchema),
  InspectionController.createInspection
);

/**
 * @route   GET /api/v1/inspections
 * @desc    Get all inspections with filters, search, sort, pagination
 * @access  Private
 */
router.get(
  '/',
  validateRequest(inspectionQuerySchema),
  InspectionController.getInspections
);

/**
 * @route   GET /api/v1/inspections/:id
 * @desc    Get single inspection details with checklist items and complete audit history
 * @access  Private
 */
router.get(
  '/:id',
  validateRequest(inspectionParamsSchema),
  InspectionController.getInspectionById
);

/**
 * @route   PUT /api/v1/inspections/:id
 * @desc    Update inspection parameters and checklist
 * @access  Private
 */
router.put(
  '/:id',
  validateRequest(updateInspectionSchema),
  InspectionController.updateInspection
);

/**
 * @route   PATCH /api/v1/inspections/:id/status
 * @desc    Update inspection status (Completed, Rescheduled, Cancelled)
 * @access  Private
 */
router.patch(
  '/:id/status',
  validateRequest(updateInspectionStatusSchema),
  InspectionController.updateInspectionStatus
);

/**
 * @route   DELETE /api/v1/inspections/:id
 * @desc    Soft delete / archive inspection
 * @access  Private
 */
router.delete(
  '/:id',
  validateRequest(inspectionParamsSchema),
  InspectionController.deleteInspection
);

/**
 * @route   POST /api/v1/inspections/:id/reschedule
 * @desc    Reschedule inspection date/time with audit trail
 * @access  Private
 */
router.post(
  '/:id/reschedule',
  validateRequest(rescheduleInspectionSchema),
  InspectionController.rescheduleInspection
);

/**
 * @route   POST /api/v1/inspections/:id/cancel
 * @desc    Cancel scheduled inspection with cancellation reason
 * @access  Private
 */
router.post(
  '/:id/cancel',
  validateRequest(cancelInspectionSchema),
  InspectionController.cancelInspection
);

/**
 * @route   PATCH /api/v1/inspections/:id/assign
 * @desc    Assign or reassign inspector
 * @access  Private (Officer, Admin)
 */
router.patch(
  '/:id/assign',
  validateRequest(assignInspectorSchema),
  InspectionController.assignInspector
);

/**
 * @route   GET /api/v1/inspections/:id/checklist
 * @desc    Get checklist items for an inspection
 * @access  Private
 */
router.get(
  '/:id/checklist',
  validateRequest(inspectionParamsSchema),
  InspectionController.getChecklist
);

/**
 * @route   PATCH /api/v1/inspections/:id/checklist/:itemId
 * @desc    Update a checklist item's compliance status and remarks
 * @access  Private
 */
router.patch(
  '/:id/checklist/:itemId',
  InspectionController.updateChecklistItem
);

export default router;
