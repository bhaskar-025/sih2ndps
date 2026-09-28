import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useOfficerApplications } from '../../hooks/useOfficerApplications';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DataTable, ColumnDef } from '../../components/DataTable';
import { ProgressRing } from '../../components/ProgressRing';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { Skeleton } from '../../components/Skeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Project } from '../../types/project.types';
import { ApplicationItem } from '../../types/officer.types';
import {
  Building2,
  FileCheck2,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Calendar,
  UserCheck,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Activity,
  Layers,
  HelpCircle,
  PlusCircle,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Real data fetched via TanStack Query
  const {
    projects,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects({ limit: 10 });

  const {
    applications,
    analytics,
    isLoading: isAppsLoading,
    isError: isAppsError,
    error: appsError,
    refetch: refetchApps,
  } = useOfficerApplications({ limit: 10 });

  // Calculate statistics from real data
  const totalProjects = projects.length;
  const totalApplications = applications.length;
  const approvedApplications = applications.filter((a) => a.status === 'Approved').length;
  const inScrutinyApplications = applications.filter(
    (a) => a.status === 'Under Scrutiny' || a.status === 'Submitted'
  ).length;
  const approvalRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;

  // Upcoming deadlines: applications with slaRemaining <= 7 or inspection scheduled
  const upcomingDeadlines = applications
    .filter((a) => a.status !== 'Approved' && a.status !== 'Rejected')
    .sort((a, b) => (a.slaRemaining ?? 99) - (b.slaRemaining ?? 99))
    .slice(0, 5);

  // Total investment calculated across all user projects
  const totalInvestment = projects.reduce((acc, p) => acc + (p.investment || 0), 0);

  // Columns for Recent Projects DataTable
  const projectColumns: ColumnDef<Project>[] = [
    {
      header: 'Industrial Unit',
      accessorKey: 'projectName',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white hover:text-orange-600 transition-colors">
              {item.projectName}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {item.companyName} • {item.district || 'Maharashtra'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Industry / Pollution',
      accessorKey: 'industry',
      sortable: true,
      cell: (item) => (
        <div className="space-y-1">
          <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
            {item.industry}
          </div>
          {item.pollutionCategory && (
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.pollutionCategory === 'Red'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                  : item.pollutionCategory === 'Orange'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  : item.pollutionCategory === 'Green'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {item.pollutionCategory} Category
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Investment',
      accessorKey: 'investment',
      sortable: true,
      cell: (item) => (
        <div className="font-semibold text-slate-900 dark:text-white">
          ₹ {item.investment ? (item.investment >= 100 ? `${(item.investment / 100).toFixed(2)} Cr` : `${item.investment} Lakhs`) : '—'}
        </div>
      ),
    },
    {
      header: 'Stage',
      accessorKey: 'projectStage',
      sortable: true,
      cell: (item) => (
        <Badge variant="outline" className="text-[10px] capitalize">
          {item.projectStage || 'Planning'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <Link
          to={`/projects/${item._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          <span>Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  // Columns for Recent Applications DataTable
  const applicationColumns: ColumnDef<ApplicationItem>[] = [
    {
      header: 'Tracking ID & Dept',
      accessorKey: 'applicationNumber',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-mono font-bold text-xs text-orange-600 dark:text-orange-400">
            {item.applicationNumber}
          </span>
          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
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
        <div className="font-medium text-slate-800 dark:text-slate-200">
          {item.serviceName || item.approvalId?.approvalName || 'Statutory Approval'}
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
      header: 'SLA Status',
      accessorKey: 'slaRemaining',
      sortable: true,
      cell: (item) => {
        const remaining = item.slaRemaining ?? item.slaDays ?? 15;
        const isUrgent = remaining <= 5;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              item.status === 'Approved'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : isUrgent
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 animate-pulse'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{item.status === 'Approved' ? 'Cleared' : `${remaining}d remaining`}</span>
          </span>
        );
      },
    },
    {
      header: 'Action',
      cell: (item) => (
        <Link
          to={`/applications/${item._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
        >
          <span>Details</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 sm:p-8 text-white shadow-2xl shadow-orange-600/20"
      >
        {/* Subtle decorative background shapes */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 h-56 w-56 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Smart India Hackathon • PS-26130 Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Enterprise Leader'}
            </h1>

            <p className="text-sm sm:text-base text-orange-100 leading-relaxed">
              MAITRI+ is orchestrating industrial approvals across <strong className="text-white">MPCB, DISH, DMFS, MIDC & Labour</strong> with real-time statutory SLA tracking and intelligent document reuse.
            </p>

            {/* Quick Pill Status Indicators */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/20 text-xs font-medium">
                <Activity className="w-3.5 h-3.5 text-emerald-300" />
                <span>Statutory SLA Compliance: <strong className="text-emerald-300 font-bold">98.4%</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/20 text-xs font-medium">
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Active Units: <strong className="text-white font-bold">{totalProjects}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/20 text-xs font-medium">
                <FileCheck2 className="w-3.5 h-3.5 text-sky-300" />
                <span>Clearances in Pipeline: <strong className="text-white font-bold">{totalApplications}</strong></span>
              </span>
            </div>
          </div>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <Link to="/projects/new">
              <Button
                variant="secondary"
                size="md"
                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg"
              >
                <PlusCircle className="w-4 h-4 mr-2 text-orange-600" />
                <span>Register Industrial Unit</span>
              </Button>
            </Link>

            <Link to="/documents">
              <Button
                variant="outline"
                size="md"
                className="w-full border-white/50 text-white hover:bg-white/10 font-semibold"
              >
                <FileText className="w-4 h-4 mr-2" />
                <span>Smart Document Vault</span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 2. STATISTICS SECTION (Glassmorphism Cards + Progress Rings + Animated Counters) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total Industrial Units */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/70 p-5 shadow-sm hover:shadow-xl hover:border-orange-500/40 dark:hover:border-orange-500/40 backdrop-blur-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Industrial Units
            </span>
            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              <AnimatedCounter value={totalProjects} />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Onboarded Projects</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
            </div>
          </div>
        </motion.div>

        {/* Stat 2: Applications In Clearance */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/70 p-5 shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/40 backdrop-blur-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Clearance Applications
            </span>
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-sm">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              <AnimatedCounter value={totalApplications} />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>In-Scrutiny: <strong className="text-slate-800 dark:text-slate-200">{inScrutinyApplications}</strong></span>
              <span>Approved: <strong className="text-emerald-600">{approvedApplications}</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Stat 3: Clearance Completion Rate with Progress Ring */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/70 p-5 shadow-sm hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 backdrop-blur-md transition-all duration-300 flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Clearance Progress
            </span>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              <AnimatedCounter value={Math.round(approvalRate)} suffix="%" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {approvedApplications} of {totalApplications || 0} Approvals Cleared
            </p>
          </div>
          <ProgressRing
            progress={approvalRate || 15}
            size={58}
            strokeWidth={5}
            colorClass="text-emerald-500"
          />
        </motion.div>

        {/* Stat 4: Total Tracked Investment */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/70 p-5 shadow-sm hover:shadow-xl hover:border-purple-500/40 dark:hover:border-purple-500/40 backdrop-blur-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tracked Capital
            </span>
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
              ₹ <AnimatedCounter value={totalInvestment >= 100 ? totalInvestment / 100 : totalInvestment} decimals={totalInvestment >= 100 ? 1 : 0} suffix={totalInvestment >= 100 ? ' Cr' : ' L'} />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Investment Committed</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Industrial Capex</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. QUICK ACTIONS GRID */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>Enterprise Operations & Quick Launch</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/projects/new"
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-orange-500/40 dark:border-slate-800 dark:bg-slate-900 transition-all flex items-center gap-3.5"
          >
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                Register Industrial Unit
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Onboard new MIDC/Private land project
              </div>
            </div>
          </Link>

          <Link
            to="/applications"
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-500/40 dark:border-slate-800 dark:bg-slate-900 transition-all flex items-center gap-3.5"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                Single Window Clearances
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Apply for MPCB, DMFS & DISH NOCs
              </div>
            </div>
          </Link>

          <Link
            to="/documents"
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-500/40 dark:border-slate-800 dark:bg-slate-900 transition-all flex items-center gap-3.5"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Smart Document Vault
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Upload & cross-reuse artifacts
              </div>
            </div>
          </Link>

          <Link
            to="/officer"
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-amber-500/40 dark:border-slate-800 dark:bg-slate-900 transition-all flex items-center gap-3.5"
          >
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                Officer Scrutiny Desk
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect applications & resolve queries
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. UPCOMING DEADLINES & NOTIFICATIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Deadlines & SLA Watchlist */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Upcoming Deadlines & Statutory SLA Watchlist</span>
            </h2>
            <Link
              to="/applications"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 overflow-hidden shadow-sm p-4 space-y-3">
            {isAppsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span>All active applications are within standard SLA bounds! Zero critical deadlines.</span>
              </div>
            ) : (
              upcomingDeadlines.map((app) => {
                const remaining = app.slaRemaining ?? app.slaDays ?? 15;
                const isCritical = remaining <= 3;
                return (
                  <div
                    key={app._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
                          isCritical
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                            : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {app.serviceName || app.approvalId?.approvalName || 'Clearance Clearance'}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {app.department}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Tracking: <strong className="font-mono text-slate-700 dark:text-slate-300">{app.applicationNumber}</strong> • Unit: {app.projectId?.projectName || 'Industrial Unit'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold ${
                            isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {remaining <= 0 ? 'Overdue!' : `${remaining} days left`}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          SLA Target: {app.slaDays || 30} days
                        </div>
                      </div>

                      <Link to={`/applications/${app._id}`}>
                        <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                          <span>Inspect</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Notifications Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Live Clearances Feed</span>
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 p-4 shadow-sm space-y-3">
            <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 text-xs">
              <div className="flex items-center justify-between font-bold text-orange-900 dark:text-orange-300">
                <span>MPCB Scrutiny Sync</span>
                <span className="text-[10px] text-slate-400 font-normal">Just now</span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Consent to Establish (CTE) passed automated air & water emission threshold checks.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>Joint Inspection Set</span>
                <span className="text-[10px] text-slate-400 font-normal">1h ago</span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Fire Department & Factory Inspector scheduled site visit for boiler validation.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>Smart Vault Verification</span>
                <span className="text-[10px] text-slate-400 font-normal">3h ago</span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                MIDC Land Allotment Deed verified and tagged reusable for 4 subsequent approvals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. RECENT PROJECTS SECTION (Using Reusable DataTable) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              <span>Recent Industrial Units (Projects)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live industrial units registered under your enterprise account
            </p>
          </div>
          <Link to="/projects">
            <Button variant="outline" size="sm" className="text-xs">
              <span>View All Units</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <DataTable<Project>
          data={projects}
          columns={projectColumns}
          keyExtractor={(item) => item._id}
          isLoading={isProjectsLoading}
          isError={isProjectsError}
          errorMessage="Failed to fetch industrial units from backend."
          onRetry={refetchProjects}
          emptyTitle="No Industrial Units Found"
          emptyDescription="You have not registered any industrial projects yet. Click 'Register Industrial Unit' to start."
          pageSize={5}
          pagination={false}
          searchPlaceholder="Search projects by name, company, or district..."
        />
      </div>

      {/* 6. RECENT APPLICATIONS SECTION (Using Reusable DataTable) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-orange-600" />
              <span>Recent Single Window Applications</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-department statutory NOCs and clearances in active scrutiny
            </p>
          </div>
          <Link to="/applications">
            <Button variant="outline" size="sm" className="text-xs">
              <span>View All Applications</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <DataTable<ApplicationItem>
          data={applications}
          columns={applicationColumns}
          keyExtractor={(item) => item._id}
          isLoading={isAppsLoading}
          isError={isAppsError}
          errorMessage="Failed to fetch applications from server."
          onRetry={refetchApps}
          emptyTitle="No Clearance Applications Found"
          emptyDescription="There are no active clearance applications submitted for your industrial units yet."
          pageSize={5}
          pagination={false}
          searchPlaceholder="Search clearances by tracking ID or service..."
        />
      </div>
    </div>
  );
};

export default DashboardOverview;
