import { apiClient } from './client';
import mockDocumentsData from './mockData/mockDocuments.json';

export interface DocumentQueryParams {
  projectId?: string;
  status?: string;
  verificationStatus?: string;
  search?: string;
}

export const documentApi = {
  /**
   * Fetches statutory documents list
   */
  async getDocuments(params?: DocumentQueryParams): Promise<any[]> {
    const projectId = params?.projectId || 'proj-001';
    return apiClient.executeWithFallback(
      () => apiClient.get(`/projects/${projectId}/documents`, { params }),
      () => {
        let list = [...mockDocumentsData];
        if (params?.projectId) {
          list = list.filter((d) => d.projectId === params.projectId);
        }
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.documentType.toLowerCase().includes(q) ||
              d.fileName.toLowerCase().includes(q)
          );
        }
        if (params?.status && params.status !== 'ALL') {
          list = list.filter((d) => d.status === params.status);
        }
        if (params?.verificationStatus && params.verificationStatus !== 'ALL') {
          list = list.filter((d) => d.verificationStatus === params.verificationStatus);
        }
        return list;
      },
      `projects/${projectId}/documents`
    );
  },

  /**
   * Fetches single document record by ID
   */
  async getDocumentById(id: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.get(`/documents/${id}`),
      () => {
        const found = mockDocumentsData.find((d) => d._id === id);
        return found || mockDocumentsData[0];
      },
      `documents/${id}`
    );
  },

  /**
   * Updates document verification status
   */
  async verifyDocument(
    id: string,
    verificationStatus: 'Uploaded' | 'Under Verification' | 'Verified' | 'Rejected',
    remarks?: string
  ): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.patch(`/documents/${id}`, { verificationStatus, remarks }),
      () => {
        const found = mockDocumentsData.find((d) => d._id === id) || mockDocumentsData[0];
        return { ...found, verificationStatus, remarks, status: verificationStatus === 'Verified' ? 'Verified' : 'Pending Verification' };
      },
      `documents/${id}`
    );
  },

  /**
   * Fetches statutory document readiness and multi-approval reuse analytics
   */
  async getDocumentReadiness(projectId: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.get(`/projects/${projectId}/document-readiness`),
      () => {
        const docs = mockDocumentsData.filter((d) => d.projectId === projectId || !d.projectId);
        const verified = docs.filter((d) => d.verificationStatus === 'Verified').length;
        const total = docs.length || 1;
        const score = Math.round((verified / total) * 100);

        return {
          projectId,
          totalUniqueRequired: 6,
          totalUploaded: docs.length,
          totalVerified: verified,
          readinessScore: score,
          missingDocuments: [
            {
              documentName: "Groundwater Extraction Renewal Permit",
              requiredFor: ["Water Supply Connection (MIDC)"],
              priority: "High"
            }
          ],
          reusableDocuments: [
            {
              documentName: "Factory Layout & Architecture Blueprints",
              documentId: "doc-001",
              isUploaded: true,
              usedCount: 4,
              usedBy: ["Consent to Establish", "Factory License", "MIDC Plan", "Fire NOC"]
            },
            {
              documentName: "MIDC Registered Land Possession Agreement",
              documentId: "doc-004",
              isUploaded: true,
              usedCount: 3,
              usedBy: ["Plot Possession", "MPCB Consent", "MSEDCL Feeder"]
            }
          ],
          expiredDocuments: docs.filter((d) => d.status === 'Expired'),
          verificationPending: docs.filter((d) => d.verificationStatus === 'Under Verification'),
          approvalBreakdown: [
            {
              approvalId: "app-001",
              approvalName: "Consent to Establish (MPCB)",
              department: "MPCB",
              priority: "High",
              totalRequired: 3,
              uploadedCount: 3,
              missingCount: 0,
              isComplete: true,
              missingDocuments: []
            },
            {
              approvalId: "app-002",
              approvalName: "Fire Safety NOC (DMFS)",
              department: "DMFS",
              priority: "Critical",
              totalRequired: 2,
              uploadedCount: 2,
              missingCount: 0,
              isComplete: true,
              missingDocuments: []
            }
          ]
        };
      },
      `projects/${projectId}/document-readiness`
    );
  },

  /**
   * Uploads new statutory document artifact
   */
  async uploadDocument(formData: FormData): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      () => ({
        success: true,
        document: {
          _id: `doc-${Date.now()}`,
          name: formData.get('name') || 'Uploaded Document',
          fileName: 'uploaded_artifact.pdf',
          fileUrl: '/uploads/documents/uploaded_artifact.pdf',
          verificationStatus: 'Uploaded',
          ocrStatus: 'Verified',
          ocrConfidence: 98.5,
          isDigitallySigned: true,
          uploadedAt: new Date().toISOString()
        }
      }),
      'documents/upload'
    );
  }
};

export const getDocuments = documentApi.getDocuments;
export const getDocumentReadiness = documentApi.getDocumentReadiness;
