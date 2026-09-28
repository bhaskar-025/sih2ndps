import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/documentService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';
import { ProjectDocumentItem, VerificationStatus } from '../../types/document.types';
import { formatFileSize, formatDate, formatDateTime } from '../../utils/formatters';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  History,
  Image as ImageIcon,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';

interface DocumentDetailsProps {
  documentId?: string;
  projectId?: string;
  onClose?: () => void;
  onDeleteSuccess?: () => void;
}

export const DocumentDetails: React.FC<DocumentDetailsProps> = ({
  documentId: propDocId,
  projectId: propProjectId,
  onClose,
  onDeleteSuccess,
}) => {
  const { id: paramProjectId, docId: paramDocId } = useParams<{
    id?: string;
    docId?: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const documentId = propDocId || paramDocId;
  const projectId = propProjectId || paramProjectId;

  const {
    data: document,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentService.getDocumentById(documentId!),
    enabled: !!documentId,
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  // Mutation to update verification status
  const updateStatusMutation = useMutation({
    mutationFn: (verificationStatus: VerificationStatus) =>
      documentService.updateDocument(documentId!, { verificationStatus }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['document', documentId], updated);
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      queryClient.invalidateQueries({ queryKey: ['document-readiness', projectId] });
      setFeedback(`Status updated to "${updated.verificationStatus}"`);
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  // Mutation to delete document
  const deleteMutation = useMutation({
    mutationFn: () => documentService.deleteDocument(documentId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      queryClient.invalidateQueries({ queryKey: ['document-readiness', projectId] });
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else if (projectId) {
        navigate(`/projects/${projectId}/documents`);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <ErrorState
          message={(error as Error)?.message || 'Document record not found'}
          onRetry={() => refetch()}
        />
        <div className="mt-4 text-center">
          {onClose ? (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          ) : (
            <Link to={projectId ? `/projects/${projectId}/documents` : '/projects'}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back to Documents</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const isImage =
    document.mimeType.startsWith('image/') ||
    ['.png', '.jpg', '.jpeg'].some((ext) => document.fileName.toLowerCase().endsWith(ext));
  const isPdf =
    document.mimeType === 'application/pdf' || document.fileName.toLowerCase().endsWith('.pdf');

  // Complete file URL for local backend serving
  const fullFileUrl = document.fileUrl.startsWith('http')
    ? document.fileUrl
    : `http://localhost:5000${document.fileUrl}`;

  const uploaderName =
    typeof document.uploadedBy === 'object' && document.uploadedBy?.name
      ? document.uploadedBy.name
      : 'Applicant / Project Officer';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Close Dossier</span>
          </Button>
        ) : (
          <Link
            to={projectId ? `/projects/${projectId}/documents` : '/projects'}
            className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project Documents</span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-mono font-bold">
            v{document.version}.0
          </Badge>
          <StatusBadge status={document.verificationStatus} className="text-xs" />
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Document Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="saffron">{document.documentType}</Badge>
            <Badge variant="secondary">Single-Source Artifact</Badge>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-xs text-slate-300">
              Size: {formatFileSize(document.fileSize)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {document.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              Uploaded on {formatDate(document.uploadedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              Uploaded by: <strong>{uploaderName}</strong>
            </span>
            {document.expiryDate && (
              <span className="flex items-center gap-1.5 text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                Expires on {formatDate(document.expiryDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reusable Cross-Departmental Approvals View */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600" />
            <span>Cross-Departmental Document Reuse (Used in {document.usedInApprovals?.length || 0} Approvals)</span>
          </CardTitle>
          <CardDescription>
            This verified statutory artifact is shared across multiple government clearances without duplicate uploads.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {document.usedInApprovals && document.usedInApprovals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {document.usedInApprovals.map((appTitle, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 text-xs font-semibold text-orange-950 dark:text-orange-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                  <span>{appTitle}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              This document is indexed in the project repository and available for ad-hoc statutory verification.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Document Preview & Download Panel */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Document File Previewer</span>
            </CardTitle>
            <CardDescription>{document.fileName}</CardDescription>
          </div>

          <a href={fullFileUrl} target="_blank" rel="noopener noreferrer" download>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Download Original</span>
            </Button>
          </a>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 min-h-[320px] flex items-center justify-center overflow-hidden">
            {isImage ? (
              <img
                src={fullFileUrl}
                alt={document.name}
                className="max-h-[500px] w-auto rounded-lg object-contain shadow-md mx-auto"
              />
            ) : isPdf ? (
              <div className="w-full h-[550px] flex flex-col">
                <iframe
                  src={fullFileUrl}
                  title={document.name}
                  className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                />
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {document.fileName}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Binary statutory document ({document.mimeType}). Click download below to view this document.
                </p>
                <a href={fullFileUrl} target="_blank" rel="noopener noreferrer" download>
                  <Button size="sm" variant="outline" className="text-xs mt-2">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    <span>Download {formatFileSize(document.fileSize)}</span>
                  </Button>
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Lifecycle & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Status Transitions */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verification Status Workflow</span>
            </CardTitle>
            <CardDescription>
              Transition document state: Uploaded &rarr; Under Verification &rarr; Verified
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Status:</span>
              <StatusBadge status={document.verificationStatus} className="text-xs px-2.5 py-0.5" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                size="sm"
                variant={document.verificationStatus === 'Uploaded' ? 'primary' : 'outline'}
                disabled={updateStatusMutation.isPending || document.verificationStatus === 'Uploaded'}
                onClick={() => updateStatusMutation.mutate('Uploaded')}
                className="text-xs flex-1"
              >
                Uploaded
              </Button>

              <Button
                size="sm"
                variant={document.verificationStatus === 'Under Verification' ? 'primary' : 'outline'}
                disabled={
                  updateStatusMutation.isPending ||
                  document.verificationStatus === 'Under Verification'
                }
                onClick={() => updateStatusMutation.mutate('Under Verification')}
                className="text-xs flex-1"
              >
                Under Verification
              </Button>

              <Button
                size="sm"
                variant={document.verificationStatus === 'Verified' ? 'primary' : 'outline'}
                disabled={updateStatusMutation.isPending || document.verificationStatus === 'Verified'}
                onClick={() => updateStatusMutation.mutate('Verified')}
                className="text-xs flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Verify Document
              </Button>
            </div>

            {document.remarks && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                <strong className="block text-[11px] text-slate-400 mb-0.5">Remarks / Annotations:</strong>
                {document.remarks}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Timeline */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              <span>Document Version & Audit Timeline</span>
            </CardTitle>
            <CardDescription>Immutable record of ingestion, updates, and reviews</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-200 dark:before:bg-orange-950 text-xs">
              {/* Event 1: Uploaded */}
              <div className="relative space-y-0.5">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                <span className="font-bold text-slate-900 dark:text-white block">
                  Document Ingested (Version {document.version}.0)
                </span>
                <span className="text-[11px] text-slate-500">
                  Uploaded by {uploaderName} &bull; {formatFileSize(document.fileSize)}
                </span>
                <span className="text-[10px] text-slate-400 block">{formatDateTime(document.uploadedAt)}</span>
              </div>

              {/* Event 2: Status check */}
              <div className="relative space-y-0.5">
                <div
                  className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                    document.verificationStatus === 'Verified'
                      ? 'bg-emerald-500'
                      : document.verificationStatus === 'Under Verification'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="font-bold text-slate-900 dark:text-white block">
                  State: {document.verificationStatus}
                </span>
                <span className="text-[11px] text-slate-500">
                  Document status is currently {document.status}
                </span>
                <span className="text-[10px] text-slate-400 block">{formatDateTime(document.updatedAt)}</span>
              </div>

              {/* Event 3: Expiry tracker */}
              {document.expiryDate && (
                <div className="relative space-y-0.5">
                  <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900" />
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Statutory Validity Expiry
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mandatory renewal due by {formatDate(document.expiryDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this document from the vault?')) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>Delete Document</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentDetails;
