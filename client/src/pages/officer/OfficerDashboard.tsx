import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOfficerApplications } from '../../hooks/useOfficerApplications';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';
import { ApplicationItem, ApplicationStatus } from '../../types/officer.types';
import { ApplicationDetailsView } from './ApplicationDetailsView';
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
  ExternalLink,
  Eye,
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
} from 'lucide-react';

const DEPARTMENTS = [
  'Maharashtra Pollution Control Board (MPCB)',
  'Directorate of Industrial Safety and Health (DISH)',
  'Directorate of Maharashtra Fire Services (DMFS)',
  'Maharashtra Industrial Development Corp. (MIDC)',
  'Labour Commissionerate Maharashtra',
  'Maharashtra State Electricity Distribution Co. (MSEDCL)',
  'Municipal Authority / Urban Development',
];

const DISTRICTS = ['Pune', 'Thane', 'Raigad', 'Nashik', 'Aurangabad', 'Nagpur', 'Kolhapur', 'Solapur'];

const INDUSTRIES = [
  'Electric Mobility & Electronics',
  'Renewable Energy & Biofuels',
  'Pharmaceuticals & Biotechnology',
  'Chemicals & Petrochemicals',
  'Manufacturing & Heavy Engineering',
  'Food Processing & Agro-tech',
];

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active view tab: 'table' | 'inspections' | 'analytics'
  const [activeTab, setActiveTab] = useState<'table' | 'inspections' | 'analytics'>('table');

  // Filter states
  const [department, setDepartment] = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [industry, setIndustry] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Selected application for detail modal
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Fetch applications & analytics using custom hook
  const {
    applications,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    analytics,
    isAnalyticsLoading,
  } = useOfficerApplications({
    department,
    district,
    industry,
    priority,
    status,
    search,
    page,
    limit: 20,
  });

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

  const kpis = analytics?.kpi || {
    pendingApplications: 0,
    applicationsDueToday: 0,
    slaAtRisk: 0,
    todayInspections: 0,
    approvedThisMonth: 0,
    queriesRaised: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Header & Role Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="saffron" className="text-xs uppercase font-bold">
              Government Officer Portal
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {userRole === 'admin'
                ? 'Super Administrator — All Departments'
                : `Agency: ${user?.department || user?.companyName || 'Department Officer'}`}
            </Badge>

          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Departmental Clearance & Scrutiny Workspace
          </h1>
          <p className="text-xs text-slate-500">
            MAITRI+ Single Window statutory verification, query resolution, and field audit scheduler
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh Queue</span>
          </Button>

          <Link to="/applications">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs">
              <FileCheck2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Full Pipeline View</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Pending */}
        <Card hover className="p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Pending Scrutiny</span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {kpis.pendingApplications}
          </div>
          <span className="text-[10px] text-slate-400">Queue workload</span>
        </Card>

        {/* Card 2: Due Today */}
        <Card hover className="p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Due Today</span>
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-2">
            {kpis.applicationsDueToday}
          </div>
          <span className="text-[10px] text-red-500 font-medium">SLA Deadline</span>
        </Card>

        {/* Card 3: SLA At Risk */}
        <Card hover className="p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>SLA At Risk</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
            {kpis.slaAtRisk}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">&le; 5 Days remaining</span>
        </Card>

        {/* Card 4: Today's Inspections */}
        <Card hover className="p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Inspections Today</span>
            <CalendarCheck className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-2">
            {kpis.todayInspections}
          </div>
          <span className="text-[10px] text-purple-500 font-medium">Field audits</span>
        </Card>

        {/* Card 5: Approved Month */}
        <Card hover className="p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Approved This Month</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {kpis.approvedThisMonth}
          </div>
          <span className="text-[10px] text-emerald-500 font-medium">NOCs Issued</span>
        </Card>

        {/* Card 6: Queries Raised */}
        <Card hover className="p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Queries Raised</span>
            <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400 mt-2">
            {kpis.queriesRaised}
          </div>
          <span className="text-[10px] text-orange-500 font-medium">Active inquiries</span>
        </Card>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'table' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('table')}
            className="text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            <span>Applications Scrutiny Table ({applications.length})</span>
          </Button>

          <Button
            variant={activeTab === 'inspections' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('inspections')}
            className="text-xs"
          >
            <CalendarCheck className="w-3.5 h-3.5 mr-1.5" />
            <span>Inspection Scheduler</span>
          </Button>

          <Button
            variant={activeTab === 'analytics' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('analytics')}
            className="text-xs"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            <span>Departmental Workload & Analytics</span>
          </Button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:block">
          Avg turnaround: <strong>{analytics?.averageApprovalDays || 16.4} Working Days</strong>
        </span>
      </div>

      {/* TAB 1: MAIN SCRUTINY TABLE */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, Project, Service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Department */}
            <div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-orange-500"
              >
                <option value="ALL">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-orange-500"
              >
                <option value="ALL">All Districts</option>
                {DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-orange-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-orange-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Scrutiny">Under Scrutiny</option>
                <option value="Query Raised">Query Raised</option>
                <option value="Inspection Scheduled">Inspection Scheduled</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 backdrop-blur-md bg-slate-50/95 dark:bg-slate-800/95 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Application ID</th>
                    <th className="py-3.5 px-4">Project & Industry</th>
                    <th className="py-3.5 px-4">Department & Clearance</th>
                    <th className="py-3.5 px-4">Priority & Risk</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">SLA Remaining</th>
                    <th className="py-3.5 px-4">Assigned Officer</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.length > 0 ? (
                    applications.map((app) => {
                      const slaDaysLeft = app.slaRemaining ?? 20;
                      const isOver = app.isOverdue || slaDaysLeft <= 0;
                      const slaColor = isOver
                        ? 'destructive'
                        : slaDaysLeft <= 5
                        ? 'warning'
                        : 'success';

                      const riskColor =
                        app.riskScore === 'High'
                          ? 'destructive'
                          : app.riskScore === 'Medium'
                          ? 'warning'
                          : 'secondary';

                      return (
                        <tr
                          key={app._id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* App ID & Submission */}
                          <td className="py-3.5 px-4 font-mono">
                            <span
                              className="font-bold text-orange-600 dark:text-orange-400 block hover:underline cursor-pointer"
                              onClick={() => setSelectedApplicationId(app._id)}
                            >
                              {app.applicationNumber}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(app.submittedAt)}
                            </span>
                          </td>

                          {/* Project & Industry */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 max-w-[200px]">
                              <span className="font-bold text-slate-900 dark:text-white block truncate">
                                {app.projectId?.projectName || 'Industrial Project'}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {app.projectId?.companyName || app.projectId?.industry}
                              </span>
                            </div>
                          </td>

                          {/* Department & Service */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 max-w-[220px]">
                              <Badge variant="saffron" className="text-[10px]">
                                {app.department.split(' ')[0]}
                              </Badge>
                              <span className="font-medium text-slate-800 dark:text-slate-200 block truncate text-[11px]">
                                {app.serviceName || 'Statutory Clearance'}
                              </span>
                            </div>
                          </td>

                          {/* Priority & Risk */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <Badge
                                variant={
                                  app.priority === 'Critical' || app.priority === 'Urgent'
                                    ? 'destructive'
                                    : app.priority === 'High'
                                    ? 'saffron'
                                    : 'secondary'
                                }
                                className="text-[10px] uppercase font-bold"
                              >
                                {app.priority}
                              </Badge>
                              <Badge variant={riskColor} className="text-[9px]">
                                Risk: {app.riskScore || 'Low'}
                              </Badge>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <StatusBadge status={app.status} className="text-[11px]" />
                          </td>

                          {/* SLA Remaining */}
                          <td className="py-3.5 px-4 font-mono">
                            <Badge variant={slaColor} className="text-[11px] font-bold">
                              {isOver ? 'Overdue' : `${slaDaysLeft} Days`}
                            </Badge>
                          </td>

                          {/* Assigned Officer */}
                          <td className="py-3.5 px-4">
                            <span className="text-slate-700 dark:text-slate-300 font-medium block">
                              {app.assignedOfficer?.name || 'Unassigned'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApplicationId(app._id)}
                              className="text-xs h-7 px-2.5 font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              <span>Review</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-sm">No applications found in scrutiny queue.</p>
                        <p className="text-xs mt-1">Try relaxing filters or check back after new submissions.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INSPECTION SCHEDULER */}
      {activeTab === 'inspections' && (
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-purple-600" />
                  <span>Joint Field Inspection Master Schedule</span>
                </CardTitle>
                <CardDescription>
                  Coordinated on-site audits for Industrial Safety (DISH), Fire NOC (DMFS), and Environmental Clearance (MPCB)
                </CardDescription>
              </div>

              <Badge variant="saffron" className="text-xs font-mono font-bold">
                {kpis.todayInspections} Inspections Due Today
              </Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applications
                  .filter((a) => a.inspectionDate || a.status === 'Inspection Scheduled')
                  .map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="saffron" className="text-[10px] mb-1">
                            {app.department.split(' ')[0]}
                          </Badge>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {app.projectId?.projectName}
                          </h4>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-orange-500" />
                            {app.projectId?.location}, {app.projectId?.district}
                          </span>
                        </div>

                        <Badge variant="warning" className="text-[10px]">
                          Scheduled
                        </Badge>
                      </div>

                      <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-500">Audit Date:</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {app.inspectionDate ? formatDate(app.inspectionDate) : 'Pending Date Assignment'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Designated Inspector:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {app.assignedOfficer?.name || 'District Safety Inspector'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedApplicationId(app._id)}
                          className="text-xs h-7"
                        >
                          View Checklist & Findings
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>

              {applications.filter((a) => a.inspectionDate).length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-sm">No inspections currently scheduled.</p>
                  <p className="mt-1">Select an application from the table to schedule a site audit.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: WORKLOAD & ANALYTICS WIDGETS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Workload */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span>Departmental Application Workload</span>
              </CardTitle>
              <CardDescription>Volume of clearance applications by agency</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {Object.entries(analytics?.departmentWorkload || {}).map(([dept, count]) => (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[280px]">
                      {dept}
                    </span>
                    <span className="font-mono text-orange-600">{count} Active</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (count / Math.max(1, applications.length)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending by District */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Clearance Queue by Maharashtra District</span>
              </CardTitle>
              <CardDescription>Regional industrial development concentration</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {Object.entries(analytics?.pendingByDistrict || {}).map(([dist, count]) => (
                <div key={dist} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{dist} District</span>
                    <span className="font-mono text-emerald-600">{count} In-flight</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (count / Math.max(1, applications.length)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplicationId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <ApplicationDetailsView
              applicationId={selectedApplicationId}
              onClose={() => setSelectedApplicationId(null)}
              onUpdateSuccess={() => {
                refetch();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
