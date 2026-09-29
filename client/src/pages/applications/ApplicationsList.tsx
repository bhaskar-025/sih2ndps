import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../../services/applicationService';
import { officerService } from '../../services/officerService';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { EmptyState, ErrorState } from '../../components/EmptyState';
import { formatDate } from '../../utils/formatters';
import { ApplicationItem, ApplicationStatus } from '../../types/officer.types';
import { ApplicationDetailsView } from '../officer/ApplicationDetailsView';
import { AICopilotDrawer } from '../../components/AICopilotDrawer';
import {
  RiskBadge,
  PriorityBadge,
} from '../../components/officer/OfficerComponents';
import {
  FileText,
  Search,
  ArrowRight,
  Clock,
  CheckCircle,
  CheckCircle2,
  ExternalLink,
  Building2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Eye,
  Filter,
  Layers,
  Sparkles,
  CalendarCheck,
  Forward,
  UserPlus,
  Undo2,
  XCircle,
  FileSpreadsheet,
  Download,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const PIPELINE_STAGES: { id: string; label: string; countKey?: string }[] = [
  { id: 'ALL', label: 'All Pipelines' },
  { id: 'Submitted', label: '1. Submitted' },
  { id: 'Under Scrutiny', label: '2. Under Scrutiny' },
  { id: 'Document Verification', label: '3. Doc Verification' },
  { id: 'Inspection', label: '4. Inspection' },
  { id: 'Committee', label: '5. Committee' },
  { id: 'Approved', label: '6. Approved' },
  { id: 'Rejected', label: '7. Rejected' },
  { id: 'Returned', label: '8. Returned' },
];

export const ApplicationsList: React.FC = () => {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeStage, setActiveStage] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected app for detailed scrutiny workspace
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Copilot state
  const [copilotAppId, setCopilotAppId] = useState<string | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Quick Action Modal states
  const [activeQuickAction, setActiveQuickAction] = useState<{
    type: 'query' | 'forward' | 'assign' | 'noc' | 'reject' | 'escalate';
    app: ApplicationItem;
  } | null>(null);
  const [quickInputText, setQuickInputText] = useState('');
  const [quickTargetDept, setQuickTargetDept] = useState('');
  const [quickOfficerId, setQuickOfficerId] = useState('');

  // Fetch all applications dynamically
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['applications-pipeline'],
    queryFn: () => applicationService.getApplications({ limit: 100 }),
    staleTime: 1000 * 30,
  });

  const applications: ApplicationItem[] = responseData?.data || [];

  // Fetch officers for assignment
  const { data: officers = [] } = useQuery({
    queryKey: ['officers-list'],
    queryFn: () => officerService.getOfficersList(),
  });

  // Fetch departments for forwarding
  const { data: departments = [] } = useQuery({
    queryKey: ['department-registry'],
    queryFn: () => officerService.getDepartmentRegistry(),
  });

  // Dynamic pipeline stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: applications.length };
    PIPELINE_STAGES.forEach((stage) => {
      if (stage.id !== 'ALL') counts[stage.id] = 0;
    });

    applications.forEach((app) => {
      const s = app.status;
      if (s === 'Inspection Scheduled' || s === 'Inspection Completed') {
        counts['Inspection'] = (counts['Inspection'] || 0) + 1;
      } else if (counts[s] !== undefined) {
        counts[s]++;
      } else {
        counts['Under Scrutiny'] = (counts['Under Scrutiny'] || 0) + 1;
      }
    });

    return counts;
  }, [applications]);

  // Filtered applications list
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Pipeline stage filter
      if (activeStage !== 'ALL') {
        if (activeStage === 'Inspection') {
          if (
            app.status !== 'Inspection' &&
            app.status !== 'Inspection Scheduled' &&
            app.status !== 'Inspection Completed'
          )
            return false;
        } else if (app.status !== activeStage) {
          return false;
        }
      }

      // Department filter
      if (filterDepartment !== 'ALL' && app.department !== filterDepartment) {
        return false;
      }

      // Priority filter
      if (filterPriority !== 'ALL' && app.priority !== filterPriority) {
        return false;
      }

      // Risk filter
      if (filterRisk !== 'ALL' && (app.riskScore || 'Low') !== filterRisk) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const num = (app.applicationNumber || '').toLowerCase();
        const proj = (app.projectId?.projectName || '').toLowerCase();
        const srv = (app.serviceName || app.approvalId?.approvalName || '').toLowerCase();
        const dept = (app.department || '').toLowerCase();
        if (!num.includes(q) && !proj.includes(q) && !srv.includes(q) && !dept.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [applications, activeStage, filterDepartment, filterPriority, filterRisk, searchQuery]);

  // Dynamic department list from active data
  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    applications.forEach((a) => {
      if (a.department) depts.add(a.department);
    });
    return Array.from(depts);
  }, [applications]);

  // Mutations for Quick Actions
  const assignMutation = useMutation({
    mutationFn: ({ appId, officerId }: { appId: string; officerId: string }) =>
      officerService.assignOfficer(appId, officerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard-analytics'] });
      setActiveQuickAction(null);
      setQuickOfficerId('');
      toastSuccess('Application assigned to officer successfully.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to assign officer');
    },
  });

  const forwardMutation = useMutation({
    mutationFn: ({ appId, dept, remarks }: { appId: string; dept: string; remarks?: string }) =>
      officerService.forwardDepartment(appId, dept, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard-analytics'] });
      setActiveQuickAction(null);
      setQuickTargetDept('');
      setQuickInputText('');
      toastSuccess('Application forwarded to designated department.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to forward application');
    },
  });

  const queryMutation = useMutation({
    mutationFn: ({ appId, text }: { appId: string; text: string }) =>
      applicationService.raiseOrReplyQuery(appId, { queryText: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard-analytics'] });
      setActiveQuickAction(null);
      setQuickInputText('');
      toastSuccess('Clarification query sent to applicant.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to raise query');
    },
  });

  const nocMutation = useMutation({
    mutationFn: ({ appId, remarks }: { appId: string; remarks?: string }) =>
      officerService.generateNoc(appId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard-analytics'] });
      setActiveQuickAction(null);
      setQuickInputText('');
      toastSuccess('Clearance NOC successfully issued!');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to issue NOC');
    },
  });

  const escalateMutation = useMutation({
    mutationFn: ({ appId, reason }: { appId: string; reason: string }) =>
      officerService.forwardDepartment(appId, 'Apex Committee', reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard-analytics'] });
      setActiveQuickAction(null);
      setQuickInputText('');
      toastSuccess('Application escalated to regulatory review committee.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to escalate application');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ appId, remarks }: { appId: string; remarks: string }) =>
      applicationService.updateStatus(appId, { status: 'Rejected', remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard-analytics'] });
      setActiveQuickAction(null);
      setQuickInputText('');
      toastSuccess('Application docket formally rejected with grounds.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to reject application');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
        <Skeleton className="h-10 w-96 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <ErrorState
          message={(error as Error)?.message || 'Failed to load statutory clearance pipeline.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="saffron" className="text-xs uppercase font-bold tracking-wider">
              Statutory Single Window
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Live Applications: {applications.length}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Industrial Approval Clearance Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Multi-stage statutory clearance lifecycle, SLA tracking, inter-departmental routing, and AI assistance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs border-slate-300 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Sync Pipeline</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => officerService.exportData('applications', 'csv')}
            className="text-xs text-emerald-700 border-emerald-300 dark:border-emerald-800 dark:text-emerald-400"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setCopilotAppId(null);
              setIsCopilotOpen(true);
            }}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-semibold shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-yellow-200" />
            <span>AI Copilot</span>
          </Button>
        </div>
      </div>

      {/* 8-Stage Workflow Timeline Navigation Tabs (Requirement #4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        {PIPELINE_STAGES.map((st) => {
          const isActive = activeStage === st.id;
          const count = stageCounts[st.id] ?? 0;

          return (
            <button
              key={st.id}
              onClick={() => setActiveStage(st.id)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-500/20'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700'
              }`}
            >
              <span
                className={`text-[11px] font-semibold block truncate ${
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {st.label}
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono">{count}</span>
                {isActive && <div className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tracking ID, unit, clearance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
          >
            <option value="ALL">All Departments ({availableDepartments.length})</option>
            {availableDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept.split(' ')[0]} ({dept})
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
          </select>
        </div>

        {/* Risk Score Filter */}
        <div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Main Clearance Pipeline Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 backdrop-blur-md bg-slate-50/95 dark:bg-slate-800/95 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Tracking ID & Date</th>
                <th className="py-3.5 px-4">Industrial Unit</th>
                <th className="py-3.5 px-4">Clearance & Agency</th>
                <th className="py-3.5 px-4">Assigned Officer</th>
                <th className="py-3.5 px-4">Priority & Risk</th>
                <th className="py-3.5 px-4">Pipeline Stage</th>
                <th className="py-3.5 px-4">SLA Countdown</th>
                <th className="py-3.5 px-4 text-right">Regulatory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => {
                  const slaRemaining = app.slaRemaining ?? app.slaDays ?? 15;
                  const isOverdue = app.isOverdue || slaRemaining <= 0;

                  return (
                    <tr
                      key={app._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Tracking ID */}
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          onClick={() => setSelectedAppId(app._id)}
                          className="font-bold text-orange-600 dark:text-orange-400 block hover:underline cursor-pointer"
                        >
                          {app.applicationNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(app.submittedAt || app.createdAt)}
                        </span>
                      </td>

                      {/* Industrial Unit */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-[200px]">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">
                            {app.projectId?.projectName || 'Industrial Project'}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {app.projectId?.district ? `${app.projectId.district} • ` : ''}
                            {app.projectId?.industry || 'Unit'}
                          </span>
                        </div>
                      </td>

                      {/* Clearance & Department */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-[220px]">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                            {app.serviceName || app.approvalId?.approvalName || 'Statutory Clearance'}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {app.department}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Officer */}
                      <td className="py-3.5 px-4">
                        {app.assignedOfficer?.name ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[140px]">
                              {app.assignedOfficer.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                              {app.assignedOfficer.email}
                            </span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveQuickAction({ type: 'assign', app })}
                            className="text-[10px] h-6 px-2 text-indigo-600 border-indigo-200 dark:border-indigo-800"
                          >
                            <UserPlus className="w-2.5 h-2.5 mr-1" />
                            <span>Assign</span>
                          </Button>
                        )}
                      </td>

                      {/* Priority & Risk */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <PriorityBadge priority={app.priority || 'Normal'} />
                          <RiskBadge risk={app.riskScore || 'Low'} />
                          {app.escalated && (
                            <Badge variant="destructive" className="text-[9px] animate-pulse">
                              ESCALATED
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} />
                      </td>

                      {/* SLA Countdown */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Clock
                            className={`w-3.5 h-3.5 ${
                              isOverdue
                                ? 'text-red-500'
                                : slaRemaining <= 5
                                ? 'text-amber-500'
                                : 'text-emerald-500'
                            }`}
                          />
                          <span
                            className={`font-mono font-bold ${
                              isOverdue
                                ? 'text-red-600 dark:text-red-400'
                                : slaRemaining <= 5
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isOverdue ? 'EXPIRED' : `${slaRemaining}d left`}
                          </span>
                        </div>
                      </td>

                      {/* Regulatory Action Buttons (Requirement #4) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {/* Review */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAppId(app._id)}
                            className="text-xs h-7 px-2"
                            title="Open Dossier Scrutiny Workspace"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            <span>Review</span>
                          </Button>

                          {/* Raise Query */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveQuickAction({ type: 'query', app })}
                            className="text-xs h-7 px-2 border-amber-300 text-amber-800 dark:text-amber-300 dark:border-amber-800"
                            title="Raise Query to Applicant"
                          >
                            Query
                          </Button>

                          {/* Forward */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveQuickAction({ type: 'forward', app })}
                            className="text-xs h-7 px-2"
                            title="Forward Department"
                          >
                            <Forward className="w-3 h-3" />
                          </Button>

                          {/* Generate NOC */}
                          <Button
                            size="sm"
                            onClick={() => setActiveQuickAction({ type: 'noc', app })}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2 shadow-sm"
                            title="Issue Statutory Approval NOC"
                          >
                            NOC
                          </Button>

                          {/* Escalate */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveQuickAction({ type: 'escalate', app })}
                            className="text-xs h-7 px-2 border-red-200 text-red-600 dark:border-red-900"
                            title="Escalate to Committee"
                          >
                            <Flame className="w-3 h-3" />
                          </Button>

                          {/* Reject */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveQuickAction({ type: 'reject', app })}
                            className="text-xs h-7 px-2 border-slate-300 text-red-500"
                            title="Reject Application Docket"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>

                          {/* AI Copilot */}
                          <Button
                            size="sm"
                            onClick={() => {
                              setCopilotAppId(app._id);
                              setIsCopilotOpen(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-2"
                            title="AI Copilot Assistance"
                          >
                            <Sparkles className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <EmptyState
                      title="No applications in this clearance stage"
                      description="Select another pipeline tab or clear filters to view files."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Deep Dossier Workspace */}
      {selectedAppId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 relative">
            <ApplicationDetailsView
              applicationId={selectedAppId}
              onClose={() => setSelectedAppId(null)}
              onUpdateSuccess={() => {
                refetch();
                queryClient.invalidateQueries({ queryKey: ['applications-pipeline'] });
              }}
            />
          </div>
        </div>
      )}

      {/* Quick Action Modal */}
      {activeQuickAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white capitalize">
                {activeQuickAction.type === 'query' && 'Raise Official Technical Query'}
                {activeQuickAction.type === 'forward' && 'Forward Application to Agency'}
                {activeQuickAction.type === 'assign' && 'Assign Technical Scrutinizer'}
                {activeQuickAction.type === 'noc' && 'Generate Statutory Clearance NOC'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveQuickAction(null)}>
                &times;
              </Button>
            </div>

            <p className="text-xs text-slate-500">
              Application: <strong>{activeQuickAction.app.applicationNumber}</strong> (
              {activeQuickAction.app.projectId?.projectName})
            </p>

            {/* Quick Assign */}
            {activeQuickAction.type === 'assign' && (
              <div className="space-y-3 text-xs">
                <label className="font-semibold block text-slate-700 dark:text-slate-300">
                  Select Officer:
                </label>
                <select
                  value={quickOfficerId}
                  onChange={(e) => setQuickOfficerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="">-- Choose Officer --</option>
                  {officers.map((off: any) => (
                    <option key={off._id} value={off._id}>
                      {off.name} ({off.department || 'Officer'}) — {off.email}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveQuickAction(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      assignMutation.mutate({
                        appId: activeQuickAction.app._id,
                        officerId: quickOfficerId,
                      })
                    }
                    disabled={assignMutation.isPending || !quickOfficerId}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                  >
                    Confirm Assign
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Forward */}
            {activeQuickAction.type === 'forward' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                    Destination Agency:
                  </label>
                  <select
                    value={quickTargetDept}
                    onChange={(e) => setQuickTargetDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="">-- Choose Agency --</option>
                    {departments.map((d: any) => (
                      <option key={d._id} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                    Inter-Agency Routing Instructions:
                  </label>
                  <textarea
                    value={quickInputText}
                    onChange={(e) => setQuickInputText(e.target.value)}
                    rows={3}
                    placeholder="Enter statutory routing instructions..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveQuickAction(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      forwardMutation.mutate({
                        appId: activeQuickAction.app._id,
                        dept: quickTargetDept,
                        remarks: quickInputText,
                      })
                    }
                    disabled={forwardMutation.isPending || !quickTargetDept}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs"
                  >
                    Forward
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Query */}
            {activeQuickAction.type === 'query' && (
              <div className="space-y-3 text-xs">
                <label className="font-semibold block text-slate-700 dark:text-slate-300">
                  Official Technical Query:
                </label>
                <textarea
                  value={quickInputText}
                  onChange={(e) => setQuickInputText(e.target.value)}
                  rows={3}
                  placeholder="Enter clarification required from entrepreneur..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveQuickAction(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      queryMutation.mutate({
                        appId: activeQuickAction.app._id,
                        text: quickInputText,
                      })
                    }
                    disabled={queryMutation.isPending || !quickInputText.trim()}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    Dispatch Query
                  </Button>
                </div>
              </div>
            )}

            {/* Quick NOC */}
            {activeQuickAction.type === 'noc' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  Are you sure you want to approve this application and issue the official digital
                  clearance certificate?
                </p>
                <label className="font-semibold block text-slate-700 dark:text-slate-300">
                  Conditions of Approval:
                </label>
                <textarea
                  value={quickInputText}
                  onChange={(e) => setQuickInputText(e.target.value)}
                  rows={3}
                  placeholder="e.g. Valid for 5 years subject to half-yearly safety compliance report."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveQuickAction(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      nocMutation.mutate({
                        appId: activeQuickAction.app._id,
                        remarks: quickInputText,
                      })
                    }
                    disabled={nocMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Issue Clearance NOC
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Escalate */}
            {activeQuickAction.type === 'escalate' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  Escalate this application docket to the Apex Statutory Committee under the Maharashtra Public Services Guarantee Act.
                </p>
                <label className="font-semibold block text-slate-700 dark:text-slate-300">
                  Reason for Committee Escalation:
                </label>
                <textarea
                  value={quickInputText}
                  onChange={(e) => setQuickInputText(e.target.value)}
                  rows={3}
                  placeholder="e.g. Critical inter-departmental bottleneck or SLA breach risk."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveQuickAction(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      escalateMutation.mutate({
                        appId: activeQuickAction.app._id,
                        reason: quickInputText,
                      })
                    }
                    disabled={escalateMutation.isPending || !quickInputText.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                  >
                    Escalate Docket
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Reject */}
            {activeQuickAction.type === 'reject' && (
              <div className="space-y-3 text-xs">
                <p className="text-red-600 dark:text-red-400 font-semibold">
                  Warning: Formally rejecting this statutory filing requires explicit regulatory justification.
                </p>
                <label className="font-semibold block text-slate-700 dark:text-slate-300">
                  Statutory Grounds for Rejection:
                </label>
                <textarea
                  value={quickInputText}
                  onChange={(e) => setQuickInputText(e.target.value)}
                  rows={3}
                  placeholder="e.g. Non-compliance with environmental buffer zone or uncertified hazardous storage."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveQuickAction(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      rejectMutation.mutate({
                        appId: activeQuickAction.app._id,
                        remarks: quickInputText,
                      })
                    }
                    disabled={rejectMutation.isPending || !quickInputText.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        applicationId={copilotAppId || undefined}
      />
    </div>
  );
};

export default ApplicationsList;
