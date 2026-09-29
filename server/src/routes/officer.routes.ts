import { Router } from 'express';
import { OfficerController } from '../controllers/officer.controller';
import { optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

// Allow authenticated requests and provide graceful fallback for demo personas
router.use(optionalAuthenticate);

/**
 * @route GET /api/v1/officer/dashboard-analytics
 * @desc Get dynamic live analytics, KPIs, queue segregation, district/industry breakdown
 */
router.get('/dashboard-analytics', OfficerController.getDashboardAnalytics);

/**
 * @route GET /api/v1/officer/officers-list
 * @desc Get list of all officers with active caseload
 */
router.get('/officers-list', OfficerController.getOfficersList);

/**
 * @route POST /api/v1/officer/assign
 * @desc Assign an officer to an application
 */
router.post('/assign', OfficerController.assignOfficer);

/**
 * @route POST /api/v1/officer/forward
 * @desc Forward application to another department
 */
router.post('/forward', OfficerController.forwardDepartment);

/**
 * @route POST /api/v1/officer/generate-noc
 * @desc Issue official digital NOC certificate for application
 */
router.post('/generate-noc', OfficerController.generateNoc);

/**
 * @route POST /api/v1/officer/notes
 * @desc Add internal officer note
 */
router.post('/notes', OfficerController.addOfficerNote);

/**
 * @route POST /api/v1/officer/return
 * @desc Return application to applicant for resubmission
 */
router.post('/return', OfficerController.returnApplication);

export default router;
