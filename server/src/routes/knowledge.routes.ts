import { Router } from 'express';
import { KnowledgeController } from '../controllers/knowledge.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  knowledgeSearchQuerySchema,
  departmentIdParamSchema,
} from '../validators/knowledge.validator';

const router = Router();

/**
 * @route   GET /api/v1/knowledge
 * @desc    High-level regulatory overview, category lists, summary statistics
 * @access  Public
 */
router.get('/', KnowledgeController.getKnowledgeOverview);

/**
 * @route   GET /api/v1/knowledge/search
 * @desc    Multi-entity keyword search across guides, FAQs, regulations, departments
 * @access  Public
 */
router.get('/search', validateRequest(knowledgeSearchQuerySchema), KnowledgeController.searchKnowledge);

/**
 * @route   GET /api/v1/knowledge/categories
 * @desc    Get all organized regulatory knowledge categories
 * @access  Public
 */
router.get('/categories', KnowledgeController.getCategories);

/**
 * @route   GET /api/v1/knowledge/department/:id
 * @desc    Comprehensive regulatory dossier for a specific department
 * @access  Public
 */
router.get(
  '/department/:id',
  validateRequest(departmentIdParamSchema),
  KnowledgeController.getDepartmentKnowledge
);

export default router;
