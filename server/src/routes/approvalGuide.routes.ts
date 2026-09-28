import { Router } from 'express';
import { KnowledgeController } from '../controllers/knowledge.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { approvalGuideFilterSchema } from '../validators/knowledge.validator';

const router = Router();

/**
 * @route   GET /api/v1/approval-guides
 * @desc    Filter approval guides by industry, department, inspection, renewal, and keywords
 * @access  Public
 */
router.get('/', validateRequest(approvalGuideFilterSchema), KnowledgeController.getApprovalGuides);

/**
 * @route   GET /api/v1/approval-guides/:id
 * @desc    Get single approval guide details with populated FAQs
 * @access  Public
 */
router.get('/:id', KnowledgeController.getApprovalGuideById);

export default router;
