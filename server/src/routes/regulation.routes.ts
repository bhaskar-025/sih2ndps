import { Router } from 'express';
import { KnowledgeController } from '../controllers/knowledge.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { regulationFilterSchema } from '../validators/knowledge.validator';

const router = Router();

/**
 * @route   GET /api/v1/regulations
 * @desc    Filter statutory regulations, acts, and rules by department, industry, and keywords
 * @access  Public
 */
router.get('/', validateRequest(regulationFilterSchema), KnowledgeController.getRegulations);

/**
 * @route   GET /api/v1/regulations/:id
 * @desc    Get single statutory regulation by ID
 * @access  Public
 */
router.get('/:id', KnowledgeController.getRegulationById);

export default router;
