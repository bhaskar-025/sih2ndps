import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

// Allow authenticated requests and provide graceful fallback for demo personas
router.use(optionalAuthenticate);

/**
 * @route POST /api/v1/applications
 * @desc Create new statutory application
 */
router.post('/', ApplicationController.createApplication);

/**
 * @route GET /api/v1/applications
 * @desc List applications with filters and SLA status
 */
router.get('/', ApplicationController.getApplications);

/**
 * @route GET /api/v1/applications/analytics/officer
 * @desc Department workload, SLA at risk, inspections today
 */
router.get('/analytics/officer', ApplicationController.getOfficerAnalytics);

/**
 * @route GET /api/v1/applications/:id
 * @desc Get application details with applicant, project, documents, queries, history
 */
router.get('/:id', ApplicationController.getApplicationById);

/**
 * @route PUT /api/v1/applications/:id
 * @desc Update application
 */
router.put('/:id', ApplicationController.updateApplication);

/**
 * @route PATCH /api/v1/applications/:id/status
 * @desc Update application status (Approve, Reject, Under Scrutiny, etc.)
 */
router.patch('/:id/status', ApplicationController.updateStatus);

/**
 * @route PATCH /api/v1/applications/:id/query
 * @desc Raise new query or reply to query
 */
router.patch('/:id/query', ApplicationController.raiseOrReplyQuery);

/**
 * @route PATCH /api/v1/applications/:id/assign
 * @desc Assign officer to application
 */
router.patch('/:id/assign', ApplicationController.assignOfficer);

/**
 * @route POST /api/v1/applications/:id/inspection
 * @desc Schedule field inspection
 */
router.post('/:id/inspection', ApplicationController.scheduleInspection);

export default router;
