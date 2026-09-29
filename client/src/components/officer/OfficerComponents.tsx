import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  UserCheck,
  Building2,
  CalendarCheck,
  FileCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Button } from '../Button';
import { formatDate } from '../../utils/formatters';

// 1. RiskBadge
export const RiskBadge: React.FC<{ risk?: string; score?: number; className?: string }> = ({
  risk = 'Low',
  score,
  className = '',
}) => {
  const normalized = (risk || 'Low').toLowerCase();
  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
  let Icon = ShieldCheck;

  if (normalized.includes('high') || normalized.includes('crit') || (score && score > 70)) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 animate-pulse';
    Icon = ShieldAlert;
  } else if (normalized.includes('med') || (score && score > 35)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    Icon = AlertTriangle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${bg} ${className}`}
    >
      <Icon className="w-3 h-3" />
      <span>{risk} Risk {score !== undefined ? `(${score}%)` : ''}</span>
    </span>
  );
};

// 2. PriorityBadge
export const PriorityBadge: React.FC<{ priority?: string; className?: string }> = ({
  priority = 'Normal',
  className = '',
}) => {
  const norm = (priority || 'Normal').toLowerCase();
  let style = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  if (norm.includes('crit')) {
    style = 'bg-red-600 text-white dark:bg-red-600 dark:text-white font-extrabold shadow-sm';
  } else if (norm.includes('urg')) {
    style = 'bg-orange-500 text-white font-bold';
  } else if (norm.includes('high')) {
    style = 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-200';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${style} ${className}`}>
      {norm.includes('crit') && <Flame className="w-3 h-3 text-yellow-300 fill-yellow-300" />}
      <span>{priority}</span>
    </span>
  );
};

// 3. DocumentStatus
export const DocumentStatus: React.FC<{
  status?: string;
  ocrVerified?: boolean;
  digitallySigned?: boolean;
  confidenceScore?: number;
}> = ({ status = 'Verified', ocrVerified, digitallySigned, confidenceScore }) => {
  const norm = (status || 'Pending').toLowerCase();
  let color = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200';
  let Icon = HelpCircle;

  if (norm.includes('verif') || norm.includes('valid') || norm.includes('approved')) {
    color = 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
    Icon = CheckCircle2;
  } else if (norm.includes('reject') || norm.includes('missing') || norm.includes('expired')) {
    color = 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200';
    Icon = XCircle;
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        <span>{status}</span>
      </span>
      {ocrVerified && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
          <FileCheck className="w-2.5 h-2.5" />
          OCR Verified
        </span>
      )}
      {digitallySigned && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300">
          <ShieldCheck className="w-2.5 h-2.5" />
          e-Sign Valid
        </span>
      )}
      {confidenceScore !== undefined && (
        <span className="text-[10px] font-mono text-slate-500">
          {confidenceScore}% conf.
        </span>
      )}
    </div>
  );
};

