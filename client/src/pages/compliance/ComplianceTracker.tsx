import React, { useState, useMemo } from 'react';
import { useCompliance } from '../../hooks/useCompliance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
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
  AlertCircle,
  Clock,
  Send,
  UserCheck,
  ShieldAlert,
  FileText,
  CalendarCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

export const ComplianceTracker: React.FC = () => {
  const { compliances, isLoading, isError, error, refetch, updateStatus, isUpdatingStatus } =
    useCompliance();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'overdue' | 'renewals' | 'risk' | 'calendar'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Notice Generation Modal State (Requirement #7)
  const [noticeTask, setNoticeTask] = useState<any | null>(null);
  const [noticeRemarks, setNoticeRemarks] = useState('');

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

  const completedCount = compliances.filter((c) => c.status === 'Completed').length;
  const overdueCount = compliances.filter((c) => {
    const isPast = new Date(c.nextDueDate).getTime() < Date.now();
    return isPast && c.status !== 'Completed';
  }).length;
  const renewalsCount = compliances.filter(
    (c) =>
      c.frequency === 'Annual' ||
      c.complianceName.toLowerCase().includes('renewal') ||
      c.complianceName.toLowerCase().includes('consent')
  ).length;
  const highRiskCount = compliances.filter(
    (c) => c.penaltyRisk === 'Critical' || c.penaltyRisk === 'High' || c.priority === 'Critical'
  ).length;

  const healthPercentage =
    compliances.length > 0 ? Math.round((completedCount / compliances.length) * 100) : 100;

  // Filtered Compliances
  const filteredList = useMemo(() => {
    if (activeTab === 'overdue') {
      return compliances.filter(
        (c) => new Date(c.nextDueDate).getTime() < Date.now() && c.status !== 'Completed'
      );
    }
    if (activeTab === 'upcoming') {
      return compliances.filter((c) => new Date(c.nextDueDate).getTime() >= Date.now());
    }
    if (activeTab === 'renewals') {
      return compliances.filter(
        (c) =>
          c.frequency === 'Annual' ||
          c.complianceName.toLowerCase().includes('renewal') ||
          c.complianceName.toLowerCase().includes('consent')
      );
    }
    if (activeTab === 'risk') {
      return compliances.filter(
        (c) => c.penaltyRisk === 'High' || c.penaltyRisk === 'Critical' || c.priority === 'Critical'
      );
    }
    return compliances;
  }, [compliances, activeTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="saffron" className="text-xs uppercase font-bold tracking-wider">
              Statutory Compliance Tracker
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Health: {healthPercentage}% Compliant
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Dynamic Statutory & Environmental Compliance Engine
          </h1>
          <p className="text-xs text-slate-500">
            Real-time compliance calendar, overdue notifications, penalty exposure prediction, and statutory notice issuance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs border-slate-300 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Engine</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (compliances.length > 0) {
                setNoticeTask(compliances[0]);
              } else {
                toastError('No compliance filings available to draft notice.');
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            <span>Generate Regulatory Notice</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards: Dynamic Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card
          hover
          onClick={() => setActiveTab('all')}
          className={`p-4 ${activeTab === 'all' ? 'ring-2 ring-orange-500' : ''}`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Filings</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {compliances.length}
          </div>
          <span className="text-[10px] text-slate-400">Statutory calendar</span>
        </Card>

        <Card
          hover
          onClick={() => setActiveTab('overdue')}
          className={`p-4 ${activeTab === 'overdue' ? 'ring-2 ring-red-500' : ''}`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Overdue Filings</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-2">
            {overdueCount}
          </div>
          <span className="text-[10px] text-red-500 font-medium">Penalty risk active</span>
        </Card>

        <Card
          hover
          onClick={() => setActiveTab('risk')}
          className={`p-4 ${activeTab === 'risk' ? 'ring-2 ring-amber-500' : ''}`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>High Penalty Risk</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
            {highRiskCount}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Critical inspections</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Verified Filings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {completedCount}
          </div>
          <span className="text-[10px] text-emerald-500 font-medium">Audit cleared</span>
        </Card>
      </div>

      {/* View Switcher Tabs (Requirement #7) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <Button
            variant={activeTab === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="text-xs"
          >
            All Filings ({compliances.length})
          </Button>

          <Button
            variant={activeTab === 'upcoming' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('upcoming')}
            className="text-xs"
          >
            Upcoming Filings
          </Button>

          <Button
            variant={activeTab === 'overdue' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('overdue')}
            className="text-xs"
          >
            Overdue ({overdueCount})
          </Button>

          <Button
            variant={activeTab === 'renewals' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('renewals')}
            className="text-xs"
          >
            Renewals ({renewalsCount})
          </Button>

          <Button
            variant={activeTab === 'risk' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('risk')}
            className="text-xs"
          >
            Penalty Risk ({highRiskCount})
          </Button>

          <Button
            variant={activeTab === 'calendar' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('calendar')}
            className="text-xs"
          >
            <CalendarCheck className="w-3.5 h-3.5 mr-1" />
            <span>Compliance Calendar</span>
          </Button>
        </div>
      </div>

      {/* TAB: COMPLIANCE CALENDAR VIEW */}
      {activeTab === 'calendar' ? (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>Maharashtra Statutory Compliance Calendar (Chronological)</span>
            </h3>
            <span className="text-xs text-slate-400">Auto-calculated SLA renewal triggers</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-200 dark:before:bg-orange-950 text-xs">
            {compliances.map((c) => (
              <div
                key={c._id}
                className="relative p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4"
              >
                <div className="absolute -left-6 top-4 h-3.5 w-3.5 rounded-full bg-orange-500 ring-4 ring-white dark:ring-slate-900" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {c.complianceName}
                    </span>
                    <Badge variant="saffron" className="text-[9px]">
                      {c.department}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Frequency: <strong>{c.frequency}</strong> • Due:{' '}
                    <strong className="text-orange-600 dark:text-orange-400">
                      {formatDate(c.nextDueDate)}
                    </strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNoticeTask(c)}
                    className="text-[11px] h-7 px-2"
                  >
                    Draft Notice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* Regular Task Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((task) => {
            const isPast = new Date(task.nextDueDate).getTime() < Date.now();

            return (
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
                      <span>
                        Frequency: <strong className="text-slate-700 dark:text-slate-300">{task.frequency}</strong>
                      </span>
                      {task.renewalRequired && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                          Renewal Required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Next Renewal Date:
                      </span>
                      <strong className={`font-mono ${isPast ? 'text-red-600 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                        {formatDate(task.nextDueDate)} {isPast ? '(OVERDUE)' : ''}
                      </strong>
                    </div>

                    {/* Penalty Risk & AI Risk Prediction (Requirement #7) */}
                    <div className="flex items-center justify-between text-slate-500">
                      <span>AI Penalty Risk:</span>
                      <span
                        className={`font-bold inline-flex items-center gap-1 ${
                          task.penaltyRisk === 'Critical' || task.priority === 'Critical'
                            ? 'text-rose-600'
                            : task.penaltyRisk === 'High' || task.priority === 'High'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>{task.penaltyRisk || task.priority || 'Low'} Penalty Risk</span>
                      </span>
                    </div>

                    {/* Officer Responsible */}
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        Officer In-Charge:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Nodal Scrutinizer ({task.department ? task.department.split(' ')[0] : 'State'})
                      </span>
                    </div>

                    {/* Documents Required */}
                    {task.documentsRequired && task.documentsRequired.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          Mandatory Verification Filings:
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

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  {task.status === 'Completed' ? (
                    <div className="flex-1 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 justify-center py-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Statutory Filing Verified</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleUploadFiling(task._id, task.complianceName)}
                      disabled={isUpdatingStatus && updatingId === task._id}
                      className="flex-1 text-xs"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      <span>
                        {updatingId === task._id ? 'Verifying...' : 'Upload Return'}
                      </span>
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNoticeTask(task)}
                    className="text-xs px-2.5 text-red-600 hover:bg-red-50 border-red-200"
                    title="Generate Statutory Notice"
                  >
                    Notice
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Notice Generation Modal (Requirement #7) */}
      {noticeTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Issue Statutory Compliance Notice</span>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setNoticeTask(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs">
              <span className="font-bold block">Statutory Non-Compliance Notice</span>
              <p className="text-[11px] mt-0.5">
                Notice will be served directly to the industrial enterprise dashboard and registered contact email.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject Statutory Filing:
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${noticeTask.complianceName} (${noticeTask.department})`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Notice Cause & Rectification Deadline:
                </label>
                <textarea
                  value={noticeRemarks}
                  onChange={(e) => setNoticeRemarks(e.target.value)}
                  rows={3}
                  placeholder="e.g. Failure to submit mandatory half-yearly hazardous emissions return within statutory deadline. Rectify within 7 working days."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setNoticeTask(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    success(`Official Compliance Notice served for ${noticeTask.complianceName}!`);
                    setNoticeTask(null);
                    setNoticeRemarks('');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  Dispatch Notice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceTracker;
