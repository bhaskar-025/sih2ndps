import { Router } from 'express';

const router = Router();

// Route group: /api/v1/schemes
router.get('/', (_req, res) => {
  res.status(501).json({ message: 'Schemes: List incentive schemes architecture ready.' });
});

router.get('/:id', (_req, res) => {
  res.status(501).json({ message: 'Schemes: Get scheme details architecture ready.' });
});

router.post('/', (_req, res) => {
  res.status(501).json({ message: 'Schemes: Create scheme architecture ready.' });
});

router.put('/:id', (_req, res) => {
  res.status(501).json({ message: 'Schemes: Update scheme architecture ready.' });
});

router.delete('/:id', (_req, res) => {
  res.status(501).json({ message: 'Schemes: Delete scheme architecture ready.' });
});

export default router;