// 4. StatCard
export const StatCard: React.FC<{
  title: string;
  value: number | string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'default' | 'primary' | 'warning' | 'danger' | 'success' | 'purple';
  trend?: string;
  onClick?: () => void;
}> = ({ title, value, subtext, icon: Icon, color = 'default', trend, onClick }) => {
  const colorMap = {
    default: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
    primary: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300',
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300',
    danger: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300',
    success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300',
  };

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={`p-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-orange-500' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{title}</span>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
          {value}
        </div>
        {trend && (
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="text-[11px] text-slate-400 mt-1 truncate">{subtext}</p>}
    </Card>
  );
};

// 5. OfficerCard
export const OfficerCard: React.FC<{
  name: string;
  email: string;
  department: string;
  activeCases: number;
  phone?: string;
  onAssign?: () => void;
}> = ({ name, email, department, activeCases, phone, onAssign }) => {
  return (
    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md hover:border-orange-500/50 transition-all flex items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{name}</h4>
          <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{department}</p>
          <p className="text-[10px] text-slate-400 font-mono">{email} {phone ? `• ${phone}` : ''}</p>
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-1">
        <Badge variant={activeCases > 5 ? 'destructive' : activeCases > 0 ? 'saffron' : 'secondary'} className="text-[10px]">
          {activeCases} Active Cases
        </Badge>
        {onAssign && (
          <Button size="sm" variant="outline" onClick={onAssign} className="text-[10px] h-6 px-2">
            Assign Case
          </Button>
        )}
      </div>
    </div>
  );
};

// 6. ApplicationCard
export const ApplicationCard: React.FC<{
  applicationNumber: string;
  projectName: string;
  department: string;
  serviceName: string;
  status: string;
  priority?: string;
  riskScore?: string | number;
  slaRemaining?: number;
  submittedAt?: string;
  onOpen: () => void;
}> = ({
  applicationNumber,
  projectName,
  department,
  serviceName,
  status,
  priority = 'Normal',
  riskScore = 'Low',
  slaRemaining = 15,
  submittedAt,
  onOpen,
}) => {
  return (
    <div
      onClick={onOpen}
      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:border-orange-500 hover:shadow-md cursor-pointer transition-all space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
          {applicationNumber}
        </span>
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={priority} />
          <RiskBadge risk={typeof riskScore === 'number' ? (riskScore > 60 ? 'High' : 'Low') : riskScore} />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{projectName}</h4>
        <p className="text-xs text-slate-500 truncate">{serviceName} • {department}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
          <Clock className="w-3 h-3 text-blue-600" />
          {slaRemaining} days SLA
        </span>
        <span className="text-[11px] text-slate-400">
          {submittedAt ? formatDate(submittedAt) : 'Pending'}
        </span>
      </div>
    </div>
  );
};

// 7. InspectionCard
export const InspectionCard: React.FC<{
  projectName: string;
  applicationNumber: string;
  inspectorName?: string;
  inspectionDate: string;
  status: 'Scheduled' | 'Completed' | 'Pending Report' | 'Cancelled';
  result?: 'Pass' | 'Fail' | 'Conditional';
  location?: string;
  onAction?: () => void;
}> = ({
  projectName,
  applicationNumber,
  inspectorName = 'Assigned Officer',
  inspectionDate,
  status,
  result,
  location = 'Maharashtra Site',
  onAction,
}) => {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <Badge variant={status === 'Completed' ? 'success' : 'saffron'} className="text-[10px]">
          {status}
        </Badge>
        {result && (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              result === 'Pass'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : result === 'Fail'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            Audit: {result}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{projectName}</h4>
        <p className="text-[11px] font-mono text-slate-500">{applicationNumber}</p>
        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-red-500" />
          <span className="truncate">{location}</span>
        </p>
      </div>
      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-slate-500 flex items-center gap-1">
          <CalendarCheck className="w-3 h-3 text-blue-600" />
          {formatDate(inspectionDate)}
        </span>
        {onAction && (
          <Button size="sm" variant="ghost" onClick={onAction} className="text-[11px] h-6 px-2">
            Review Report &rarr;
          </Button>
        )}
      </div>
    </div>
  );
};

// 8. ComplianceCard
export const ComplianceCard: React.FC<{
  title: string;
  dueDate: string;
  department: string;
  status: 'Compliant' | 'Pending' | 'Overdue' | 'Upcoming';
  penaltyRisk?: string;
  officerResponsible?: string;
  onSendNotice?: () => void;
}> = ({
  title,
  dueDate,
  department,
  status,
  penaltyRisk,
  officerResponsible = 'Nodal Officer',
  onSendNotice,
}) => {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {department}
        </span>
        <Badge
          variant={
            status === 'Compliant'
              ? 'success'
              : status === 'Overdue'
              ? 'destructive'
              : 'warning'
          }
          className="text-[10px]"
        >
          {status}
        </Badge>
      </div>
      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h4>
      <div className="text-[11px] text-slate-500 space-y-1">
        <p>Due: <strong className="text-slate-700 dark:text-slate-300">{formatDate(dueDate)}</strong></p>
        {penaltyRisk && (
          <p className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Risk: {penaltyRisk}
          </p>
        )}
        <p className="text-slate-400">Officer: {officerResponsible}</p>
      </div>
      {onSendNotice && (
        <div className="pt-2">
          <Button size="sm" variant="outline" onClick={onSendNotice} className="w-full text-xs h-7">
            Generate Notice
          </Button>
        </div>
      )}
    </div>
  );
};

// 9. DepartmentCard
export const DepartmentCard: React.FC<{
  name: string;
  code: string;
  officerCount: number;
  pendingCases: number;
  completedCases: number;
  averageSla: number;
  performancePercent: number;
  jurisdiction: string;
  onOpen?: () => void;
}> = ({
  name,
  code,
  officerCount,
  pendingCases,
  completedCases,
  averageSla,
  performancePercent,
  jurisdiction,
  onOpen,
}) => {
  return (
    <Card hover className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="saffron" className="text-[10px] font-mono">
          {code}
        </Badge>
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          {performancePercent}% SLA Compliance
        </span>
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{name}</h4>
        <p className="text-xs text-slate-500">{jurisdiction}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
        <div>
          <span className="text-[10px] text-slate-400 block">Officers</span>
          <strong className="text-xs font-mono text-slate-900 dark:text-white">{officerCount}</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Pending</span>
          <strong className="text-xs font-mono text-amber-600">{pendingCases}</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Avg SLA</span>
          <strong className="text-xs font-mono text-blue-600">{averageSla}d</strong>
        </div>
      </div>
      {onOpen && (
        <Button size="sm" variant="outline" onClick={onOpen} className="w-full text-xs h-7 mt-2">
          <span>View Registry & Clearances</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      )}
    </Card>
  );
};

// 10. AnalyticsChart
export const AnalyticsChart: React.FC<{
  title: string;
  data: { label: string; value: number }[];
  type?: 'bar' | 'pie';
  height?: number;
}> = ({ title, data, type = 'bar', height = 220 }) => {
  const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
        {title}
      </h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// 11. TimelineComponent
export const TimelineComponent: React.FC<{
  events: {
    status: string;
    remarks?: string;
    updatedBy?: string;
    timestamp: string;
  }[];
}> = ({ events }) => {
  if (!events || events.length === 0) {
    return <p className="text-xs text-slate-400 italic">No timeline events recorded.</p>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {events.map((ev, idx) => (
        <div key={idx} className="relative group">
          <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900 group-hover:scale-125 transition-transform" />
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">{ev.status}</span>
              <span className="text-[10px] text-slate-400">{formatDate(ev.timestamp)}</span>
            </div>
            {ev.remarks && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{ev.remarks}</p>
            )}
            {ev.updatedBy && (
              <p className="text-[10px] text-slate-400 mt-1">Recorded by: {ev.updatedBy}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
