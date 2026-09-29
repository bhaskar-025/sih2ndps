import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { AIComplianceService } from '../services/ai/aiCompliance.service';

export class DocumentController {
  /**
   * @route POST /api/v1/documents/upload
   * @desc Upload and index a document with Multer
   */
  static async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded. Please attach a PDF, PNG, JPEG, or DOCX file.',
        });
        return;
      }

      const { projectId, name, documentType, expiryDate, remarks } = req.body;

      if (!projectId || !name) {
        res.status(400).json({
          success: false,
          message: 'projectId and name are required fields',
        });
        return;
      }

      const userId = (req as any).user?.userId || (req as any).user?._id;

      const document = await DocumentService.uploadDocument(
        req.file,
        {
          projectId,
          name,
          documentType: documentType || 'Statutory Compliance',
          expiryDate,
          remarks,
        },
        userId
      );

      // Recalculate AI Compliance score on document upload
      AIComplianceService.calculateComplianceScore(projectId).catch(() => {});

      res.status(201).json({
        success: true,
        message: 'Document uploaded and indexed successfully into Project Repository',
        data: document,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload document',
      });
    }
  }

  /**
   * @route GET /api/v1/projects/:id/documents
   * @desc Get all documents for a project
   */
  static async getProjectDocuments(req: Request, res: Response): Promise<void> {
    try {
      const projectId = req.params.id as string;
      const { status, verificationStatus, search } = req.query;

      const documents = await DocumentService.getDocumentsByProject(projectId, {
        status: status as string,
        verificationStatus: verificationStatus as string,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch project documents',
      });
    }
  }

  /**
   * @route GET /api/v1/documents/:id
   * @desc Get single document by ID
   */
  static async getDocumentById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const document = await DocumentService.getDocumentById(id);

      res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch document',
      });
    }
  }

  /**
   * @route PUT /api/v1/documents/:id
   * @desc Update document metadata or verification status
   */
  static async updateDocument(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await DocumentService.updateDocument(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Document updated successfully',
        data: updated,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update document',
      });
    }
  }

  /**
   * @route DELETE /api/v1/documents/:id
   * @desc Delete document and underlying file
   */
  static async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await DocumentService.deleteDocument(id);

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully from project repository',
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete document',
      });
    }
  }

  /**
   * @route GET /api/v1/projects/:id/document-readiness
   * @desc Run Document Reuse Engine to calculate readiness score and reusable/missing breakdown
   */
  static async getDocumentReadiness(req: Request, res: Response): Promise<void> {
    try {
      const projectId = req.params.id as string;
      const readiness = await DocumentService.calculateDocumentReadiness(projectId);

      res.status(200).json({
        success: true,
        data: readiness,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to evaluate document readiness',
      });
    }
  }
}

export default DocumentController;
