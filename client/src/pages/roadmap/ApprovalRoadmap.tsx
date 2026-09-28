import React, { useState, useEffect } from 'react';
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
import {
  ProjectApprovalItem,
  ProjectApprovalStatus,
  RoadmapData,
} from '../../types/roadmap.types';
import { ApprovalDetails } from './ApprovalDetails';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileDown,
  FileText,
  Filter,
  Info,
  Layers,
  Link as LinkIcon,
  ListFilter,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';

const GENERATION_STEPS = [
  'Analyzing Project Parameters & Land Dossier...',
  'Reading Industry & Sectoral Rules...',
  'Checking Infrastructure & Utility Capacities...',
  'Preparing Environmental & Safety Compliance Plan...',
  'Generating Statutory Dependency Graph...',
  'Complete.',
];

export const ApprovalRoadmap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Active view tab: 'cards' | 'graph' | 'timeline'
  const [activeTab, setActiveTab] = useState<'cards' | 'graph' | 'timeline'>('cards');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Expandable Approval item
  const [expandedApprovalId, setExpandedApprovalId] = useState<string | null>(null);
  const [detailModalApproval, setDetailModalApproval] = useState<ProjectApprovalItem | null>(null);

  // Multi-step Loading Animation State
  const [isGeneratingFlow, setIsGeneratingFlow] = useState(false);
  const [generationStepIndex, setGenerationStepIndex] = useState(0);

  // Fetch Project Data
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id!),
    enabled: !!id,
  });

  // Fetch Roadmap Data
  const {
    data: roadmap,
    isLoading: isRoadmapLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: () => roadmapService.getRoadmap(id!),
    enabled: !!id,
  });

  // Generate Roadmap Mutation
  const generateMutation = useMutation({
    mutationFn: () => roadmapService.generateRoadmap(id!),
    onSuccess: (data) => {
      queryClient.setQueryData(['roadmap', id], data);
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ approvalId, status }: { approvalId: string; status: ProjectApprovalStatus }) =>
      roadmapService.updateApprovalStatus(approvalId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', id] });
    },
  });

  // Trigger Multi-stage generation animation and API call
  const handleGenerateRoadmap = async () => {
    setIsGeneratingFlow(true);
    setGenerationStepIndex(0);

    // Progress through steps smoothly
    for (let i = 0; i < GENERATION_STEPS.length - 1; i++) {
      setGenerationStepIndex(i);
      await new Promise((res) => setTimeout(res, 600));
    }

    try {
      await generateMutation.mutateAsync();
      setGenerationStepIndex(GENERATION_STEPS.length - 1);
      await new Promise((res) => setTimeout(res, 400));
    } catch (err) {
      console.error('Error generating roadmap:', err);
    } finally {
      setIsGeneratingFlow(false);
    }
  };

  const handleStatusChange = (approvalId: string, newStatus: ProjectApprovalStatus) => {
    updateStatusMutation.mutate({ approvalId, status: newStatus });
  };

  const hasRoadmap = Boolean(roadmap && roadmap.generated && roadmap.approvals?.length > 0);

  // Filter approvals
  const filteredApprovals = (roadmap?.approvals || []).filter((item) => {
    const matchesSearch =
      item.approvalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || item.department === selectedDept;
    const matchesPriority = selectedPriority === 'ALL' || item.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesSearch && matchesDept && matchesPriority && matchesStatus;
  });

  // Collect unique departments for filter dropdown
  const uniqueDepartments = Array.from(
    new Set((roadmap?.approvals || []).map((a) => a.department))
  );

  // Compute Readiness Breakdown Score
  const readiness = roadmap?.readinessScore || 40;
  const approvedCount = (roadmap?.approvals || []).filter((a) => a.status === 'Approved').length;
  const appliedCount = (roadmap?.approvals || []).filter(
    (a) => a.status === 'Applied' || a.status === 'Under Review'
  ).length;

  if (isProjectLoading || (isRoadmapLoading && !isGeneratingFlow)) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-in fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <ErrorState
          message={(error as Error)?.message || 'Failed to retrieve approval roadmap'}
          onRetry={() => refetch()}
        />
        <div className="mt-4 text-center">
          <Link to={`/projects/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to Project Details</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to={`/projects/${id}`}
          className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Project: {project?.projectName || 'Project Dossier'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {hasRoadmap && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateRoadmap}
              disabled={isGeneratingFlow}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isGeneratingFlow ? 'animate-spin' : ''}`} />
              <span>Regenerate Roadmap</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => window.print()}
            variant="outline"
            className="text-xs hidden sm:flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roadmap</span>
          </Button>
        </div>
      </div>

      {/* Generation Loading Sequence Overlay / Card */}
      {isGeneratingFlow && (
        <Card className="p-8 border-2 border-orange-500/40 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/60 dark:from-slate-900 dark:via-navy-950 dark:to-slate-900 shadow-2xl relative overflow-hidden">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 animate-pulse ring-8 ring-orange-200/50 dark:ring-orange-900/30">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Approval Intelligence Engine Active
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Evaluating statutory rules across Maharashtra Government departments
              </p>
            </div>

            {/* Stepper progress */}
            <div className="space-y-2 text-left bg-white/70 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              {GENERATION_STEPS.map((step, idx) => {
                const isPassed = idx < generationStepIndex;
                const isCurrent = idx === generationStepIndex;

                return (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-orange-600 border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex-shrink-0" />
                    )}
                    <span
                      className={`${
                        isCurrent
                          ? 'font-bold text-orange-600 dark:text-orange-400'
                          : isPassed
                          ? 'text-slate-700 dark:text-slate-300 line-through'
                          : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-orange-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${((generationStepIndex + 1) / GENERATION_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* If Roadmap has NOT been generated yet */}
      {!hasRoadmap && !isGeneratingFlow && (
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 border border-slate-800 text-white shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
              <Sparkles className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Personalized Approval Intelligence Engine
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              MAITRI+ automatically evaluates statutory requirements, environmental thresholds (MPCB
              Consent), labour compliances, factory plans (DISH), water extraction, and electrical
              grid sanctions specifically tailored for <strong>{project?.projectName}</strong>.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={handleGenerateRoadmap}
                className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-lg shadow-orange-600/30 px-6 py-2.5"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Generate Approval Roadmap</span>
              </Button>
            </div>

            <p className="text-[11px] text-slate-400">
              Deterministic rule-based reasoning engine &bull; Zero hallucinations &bull; Maharashtra
              Industrial Policy 2019 & Factories Act compliant
            </p>
          </div>
        </div>
      )}

      {/* Main Roadmap Dashboard (When Generated) */}
      {hasRoadmap && roadmap && (
        <>

          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="saffron">Approval Intelligence Engine</Badge>
                  <Badge variant="secondary">Rule-Based Statutory Plan</Badge>
                  <span className="text-slate-400 text-xs">&bull;</span>
                  <span className="text-xs text-slate-300">
                    Industry: {project?.industry || roadmap?.industry}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Statutory Approval Roadmap
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-400" />
                  <span>{project?.projectName}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span>{project?.district} District</span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Readiness Score:</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {readiness}%
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Last evaluated on {new Date(roadmap.generatedAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Prototype Recommendation Notice */}
          <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-3 shadow-sm">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Prototype Statutory Recommendation</span>
              <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                &ldquo;This recommendation is generated using configurable business rules. Final
                applicability should be verified by the competent authority.&rdquo;
              </p>
            </div>
          </div>

          {/* Top 5 KPI Cards: Approvals, Departments, Estimated Days, Documents, Overall Readiness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Approvals */}
            <Card hover className="relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Approvals</span>
                <Layers className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {roadmap.totalApprovals}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {approvedCount} Approved &bull; {appliedCount} In-flight
              </p>
            </Card>

            {/* Departments */}
            <Card hover>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Unique Departments</span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {roadmap.totalDepartments}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Single-Window Coordinated</p>
            </Card>

            {/* Estimated Days */}
            <Card hover>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Estimated Timeline</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {roadmap.estimatedTimeline} Days
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Critical path duration</p>
            </Card>

            {/* Documents Required */}
            <Card hover>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Documents Required</span>
                <FileCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {roadmap.requiredDocuments?.length || 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Verification artifacts</p>
            </Card>

            {/* Overall Readiness Gauge */}
            <Card hover className="bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-800/40 dark:to-orange-950/10">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Overall Readiness</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                {/* Circular Progress Gauge */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-orange-600 transition-all duration-1000 ease-out"
                      strokeDasharray={`${readiness}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-900 dark:text-white">
                    {readiness}%
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    {readiness >= 80 ? 'High Readiness' : readiness >= 60 ? 'Moderate' : 'Action Needed'}
                  </span>
                  <span className="text-[10px] text-slate-400">4 Factors Scored</span>
                </div>
              </div>
            </Card>
          </div>

          {/* View Mode Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'cards' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('cards')}
                className="text-xs"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                <span>Approval Dossiers ({roadmap.approvals.length})</span>
              </Button>

              <Button
                variant={activeTab === 'graph' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('graph')}
                className="text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                <span>Dependency Graph</span>
              </Button>

              <Button
                variant={activeTab === 'timeline' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('timeline')}
                className="text-xs"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                <span>5-Week Timeline View</span>
              </Button>
            </div>

            <div className="text-xs text-slate-400 hidden md:block">
              {filteredApprovals.length} of {roadmap.approvals.length} approvals shown
            </div>
          </div>

          {/* TAB 1: CARDS VIEW */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              {/* Filter & Search Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
                <div className="relative sm:col-span-1">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search approvals, departments, rules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="ALL">All Departments ({uniqueDepartments.length})</option>
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Recommended">Recommended</option>
                    <option value="Ready to Apply">Ready to Apply</option>
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              {/* Approval Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredApprovals.map((approval) => {
                  const isExpanded = expandedApprovalId === approval._id;
                  const priorityVariant =
                    approval.priority === 'Critical'
                      ? 'destructive'
                      : approval.priority === 'High'
                      ? 'saffron'
                      : approval.priority === 'Medium'
                      ? 'warning'
                      : 'secondary';

                  return (
                    <Card
                      key={approval._id}
                      hover
                      className={`transition-all duration-200 ${
                        approval.status === 'Approved'
                          ? 'border-emerald-300 dark:border-emerald-800/60'
                          : ''
                      }`}
                    >
                      <div className="p-5 space-y-4">
                        {/* Header: Department + Priority + Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 block uppercase tracking-wider flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{approval.department}</span>
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                              {approval.approvalName}
                            </h3>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <StatusBadge status={approval.status} className="text-xs" />
                            <Badge variant={priorityVariant} className="text-[10px] uppercase font-bold">
                              {approval.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Rationale / Reason why recommended */}
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <strong className="text-orange-600 dark:text-orange-400 block text-[11px] mb-0.5">
                            Rule Engine Recommendation:
                          </strong>
                          {approval.reason}
                        </div>

                        {/* Metadata row: Estimated Days, Inspection flag, Dependencies count */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 gap-2">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-mono font-medium text-slate-800 dark:text-slate-200">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              {approval.estimatedDays} Days SLA
                            </span>

                            <span className="flex items-center gap-1 text-[11px]">
                              <UserCheck
                                className={`w-3.5 h-3.5 ${
                                  approval.inspectionRequired ? 'text-red-500' : 'text-emerald-500'
                                }`}
                              />
                              {approval.inspectionRequired ? 'Site Audit Required' : 'Self-Certified'}
                            </span>
                          </div>

                          {approval.dependencies?.length > 0 && (
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                              {approval.dependencies.length} Prerequisites
                            </span>
                          )}
                        </div>

                        {/* Expandable Section */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in text-xs">
                            {/* Required Documents */}
                            <div>
                              <strong className="text-slate-700 dark:text-slate-300 block mb-1">
                                Required Verification Documents ({approval.requiredDocuments?.length || 0}):
                              </strong>
                              <ul className="space-y-1 pl-4 list-disc text-slate-600 dark:text-slate-400">
                                {approval.requiredDocuments?.map((doc, i) => (
                                  <li key={i}>{doc}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Dependencies */}
                            {approval.dependencies?.length > 0 && (
                              <div>
                                <strong className="text-slate-700 dark:text-slate-300 block mb-1">
                                  Prerequisites & Dependencies:
                                </strong>
                                <div className="flex flex-wrap gap-1.5">
                                  {approval.dependencies.map((dep, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[10px]"
                                    >
                                      {dep}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Status Quick Updater */}
                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-slate-500 text-[11px]">Change Status:</span>
                              <div className="flex items-center gap-1.5">
                                {(['Ready to Apply', 'Applied', 'Approved'] as ProjectApprovalStatus[]).map(
                                  (st) => (
                                    <Button
                                      key={st}
                                      size="sm"
                                      variant={approval.status === st ? 'primary' : 'outline'}
                                      disabled={approval.status === st}
                                      onClick={() => handleStatusChange(approval._id, st)}
                                      className="text-[10px] py-1 px-2 h-7"
                                    >
                                      {st}
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Card Footer Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedApprovalId(isExpanded ? null : approval._id)
                            }
                            className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'Expand Details'}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailModalApproval(approval)}
                            className="text-xs h-7 px-2"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Dossier View</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {filteredApprovals.length === 0 && (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                  <Filter className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="font-semibold text-sm">No approvals match the selected filter criteria.</p>
                  <p className="mt-1">Try clearing filters or search query.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VISUAL DEPENDENCY GRAPH */}
          {activeTab === 'graph' && (
            <div className="space-y-6">
              <Card className="p-6">
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>Statutory Approval Sequencing & Parallel Path Graph</span>
                  </CardTitle>
                  <CardDescription>
                    Visual execution flow showing non-blocking parallel workflows and inspection gates
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                  {/* Flow Diagram */}
                  <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 relative">
                    {/* Node 1: Project Dossier */}
                    <div className="flex-1 p-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-center space-y-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white mx-auto flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Project Registration</h4>
                      <p className="text-[11px] text-slate-500">Unit dossier logged in MAITRI+</p>
                      <Badge variant="success" className="text-[10px]">
                        Completed
                      </Badge>
                    </div>

                    <div className="hidden lg:flex items-center text-slate-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    {/* Node 2: Phase 1 Pre-Construction */}
                    <div className="flex-1 p-4 rounded-xl border-2 border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20 text-center space-y-2">
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white mx-auto flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Phase 1: Pre-Construction
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        MPCB CTE & Fire Provisional NOC (Parallel execution)
                      </p>
                      <Badge variant="saffron" className="text-[10px]">
                        Can Run Parallel
                      </Badge>
                    </div>

                    <div className="hidden lg:flex items-center text-slate-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    {/* Node 3: Phase 2 Utility Allotments */}
                    <div className="flex-1 p-4 rounded-xl border-2 border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20 text-center space-y-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white mx-auto flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Phase 2: Utilities</h4>
                      <p className="text-[11px] text-slate-500">
                        MSEDCL Power, MIDC Water, CLRA Labour
                      </p>
                      <Badge variant="secondary" className="text-[10px]">
                        Infrastructure
                      </Badge>
                    </div>

                    <div className="hidden lg:flex items-center text-slate-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    {/* Node 4: Statutory Inspection */}
                    <div className="flex-1 p-4 rounded-xl border-2 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-2">
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white mx-auto flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Joint Inspection Gate</h4>
                      <p className="text-[11px] text-slate-500">
                        DISH Factory & Boiler statutory inspection
                      </p>
                      <Badge variant="warning" className="text-[10px]">
                        On-Site Audit
                      </Badge>
                    </div>

                    <div className="hidden lg:flex items-center text-slate-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    {/* Node 5: Final Compliance & Operating License */}
                    <div className="flex-1 p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold text-xs">
                        5
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Consent to Operate</h4>
                      <p className="text-[11px] text-slate-500">
                        MPCB CTO & Final Factory License (Commercial Ops)
                      </p>
                      <Badge variant="success" className="text-[10px]">
                        Commercial Go-Live
                      </Badge>
                    </div>
                  </div>

                  {/* Stage-wise Breakdown */}
                  <div className="space-y-4 pt-4">
                    {roadmap.parallelWorkflows?.map((wf, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {wf.stage}
                          </span>
                          <Badge variant={wf.canRunParallel ? 'success' : 'secondary'} className="text-[10px]">
                            {wf.canRunParallel ? 'Parallel Track' : 'Sequential Track'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {wf.approvals.map((appTitle, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs shadow-sm font-medium"
                            >
                              {appTitle}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: 5-WEEK TIMELINE VIEW */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <Card className="p-6">
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span>Statutory Clearance Timeline (Week 1 through Week 5+)</span>
                  </CardTitle>
                  <CardDescription>
                    Sequential turnaround schedule based on Maharashtra Right to Public Services Act SLAs
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Timeline Milestones */}
                  <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-300 dark:before:bg-orange-950">
                    {/* Week 1 */}
                    <div className="relative pl-10 space-y-2">
                      <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-orange-600 ring-4 ring-white dark:ring-slate-900" />
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Week 1: Document Scrutiny & Pre-Construction Filings
                        </h4>
                        <Badge variant="outline" className="text-[10px]">Days 1 - 7</Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Submit online dossiers for MPCB Consent to Establish (CTE) and DMFS Provisional Fire NOC. Upload architectural layouts and EIA reports.
                      </p>
                    </div>

                    {/* Week 2 */}
                    <div className="relative pl-10 space-y-2">
                      <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Week 2: Environmental Scrutiny & Utility Applications
                        </h4>
                        <Badge variant="outline" className="text-[10px]">Days 8 - 14</Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        File MSEDCL High-Tension load sanction (HT 33kV) and MIDC industrial water connection reservation. Fire department completes drawing scrutiny.
                      </p>
                    </div>

                    {/* Week 3 */}
                    <div className="relative pl-10 space-y-2">
                      <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-amber-600 ring-4 ring-white dark:ring-slate-900" />
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Week 3: Civil Approvals & Factory Building Plan Sanction
                        </h4>
                        <Badge variant="outline" className="text-[10px]">Days 15 - 21</Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        DISH validates industrial safety plan, machine layout, emergency exits, and sanitary provisions. Labour registration initiated under CLRA Act.
                      </p>
                    </div>

                    {/* Week 4 */}
                    <div className="relative pl-10 space-y-2">
                      <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Week 4: On-Site Inspection & Equipment Certification
                        </h4>
                        <Badge variant="outline" className="text-[10px]">Days 22 - 28</Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Joint field verification by DISH Safety Inspector & Steam Boiler Directorate. CEIG substation electrical inspection conducted.
                      </p>
                    </div>

                    {/* Week 5+ */}
                    <div className="relative pl-10 space-y-2">
                      <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-slate-900" />
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Week 5+: Final Statutory Consent to Operate (CTO) & Commissioning
                        </h4>
                        <Badge variant="success" className="text-[10px]">Days 29 - 45+</Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Issuance of final manufacturing license, FSSAI/FDA drug license (if applicable), and permanent power energization.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Readiness Score Breakdown & Next Action Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Readiness Score Breakdown */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Statutory Readiness Calculation</span>
                </CardTitle>
                <CardDescription>Multi-factor compliance evaluation</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                {/* Score bar */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Project Baseline Details</span>
                    <span className="text-emerald-600 font-mono">100%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Infrastructure Specifications</span>
                    <span className="text-emerald-600 font-mono">100%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Mandatory Verification Documents</span>
                    <span className="text-amber-600 font-mono">65% Prepared</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Statutory Approvals Cleared</span>
                    <span className="text-orange-600 font-mono">
                      {Math.round((approvedCount / (roadmap.totalApprovals || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full"
                      style={{
                        width: `${Math.round((approvedCount / (roadmap.totalApprovals || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  Readiness score determines eligibility for expedited fast-track government scrutiny.
                </div>
              </CardContent>
            </Card>

            {/* Next Action Panel */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Next Action Panel & Recommended Next Steps</span>
                </CardTitle>
                <CardDescription>
                  Actions required to advance statutory clearances through MAITRI Single Window
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Action 1 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-orange-400 transition-colors space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Upload className="w-4 h-4 text-orange-600" />
                      <span>Upload Missing Documents</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Upload DPR, plant layout CAD drawings, and water balance diagrams for fast-track scrutiny.
                    </p>
                    <Link to={`/projects/${id}/documents`}>
                      <Button variant="outline" size="sm" className="text-[11px] w-full mt-1">
                        Go to Document Vault
                      </Button>
                    </Link>

                  </div>

                  {/* Action 2 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-orange-400 transition-colors space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span>Start Applications</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Initiate Common Application Form (CAF) for Phase 1 parallel clearances.
                    </p>
                    <Link to="/applications">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-[11px] w-full mt-1">
                        Open Single Window CAF
                      </Button>
                    </Link>
                  </div>

                  {/* Action 3 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-orange-400 transition-colors space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <FileDown className="w-4 h-4 text-emerald-600" />
                      <span>Download Statutory Checklist</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Export full printable checklist of all {roadmap.requiredDocuments?.length || 0} statutory documents.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="text-[11px] w-full mt-1"
                    >
                      Print Checklist
                    </Button>
                  </div>

                  {/* Action 4 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-orange-400 transition-colors space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>View Compliance Calendar</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Track renewal milestones, quarterly MPCB returns, and boiler inspection due dates.
                    </p>
                    <Link to="/compliance">
                      <Button variant="outline" size="sm" className="text-[11px] w-full mt-1">
                        Compliance Calendar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Modal / Slide-over for Approval Details */}
      {detailModalApproval && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <ApprovalDetails
              approvalItem={detailModalApproval}
              projectId={id}
              onClose={() => setDetailModalApproval(null)}
              onStatusChange={(approvalId, st) => {
                handleStatusChange(approvalId, st);
                setDetailModalApproval(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalRoadmap;
