import { Router } from 'express';
import { KnowledgeController } from '../controllers/knowledge.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { faqFilterSchema } from '../validators/knowledge.validator';

const router = Router();

/**
 * @route   GET /api/v1/faq
 * @desc    Filter FAQs by department, category, keyword, and search query
 * @access  Public
 */
router.get('/', validateRequest(faqFilterSchema), KnowledgeController.getFAQs);

/**
 * @route   GET /api/v1/faq/:id
 * @desc    Get single FAQ details
 * @access  Public
 */
router.get('/:id', KnowledgeController.getFAQById);

export default router;
