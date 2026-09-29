import React from 'react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../Button';
import { Building2, Clock, MapPin, Eye, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export interface ApprovalCardProps {
  application: {
    _id: string;
    applicationNumber: string;
    serviceName: string;
    department: string;
    status: string;
    priority?: string;
    riskScore?: string;
    slaRemaining?: number;
    isOverdue?: boolean;
    submittedAt: string;
    projectId?: {
      projectName: string;
      companyName: string;
      district: string;
    };
    assignedOfficer?: {
      name: string;
    };
  };
  onReview: (app: any) => void;
  onQuickApprove?: (app: any) => void;
  onQuickQuery?: (app: any) => void;
  className?: string;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  application: app,
  onReview,
  onQuickApprove,
  onQuickQuery,
  className = '',
}) => {
  const slaRemaining = app.slaRemaining ?? 15;
  const isOverdue = app.isOverdue || slaRemaining <= 0;

  const slaBadgeVariant = isOverdue
    ? 'destructive'
    : slaRemaining <= 5
    ? 'warning'
    : 'success';

  const riskBadgeVariant =
    app.riskScore === 'High'
      ? 'destructive'
      : app.riskScore === 'Medium'
      ? 'warning'
      : 'success';

  return (
    <Card hover className={`p-4 border transition-all ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="saffron" className="text-[10px]">
              {app.department}
            </Badge>
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              {app.applicationNumber}
            </span>
            <Badge variant={riskBadgeVariant} className="text-[9px] uppercase font-bold">
              {app.riskScore || 'Low'} Risk
            </Badge>
            <Badge variant={slaBadgeVariant} className="text-[9px] font-mono font-bold">
              {isOverdue ? 'Overdue' : `${slaRemaining} Days Left`}
            </Badge>
          </div>

          <h4
            onClick={() => onReview(app)}
            className="text-sm font-bold text-slate-900 dark:text-white hover:text-orange-600 cursor-pointer transition-colors"
          >
            {app.serviceName}
          </h4>

          {app.projectId && (
            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {app.projectId.projectName}
              </span>
              <span>&bull;</span>
              <span>{app.projectId.companyName}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-500" />
                {app.projectId.district}
              </span>
            </p>
          )}

          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
            <span>Submitted: {formatDate(app.submittedAt)}</span>
            <span>&bull;</span>
            <span>
              Officer: <strong>{app.assignedOfficer?.name || 'Unassigned'}</strong>
            </span>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0 pt-2 sm:pt-0">
          <StatusBadge status={app.status} className="text-xs" />

          <div className="flex items-center gap-1.5">
            {onQuickQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuickQuery(app)}
                className="text-xs h-7 px-2 border-amber-300 text-amber-700"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                <span>Query</span>
              </Button>
            )}

            {onQuickApprove && app.status !== 'Approved' && (
              <Button
                size="sm"
                onClick={() => onQuickApprove(app)}
                className="text-xs h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                <span>NOC</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(app)}
              className="text-xs h-7 px-2.5"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>Review</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
