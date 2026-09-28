import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { DocumentModel, IDocument, DocumentStatus, VerificationStatus } from '../models/Document';
import { ProjectApproval, IProjectApproval } from '../models/ProjectApproval';
import { Project } from '../models/Project';

export interface DocumentUploadDTO {
  projectId: string;
  name: string;
  documentType: string;
  expiryDate?: string;
  remarks?: string;
}

export interface DocumentReadinessResponse {
  projectId: string;
  totalUniqueRequired: number;
  totalUploaded: number;
  totalVerified: number;
  readinessScore: number;
  missingDocuments: {
    documentName: string;
    requiredFor: string[];
    priority: string;
  }[];
  reusableDocuments: {
    documentName: string;
    documentId?: string;
    fileUrl?: string;
    status?: string;
    verificationStatus?: string;
    usedBy: string[];
    usedCount: number;
    isUploaded: boolean;
  }[];
  expiredDocuments: IDocument[];
  verificationPending: IDocument[];
  approvalBreakdown: {
    approvalId: string;
    approvalName: string;
    department: string;
    priority: string;
    totalRequired: number;
    uploadedCount: number;
    missingCount: number;
    isComplete: boolean;
    missingDocuments: string[];
  }[];
}

export class DocumentService {
  /**
   * Helper to normalize text for fuzzy document matching
   */
  private static normalizeDocName(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Check if uploaded document matches a required document specification
   */
  private static isDocMatch(uploadedName: string, requiredName: string): boolean {
    const normUp = this.normalizeDocName(uploadedName);
    const normReq = this.normalizeDocName(requiredName);

    if (normUp === normReq) return true;
    if (normUp.includes(normReq) || normReq.includes(normUp)) return true;

    // Check shared key tokens (e.g. ['architectural', 'blueprint', 'layout'], ['fire', 'hydrant'], ['structural', 'stability'])
    const upWords = normUp.split(' ').filter((w) => w.length > 2);
    const reqWords = normReq.split(' ').filter((w) => w.length > 2);

    let matchCount = 0;
    for (const w of upWords) {
      if (reqWords.includes(w)) {
        matchCount++;
      }
    }

    if (matchCount >= 2 || (matchCount >= 1 && (upWords.length <= 2 || reqWords.length <= 2))) {
      return true;
    }

    // Common statutory aliases
    const aliases: [string, string[]][] = [
      ['gst', ['gst', 'gstin', 'form reg 06', 'tax registration', 'indirect tax']],
      ['pan', ['pan', 'permanent account number', 'director pan', 'company pan']],
      ['midc', ['midc', 'plot allotment', 'lease agreement', 'possession letter', 'industrial estate']],
      ['cad', ['architectural', 'blueprint', 'drawing', 'machine layout', 'factory plan', 'cad']],
      ['structural', ['stability', 'structural', 'chartered engineer', 'civil stability']],
      ['fire', ['fire', 'hydrant', 'sprinkler', 'evacuation', 'provisional fire', 'smoke']],
      ['water', ['water balance', 'drainage', 'zld', 'etp', 'groundwater', 'kld', 'water requirement']],
      ['boiler', ['boiler', 'steam', 'hydraulic', 'pressure vessel', 'boiler inspector']],
      ['hazard', ['hazard', 'process safety', 'msds', 'chemical safety', 'risk assessment']],
      ['power', ['msedcl', 'load sanction', 'substation', 'ht', 'lt', 'electrical', 'sld']],
      ['labour', ['clra', 'contract labour', 'standing orders', 'workmen', 'provident fund', 'epf']],
      ['dpr', ['dpr', 'detailed project report', 'feasibility', 'viability', 'project report']],
    ];

    for (const [key, list] of aliases) {
      const matchUp = list.some((a) => normUp.includes(a)) || normUp.includes(key);
      const matchReq = list.some((a) => normReq.includes(a)) || normReq.includes(key);
      if (matchUp && matchReq) return true;
    }

    return false;
  }


  /**
   * Upload & index a new document or update an existing document version
   */
  static async uploadDocument(
    file: Express.Multer.File,
    data: DocumentUploadDTO,
    userId: string
  ): Promise<IDocument> {
    if (!mongoose.Types.ObjectId.isValid(data.projectId)) {
      throw new Error('Invalid project ID format');
    }

    const project = await Project.findById(data.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Relative accessible URL path for static file serving
    const fileUrl = `/uploads/${file.filename}`;

    // Find which approvals require this document
    const approvals = await ProjectApproval.find({ projectId: project._id });
    const usedInApprovals: string[] = [];

    approvals.forEach((app) => {
      const isNeeded = app.requiredDocuments.some((reqDoc) =>
        this.isDocMatch(data.name, reqDoc)
      );
      if (isNeeded) {
        usedInApprovals.push(app.approvalName);
      }
    });

    // Check if document already exists for this project with the same name
    const existingDoc = await DocumentModel.findOne({
      projectId: project._id,
      name: new RegExp(`^${data.name.trim()}$`, 'i'),
    });

    if (existingDoc) {
      // Increment version and update file details
      existingDoc.version += 1;
      existingDoc.fileName = file.filename;
      existingDoc.fileUrl = fileUrl;
      existingDoc.mimeType = file.mimetype;
      existingDoc.fileSize = file.size;
      existingDoc.uploadedBy = new mongoose.Types.ObjectId(userId);
      existingDoc.uploadedAt = new Date();
      existingDoc.status = 'Uploaded';
      existingDoc.verificationStatus = 'Uploaded';
      if (data.expiryDate) existingDoc.expiryDate = new Date(data.expiryDate);
      if (data.remarks) existingDoc.remarks = data.remarks;
      existingDoc.usedInApprovals = Array.from(
        new Set([...existingDoc.usedInApprovals, ...usedInApprovals])
      );

      await existingDoc.save();
      return existingDoc;
    }

    // Create fresh Document record
    const newDoc = new DocumentModel({
      projectId: project._id,
      name: data.name.trim(),
      documentType: data.documentType || 'Statutory Compliance',
      fileName: file.filename,
      fileUrl,
      mimeType: file.mimetype,
      fileSize: file.size,
      version: 1,
      status: 'Uploaded',
      verificationStatus: 'Uploaded',
      uploadedBy: new mongoose.Types.ObjectId(userId),
      uploadedAt: new Date(),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      remarks: data.remarks || '',
      usedInApprovals,
    });

    await newDoc.save();
    return newDoc;
  }

  /**
   * Get all documents belonging to a project
   */
  static async getDocumentsByProject(
    projectId: string,
    filters?: { status?: string; verificationStatus?: string; search?: string }
  ): Promise<IDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID format');
    }

    const query: any = { projectId: new mongoose.Types.ObjectId(projectId) };

    if (filters?.status && filters.status !== 'ALL') {
      query.status = filters.status;
    }

    if (filters?.verificationStatus && filters.verificationStatus !== 'ALL') {
      query.verificationStatus = filters.verificationStatus;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { documentType: { $regex: filters.search, $options: 'i' } },
        { remarks: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return DocumentModel.find(query).sort({ updatedAt: -1 });
  }

  /**
   * Get single document by ID
   */
  static async getDocumentById(documentId: string): Promise<IDocument> {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new Error('Invalid document ID format');
    }

    const document = await DocumentModel.findById(documentId).populate(
      'uploadedBy',
      'name email organization'
    );

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }

  /**
   * Update document metadata or verification status
   */
  static async updateDocument(
    documentId: string,
    updateData: Partial<IDocument>
  ): Promise<IDocument> {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new Error('Invalid document ID format');
    }

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Status sync with verification status
    if (updateData.verificationStatus === 'Verified') {
      document.status = 'Verified';
      document.verificationStatus = 'Verified';
    } else if (updateData.verificationStatus === 'Rejected') {
      document.status = 'Rejected';
      document.verificationStatus = 'Rejected';
    } else if (updateData.verificationStatus === 'Under Verification') {
      document.verificationStatus = 'Under Verification';
      document.status = 'Pending Verification';
    }

    if (updateData.name) document.name = updateData.name;
    if (updateData.documentType) document.documentType = updateData.documentType;
    if (updateData.expiryDate) document.expiryDate = updateData.expiryDate;
    if (updateData.remarks !== undefined) document.remarks = updateData.remarks;
    if (updateData.status) document.status = updateData.status;

    await document.save();
    return document;
  }

