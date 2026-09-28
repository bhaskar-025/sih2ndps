import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/documentService';
import {
  DocumentUploadPayload,
  ProjectDocumentItem,
} from '../types/document.types';

export const useDocuments = (
  projectId?: string,
  filters?: { status?: string; verificationStatus?: string; search?: string }
) => {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents', projectId, filters],
    queryFn: () =>
      projectId
        ? documentService.getProjectDocuments(projectId, filters)
        : Promise.resolve([]),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 2, // 2 mins
  });

  const readinessQuery = useQuery({
    queryKey: ['document-readiness', projectId],
    queryFn: () => (projectId ? documentService.getDocumentReadiness(projectId) : Promise.reject('No ID')),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 2,
  });

  const uploadMutation = useMutation({
    mutationFn: ({
      payload,
      onProgress,
    }: {
      payload: DocumentUploadPayload;
      onProgress?: (percent: number) => void;
    }) => documentService.uploadDocument(payload, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      queryClient.invalidateQueries({ queryKey: ['document-readiness', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['roadmap', projectId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      documentId,
      updateData,
    }: {
      documentId: string;
      updateData: Partial<ProjectDocumentItem>;
    }) => documentService.updateDocument(documentId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      queryClient.invalidateQueries({ queryKey: ['document-readiness', projectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => documentService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      queryClient.invalidateQueries({ queryKey: ['document-readiness', projectId] });
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,
    refetchDocuments: documentsQuery.refetch,

    readiness: readinessQuery.data,
    isReadinessLoading: readinessQuery.isLoading,
    refetchReadiness: readinessQuery.refetch,

    uploadDocument: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,

    updateDocument: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteDocument: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useDocument = (id: string | undefined) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => (id ? documentService.getDocumentById(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
};

export default useDocuments;
