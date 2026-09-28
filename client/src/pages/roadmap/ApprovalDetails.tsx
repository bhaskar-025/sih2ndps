import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapService } from '../../services/roadmapService';
import { projectService } from '../../services/projectService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';
import { ProjectApprovalItem, ProjectApprovalStatus } from '../../types/roadmap.types';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Link as LinkIcon,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface ApprovalDetailsProps {
  approvalItem?: ProjectApprovalItem;
  projectId?: string;
  onClose?: () => void;
  onStatusChange?: (approvalId: string, status: ProjectApprovalStatus) => void;
}

export const ApprovalDetails: React.FC<ApprovalDetailsProps> = ({
  approvalItem: propApproval,
  projectId: propProjectId,
  onClose,
  onStatusChange,
}) => {
  const { id: paramProjectId, approvalId: paramApprovalId } = useParams<{
    id?: string;
    approvalId?: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const projectId = propProjectId || paramProjectId;
  const approvalId = propApproval?._id || paramApprovalId;

  // Fetch roadmap data if not passed directly via props
  const { data: roadmap, isLoading: isRoadmapLoading } = useQuery({
    queryKey: ['roadmap', projectId],
    queryFn: () => roadmapService.getRoadmap(projectId!),
    enabled: !propApproval && !!projectId,
  });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProject(projectId!),
    enabled: !!projectId,
  });

  // Find the specific approval item
  const approval: ProjectApprovalItem | undefined =
    propApproval || roadmap?.approvals?.find((a) => a._id === approvalId);

  // Status mutation
  const [selectedStatus, setSelectedStatus] = useState<ProjectApprovalStatus>(
    approval?.status || 'Recommended'
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleUpdateStatus = async (newStatus: ProjectApprovalStatus) => {
    if (!approval) return;
    setIsUpdating(true);
    setFeedbackMsg(null);
    try {
      if (onStatusChange) {
        onStatusChange(approval._id, newStatus);
      } else {
        await roadmapService.updateApprovalStatus(approval._id, newStatus);
        queryClient.invalidateQueries({ queryKey: ['roadmap', projectId] });
      }
      setSelectedStatus(newStatus);
      setFeedbackMsg(`Approval status successfully updated to "${newStatus}"`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isRoadmapLoading && !approval) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <ErrorState
          message="Approval record not found or has not been generated yet for this project."
          onRetry={() => {
            if (projectId) navigate(`/projects/${projectId}/roadmap`);
          }}
        />
        <div className="mt-4 text-center">
          <Link to={projectId ? `/projects/${projectId}/roadmap` : '/projects'}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to Approval Roadmap</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const priorityColor =
    approval.priority === 'Critical'
      ? 'destructive'
      : approval.priority === 'High'
      ? 'saffron'
      : approval.priority === 'Medium'
      ? 'warning'
      : 'secondary';

  const validStatuses: ProjectApprovalStatus[] = [
    'Recommended',
    'Pending',
    'Documents Missing',
    'Ready to Apply',
    'Applied',
    'Under Review',
    'Inspection Pending',
    'Approved',
    'Rejected',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back / Navigation Bar */}
      <div className="flex items-center justify-between">
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Close Details</span>
          </Button>
        ) : (
          <Link
            to={`/projects/${projectId}/roadmap`}
            className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Full Project Roadmap</span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          <Badge variant={priorityColor} className="text-xs uppercase font-bold tracking-wider">
            {approval.priority} Priority
          </Badge>
          <StatusBadge status={approval.status} className="text-xs" />
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>{approval.department}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {approval.approvalName}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Estimated SLA: <strong>{approval.estimatedDays} Working Days</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Site Inspection:{' '}
                <strong>{approval.inspectionRequired ? 'Mandatory Field Audit' : 'Self-Certification / Desk Review'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>
                Engine Engine Rule: <strong>{approval.generatedBy || 'RuleEngine'}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rationale & Rule Trigger Details */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-orange-600" />
            <span>Statutory Rationale & Applicability Trigger</span>
          </CardTitle>
          <CardDescription>
            Why this statutory clearance is legally triggered for your industrial project
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="p-4 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
            <p className="font-semibold text-orange-900 dark:text-orange-300 text-xs mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rule Engine Statutory Determination:</span>
            </p>
            {approval.reason}
          </div>

          {project && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Project Category</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{project.pollutionCategory}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Total Investment</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{project.investment} Lakhs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Employees Planned</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{project.employees} Personnel</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Water Load</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{project.waterRequirement} KLD</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Required Documents Checklist */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Required Verification Documents ({approval.requiredDocuments?.length || 0})</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">Must be uploaded prior to submission</span>
          </CardTitle>
          <CardDescription>
            Documents mandated by {approval.department} for scrutiny and verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-2.5">
          {approval.requiredDocuments && approval.requiredDocuments.length > 0 ? (
            approval.requiredDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {doc}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Standard format &bull; PDF / CAD drawings under 10MB
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-slate-400">
                  Required
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">No mandatory documents specified.</p>
          )}
        </CardContent>
      </Card>

      {/* Dependencies & Prerequisites */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-blue-600" />
            <span>Statutory Sequence & Dependencies</span>
          </CardTitle>
          <CardDescription>
            Pre-requisite approvals that must be obtained before applying for this clearance
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {approval.dependencies && approval.dependencies.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You must possess the following clearances prior to final issuance:
              </p>
              <div className="flex flex-wrap gap-2">
                {approval.dependencies.map((dep, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-semibold text-blue-900 dark:text-blue-200"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>{dep}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>No Prerequisites:</strong> This approval can be initiated immediately in Phase 1 (parallel execution).
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Management Bar */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Update Approval Status & Lifecycle Stage</span>
          </CardTitle>
          <CardDescription>
            Transition this clearance through the statutory single-window workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-500">Current Status:</span>
              <div>
                <StatusBadge status={approval.status} className="text-sm px-3 py-1" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {validStatuses.map((st) => (
                <Button
                  key={st}
                  variant={st === approval.status ? 'primary' : 'outline'}
                  size="sm"
                  disabled={isUpdating || st === approval.status}
                  onClick={() => handleUpdateStatus(st)}
                  className="text-xs"
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prototype Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold">Statutory Advisory Note</strong>
          This recommendation is generated using configurable business rules. Final applicability should be verified by the competent authority.
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetails;
