import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @route GET /api/v1/reports/export/:type
 * @desc Export applications, projects, inspections in CSV format
 */
router.get('/export/:type', ReportsController.exportData);

/**
 * @route GET /api/v1/reports/summary
 * @desc Multi-dimensional analytics summary report
 */
router.get('/summary', ReportsController.getSummaryReport);

export default router;
