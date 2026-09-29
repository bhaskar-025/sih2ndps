export type DocumentStatus =
  | 'Uploaded'
  | 'Missing'
  | 'Rejected'
  | 'Verified'
  | 'Expired'
  | 'Pending Verification';

export type VerificationStatus =
  | 'Uploaded'
  | 'Under Verification'
  | 'Verified'
  | 'Rejected';

export interface ProjectDocumentItem {
  _id: string;
  projectId: string;
  name: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  version: number;
  status: DocumentStatus;
  verificationStatus: VerificationStatus;
  uploadedBy: {
    _id?: string;
    name?: string;
    email?: string;
    organization?: string;
  } | string;
  uploadedAt: string;
  expiryDate?: string;
  remarks?: string;
  usedInApprovals: string[];
  ocrStatus?: 'Processed' | 'Pending' | 'Verified' | 'Failed';
  ocrConfidence?: number;
  isDigitallySigned?: boolean;
  signerName?: string;
  signatureTimestamp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MissingDocumentInfo {
  documentName: string;
  requiredFor: string[];
  priority: string;
}

export interface ReusableDocumentInfo {
  documentName: string;
  documentId?: string;
  fileUrl?: string;
  status?: string;
  verificationStatus?: string;
  usedBy: string[];
  usedCount: number;
  isUploaded: boolean;
}

export interface ApprovalDocumentBreakdown {
  approvalId: string;
  approvalName: string;
  department: string;
  priority: string;
  totalRequired: number;
  uploadedCount: number;
  missingCount: number;
  isComplete: boolean;
  missingDocuments: string[];
}

export interface DocumentReadinessData {
  projectId: string;
  totalUniqueRequired: number;
  totalUploaded: number;
  totalVerified: number;
  readinessScore: number;
  missingDocuments: MissingDocumentInfo[];
  reusableDocuments: ReusableDocumentInfo[];
  expiredDocuments: ProjectDocumentItem[];
  verificationPending: ProjectDocumentItem[];
  approvalBreakdown: ApprovalDocumentBreakdown[];
}

export interface DocumentUploadPayload {
  projectId: string;
  name: string;
  documentType: string;
  file: File;
  expiryDate?: string;
  remarks?: string;
}
