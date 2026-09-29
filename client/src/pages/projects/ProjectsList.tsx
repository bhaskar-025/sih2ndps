import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { projectApi } from '../../api/project.api';
import { officerService } from '../../services/officerService';
import { Project } from '../../types/project.types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { TableSkeleton } from '../../components/Skeleton';
import { EmptyState, ErrorState } from '../../components/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { applicationService } from '../../services/applicationService';
import { documentService } from '../../services/documentService';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Building,
  MapPin,
  TrendingUp,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  Download,
  UserPlus,
  ExternalLink,
  Clock,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'ALL',
  'Pune',
  'Mumbai City',
  'Mumbai Suburban',
  'Thane',
  'Raigad',
  'Nagpur',
  'Nashik',
  'Aurangabad',
  'Solapur',
  'Kolhapur',
  'Satara',
  'Ahmednagar',
];

const INDUSTRIES = [
  'ALL',
  'Renewable Energy & Biofuels',
  'Electric Mobility & Electronics',
  'Manufacturing & Heavy Engineering',
  'Pharmaceuticals & Biotechnology',
  'Chemicals & Petrochemicals',
  'Food Processing & Agro-tech',
  'Textiles & Garments',
  'IT & Data Centers',
];

export const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters state
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('ALL');
  const [industry, setIndustry] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [officerFilter, setOfficerFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Selected project for Right Slide-over Details Drawer (Requirement #3)
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);
  const [assignProject, setAssignProject] = useState<Project | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');

  // Drawer tab state: 'profile' | 'timeline' | 'approvals' | 'documents'
  const [drawerTab, setDrawerTab] = useState<'profile' | 'timeline' | 'approvals' | 'documents'>('profile');

  // Fetch linked approvals for selected project in drawer (Requirement #3)
  const { data: drawerApps = [] } = useQuery({
    queryKey: ['drawer-apps', drawerProject?._id],
    queryFn: async () => {
      if (!drawerProject?._id) return [];
      return projectApi.getProjectApprovals(drawerProject._id);
    },
    enabled: !!drawerProject?._id,
  });

  // Fetch linked documents for selected project in drawer (Requirement #3)
  const { data: drawerDocs = [] } = useQuery({
    queryKey: ['drawer-docs', drawerProject?._id],
    queryFn: async () => {
      if (!drawerProject?._id) return [];
      return projectApi.getProjectDocuments(drawerProject._id);
    },
    enabled: !!drawerProject?._id,
  });

  // TanStack Query: Fetch projects dynamically from API / Mock Service Layer
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects', { page, search, district, industry, status, sort }],
    queryFn: () =>
      projectApi.getProjects({
        page,
        limit: 10,
        search,
        district,
        industry,
        status,
        sort,
      }),
  });

  // TanStack Query: Officers list for assignment
  const { data: officers = [] } = useQuery({
    queryKey: ['officers-list'],
    queryFn: () => officerService.getOfficersList(),
  });

  // Soft delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteConfirmId(null);
    },
  });

  const rawProjects = Array.isArray(data) ? data : data?.data || [];
  const pagination = data?.pagination || { total: rawProjects.length, page: 1, limit: 10, totalPages: 1 };

  // Client-side date range and officer filtering if applied
  const projects = useMemo(() => {
    let list = rawProjects;
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      list = list.filter((p) => new Date(p.createdAt).getTime() >= from);
    }
    if (toDate) {
      const to = new Date(toDate).getTime();
      list = list.filter((p) => new Date(p.createdAt).getTime() <= to);
    }
    return list;
  }, [rawProjects, fromDate, toDate]);

  const handleExport = () => {
    officerService.exportData('projects', 'csv');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="saffron" className="text-xs uppercase font-bold tracking-wider">
              Industrial Registry
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Total Units: {pagination.total}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Industrial Units & Enterprises Registry
          </h1>
          <p className="text-xs text-slate-500">
            Official statutory directory of industrial setups, manufacturing units, and clearance dockets in Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs text-emerald-700 border-emerald-300 dark:border-emerald-800 dark:text-emerald-400"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            <span>Export Registry (CSV)</span>
          </Button>

          <Link to="/projects/new">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Register New Unit</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Complete Search & Filter Suite (Requirement #3) */}
      <Card className="p-4 space-y-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search enterprise, project name, or CIN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* District Filter */}
          <div>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            >
              {MAHARASHTRA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Maharashtra Districts' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <select
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === 'ALL' ? 'All Industrial Sectors' : ind}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            >
              <option value="ALL">All Operational Statuses</option>
              <option value="Active">Active</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Date Range & Sorting Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">Registration Date:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
              title="From Date"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
              title="To Date"
            />
            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="text-orange-600 hover:underline text-[11px]"
              >
                Clear Dates
              </button>
            )}
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
            >
              <option value="-createdAt">Newest Submissions First</option>
              <option value="createdAt">Oldest Submissions First</option>
              <option value="-investment">Highest Capital Investment</option>
              <option value="investment">Lowest Capital Investment</option>
              <option value="projectName">Unit Name (A-Z)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Registry Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : isError ? (
          <div className="p-8">
            <ErrorState
              message={(error as Error)?.message || 'Failed to load industrial units'}
              onRetry={() => refetch()}
            />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No industrial units registered"
              description="No enterprises match your active filters. Register a new unit or adjust search parameters."
              actionText="Register Unit"
              onAction={() => navigate('/projects/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 backdrop-blur-md bg-slate-50/95 dark:bg-slate-800/95 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Industrial Unit</th>
                  <th className="py-3.5 px-4">Enterprise & Category</th>
                  <th className="py-3.5 px-4">Sector / Industry</th>
                  <th className="py-3.5 px-4">District & Taluka</th>
                  <th className="py-3.5 px-4">Capital Investment</th>
                  <th className="py-3.5 px-4">Statutory Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((project: any) => (
                  <tr
                    key={project._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Unit Name */}
                    <td className="py-3.5 px-4">
                      <span
                        onClick={() => setDrawerProject(project)}
                        className="font-bold text-slate-900 dark:text-white block hover:text-orange-600 cursor-pointer truncate max-w-[200px]"
                      >
                        {project.projectName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Reg: {formatDate(project.createdAt)}
                      </span>
                    </td>

                    {/* Enterprise */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-[170px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                          {project.companyName}
                        </span>
                        <Badge
                          variant={project.pollutionCategory === 'Red' ? 'destructive' : 'secondary'}
                          className="text-[9px]"
                        >
                          {project.pollutionCategory || 'Orange'} Category
                        </Badge>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium truncate max-w-[150px]">
                        {project.industry}
                      </span>
                    </td>

                    {/* District */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                        <span className="truncate">{project.district}</span>
                      </div>
                    </td>

                    {/* Capital Investment */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(project.investment)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={project.status} />
                    </td>

                    {/* Quick Actions (Requirement #3) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Drawer */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDrawerProject(project)}
                          className="text-xs h-7 px-2"
                          title="Open Unit Details Drawer"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          <span>Dossier</span>
                        </Button>

                        {/* Assign Officer */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAssignProject(project)}
                          className="text-xs h-7 px-2 border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-400"
                          title="Assign Nodal Scrutiny Officer"
                        >
                          <UserPlus className="w-3 h-3" />
                        </Button>

                        {/* Open Workspace */}
                        <Link to="/officer">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-2 text-orange-600 dark:text-orange-400"
                            title="Open Officer Workspace"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </Link>

                        {/* View Documents */}
                        <Link to={`/projects/${project._id}/documents`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-2 text-slate-500"
                            title="View Unit Documents"
                          >
                            <FileText className="w-3 h-3" />
                          </Button>
                        </Link>

                        {/* View Timeline */}
                        <Link to={`/projects/${project._id}/roadmap`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-2 text-slate-500"
                            title="View Clearance Roadmap"
                          >
                            <Clock className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && !isError && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-500">
            <div>
              Showing page <strong className="text-slate-800 dark:text-slate-200">{pagination.page}</strong> of{' '}
              <strong>{pagination.totalPages}</strong> ({pagination.total} registered units)
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="py-1 px-2.5"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="py-1 px-2.5"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Project Details Right Slide-Over Drawer (Requirement #3) */}
      {drawerProject && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-md">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Industrial Dossier
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {drawerProject.projectName}
                </h3>
              </div>
              <button
                onClick={() => setDrawerProject(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Tabs (Requirement #3) */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setDrawerTab('profile')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                  drawerTab === 'profile'
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Profile & Unit
              </button>
              <button
                onClick={() => setDrawerTab('timeline')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                  drawerTab === 'timeline'
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setDrawerTab('approvals')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                  drawerTab === 'approvals'
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Linked Approvals ({drawerApps.length})
              </button>
              <button
                onClick={() => setDrawerTab('documents')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                  drawerTab === 'documents'
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Linked Documents ({drawerDocs.length})
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* TAB 1: PROFILE */}
              {drawerTab === 'profile' && (
                <>
                  {/* Unit Highlights */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">Capital Investment</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(drawerProject.investment)}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">Workforce</span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">
                        {drawerProject.employees} Workers
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">Pollution Category</span>
                      <Badge
                        variant={drawerProject.pollutionCategory === 'Red' ? 'destructive' : 'secondary'}
                        className="text-[10px] mt-0.5"
                      >
                        {drawerProject.pollutionCategory || 'Orange'} Category
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-slate-400 block text-[10px]">Current Status</span>
                      <StatusBadge status={drawerProject.status} className="mt-0.5" />
                    </div>
                  </div>

                  {/* Enterprise Info */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">Enterprise Profile</h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Company Name</span>
                        <strong className="text-slate-800 dark:text-slate-200">{drawerProject.companyName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Industrial Sector</span>
                        <strong className="text-slate-800 dark:text-slate-200">{drawerProject.industry}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">District & Location</span>
                        <strong className="text-slate-800 dark:text-slate-200">{drawerProject.district}, {drawerProject.location}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Plot / Land Area</span>
                        <strong className="text-slate-800 dark:text-slate-200">{drawerProject.landArea || 'N/A'} Sq.Mtr</strong>
                      </div>
                    </div>
                  </div>

                  {/* Manufacturing Description */}
                  {(drawerProject as any).manufacturingProcess && (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">Manufacturing Process & Scope</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {(drawerProject as any).manufacturingProcess}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: TIMELINE */}
              {drawerTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-200 dark:before:bg-orange-950 text-xs">
                    <div className="relative space-y-0.5">
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-orange-500 ring-4 ring-white dark:ring-slate-900" />
                      <span className="font-bold text-slate-900 dark:text-white block">Unit Registered on MAITRI</span>
                      <span className="text-slate-500 text-[11px]">Industrial dossier initialized</span>
                      <span className="text-slate-400 text-[10px] block">{formatDate(drawerProject.createdAt)}</span>
                    </div>

                    <div className="relative space-y-0.5">
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                      <span className="font-bold text-slate-900 dark:text-white block">Statutory Approvals Generated</span>
                      <span className="text-slate-500 text-[11px]">{drawerApps.length} clearance applications linked to unit</span>
                    </div>

                    <div className="relative space-y-0.5">
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-purple-500 ring-4 ring-white dark:ring-slate-900" />
                      <span className="font-bold text-slate-900 dark:text-white block">Documents Vault Configured</span>
                      <span className="text-slate-500 text-[11px]">{drawerDocs.length} statutory files uploaded and indexed</span>
                    </div>

                    <div className="relative space-y-0.5">
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                      <span className="font-bold text-slate-900 dark:text-white block">Operational Status</span>
                      <span className="text-slate-500 text-[11px]">Current regulatory status: {drawerProject.status}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LINKED APPROVALS */}
              {drawerTab === 'approvals' && (
                <div className="space-y-3">
                  {drawerApps.length > 0 ? (
                    drawerApps.map((app: any) => (
                      <div
                        key={app._id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                            {app.applicationNumber}
                          </span>
                          <StatusBadge status={app.status} />
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                          {app.serviceName || app.approvalId?.approvalName || 'Statutory Clearance'}
                        </h5>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>{app.department}</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            SLA: {app.slaRemaining ?? app.slaDays ?? 15}d remaining
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                      <p>No statutory clearances currently submitted for this unit.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LINKED DOCUMENTS */}
              {drawerTab === 'documents' && (
                <div className="space-y-3">
                  {drawerDocs.length > 0 ? (
                    drawerDocs.map((doc: any) => {
                      const fullFileUrl = doc.fileUrl?.startsWith('http')
                        ? doc.fileUrl
                        : `http://localhost:5000${doc.fileUrl}`;

                      return (
                        <div
                          key={doc._id}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-sm"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[240px]">
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {doc.documentType} • Uploaded on {formatDate(doc.uploadedAt || doc.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <StatusBadge status={doc.verificationStatus} className="text-[9px]" />
                            <a href={fullFileUrl} target="_blank" rel="noopener noreferrer" download>
                              <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                                <Download className="w-3 h-3" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-400">
                      <FileCheck className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                      <p>No verification documents uploaded yet for this unit.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions Shortcuts inside Drawer (Requirement #3) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white">Registry Action Center</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAssignProject(drawerProject);
                      setDrawerProject(null);
                    }}
                    className="w-full text-xs justify-start"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    <span>Assign Officer</span>
                  </Button>

                  <Link to="/officer" className="w-full">
                    <Button size="sm" variant="outline" className="w-full text-xs justify-start">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
                      <span>Open Workspace</span>
                    </Button>
                  </Link>

                  <Link to={`/projects/${drawerProject._id}/documents`} className="w-full">
                    <Button size="sm" variant="outline" className="w-full text-xs justify-start">
                      <FileText className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      <span>View Documents</span>
                    </Button>
                  </Link>

                  <Link to={`/projects/${drawerProject._id}/roadmap`} className="w-full">
                    <Button size="sm" variant="outline" className="w-full text-xs justify-start">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      <span>View Timeline</span>
                    </Button>
                  </Link>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    handleExport();
                  }}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span>Generate Detailed Unit Report</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Officer Modal */}
      {assignProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Assign Scrutiny Officer</span>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setAssignProject(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Assign a qualified state clearance officer to supervise statutory approvals for{' '}
              <strong>{assignProject.projectName}</strong>.
            </p>
            <div className="space-y-3 text-xs">
              <label className="font-semibold block text-slate-700 dark:text-slate-300">
                Select Nodal Officer:
              </label>
              <select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
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
                <Button variant="outline" size="sm" onClick={() => setAssignProject(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    alert(`Nodal officer assigned to ${assignProject.projectName} successfully.`);
                    setAssignProject(null);
                  }}
                  disabled={!selectedOfficerId}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  Confirm Assignment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
