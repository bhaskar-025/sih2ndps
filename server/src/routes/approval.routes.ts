import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmap.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Route group: /api/v1/approvals
router.use(authenticate);

router.get('/', (_req, res) => {
  res.status(501).json({ message: 'Approvals: List approvals and NOCs architecture ready.' });
});

router.get('/:id', (_req, res) => {
  res.status(501).json({ message: 'Approvals: Get approval details architecture ready.' });
});

router.post('/', (_req, res) => {
  res.status(501).json({ message: 'Approvals: Issue approval NOC certificate architecture ready.' });
});

router.put('/:id/status', RoadmapController.updateApprovalStatus);
router.put('/:id', RoadmapController.updateApprovalStatus);

export default router;

