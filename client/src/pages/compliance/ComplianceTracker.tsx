import React, { useState } from 'react';
import { useCompliance } from '../../hooks/useCompliance';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { formatDate } from '../../utils/formatters';
import { CardSkeleton } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Upload,
  CheckCircle,
  FileCheck,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const ComplianceTracker: React.FC = () => {
  const { compliances, isLoading, isError, error, refetch, updateStatus, isUpdatingStatus } =
    useCompliance();
  const { success, error: toastError } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUploadFiling = async (complianceId: string, complianceName: string) => {
    try {
      setUpdatingId(complianceId);
      await updateStatus({
        id: complianceId,
        status: 'Completed',
        remarks: 'Statutory return filed and verified through single window platform.',
      });
      success(`Statutory filing for "${complianceName}" uploaded and verified!`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update compliance record');
    } finally {
      setUpdatingId(null);
    }
  };

  const completedCount = compliances.filter(
    (c) => c.status === 'Completed'
  ).length;
  const healthPercentage =
    compliances.length > 0 ? Math.round((completedCount / compliances.length) * 100) : 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            AI-Powered Statutory Compliance Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated calendar reminders, penalty prevention, and audit filings for Maharashtra industrial units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Compliances"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              Health Score: {healthPercentage}% Compliant
            </span>
          </div>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to load statutory compliances: {(error as any)?.message || 'Server error'}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Compliance Task Cards */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : compliances.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">All Clear! No Compliances Due</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All environmental and industrial licenses are in active compliance with zero overdue filings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {compliances.map((task) => (
            <Card key={task._id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide truncate max-w-[200px]">
                    {task.department || 'Statutory Department'}
                  </span>
                  <StatusBadge status={task.status} />
                </div>

                <div className="mt-3 space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {task.complianceName}
                  </h3>
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                    <span>Frequency: <strong className="text-slate-700 dark:text-slate-300">{task.frequency}</strong></span>
                    {task.renewalRequired && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                        Renewal Required
                      </span>
                    )}
                  </div>
                  {task.remarks && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {task.remarks}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Next Due Date:
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {formatDate(task.nextDueDate)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Penalty Risk:</span>
                    <span
                      className={`font-bold ${
                        task.penaltyRisk === 'Critical' || task.priority === 'Critical'
                          ? 'text-rose-600'
                          : task.penaltyRisk === 'High' || task.priority === 'High'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {task.penaltyRisk || task.priority || 'Low'}
                    </span>
                  </div>

                  {task.documentsRequired && task.documentsRequired.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        Mandatory Documents:
                      </span>
                      <div className="space-y-1">
                        {task.documentsRequired.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded"
                          >
                            <FileCheck className="w-3 h-3 text-orange-500 shrink-0" />
                            <span className="truncate">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                {task.status === 'Completed' ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 justify-center py-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Statutory Filing Verified</span>
                  </div>
                ) : task.status === 'Renewal Pending' ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 justify-center py-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Renewal in Processing</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleUploadFiling(task._id, task.complianceName)}
                    disabled={isUpdatingStatus && updatingId === task._id}
                    className="w-full text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    <span>
                      {updatingId === task._id ? 'Verifying Filing...' : 'Upload Statutory Return'}
                    </span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplianceTracker;
