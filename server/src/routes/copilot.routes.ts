import { Router } from 'express';
import { CopilotController } from '../controllers/copilot.controller';
import { optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(optionalAuthenticate);

/**
 * @route POST /api/v1/ai/copilot/action
 * @desc One-click AI Copilot assistant dispatcher
 */
router.post('/action', CopilotController.executeAction);

export default router;
