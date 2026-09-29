import { api } from './api';
import {
  ProjectDocumentItem,
  DocumentReadinessData,
  DocumentUploadPayload,
} from '../types/document.types';

export const documentService = {
  /**
   * Upload and index project document with progress tracking
   */
  uploadDocument: async (
    payload: DocumentUploadPayload,
    onProgress?: (percentage: number) => void
  ): Promise<ProjectDocumentItem> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('projectId', payload.projectId);
    formData.append('name', payload.name);
    formData.append('documentType', payload.documentType);
    if (payload.expiryDate) formData.append('expiryDate', payload.expiryDate);
    if (payload.remarks) formData.append('remarks', payload.remarks);

    const response = await api.post<any, { success: boolean; data: ProjectDocumentItem }>(
      '/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Get all documents for a project
   */
  getProjectDocuments: async (
    projectId: string,
    filters?: { status?: string; verificationStatus?: string; search?: string }
  ): Promise<ProjectDocumentItem[]> => {
    const params: Record<string, any> = {};
    if (filters?.status && filters.status !== 'ALL') params.status = filters.status;
    if (filters?.verificationStatus && filters.verificationStatus !== 'ALL')
      params.verificationStatus = filters.verificationStatus;
    if (filters?.search) params.search = filters.search;

    const response = await api.get<any, { success: boolean; data: ProjectDocumentItem[] }>(
      `/projects/${projectId}/documents`,
      { params }
    );
    return response.data;
  },

  /**
   * Get single document by ID
   */
  getDocumentById: async (documentId: string): Promise<ProjectDocumentItem> => {
    const response = await api.get<any, { success: boolean; data: ProjectDocumentItem }>(
      `/documents/${documentId}`
    );
    return response.data;
  },

  /**
   * Update document metadata or verification status
   */
  updateDocument: async (
    documentId: string,
    updateData: Partial<ProjectDocumentItem>
  ): Promise<ProjectDocumentItem> => {
    const response = await api.put<any, { success: boolean; data: ProjectDocumentItem }>(
      `/documents/${documentId}`,
      updateData
    );
    return response.data;
  },

  /**
   * Delete document
   */
  deleteDocument: async (documentId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}`);
  },

  /**
   * Get document reuse and readiness metrics
   */
  getDocumentReadiness: async (projectId: string): Promise<DocumentReadinessData> => {
    const response = await api.get<any, { success: boolean; data: DocumentReadinessData }>(
      `/projects/${projectId}/document-readiness`
    );
    return response.data;
  },

  /**
   * Analyze document with Gemini Vision for automatic type detection and multi-approval reuse
   */
  analyzeDocument: async (
    file: File,
    options?: { projectId?: string; documentName?: string }
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.projectId) formData.append('projectId', options.projectId);
    if (options?.documentName) formData.append('documentName', options.documentName);

    const response = await api.post<any, any>('/ai/analyze-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};

export default documentService;
