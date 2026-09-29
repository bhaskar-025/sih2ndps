import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { RoadmapController } from '../controllers/roadmap.controller';
import { DocumentController } from '../controllers/document.controller';
import { ComplianceController } from '../controllers/compliance.controller';
import { optionalAuthenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';

const router = Router();

// Allow authenticated requests and provide graceful fallback for demo personas
router.use(optionalAuthenticate);

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new industrial unit project
 * @access  Private (Entrepreneur, Admin)
 */
router.post('/', validateRequest(createProjectSchema), ProjectController.createProject);

/**
 * @route   GET /api/v1/projects
 * @desc    Get all projects with search, filter, sort, pagination
 * @access  Private
 */
router.get('/', ProjectController.getProjects);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get project details with populated relationships
 * @access  Private
 */
router.get('/:id', ProjectController.getProjectById);

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update an existing project
 * @access  Private (Owner, Admin)
 */
router.put('/:id', validateRequest(updateProjectSchema), ProjectController.updateProject);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Soft delete an existing project
 * @access  Private (Owner, Admin)
 */
router.delete('/:id', ProjectController.deleteProject);

/**
 * @route   POST /api/v1/projects/:id/generate-roadmap
 * @desc    Generate personalized statutory approval roadmap via Rule Engine
 * @access  Private
 */
router.post('/:id/generate-roadmap', RoadmapController.generateRoadmap);

/**
 * @route   GET /api/v1/projects/:id/roadmap
 * @desc    Get generated approval roadmap and timeline
 * @access  Private
 */
router.get('/:id/roadmap', RoadmapController.getRoadmap);

/**
 * @route   GET /api/v1/projects/:id/documents
 * @desc    Get all uploaded documents for a project
 * @access  Private
 */
router.get('/:id/documents', DocumentController.getProjectDocuments);

/**
 * @route   GET /api/v1/projects/:id/document-readiness
 * @desc    Get document readiness score, missing, and reusable document metrics
 * @access  Private
 */
router.get('/:id/document-readiness', DocumentController.getDocumentReadiness);

/**
 * @route   GET /api/v1/projects/:id/compliance
 * @desc    Get project compliances and compliance score
 * @access  Private
 */
router.get('/:id/compliance', ComplianceController.getProjectCompliances);

/**
 * @route   GET /api/v1/projects/:id/compliance/score
 * @desc    Get project compliance score and status breakdown
 * @access  Private
 */
router.get('/:id/compliance/score', ComplianceController.getProjectComplianceScore);

/**
 * @route   GET /api/v1/projects/:id/compliance/reminders
 * @desc    Get project compliance reminders (30, 15, 7, 1 day & overdue)
 * @access  Private
 */
router.get('/:id/compliance/reminders', ComplianceController.getProjectReminders);

export default router;


