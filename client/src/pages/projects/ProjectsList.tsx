import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Project, ProjectFilterParams } from '../../types/project.types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { TableSkeleton } from '../../components/Skeleton';
import { EmptyState, ErrorState } from '../../components/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
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
  const [projectStage, setProjectStage] = useState('ALL');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // TanStack Query: Fetch projects from backend
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects', { page, search, district, industry, status, projectStage, sort }],
    queryFn: () =>
      projectService.getProjects({
        page,
        limit: 10,
        search,
        district,
        industry,
        status,
        projectStage,
        sort,
      }),
  });

  // TanStack Mutation: Soft Delete project
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteConfirmId(null);
    },
  });

  const projects = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400">
              Industrial Units
            </span>
            <span className="text-xs text-slate-500">Total Registered: {pagination.total}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Projects Registry & Dockets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your industrial manufacturing facilities, clearance lifecycles, and statutory compliance files.
          </p>
        </div>

        <Link to="/projects/new">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Register New Industrial Project</span>
          </Button>
        </Link>
      </div>

      {/* Top Bar: Search, Filters & Sort */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar (4 cols) */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project name, company, or district..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* District Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Districts</option>
              {MAHARASHTRA_DISTRICTS.filter((d) => d !== 'ALL').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Filter (2 cols) */}
          <div className="md:col-span-3">
            <select
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500 truncate"
            >
              <option value="ALL">All Industries</option>
              {INDUSTRIES.filter((i) => i !== 'ALL').map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter (2 cols) */}
          <div className="md:col-span-1">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">Status</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Under_Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500"
            >
              <option value="-createdAt">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="investment_desc">Investment: High to Low</option>
              <option value="investment_asc">Investment: Low to High</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Remove Industrial Project?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will soft delete the project docket. Associated applications and approvals will be archived.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                isLoading={deleteMutation.isPending}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Data Table */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <div className="p-8">
            <ErrorState
              message={(error as Error)?.message || 'Failed to retrieve projects from database'}
              onRetry={() => refetch()}
            />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No Industrial Projects Found"
              description="No projects match your search or filter criteria. Register your first industrial unit to initiate statutory single window clearances."
              actionText="Register Industrial Project"
              onAction={() => navigate('/projects/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 backdrop-blur-md bg-slate-50/95 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Project Name</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Industry</th>
                  <th className="py-3.5 px-4">District</th>
                  <th className="py-3.5 px-4">Investment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map((project: Project) => (
                  <tr
                    key={project._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Project Name */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/projects/${project._id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors block max-w-xs truncate"
                      >
                        {project.projectName}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Type: {project.projectType}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium max-w-[150px] truncate">
                      {project.companyName}
                    </td>

                    {/* Industry */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium truncate max-w-[140px]">
                        {project.industry}
                      </span>
                    </td>

                    {/* District */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        <span>{project.district}</span>
                      </div>
                    </td>

                    {/* Investment */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(project.investment)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={project.status} />
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(project.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/projects/${project._id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                          title="View Project Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/projects/${project._id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Edit Project"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(project._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!isLoading && !isError && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-500">
            <div>
              Showing page <strong className="text-slate-800 dark:text-slate-200">{pagination.page}</strong> of{' '}
              <strong>{pagination.totalPages}</strong> (Total {pagination.total} units)
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
    </div>
  );
};

export default ProjectsList;
