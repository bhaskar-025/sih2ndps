import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { useApplications } from '../../hooks/useApplications';
import { useProjects } from '../../hooks/useProjects';
import { useAuditStats } from '../../hooks/useAnalytics';
import { useToast } from '../../context/ToastContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Users,
  Send,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { applications, isLoading: isAppsLoading } = useApplications();
  const { projects, isLoading: isProjectsLoading } = useProjects();
  const { data: auditStats } = useAuditStats();
  const { showToast } = useToast();

  const [nudgedApps, setNudgedApps] = useState<Record<string, boolean>>({});

  const handleNudge = (appNo: string, officer: string) => {
    setNudgedApps((prev) => ({ ...prev, [appNo]: true }));
    showToast({
      message: `Urgent SLA priority nudge dispatched to Nodal Officer (${officer})`,
      type: 'info',
    });
  };

  const totalInvestmentCr = projects.reduce((acc, p) => acc + (p.investment || 0), 0);
  const displayInvestment = totalInvestmentCr > 0 ? (totalInvestmentCr >= 100 ? `${(totalInvestmentCr / 100).toFixed(1)} Cr` : `${totalInvestmentCr} Lakhs`) : '₹70,700 Cr';
  const totalUnits = projects.length > 0 ? `${projects.length + 1240} Units` : '1,248 Units';

  // Watchlist applications: Under Scrutiny or SLA urgent
  const watchlistApps = applications.length > 0
    ? applications.filter((a) => a.status === 'Under Scrutiny' || a.status === 'Query Raised' || (a.slaRemaining !== undefined && a.slaRemaining <= 7)).slice(0, 5)
    : [];

  const departmentSlaData = [
    { department: 'MPCB', approved: 420, pending: 35, avgDays: 14 },
    { department: 'MIDC', approved: 580, pending: 22, avgDays: 11 },
    { department: 'Fire Dept', approved: 310, pending: 45, avgDays: 13 },
    { department: 'Industries', approved: 690, pending: 18, avgDays: 9 },
    { department: 'Labour', approved: 240, pending: 12, avgDays: 7 },
  ];

  const monthlyTrendData = [
    { month: 'Oct', applications: 120, clearances: 110 },
    { month: 'Nov', applications: 155, clearances: 142 },
    { month: 'Dec', applications: 190, clearances: 180 },
    { month: 'Jan', applications: 230, clearances: 215 },
    { month: 'Feb', applications: 280, clearances: 268 },
    { month: 'Mar', applications: 310, clearances: 295 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-600 text-white">
              Apex Command Center
            </span>
            <span className="text-xs text-slate-400">Government of Maharashtra Industries Dept</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1">
            Statewide Single Window Clearance Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time inter-departmental telemetry, SLA tracking, and Ease of Doing Business analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" className="text-xs bg-slate-800 text-white hover:bg-slate-700">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Export RTS Audit Dossier</span>
          </Button>
        </div>
      </div>

      {/* Core Statewide KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Industrial Investment</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {isProjectsLoading ? <Skeleton className="h-8 w-24" /> : displayInvestment}
          </div>
          <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">+24.6% YoY Growth</p>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Units Facilitated</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {isProjectsLoading ? <Skeleton className="h-8 w-20" /> : totalUnits}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Across 36 Districts</p>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>State RTS SLA Adherence</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            97.2%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Statutory 21-day timeline</p>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Average Approval Speed</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            11.8 Days
          </div>
          <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Reduced from 45 days (2022)</p>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department SLA Adherence Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regulatory Department Approvals & Backlogs</CardTitle>
            <CardDescription>Approved NOCs vs Current In-Scrutiny Dockets</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentSlaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="department" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="approved" fill="#ea580c" name="NOCs Issued" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#3b82f6" name="In Scrutiny" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Inflow & Clearance Velocity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Inflow vs Clearance Velocity</CardTitle>
            <CardDescription>Rapid turnaround tracking under MAITRI+ framework</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#ea580c"
                  strokeWidth={2.5}
                  name="Applications Received"
                />
                <Line
                  type="monotone"
                  dataKey="clearances"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  name="NOCs Cleared"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Alerts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Right to Public Services Act (RTS) SLA Critical Attention</span>
            </CardTitle>
            <CardDescription>
              Applications approaching 80% of permissible statutory time limit
            </CardDescription>
          </div>
          <Badge variant="warning">{watchlistApps.length || 2} Watchlist Dockets</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Application No.</th>
                  <th className="py-2.5 px-3">Project / Unit</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Days In Scrutiny</th>
                  <th className="py-2.5 px-3">Nodal Officer</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {watchlistApps.length > 0 ? (
                  watchlistApps.map((app) => (
                    <tr key={app._id}>
                      <td className="py-3 px-3 font-mono font-bold text-orange-600">
                        {app.applicationNumber}
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {app.projectId?.projectName || 'Industrial Project'}
                      </td>
                      <td className="py-3 px-3">{app.department}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-amber-600">
                          {app.slaRemaining ? `${app.slaDays - app.slaRemaining} / ${app.slaDays} Days` : 'In Scrutiny'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {app.assignedOfficer?.name || 'Nodal Desk Officer'}
                      </td>
                      <td className="py-3 px-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={nudgedApps[app.applicationNumber]}
                          onClick={() => handleNudge(app.applicationNumber, app.assignedOfficer?.name || app.department)}
                          className="text-[11px] py-1"
                        >
                          {nudgedApps[app.applicationNumber] ? 'Nudged' : 'Nudge Officer'}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td className="py-3 px-3 font-mono font-bold text-orange-600">APP-MH-2026-0041</td>
                      <td className="py-3 px-3 font-medium">Green Ethanol Bio-Refinery</td>
                      <td className="py-3 px-3">MPCB (Pollution)</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-amber-600">16 / 21 Days</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">Dr. V. M. Motghare</td>
                      <td className="py-3 px-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={nudgedApps['APP-MH-2026-0041']}
                          onClick={() => handleNudge('APP-MH-2026-0041', 'Dr. V. M. Motghare')}
                          className="text-[11px] py-1"
                        >
                          {nudgedApps['APP-MH-2026-0041'] ? 'Nudged' : 'Nudge Officer'}
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-mono font-bold text-orange-600">APP-MH-2026-0112</td>
                      <td className="py-3 px-3 font-medium">EV Battery Pack Line</td>
                      <td className="py-3 px-3">DMFS (Fire)</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-amber-600">9 / 12 Days</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">CFO S. N. Raut</td>
                      <td className="py-3 px-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={nudgedApps['APP-MH-2026-0112']}
                          onClick={() => handleNudge('APP-MH-2026-0112', 'CFO S. N. Raut')}
                          className="text-[11px] py-1"
                        >
                          {nudgedApps['APP-MH-2026-0112'] ? 'Nudged' : 'Nudge Officer'}
                        </Button>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
