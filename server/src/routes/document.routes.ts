import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Protect all document routes with authentication
router.use(authenticate);

/**
 * @route POST /api/v1/documents/upload
 * @desc Upload and index project statutory document
 * @access Private
 */
router.post('/upload', upload.single('file'), DocumentController.uploadDocument);

/**
 * @route GET /api/v1/documents/:id
 * @desc Get single document by ID
 * @access Private
 */
router.get('/:id', DocumentController.getDocumentById);

/**
 * @route PUT /api/v1/documents/:id
 * @desc Update document metadata or verification status
 * @access Private
 */
router.put('/:id', DocumentController.updateDocument);

/**
 * @route DELETE /api/v1/documents/:id
 * @desc Delete document and underlying file
 * @access Private
 */
router.delete('/:id', DocumentController.deleteDocument);

export default router;
