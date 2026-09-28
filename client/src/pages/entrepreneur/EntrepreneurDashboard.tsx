import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useOfficerApplications } from '../../hooks/useOfficerApplications';
import { useCompliance } from '../../hooks/useCompliance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { ProgressRing } from '../../components/ProgressRing';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { Skeleton } from '../../components/Skeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  TrendingUp,
  Coins,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, isLoading: isProjectsLoading } = useProjects();
  const { applications, isLoading: isAppsLoading, refetch: refetchApps } = useOfficerApplications();
  const { compliances, isLoading: isComplianceLoading } = useCompliance();

  const currentProject = projects[0];
  const totalInvestment = projects.reduce((sum, p) => sum + (p.investment || 0), 0);
  const approvedApps = applications.filter((a) => a.status === 'Approved').length;
  const totalApps = applications.length;
  const clearanceRate = totalApps > 0 ? (approvedApps / totalApps) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 sm:p-8 text-white shadow-xl shadow-orange-600/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Single Window Clearance & Tracking Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name}
            </h1>
            <p className="text-sm text-orange-100 max-w-2xl leading-relaxed">
              Managing <strong className="text-white underline">{user?.companyName || currentProject?.companyName || 'Industrial Enterprise Unit'}</strong>.
              Your applications are synchronized across MPCB, MIDC, DMFS, and Industries Department with real-time statutory SLA tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link to="/projects">
              <Button variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-md">
                <Building className="w-4 h-4 mr-1.5 text-orange-600" />
                <span>My Industrial Units</span>
              </Button>
            </Link>
            <Link to="/projects/new">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold">
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Register New Unit</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Investment</span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹ <AnimatedCounter value={totalInvestment >= 100 ? totalInvestment / 100 : totalInvestment} decimals={totalInvestment >= 100 ? 1 : 0} suffix={totalInvestment >= 100 ? ' Cr' : ' Lakhs'} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {currentProject?.projectName || `${projects.length} Industrial Units`}
            </p>
          </div>
        </Card>

        <Card hover className="rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Clearances Status</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {approvedApps} of {totalApps} Approved
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${clearanceRate}%` }}
              />
            </div>
          </div>
        </Card>

        <Card hover className="rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Turnaround</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">12 Days</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              46% faster than state benchmark
            </p>
          </div>
        </Card>

        <Card hover className="rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Subsidies Eligible</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">₹5.00 Cr</div>
            <p className="text-xs text-slate-500 mt-0.5">Package Scheme of Incentives (PSI)</p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Active Applications & Compliance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applications Tracker */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Single Window Industrial Approvals</CardTitle>
                <CardDescription>Real-time lifecycle & inter-departmental status</CardDescription>
              </div>
              <Link to="/applications">
                <Button variant="ghost" size="sm" className="text-xs">
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isAppsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : applications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active clearance applications found. Apply via your project approval roadmap.
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                            {app.applicationNumber}
                          </span>
                          <span className="text-xs text-slate-400">&bull;</span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {app.department}
                          </span>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {app.serviceName || app.approvalId?.approvalName || 'Clearance Service'}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          Stage: <strong className="text-slate-700 dark:text-slate-300">{app.currentStage}</strong>
                        </span>
                        <span>Submitted: {app.submittedAt ? formatDate(app.submittedAt) : 'Recent'}</span>
                      </div>

                      {app.remarks && (
                        <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200/50 text-orange-950 dark:bg-orange-950/20 dark:border-orange-900/40 dark:text-orange-300 text-xs">
                          <strong>Nodal Officer Note:</strong> {app.remarks}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Compliance & Schemes */}
        <div className="space-y-4">
          {/* Statutory Compliance Watch */}
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-orange-600" />
                  <span>Statutory Compliance</span>
                </CardTitle>
                <CardDescription>Mandatory recurring filings</CardDescription>
              </div>
              <Link to="/compliance">
                <Button variant="ghost" size="sm" className="text-xs">
                  <span>Details</span>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isComplianceLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : compliances.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  No statutory compliances due.
                </div>
              ) : (
                <div className="space-y-3">
                  {compliances.slice(0, 3).map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.complianceName}
                        </span>
                        <Badge
                          variant={
                            item.status === 'Completed'
                              ? 'success'
                              : item.status === 'Overdue'
                              ? 'destructive'
                              : item.status === 'Due Soon'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="text-[10px] shrink-0"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Due: {item.nextDueDate ? formatDate(item.nextDueDate) : 'Scheduled'}</span>
                        <span
                          className={`font-semibold ${
                            item.penaltyRisk === 'High'
                              ? 'text-rose-600 dark:text-rose-400'
                              : item.penaltyRisk === 'Medium'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          Risk: {item.penaltyRisk || 'Low'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matched Incentive Scheme */}
          <Card className="rounded-2xl bg-gradient-to-br from-slate-900 to-navy-950 text-white border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">
                  Matched Subsidy Program
                </span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <CardTitle className="text-white text-base mt-1">
                PSI 2019 Incentive Package
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Your industrial investment qualifies for up to 80% SGST refund and power tariff concessions under the Maharashtra Industrial Policy.
              </p>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 font-medium text-orange-300">
                Estimated Benefit: Up to ₹50,00,000 / year
              </div>
              <Link to="/schemes">
                <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold">
                  <span>Apply for Sanction Certificate</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurDashboard;
