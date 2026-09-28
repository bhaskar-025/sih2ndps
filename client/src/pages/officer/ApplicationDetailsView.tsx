import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../../services/applicationService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';
import { ApplicationItem, ApplicationStatus, RiskLevel } from '../../types/officer.types';
import { formatCurrency, formatDate, formatDateTime, formatFileSize } from '../../utils/formatters';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  History,
  Layers,
  MapPin,
  MessageSquare,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';

interface ApplicationDetailsViewProps {
  applicationId: string;
  onClose?: () => void;
  onUpdateSuccess?: () => void;
}

export const ApplicationDetailsView: React.FC<ApplicationDetailsViewProps> = ({
  applicationId,
  onClose,
  onUpdateSuccess,
}) => {
  const queryClient = useQueryClient();

  const {
    data: application,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['application-details', applicationId],
    queryFn: () => applicationService.getApplicationById(applicationId),
    enabled: !!applicationId,
  });

  // Action form states
  const [activeActionModal, setActiveActionModal] = useState<
    'approve' | 'reject' | 'query' | 'inspection' | 'remarks' | null
  >(null);

  const [remarksText, setRemarksText] = useState('');
  const [queryText, setQueryText] = useState('');
  const [replyQueryId, setReplyQueryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionRemarks, setInspectionRemarks] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, remarks }: { status: ApplicationStatus; remarks?: string }) =>
      applicationService.updateStatus(applicationId, { status, remarks }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['application-details', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-analytics'] });
      setActiveActionModal(null);
      setRemarksText('');
      setFeedback(`Status transitioned to "${updated.status}"`);
      setTimeout(() => setFeedback(null), 3000);
      if (onUpdateSuccess) onUpdateSuccess();
    },
  });

  const queryMutation = useMutation({
    mutationFn: (data: { queryText?: string; queryId?: string; response?: string }) =>
      applicationService.raiseOrReplyQuery(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-details', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-analytics'] });
      setActiveActionModal(null);
      setQueryText('');
      setReplyQueryId(null);
      setReplyText('');
      setFeedback('Query operation recorded successfully.');
      setTimeout(() => setFeedback(null), 3000);
      if (onUpdateSuccess) onUpdateSuccess();
    },
  });

  const inspectionMutation = useMutation({
    mutationFn: (data: { inspectionDate: string; remarks?: string }) =>
      applicationService.scheduleInspection(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-details', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-analytics'] });
      setActiveActionModal(null);
      setInspectionDate('');
      setInspectionRemarks('');
      setFeedback('Field inspection scheduled and logged in compliance calendar.');
      setTimeout(() => setFeedback(null), 3000);
      if (onUpdateSuccess) onUpdateSuccess();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <ErrorState
          message={(error as Error)?.message || 'Failed to load application dossier'}
          onRetry={() => refetch()}
        />
        {onClose && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    );
  }

  const project = application.projectId;
  const applicant = project?.owner;
  const approval = application.approvalId;
  const slaRemaining = application.slaRemaining ?? 20;
  const isOverdue = application.isOverdue || slaRemaining <= 0;

  const slaBadgeColor = isOverdue
    ? 'destructive'
    : slaRemaining <= 5
    ? 'warning'
    : 'success';

  const riskBadgeColor =
    application.riskScore === 'High'
      ? 'destructive'
      : application.riskScore === 'Medium'
      ? 'warning'
      : 'success';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Action & Navigation */}
      <div className="flex items-center justify-between">
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Close Dossier</span>
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <Badge variant={riskBadgeColor} className="text-xs uppercase font-bold">
            Risk: {application.riskScore || 'Low'}
          </Badge>
          <Badge variant={slaBadgeColor} className="text-xs font-mono font-bold">
            {isOverdue ? '⚠ Overdue' : `SLA: ${slaRemaining} Days Left`}
          </Badge>
          <StatusBadge status={application.status} className="text-xs" />
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="saffron">{application.department}</Badge>
              <span className="font-mono text-xs text-orange-400 font-bold">
                {application.applicationNumber}
              </span>
              <span className="text-slate-400 text-xs">&bull;</span>
              <span className="text-xs text-slate-300">Stage: {application.currentStage}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {application.serviceName || 'Statutory Clearance NOC'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span>{project?.projectName}</span>
              <span className="text-slate-500">&bull;</span>
              <span>{project?.companyName}</span>
              <span className="text-slate-500">&bull;</span>
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>{project?.district}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="text-xs text-slate-400">
              Submitted: {formatDate(application.submittedAt)}
            </span>
            <span className="text-[11px] text-slate-400">
              Assigned Officer: <strong>{application.assignedOfficer?.name || 'Unassigned'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Officer Decision & Workflow Action Bar */}
      <Card className="border-2 border-orange-500/30 bg-gradient-to-r from-orange-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-navy-950 dark:to-slate-900 shadow-md">
        <div className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Official Decision Workflow Actions</span>
            </span>
            <p className="text-[11px] text-slate-500">
              Statutory verification actions logged directly in immutable audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Action 1: Under Scrutiny */}
            {application.status === 'Submitted' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateStatusMutation.mutate({
                    status: 'Under Scrutiny',
                    remarks: 'Application docket moved to technical officer scrutiny',
                  })
                }
                disabled={updateStatusMutation.isPending}
                className="text-xs"
              >
                Mark Under Scrutiny
              </Button>
            )}

            {/* Action 2: Raise Query */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveActionModal('query')}
              className="text-xs border-amber-300 text-amber-800 dark:text-amber-300 dark:border-amber-800"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1 text-amber-600" />
              <span>Raise Query ({application.queries?.length || 0})</span>
            </Button>

            {/* Action 3: Schedule Inspection */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveActionModal('inspection')}
              className="text-xs border-blue-300 text-blue-800 dark:text-blue-300 dark:border-blue-800"
            >
              <CalendarCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
              <span>Schedule Inspection</span>
            </Button>

            {/* Action 4: Approve */}
            <Button
              size="sm"
              onClick={() => setActiveActionModal('approve')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Issue Approval NOC</span>
            </Button>

            {/* Action 5: Reject */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveActionModal('reject')}
              className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              <span>Reject Application</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Visual Workflow Timeline: Submitted -> Document Review -> Query Raised -> Applicant Response -> Inspection -> Approval */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <span>Statutory Lifecycle Progression</span>
          </CardTitle>
          <CardDescription>Visual state progress through the single window clearance stages</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center text-xs">
            {/* Stage 1 */}
            <div className="flex-1 p-2.5 rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                1. Submitted
              </span>
              <span className="text-[10px] text-slate-500">{formatDate(application.submittedAt)}</span>
            </div>

            <div className="text-slate-400 font-bold hidden sm:block">&rarr;</div>

            {/* Stage 2 */}
            <div
              className={`flex-1 p-2.5 rounded-xl border space-y-1 ${
                application.status !== 'Draft'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="font-bold block">2. Document Review</span>
              <span className="text-[10px] text-slate-500">Technical Scrutiny</span>
            </div>

            <div className="text-slate-400 font-bold hidden sm:block">&rarr;</div>

            {/* Stage 3 */}
            <div
              className={`flex-1 p-2.5 rounded-xl border space-y-1 ${
                application.queries?.length > 0
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="font-bold block">3. Query Cycle</span>
              <span className="text-[10px] text-slate-500">
                {application.queries?.length || 0} Queries Logged
              </span>
            </div>

            <div className="text-slate-400 font-bold hidden sm:block">&rarr;</div>

            {/* Stage 4 */}
            <div
              className={`flex-1 p-2.5 rounded-xl border space-y-1 ${
                application.inspectionDate
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="font-bold block">4. Field Inspection</span>
              <span className="text-[10px] text-slate-500">
                {application.inspectionDate ? formatDate(application.inspectionDate) : 'Not Scheduled'}
              </span>
            </div>

            <div className="text-slate-400 font-bold hidden sm:block">&rarr;</div>

            {/* Stage 5 */}
            <div
              className={`flex-1 p-2.5 rounded-xl border space-y-1 ${
                application.status === 'Approved'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                  : application.status === 'Rejected'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="font-bold block">5. Final Determination</span>
              <span className="text-[10px] text-slate-500">{application.status}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Applicant & Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applicant Details */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Applicant Legal Entity Details</span>
            </CardTitle>
            <CardDescription>Entrepreneur credentials and contact information</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Authorized Signatory</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {applicant?.name || 'Authorized Signatory'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Corporate Entity</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {applicant?.organization || project?.companyName}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Contact Email</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {applicant?.email || 'officer-contact@maitri.gov.in'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Phone Number</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {applicant?.phone || '+91 98200 12345'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industrial Project Specifications */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              <span>Industrial Unit Engineering Profile</span>
            </CardTitle>
            <CardDescription>Facility parameters from registered dossier</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Total Investment</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {formatCurrency(project?.investment || 0)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Pollution Category</span>
                <Badge
                  variant={project?.pollutionCategory === 'Red' ? 'destructive' : 'secondary'}
                  className="text-[10px] mt-0.5"
                >
                  {project?.pollutionCategory || 'Orange'} Category
                </Badge>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Workforce Size</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {project?.employees || 0} Employees
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Location & Taluka</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {project?.location}, {project?.district}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Documents Vault */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Project Verification Documents Vault ({application.documents?.length || 0})</span>
            </CardTitle>
            <CardDescription>
              Cross-referenced statutory artifacts submitted by applicant
            </CardDescription>
          </div>
          <span className="text-xs text-slate-400">Zero duplicate uploads</span>
        </CardHeader>
        <CardContent className="pt-4 space-y-2.5">
          {application.documents && application.documents.length > 0 ? (
            application.documents.map((doc: any) => {
              const fullFileUrl = doc.fileUrl.startsWith('http')
                ? doc.fileUrl
                : `http://localhost:5000${doc.fileUrl}`;

              return (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-orange-300 transition-colors text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {doc.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {doc.documentType} &bull; {formatFileSize(doc.fileSize)} &bull; Uploaded on{' '}
                      {formatDate(doc.uploadedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.verificationStatus} className="text-[10px]" />
                    <a href={fullFileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                        <Download className="w-3.5 h-3.5 mr-1" />
                        <span>View</span>
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              No verification documents currently attached to this project dossier.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Query Management Thread */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Query Management & Conversation History ({application.queries?.length || 0})</span>
            </CardTitle>
            <CardDescription>
              Statutory inquiries, clarifications, and applicant responses
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={() => setActiveActionModal('query')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            <span>Raise New Query</span>
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {application.queries && application.queries.length > 0 ? (
            application.queries.map((q: any) => (
              <div
                key={q._id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs"
              >
                {/* Officer Query */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        Officer Inquiry
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(q.raisedAt)}
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                      {q.queryText}
                    </p>
                  </div>

                  <Badge variant={q.status === 'Resolved' ? 'success' : 'warning'} className="text-[10px]">
                    {q.status}
                  </Badge>
                </div>

                {/* Response */}
                {q.response ? (
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-800 dark:text-slate-200 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Applicant Clarification Submitted ({formatDateTime(q.respondedAt)})</span>
                    </div>
                    <p className="leading-relaxed">{q.response}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-amber-600 font-medium">
                      Awaiting response from applicant...
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyQueryId(q._id);
                        setActiveActionModal('query');
                      }}
                      className="text-[11px] h-7 px-2"
                    >
                      Record Response
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">
              No queries raised yet for this application dossier.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Audit History Log */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            <span>Immutable Audit Trail ({application.history?.length || 0} Events)</span>
          </CardTitle>
          <CardDescription>Chronological event log conforming to government oversight guidelines</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-200 dark:before:bg-orange-950 text-xs">
            {application.history?.map((h: any, idx: number) => (
              <div key={idx} className="relative space-y-0.5">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-orange-500 ring-4 ring-white dark:ring-slate-900" />
                <span className="font-bold text-slate-900 dark:text-white block">{h.action}</span>
                <span className="text-[11px] text-slate-500">
                  {h.remarks || 'Action logged by officer'}
                </span>
                <span className="text-[10px] text-slate-400 block">{formatDateTime(h.timestamp)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal 1: Approve Application */}
      {activeActionModal === 'approve' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Issue Statutory Approval NOC</span>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveActionModal(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Confirm that all required documents, environmental parameters, and statutory checklists for{' '}
              <strong>{project?.projectName}</strong> have been fully verified.
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Approval Endorsement & Conditions:
              </label>
              <textarea
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                rows={3}
                placeholder="e.g. Valid for 5 years subject to annual environmental audit submission."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveActionModal(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  updateStatusMutation.mutate({
                    status: 'Approved',
                    remarks: remarksText || 'Application approved by scrutinizing officer',
                  })
                }
                disabled={updateStatusMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
              >
                Confirm Approval
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Reject Application */}
      {activeActionModal === 'reject' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span>Reject Application</span>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveActionModal(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Specify the legal or technical statutory non-compliance reason for rejecting this clearance.
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Reason for Rejection <span className="text-red-500">*</span>:
              </label>
              <textarea
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                rows={3}
                required
                placeholder="e.g. Setback distance violates Maharashtra Fire Safety Regulations 2023 Section 14."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveActionModal(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  updateStatusMutation.mutate({
                    status: 'Rejected',
                    remarks: remarksText || 'Application rejected due to statutory non-compliance',
                  })
                }
                disabled={updateStatusMutation.isPending || !remarksText.trim()}
                className="bg-red-600 hover:bg-red-700 text-white text-xs"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Raise / Reply Query */}
      {activeActionModal === 'query' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <span>{replyQueryId ? 'Record Applicant Reply' : 'Raise Statutory Query'}</span>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveActionModal(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {replyQueryId ? (
              <div className="space-y-3 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Applicant Response Clarification:
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Enter response or upload confirmation details..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveActionModal(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      queryMutation.mutate({ queryId: replyQueryId, response: replyText })
                    }
                    disabled={queryMutation.isPending || !replyText.trim()}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    Submit Response
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Official Technical Query <span className="text-red-500">*</span>:
                </label>
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  rows={3}
                  placeholder="e.g. Please clarify effluent water treatment capacity and submit revised flow diagram."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveActionModal(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => queryMutation.mutate({ queryText })}
                    disabled={queryMutation.isPending || !queryText.trim()}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    Send Query
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 4: Schedule Inspection */}
      {activeActionModal === 'inspection' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                <span>Schedule Field Inspection</span>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveActionModal(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Inspection Target Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Inspection Team Instructions & Scope
                </label>
                <textarea
                  value={inspectionRemarks}
                  onChange={(e) => setInspectionRemarks(e.target.value)}
                  rows={3}
                  placeholder="e.g. Joint site audit with MPCB Sub-Regional Officer and DISH Industrial Safety Inspector."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveActionModal(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    inspectionMutation.mutate({
                      inspectionDate,
                      remarks: inspectionRemarks,
                    })
                  }
                  disabled={inspectionMutation.isPending || !inspectionDate}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  Confirm Inspection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailsView;
