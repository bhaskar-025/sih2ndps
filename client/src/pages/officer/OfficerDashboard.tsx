import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useOfficer } from '../../context/OfficerContext';
import { useOfficerDashboard } from '../../hooks/useOfficerDashboard';
import { officerService } from '../../services/officerService';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState, EmptyState } from '../../components/EmptyState';
import { ApplicationDetailsView } from './ApplicationDetailsView';
import { AICopilotDrawer } from '../../components/AICopilotDrawer';
import { MetricCard, SearchBar, FilterBar, GlobalSearchModal } from '../../components/common';
import {
  OfficerCard,
  RiskBadge,
  PriorityBadge,
  AnalyticsChart,
} from '../../components/officer/OfficerComponents';
import { formatDate } from '../../utils/formatters';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileCheck2,
  FileText,
  Filter,
  Layers,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
  Undo2,
  FileSpreadsheet,
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isGlobalSearchOpen, openGlobalSearch, closeGlobalSearch, isMockFallbackActive } = useOfficer();

  // Active view tab: 'queues' | 'workload' | 'analytics' | 'activity'
  const [activeTab, setActiveTab] = useState<'queues' | 'workload' | 'analytics' | 'activity'>('queues');

  // Selected queue tab inside queues view
  const [selectedQueue, setSelectedQueue] = useState<
    | 'priorityQueue'
    | 'todayTasks'
    | 'assignedCases'
    | 'unassignedCases'
    | 'escalatedCases'
    | 'highRiskCases'
    | 'pendingQueries'
    | 'returnedFiles'
    | 'approvalsReady'
  >('priorityQueue');

  // Filters
  const [department, setDepartment] = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [industry, setIndustry] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected application for detail modal
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // AI Copilot Drawer State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotAppContext, setCopilotAppContext] = useState<any>(null);

  // Fetch live dashboard analytics dynamically via useOfficerDashboard hook
  const {
    dashboardData,
    kpis: fetchedKpis,
    isLoading,
    isError,
    error,
    refetch,
  } = useOfficerDashboard(department);

  // Role Access Gate: Entrepreneurs cannot access Government Officer Workspace
  const userRole = (user?.role || '').toLowerCase();
  if (userRole === 'entrepreneur') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Restricted Government Officer Workspace
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          This portal is reserved for official scrutinizing officers across Maharashtra state departments
          (MPCB, DISH, DMFS, MIDC, MSEDCL, Labour). Entrepreneurs can track their submissions on the
          Main Dashboard.
        </p>
        <div className="pt-2">
          <Link to="/dashboard">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs">
              Return to Entrepreneur Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 12 Real-Time Dynamic KPIs Derived from Backend Aggregation
  const kpis = {
    pendingReviews: fetchedKpis?.pendingReviews ?? fetchedKpis?.pendingScrutiny ?? 0,
    approvedToday: fetchedKpis?.approvedToday ?? fetchedKpis?.approvalsIssued ?? 0,
    rejected: fetchedKpis?.rejected ?? 0,
    queriesRaised: fetchedKpis?.queriesRaised ?? 0,
    applicationsWaiting: fetchedKpis?.applicationsWaiting ?? 0,
    averageSla: fetchedKpis?.averageSla ?? fetchedKpis?.averageSlaRemaining ?? 18,
    inspectionToday: fetchedKpis?.inspectionToday ?? fetchedKpis?.inspectionsScheduled ?? 0,
    totalProjects: fetchedKpis?.totalProjects ?? 24,
    todaysDeadline: fetchedKpis?.todaysDeadline ?? 4,
    overdue: fetchedKpis?.overdue ?? 0,
    highRiskApplications: fetchedKpis?.highRiskApplications ?? 0,
    departmentsActive: fetchedKpis?.departmentsActive ?? 8,
    totalApplications: fetchedKpis?.totalApplications ?? 0,
  };

  const queues = dashboardData?.queues || {
    priorityQueue: [],
    todayTasks: [],
    assignedCases: [],
    unassignedCases: [],
    escalatedCases: [],
    highRiskCases: [],
    pendingQueries: [],
    returnedFiles: [],
    approvalsReady: [],
  };

  const currentQueueItems = useMemo(() => {
    let list = queues[selectedQueue] || [];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (app: any) =>
          (app.applicationNumber || '').toLowerCase().includes(q) ||
          (app.projectId?.projectName || '').toLowerCase().includes(q) ||
          (app.projectId?.companyName || '').toLowerCase().includes(q) ||
          (app.serviceName || '').toLowerCase().includes(q) ||
          (app.department || '').toLowerCase().includes(q)
      );
    }

    if (district !== 'ALL') {
      list = list.filter((app: any) => app.projectId?.district === district);
    }

    if (industry !== 'ALL') {
      list = list.filter((app: any) => app.projectId?.industry === industry);
    }

    return list;
  }, [queues, selectedQueue, search, district, industry]);

  // Extract unique departments, districts, and industries from active data for dynamic filter dropdowns
  const availableDistricts = useMemo(() => {
    if (!dashboardData?.charts?.districtBreakdown) return [];
    return dashboardData.charts.districtBreakdown.map((d) => d.district).filter(Boolean);
  }, [dashboardData]);

  const availableIndustries = useMemo(() => {
    if (!dashboardData?.charts?.industryBreakdown) return [];
    return dashboardData.charts.industryBreakdown.map((d) => d.industry).filter(Boolean);
  }, [dashboardData]);

  const handleExport = (type: 'applications' | 'inspections') => {
    officerService.exportData(type, 'csv');
  };

  const openAppInWorkspace = (app: any) => {
    setSelectedApplicationId(app._id);
    setCopilotAppContext({
      applicationId: app._id,
      applicationNumber: app.applicationNumber,
      projectName: app.projectId?.projectName || 'Industrial Project',
      industry: app.projectId?.industry || 'Industrial Unit',
      department: app.department,
      investment: app.projectId?.investment,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
        <Skeleton className="h-10 w-96 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
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
          message={(error as Error)?.message || 'Failed to load live officer workspace analytics.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-12">
      {/* Top Header & Role Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="saffron" className="text-xs uppercase font-bold tracking-wider">
              MAITRI+ Government Officer Workspace
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono">
              {userRole === 'admin'
                ? 'Super Admin clearance'
                : `Officer: ${user?.name || user?.email} • ${user?.department || 'State Clearing Agency'}`}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Statutory Scrutiny & Clearance Command Center
          </h1>
          <p className="text-xs text-slate-500">
            Real-time inter-departmental clearance pipeline, SLA enforcement, and AI-assisted scrutiny.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={openGlobalSearch}
            className="text-xs border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
          >
            <Search className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>Quick Search (Ctrl+K)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs border-slate-300 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Sync Live Data</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('applications')}
            className="text-xs text-emerald-700 border-emerald-300 dark:border-emerald-800 dark:text-emerald-400"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setCopilotAppContext(null);
              setIsCopilotOpen(true);
            }}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-semibold shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-yellow-200" />
            <span>AI Copilot</span>
          </Button>
        </div>
      </div>

      {/* 6 PRIMARY DYNAMIC KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Pending Reviews */}
        <MetricCard
          title="Pending Reviews"
          value={kpis.pendingReviews}
          subtext="Awaiting scrutiny decision"
          icon={Clock}
          color="primary"
          onClick={() => {
            setActiveTab('queues');
            setSelectedQueue('unassignedCases');
          }}
        />

        {/* 2. Approved Today */}
        <MetricCard
          title="Approved Today"
          value={kpis.approvedToday}
          subtext="NOCs & clearances granted"
          icon={CheckCircle2}
          color="success"
          onClick={() => {
            setActiveTab('queues');
            setSelectedQueue('approvalsReady');
          }}
        />

        {/* 3. Queries Raised */}
        <MetricCard
          title="Queries Raised"
          value={kpis.queriesRaised}
          subtext="Awaiting applicant reply"
          icon={MessageSquare}
          color="warning"
          onClick={() => {
            setActiveTab('queues');
            setSelectedQueue('pendingQueries');
          }}
        />

        {/* 4. High Risk Applications */}
        <MetricCard
          title="High Risk Apps"
          value={kpis.highRiskApplications}
          subtext="Statutory risk flagged"
          icon={AlertTriangle}
          color="danger"
          onClick={() => {
            setActiveTab('queues');
            setSelectedQueue('highRiskCases');
          }}
        />

        {/* 5. Inspection Today */}
        <MetricCard
          title="Inspection Today"
          value={kpis.inspectionToday}
          subtext="Field audits scheduled"
          icon={CalendarCheck}
          color="purple"
          onClick={() => navigate('/inspections')}
        />

        {/* 6. Officer Workload */}
        <MetricCard
          title="Officer Workload"
          value={`${dashboardData?.officerWorkload?.length || 0} Officers`}
          subtext="Active scrutinizers assigned"
          icon={Users}
          color="primary"
          onClick={() => setActiveTab('workload')}
        />
      </div>

      {/* SECONDARY DYNAMIC METRICS ROW (All Calculated from API response) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Applications Waiting</span>
          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{kpis.applicationsWaiting}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Average Statutory SLA</span>
          <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">{kpis.averageSla} Days</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Today's Deadline</span>
          <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">{kpis.todaysDeadline}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Overdue Clearances</span>
          <span className="font-mono font-bold text-sm text-red-500">{kpis.overdue}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Rejected Filings</span>
          <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-300">{kpis.rejected}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Total Units Monitored</span>
          <span className="font-mono font-bold text-sm text-orange-600 dark:text-orange-400">{kpis.totalProjects} Units</span>
        </div>
      </div>

      {/* Main Mode View Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button
            variant={activeTab === 'queues' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('queues')}
            className="text-xs whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            <span>Officer Queues ({dashboardData?.kpi.totalApplications || 0})</span>
          </Button>

          <Button
            variant={activeTab === 'workload' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('workload')}
            className="text-xs whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            <span>Officer Workload Distribution ({dashboardData?.officerWorkload?.length || 0})</span>
          </Button>

          <Button
            variant={activeTab === 'analytics' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('analytics')}
            className="text-xs whitespace-nowrap"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            <span>District & Industry Analytics</span>
          </Button>

          <Button
            variant={activeTab === 'activity' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('activity')}
            className="text-xs whitespace-nowrap"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            <span>Audit & Activity Stream</span>
          </Button>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/applications">
            <Button size="sm" variant="ghost" className="text-xs text-orange-600 dark:text-orange-400">
              <span>Approval Pipeline &rarr;</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* TAB 1: OFFICER QUEUES */}
      {activeTab === 'queues' && (
        <div className="space-y-4">
          {/* Sub-Queue Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedQueue('priorityQueue')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedQueue === 'priorityQueue'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Priority Queue</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {queues.priorityQueue.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('todayTasks')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedQueue === 'todayTasks'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Tasks</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {queues.todayTasks.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('escalatedCases')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedQueue === 'escalatedCases'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Escalated Cases</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {queues.escalatedCases.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('highRiskCases')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedQueue === 'highRiskCases'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>High Risk Cases</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {queues.highRiskCases.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('unassignedCases')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedQueue === 'unassignedCases'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Unassigned Cases</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {queues.unassignedCases.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('assignedCases')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedQueue === 'assignedCases'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Assigned Cases</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {queues.assignedCases.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('pendingQueries')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedQueue === 'pendingQueries'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Pending Queries</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {queues.pendingQueries.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('returnedFiles')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedQueue === 'returnedFiles'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Returned Files</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {queues.returnedFiles.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedQueue('approvalsReady')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedQueue === 'approvalsReady'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Approvals Ready</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
                {queues.approvalsReady.length}
              </span>
            </button>
          </div>

          {/* Search & Dynamic Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Application Number, Project Name, Service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                <option value="ALL">All Districts ({availableDistricts.length})</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              >
                <option value="ALL">All Industries ({availableIndustries.length})</option>
                {availableIndustries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications Scrutiny Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 backdrop-blur-md bg-slate-50/95 dark:bg-slate-800/95 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Project & Enterprise</th>
                    <th className="py-3 px-4">Department & Clearance</th>
                    <th className="py-3 px-4">Priority & Risk</th>
                    <th className="py-3 px-4">Pipeline Status</th>
                    <th className="py-3 px-4">SLA Clock</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4 text-right">Scrutiny Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentQueueItems.length > 0 ? (
                    currentQueueItems.map((app: any) => {
                      const slaRemaining = app.slaRemaining ?? app.slaDays ?? 15;
                      const isOverdue = app.isOverdue || slaRemaining <= 0;

                      return (
                        <tr
                          key={app._id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* App Number & Date */}
                          <td className="py-3 px-4 font-mono">
                            <span
                              onClick={() => openAppInWorkspace(app)}
                              className="font-bold text-orange-600 dark:text-orange-400 block hover:underline cursor-pointer"
                            >
                              {app.applicationNumber}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(app.submittedAt || app.createdAt)}
                            </span>
                          </td>

                          {/* Project Name */}
                          <td className="py-3 px-4">
                            <div className="max-w-[200px]">
                              <span className="font-bold text-slate-900 dark:text-white block truncate">
                                {app.projectId?.projectName || 'Industrial Project'}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {app.projectId?.industry || app.projectId?.district || 'Unit'}
                              </span>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-3 px-4">
                            <div className="max-w-[220px]">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate text-xs">
                                {app.serviceName || app.approvalId?.approvalName || 'Statutory Clearance'}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {app.department}
                              </span>
                            </div>
                          </td>

                          {/* Priority & Risk */}
                          <td className="py-3 px-4">
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
                          <td className="py-3 px-4">
                            <StatusBadge status={app.status} />
                          </td>

                          {/* SLA */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
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
                                {isOverdue ? 'BREACHED' : `${slaRemaining} Days`}
                              </span>
                            </div>
                          </td>

                          {/* Assigned Officer */}
                          <td className="py-3 px-4 text-xs">
                            {app.assignedOfficer?.name ? (
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {app.assignedOfficer.name}
                              </span>
                            ) : (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold italic">
                                Unassigned
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openAppInWorkspace(app)}
                                className="text-xs h-7 px-2.5"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                <span>Scrutinize</span>
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => {
                                  setCopilotAppContext({
                                    applicationId: app._id,
                                    applicationNumber: app.applicationNumber,
                                    projectName: app.projectId?.projectName || 'Industrial Project',
                                    industry: app.projectId?.industry || 'Industrial Unit',
                                    department: app.department,
                                    investment: app.projectId?.investment,
                                  });
                                  setIsCopilotOpen(true);
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-2"
                                title="AI Assistant for this file"
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
                      <td colSpan={8} className="py-8 text-center">
                        <EmptyState
                          title="No applications in this queue"
                          description="All applications matching your filter criteria have been processed or moved."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICER WORKLOAD DISTRIBUTION */}
      {activeTab === 'workload' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              State Officer Registry & Real-Time Case Load
            </h3>
            <span className="text-xs text-slate-400">
              Total active scrutinizers: {dashboardData?.officerWorkload?.length || 0}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dashboardData?.officerWorkload && dashboardData.officerWorkload.length > 0 ? (
              dashboardData.officerWorkload.map((officer) => (
                <OfficerCard
                  key={officer.officerId}
                  name={officer.name}
                  email={officer.email}
                  department={officer.department}
                  activeCases={officer.activeCases}
                  phone={officer.phone}
                />
              ))
            ) : (
              <div className="col-span-3 py-8">
                <EmptyState
                  title="No officers found"
                  description="Officers registered with state clearance agencies will appear here."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DISTRICT & INDUSTRY ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardData?.charts?.districtBreakdown && (
            <AnalyticsChart
              title="Applications by Industrial District"
              data={dashboardData.charts.districtBreakdown.map((d) => ({
                label: d.district || 'Unassigned',
                value: d.count,
              }))}
              type="bar"
            />
          )}

          {dashboardData?.charts?.industryBreakdown && (
            <AnalyticsChart
              title="Applications by Sector & Industry"
              data={dashboardData.charts.industryBreakdown.map((d) => ({
                label: (d.industry || 'General').split(' ')[0],
                value: d.count,
              }))}
              type="pie"
            />
          )}

          {dashboardData?.charts?.statusBreakdown && (
            <div className="md:col-span-2">
              <AnalyticsChart
                title="Statutory Clearance Pipeline Status Breakdown"
                data={dashboardData.charts.statusBreakdown.map((s: any) => ({
                  label: s.status,
                  value: s.count,
                }))}
                type="bar"
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT & ACTIVITY STREAM */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Regulatory Audit Stream
            </h3>
            <span className="text-xs text-slate-400">Chronological activity log</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 divide-y divide-slate-100 dark:divide-slate-800">
            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((act: any, idx: number) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                        {act.applicationNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {act.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Unit: <strong>{act.projectName}</strong> • Agency: {act.department}
                    </p>
                    {act.remarks && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                        "{act.remarks}"
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {formatDate(act.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No recent activity records found.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Application Details Workspace Modal */}
      {selectedApplicationId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 relative">
            <button
              onClick={() => setSelectedApplicationId(null)}
              className="absolute right-4 top-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <ApplicationDetailsView
              applicationId={selectedApplicationId}
              onClose={() => setSelectedApplicationId(null)}
              onUpdateSuccess={() => {
                refetch();
                queryClient.invalidateQueries({ queryKey: ['officer-dashboard-analytics'] });
              }}
            />
          </div>
        </div>
      )}

      {/* AI Copilot Floating Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialContext={copilotAppContext}
      />

      {/* Global Unified Search Overlay */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={closeGlobalSearch}
      />
    </div>
  );
};

export default OfficerDashboard;
