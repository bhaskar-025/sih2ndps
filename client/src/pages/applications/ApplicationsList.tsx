import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOfficerApplications } from '../../hooks/useOfficerApplications';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DataTable, ColumnDef } from '../../components/DataTable';
import { formatDate } from '../../utils/formatters';
import { ApplicationItem, ApplicationStatus } from '../../types/officer.types';
import {
  FileText,
  Search,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  ExternalLink,
  Building2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Filter,
} from 'lucide-react';

export const ApplicationsList: React.FC = () => {
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  const {
    applications,
    isLoading,
    isError,
    error,
    refetch,
  } = useOfficerApplications({
    department: filterDepartment !== 'ALL' ? filterDepartment : undefined,
    status: filterStatus !== 'ALL' ? filterStatus : undefined,
  });

  const activeApp = selectedApp || applications[0] || null;

  const columns: ColumnDef<ApplicationItem>[] = [
    {
      header: 'Tracking ID',
      accessorKey: 'applicationNumber',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-mono font-bold text-xs text-orange-600 dark:text-orange-400">
            {item.applicationNumber}
          </span>
          <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
            {item.department}
          </div>
        </div>
      ),
    },
    {
      header: 'Clearance Service',
      accessorKey: 'serviceName',
      sortable: true,
      cell: (item) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">
            {item.serviceName || item.approvalId?.approvalName || 'Statutory Clearance'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Unit: {item.projectId?.projectName || 'Industrial Project'}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: 'SLA Days',
      accessorKey: 'slaRemaining',
      sortable: true,
      cell: (item) => {
        const remaining = item.slaRemaining ?? item.slaDays ?? 15;
        const isUrgent = remaining <= 5;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              item.status === 'Approved'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : isUrgent
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{item.status === 'Approved' ? 'Cleared' : `${remaining}d left`}</span>
          </span>
        );
      },
    },
    {
      header: 'Submitted',
      accessorKey: 'submittedAt',
      sortable: true,
      cell: (item) => (
        <span className="text-slate-500 text-xs">
          {item.submittedAt ? formatDate(item.submittedAt) : 'Recent'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedApp(item);
            }}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Preview Timeline"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <Link
            to={`/applications/${item._id}`}
            className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400"
            title="Full Scrutiny Details"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Single Window Industrial Approvals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            End-to-end statutory clearance pipeline across MPCB, MIDC, DMFS, and Labour with live SLA tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Sync</span>
          </Button>

          <Link to="/projects">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Apply via Project Roadmap</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {['ALL', 'Submitted', 'Under Scrutiny', 'Query Raised', 'Approved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Total In System: <strong className="text-slate-900 dark:text-white font-bold">{applications.length}</strong>
          </span>
        </div>
      </div>

      {/* Master Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Enterprise DataTable */}
        <div className="lg:col-span-2">
          <DataTable<ApplicationItem>
            data={applications}
            columns={columns}
            keyExtractor={(item) => item._id}
            isLoading={isLoading}
            isError={isError}
            errorMessage={error ? (error as any).message : 'Failed to load applications'}
            onRetry={refetch}
            emptyTitle="No Clearance Applications Found"
            emptyDescription="There are currently no applications matching your selected filters."
            pageSize={8}
            stickyHeader
            onRowClick={(item) => setSelectedApp(item)}
            searchPlaceholder="Search tracking ID, service, or department..."
          />
        </div>

        {/* Right 1 Col: Live Timeline Tracker Card */}
        <div>
          {activeApp ? (
            <Card className="sticky top-24 border-slate-200/80 dark:border-slate-800 shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                    {activeApp.applicationNumber}
                  </span>
                  <StatusBadge status={activeApp.status} />
                </div>
                <CardTitle className="text-sm mt-1.5 font-bold">
                  {activeApp.serviceName || activeApp.approvalId?.approvalName || 'Statutory Application'}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Department: <strong className="text-slate-700 dark:text-slate-300">{activeApp.department}</strong>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Unit Details Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-orange-600" />
                    <span>{activeApp.projectId?.projectName || 'Industrial Project'}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    District: {activeApp.projectId?.district || 'Maharashtra'} • Investment: ₹ {activeApp.projectId?.investment || 0} Lakhs
                  </div>
                </div>

                {/* Statutory Timeline */}
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    Statutory Lifecycle Stages
                  </div>

                  {activeApp.history && activeApp.history.length > 0 ? (
                    <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-200 dark:before:bg-orange-950">
                      {activeApp.history.map((event, idx) => (
                        <div key={idx} className="relative text-xs space-y-0.5">
                          <div className="absolute -left-5 top-1 h-3.5 w-3.5 rounded-full bg-orange-600 ring-4 ring-white dark:ring-slate-900" />
                          <div className="font-bold text-slate-900 dark:text-white">
                            {event.action}
                          </div>
                          {event.remarks && (
                            <p className="text-slate-500 text-[11px] leading-snug">
                              {event.remarks}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 block">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 py-3 italic">
                      Current stage: {activeApp.currentStage || 'Initial Document Scrutiny'}
                    </div>
                  )}
                </div>

                {/* Detailed Action Button */}
                <div className="pt-2">
                  <Link to={`/applications/${activeApp._id}`} className="block">
                    <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs">
                      <span>Open Full Application View</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center text-xs text-slate-400">
              Select an application from the table to preview its live statutory timeline.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsList;