  /**
   * Delete a document and its local file
   */
  static async deleteDocument(documentId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new Error('Invalid document ID format');
    }

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Remove local file if present
    const filePath = path.join(process.cwd(), 'uploads', document.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn(`Could not delete file ${filePath}:`, err);
      }
    }

    await DocumentModel.findByIdAndDelete(documentId);
  }

  /**
   * Document Reuse & Readiness Engine
   * Compares uploaded documents against statutory approval requirements
   */
  static async calculateDocumentReadiness(
    projectId: string
  ): Promise<DocumentReadinessResponse> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID format');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // 1. Fetch approvals and uploaded documents
    const approvals = await ProjectApproval.find({ projectId: project._id });
    const uploadedDocs = await DocumentModel.find({ projectId: project._id });

    // 2. Identify expired documents
    const now = new Date();
    const expiredDocuments = uploadedDocs.filter(
      (d) => d.status === 'Expired' || (d.expiryDate && new Date(d.expiryDate) < now)
    );

    // 3. Identify pending verification documents
    const verificationPending = uploadedDocs.filter(
      (d) => d.verificationStatus === 'Uploaded' || d.verificationStatus === 'Under Verification'
    );

    // 4. Map each required document across approvals
    const requiredDocMap = new Map<
      string,
      { requiredFor: string[]; priorities: string[] }
    >();

    approvals.forEach((app) => {
      app.requiredDocuments.forEach((docName) => {
        const trimmed = docName.trim();
        if (!requiredDocMap.has(trimmed)) {
          requiredDocMap.set(trimmed, {
            requiredFor: [app.approvalName],
            priorities: [app.priority],
          });
        } else {
          const entry = requiredDocMap.get(trimmed)!;
          if (!entry.requiredFor.includes(app.approvalName)) {
            entry.requiredFor.push(app.approvalName);
            entry.priorities.push(app.priority);
          }
        }
      });
    });

    const totalUniqueRequired = requiredDocMap.size;

    // 5. Compare Uploaded vs Required
    const missingDocuments: {
      documentName: string;
      requiredFor: string[];
      priority: string;
    }[] = [];

    // Map of matching uploaded doc per required doc
    const matchedUploadedMap = new Map<string, IDocument>();

    requiredDocMap.forEach((meta, reqDocName) => {
      const match = uploadedDocs.find((uDoc) => this.isDocMatch(uDoc.name, reqDocName));

      if (match) {
        matchedUploadedMap.set(reqDocName, match);
      } else {
        const highestPriority = meta.priorities.includes('Critical')
          ? 'Critical'
          : meta.priorities.includes('High')
          ? 'High'
          : meta.priorities.includes('Medium')
          ? 'Medium'
          : 'Low';

        missingDocuments.push({
          documentName: reqDocName,
          requiredFor: meta.requiredFor,
          priority: highestPriority,
        });
      }
    });

    // 6. Build Reusable Documents list (used across multiple approvals)
    // Common statutory reusable docs that apply broadly
    const reusableMap = new Map<
      string,
      {
        usedBy: Set<string>;
        doc?: IDocument;
      }
    >();

    // Seed common cross-departmental docs
    const standardUniversalDocs = [
      'PAN Card of Company & Authorized Signatories',
      'GST Registration Certificate (Form REG-06)',
      'MIDC Plot Allotment Letter / Registered Lease Agreement',
      'Comprehensive Factory Building CAD Drawing & Machine Layout',
      'Detailed Project Report (DPR) & Techno-Economic Feasibility',
      'Comprehensive Water Balance Diagram & ZLD Concept Plan',
    ];

    standardUniversalDocs.forEach((docTitle) => {
      reusableMap.set(docTitle, { usedBy: new Set<string>() });
    });

    // Map each required doc from approvals into reusable items
    requiredDocMap.forEach((meta, reqDocName) => {
      let targetKey = reqDocName;
      for (const std of standardUniversalDocs) {
        if (this.isDocMatch(reqDocName, std)) {
          targetKey = std;
          break;
        }
      }

      if (!reusableMap.has(targetKey)) {
        reusableMap.set(targetKey, { usedBy: new Set<string>() });
      }

      const item = reusableMap.get(targetKey)!;
      meta.requiredFor.forEach((r) => item.usedBy.add(r));
    });

    // Attach uploaded matching doc
    reusableMap.forEach((val, key) => {
      const matchingUploaded = uploadedDocs.find((u) => this.isDocMatch(u.name, key));
      if (matchingUploaded) {
        val.doc = matchingUploaded;
      }
    });

    const reusableDocuments = Array.from(reusableMap.entries())
      .filter(([_, val]) => val.usedBy.size >= 1)
      .map(([name, val]) => ({
        documentName: name,
        documentId: val.doc?._id.toString(),
        fileUrl: val.doc?.fileUrl,
        status: val.doc?.status || 'Missing',
        verificationStatus: val.doc?.verificationStatus || 'Missing',
        usedBy: Array.from(val.usedBy),
        usedCount: val.usedBy.size,
        isUploaded: Boolean(val.doc),
      }))
      .sort((a, b) => b.usedCount - a.usedCount);

    // 7. Calculate Approval-by-Approval Breakdown
    const approvalBreakdown = approvals.map((app) => {
      const totalReq = app.requiredDocuments.length;
      const missingForApp: string[] = [];
      let uploadedForApp = 0;

      app.requiredDocuments.forEach((docName) => {
        const isUploaded = uploadedDocs.some((uDoc) => this.isDocMatch(uDoc.name, docName));
        if (isUploaded) {
          uploadedForApp += 1;
        } else {
          missingForApp.push(docName);
        }
      });

      return {
        approvalId: app._id.toString(),
        approvalName: app.approvalName,
        department: app.department,
        priority: app.priority,
        totalRequired: totalReq,
        uploadedCount: uploadedForApp,
        missingCount: missingForApp.length,
        isComplete: missingForApp.length === 0,
        missingDocuments: missingForApp,
      };
    });

    // 8. Overall Readiness Score (0 - 100%)
    const totalVerified = uploadedDocs.filter(
      (d) => d.status === 'Verified' || d.verificationStatus === 'Verified'
    ).length;

    const matchedCount = matchedUploadedMap.size;
    let readinessScore = 0;

    if (totalUniqueRequired > 0) {
      const matchedRatio = matchedCount / totalUniqueRequired;
      const verifiedBonus = totalVerified > 0 ? (totalVerified / Math.max(uploadedDocs.length, 1)) * 0.2 : 0;
      readinessScore = Math.round((matchedRatio * 0.8 + verifiedBonus) * 100);
      readinessScore = Math.min(100, Math.max(0, readinessScore));
    } else {
      readinessScore = uploadedDocs.length > 0 ? 100 : 50;
    }

    return {
      projectId: project._id.toString(),
      totalUniqueRequired,
      totalUploaded: uploadedDocs.length,
      totalVerified,
      readinessScore,
      missingDocuments,
      reusableDocuments,
      expiredDocuments,
      verificationPending,
      approvalBreakdown,
    };
  }
}

export default DocumentService;
