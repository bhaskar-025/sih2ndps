import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '../../services/projectService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Building2,
  MapPin,
  TrendingUp,
  Cpu,
  Droplets,
  Zap,
  Users,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Edit2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-in fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <ErrorState
          message={(error as Error)?.message || 'Unable to load project docket from MongoDB'}
          onRetry={() => refetch()}
        />
        <div className="mt-4 text-center">
          <Link to="/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Back to Projects List</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate simulated stage completion percentage
  const stageWeights: Record<string, number> = {
    Planning: 20,
    Land_Acquisition: 40,
    Clearance_In_Progress: 60,
    Construction: 85,
    Operational: 100,
  };
  const progressPercent = stageWeights[project.projectStage] || 35;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/projects"
          className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects Registry</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to={`/projects/${project._id}/roadmap`}>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-md">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>Generate Approval Roadmap</span>
            </Button>
          </Link>
          <Link to={`/projects/${project._id}/edit`}>
            <Button variant="outline" size="sm" className="text-xs">
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Edit Project Dossier</span>
            </Button>
          </Link>
          <Link to="/applications">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              <span>Single Window NOC</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Project Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="saffron">{project.projectType} Unit</Badge>
              <Badge variant={project.pollutionCategory === 'Red' ? 'destructive' : 'secondary'}>
                {project.pollutionCategory} Category
              </Badge>
              <span className="text-slate-400 text-xs">&bull;</span>
              <span className="text-xs text-slate-300">Stage: {project.projectStage.replace(/_/g, ' ')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {project.projectName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span>{project.companyName}</span>
              <span className="text-slate-500">&bull;</span>
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>{project.location}, {project.taluka}, {project.district}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={project.status} className="text-sm px-3 py-1" />
            <span className="text-[11px] text-slate-400">
              Registered on {formatDate(project.createdAt)}
            </span>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">
              Regulatory Approval & Commissioning Progress
            </span>
            <span className="font-mono font-bold text-orange-400">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Approval Intelligence Engine Feature Callout */}
      <div className="p-4 sm:p-5 rounded-2xl border-2 border-orange-500/30 bg-gradient-to-r from-orange-50 via-white to-amber-50 dark:from-slate-900 dark:via-navy-950 dark:to-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-orange-600 text-white flex-shrink-0 shadow-md shadow-orange-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Approval Intelligence Engine</span>
              <Badge variant="saffron" className="text-[10px]">Deterministic Rule Engine</Badge>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Automatically evaluate MPCB consent, DISH factory plans, DMFS fire clearance, and water/power requirements for this project.
            </p>
          </div>
        </div>
        <Link to={`/projects/${project._id}/roadmap`} className="flex-shrink-0">
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-md w-full sm:w-auto">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            <span>Generate Approval Roadmap</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards: Investment, Industry, Location, Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Investment */}
        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Capital Outlay</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {formatCurrency(project.investment)}
          </div>
          <p className="text-xs text-emerald-600 mt-0.5 font-medium">Eligible for PSI Subsidies</p>
        </Card>

        {/* Industry */}
        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Industry Sector</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-2 truncate">
            {project.industry}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Pollution Cat: {project.pollutionCategory}</p>
        </Card>

        {/* Location */}
        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>District & Jurisdiction</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-2">
            {project.district}, {project.taluka}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{project.village || 'MIDC Estate'}</p>
        </Card>

        {/* Status & Stage */}
        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Development Stage</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-2">
            {project.projectStage.replace(/_/g, ' ')}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Status: {project.status}</p>
        </Card>
      </div>

      {/* Infrastructure & Utilities Grid */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="w-4 h-4 text-orange-600" />
            <span>Industrial Infrastructure & Utility Allocations</span>
          </CardTitle>
          <CardDescription>
            Resource reservations sanctioned under MIDC and statutory utility boards.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Industrial Land Area</span>
              <div className="text-base font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {project.landArea} Acres
              </div>
              <span className="text-[10px] text-slate-500">MIDC Industrial Allotment</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-500" /> Direct Employment
              </span>
              <div className="text-base font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {project.employees} Personnel
              </div>
              <span className="text-[10px] text-slate-500">Local Hiring &gt; 70%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-500" /> Water Requirement
              </span>
              <div className="text-base font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {project.waterRequirement} KLD
              </div>
              <span className="text-[10px] text-slate-500">Zero Liquid Discharge (ZLD)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Power Load
              </span>
              <div className="text-base font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {project.powerRequirement} KW
              </div>
              <span className="text-[10px] text-slate-500">MSEDCL 33kV Dedicated Line</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs / Multi-card Grid: Applications & Documents & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications attached to Project */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span>Single Window Applications ({project.applications?.length || 0})</span>
              </CardTitle>
              <CardDescription>Departmental clearances linked to this unit</CardDescription>
            </div>
            <Link to="/applications">
              <Button variant="ghost" size="sm" className="text-xs">
                <span>View Full Pipeline</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {project.applications && project.applications.length > 0 ? (
              project.applications.map((app) => (
                <div
                  key={app._id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-orange-600 dark:text-orange-400 font-bold block">
                      {app.applicationNumber}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {app.serviceName}
                    </span>
                    <span className="text-slate-400 text-[10px]">Stage: {app.currentStage}</span>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                <FileText className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <p>No statutory clearances filed yet for this unit.</p>
                <Link to="/applications" className="text-orange-600 hover:underline font-semibold mt-1 inline-block">
                  Apply for MPCB CTE / Fire NOC
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline & Audit Trail */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Project Audit Trail & Timeline</span>
            </CardTitle>
            <CardDescription>Milestones recorded in immutable audit log</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-200 dark:before:bg-orange-950 text-xs">
              <div className="relative space-y-0.5">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                <span className="font-bold text-slate-900 dark:text-white block">
                  Industrial Unit Registered
                </span>
                <span className="text-[11px] text-slate-500">
                  Dossier logged with status: <strong>{project.status}</strong>
                </span>
                <span className="text-[10px] text-slate-400 block">{formatDate(project.createdAt)}</span>
              </div>

              <div className="relative space-y-0.5">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-orange-500 ring-4 ring-white dark:ring-slate-900" />
                <span className="font-bold text-slate-900 dark:text-white block">
                  Stage Updated: {project.projectStage.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-slate-500">
                  Resource allocations assigned for {project.district} District
                </span>
                <span className="text-[10px] text-slate-400 block">{formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetails;
