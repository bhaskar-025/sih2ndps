import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @route   POST /api/v1/ai/generate-roadmap
 * @desc    Generate approval roadmap via Gemini 2.5 Flash (returns cached if already generated)
 * @body    { "projectId": "..." }
 */
router.post('/generate-roadmap', AIController.generateRoadmap);

/**
 * @route   POST /api/v1/ai/regenerate-roadmap/:projectId
 * @desc    Force regenerate roadmap using Gemini 2.5 Flash and store latest
 */
router.post('/regenerate-roadmap/:projectId', AIController.regenerateRoadmap);

/**
 * @route   GET /api/v1/ai/roadmap/:projectId
 * @desc    Get roadmap for a project
 */
router.get('/roadmap/:projectId', AIController.getRoadmap);

/**
 * @route   POST /api/v1/ai/compliance-score
 * @desc    Calculate AI compliance score, risk level, strengths, weaknesses, and explanation
 * @body    { "projectId": "..." }
 */
router.post('/compliance-score', AIController.calculateComplianceScore);

/**
 * @route   POST /api/v1/ai/recommend-schemes
 * @desc    Recommend government schemes dynamically based on Industry, Investment, MSME status, Women entrepreneur, Startup, District, Employment
 * @body    { industry, investment, isMsme, isWomenEntrepreneur, isStartup, district, employment, projectId }
 */
router.post('/recommend-schemes', AIController.recommendSchemes);

/**
 * @route   POST /api/v1/ai/analyze-document
 * @desc    Analyze uploaded statutory document using Gemini Vision, extract fields, calculate reusability, and store metadata in MongoDB
 * @body    Multipart file or JSON { fileBase64, mimeType, fileName, projectId, documentId, documentName }
 */
router.post('/analyze-document', upload.single('file'), AIController.analyzeDocument);

export default router;


