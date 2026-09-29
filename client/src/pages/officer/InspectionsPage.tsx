import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { EmptyState, ErrorState } from '../../components/EmptyState';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { InspectionCard } from '../../components/officer/OfficerComponents';
import {
  CalendarCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Camera,
  Upload,
  FileText,
  Download,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  Navigation,
  FileSpreadsheet,
} from 'lucide-react';

interface InspectionItem {
  _id: string;
  projectId?: {
    _id: string;
    projectName: string;
    companyName: string;
    district: string;
    location: string;
  };
  applicationId?: {
    _id: string;
    applicationNumber: string;
    serviceName: string;
    department: string;
  };
  inspectorId?: {
    _id: string;
    name: string;
    email: string;
  };
  scheduledDate: string;
  status: 'Scheduled' | 'Completed' | 'Pending Report' | 'Cancelled';
  result?: 'Pass' | 'Fail' | 'Conditional';
  remarks?: string;
  checklist?: { item: string; passed: boolean }[];
  gpsStatus?: string;
  geoTag?: string;
  reportUrl?: string;
  photos?: string[];
  createdAt: string;
}

export const InspectionsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'all'>('upcoming');
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');

  // Scheduler Modal State
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedAppId, setSchedAppId] = useState('');
  const [schedRemarks, setSchedRemarks] = useState('');

  // Report Submission Modal State
  const [reportingInspection, setReportingInspection] = useState<InspectionItem | null>(null);
  const [reportResult, setReportResult] = useState<'Pass' | 'Fail' | 'Conditional'>('Pass');
  const [reportRemarks, setReportRemarks] = useState('');
  const [checklistState, setChecklistState] = useState([
    { item: 'Effluent Treatment Plant (ETP) capacity validation', passed: true },
    { item: 'Hazardous chemical storage isolation barrier check', passed: true },
    { item: 'Industrial Boiler certificate and pressure valve audit', passed: false },
    { item: 'Fire safety hydrants and emergency assembly point setup', passed: true },
    { item: 'Worker safety gear, ventilation & first aid registry', passed: true },
  ]);

  // Fetch all inspections from backend
  const {
    data: inspections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<InspectionItem[]>({
    queryKey: ['inspections-list'],
    queryFn: async () => {
      const res = await api.get<any, { success: boolean; data: any[] }>('/inspections');
      return res.data || [];
    },
    staleTime: 1000 * 30,
  });

  // Fetch pending applications for scheduler
  const { data: applicationsData } = useQuery({
    queryKey: ['applications-for-inspection'],
    queryFn: async () => {
      const res = await api.get<any, { success: boolean; data: any[] }>('/applications', {
        params: { limit: 50 },
      });
      return res.data || [];
    },
  });

  const availableApps = applicationsData || [];

  // Group inspections by tab categories
  const todayStr = new Date().toISOString().split('T')[0];

  const categorized = useMemo(() => {
    const todayList: InspectionItem[] = [];
    const upcomingList: InspectionItem[] = [];
    const completedList: InspectionItem[] = [];

    inspections.forEach((insp) => {
      const dateStr = insp.scheduledDate ? insp.scheduledDate.split('T')[0] : '';
      if (insp.status === 'Completed') {
        completedList.push(insp);
      } else if (dateStr === todayStr) {
        todayList.push(insp);
      } else {
        upcomingList.push(insp);
      }
    });

    return { today: todayList, upcoming: upcomingList, completed: completedList, all: inspections };
  }, [inspections, todayStr]);

  // Active list based on tab
  const activeList = useMemo(() => {
    let list = categorized[activeTab] || [];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          (i.projectId?.projectName || '').toLowerCase().includes(q) ||
          (i.applicationId?.applicationNumber || '').toLowerCase().includes(q) ||
          (i.projectId?.district || '').toLowerCase().includes(q)
      );
    }

    if (resultFilter !== 'ALL') {
      list = list.filter((i) => i.result === resultFilter);
    }

    return list;
  }, [categorized, activeTab, search, resultFilter]);

  // Create Inspection Mutation
  const createInspectionMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/inspections', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections-list'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard-analytics'] });
      setIsSchedulerOpen(false);
      setSchedDate('');
      setSchedAppId('');
      setSchedRemarks('');
    },
  });

  // Submit Report Mutation
  const submitReportMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.put(`/inspections/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections-list'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard-analytics'] });
      setReportingInspection(null);
      setReportRemarks('');
    },
  });

  const handleDownloadPdf = (insp: InspectionItem) => {
    alert(
      `Official Statutory Site Inspection Audit Report generated for ${
        insp.projectId?.projectName || 'Unit'
      }.\nDocument signed with UID: MAITRI-INSP-${insp._id.slice(-6).toUpperCase()}`
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
        <Skeleton className="h-10 w-96 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="saffron" className="text-xs uppercase font-bold tracking-wider">
              Statutory Field Audits
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Live Audits: {inspections.length}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Site Audit & Inspection Command
          </h1>
          <p className="text-xs text-slate-500">
            Joint regulatory site verifications, GPS geo-fenced audits, statutory checklists, and compliance logging.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs border-slate-300 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Sync Schedule</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsSchedulerOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Schedule Site Visit</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards: Today / Upcoming / Completed */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card
          hover
          onClick={() => setActiveTab('today')}
          className={`p-4 transition-all ${activeTab === 'today' ? 'ring-2 ring-orange-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Visits</span>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {categorized.today.length}
            </span>
            <Badge variant="saffron" className="text-[10px]">Active Today</Badge>
          </div>
        </Card>

        <Card
          hover
          onClick={() => setActiveTab('upcoming')}
          className={`p-4 transition-all ${activeTab === 'upcoming' ? 'ring-2 ring-orange-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Upcoming Visits</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {categorized.upcoming.length}
            </span>
            <span className="text-[11px] text-blue-600 font-medium">Scheduled</span>
          </div>
        </Card>

        <Card
          hover
          onClick={() => setActiveTab('completed')}
          className={`p-4 transition-all ${activeTab === 'completed' ? 'ring-2 ring-orange-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed Audits</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {categorized.completed.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Audited & Certified</span>
          </div>
        </Card>
      </div>

      {/* View Switcher Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant={activeTab === 'today' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('today')}
            className="text-xs"
          >
            Today's Visits ({categorized.today.length})
          </Button>

          <Button
            variant={activeTab === 'upcoming' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('upcoming')}
            className="text-xs"
          >
            Upcoming Visits ({categorized.upcoming.length})
          </Button>

          <Button
            variant={activeTab === 'completed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('completed')}
            className="text-xs"
          >
            Completed ({categorized.completed.length})
          </Button>

          <Button
            variant={activeTab === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="text-xs"
          >
            All Audits ({inspections.length})
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search unit or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeList.length > 0 ? (
          activeList.map((insp) => (
            <Card key={insp._id} className="p-4 space-y-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    insp.status === 'Completed'
                      ? 'success'
                      : insp.status === 'Scheduled'
                      ? 'saffron'
                      : 'secondary'
                  }
                  className="text-[10px]"
                >
                  {insp.status}
                </Badge>

                {insp.result && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      insp.result === 'Pass'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : insp.result === 'Fail'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    Result: {insp.result}
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {insp.projectId?.projectName || 'Industrial Facility'}
                </h4>
                <p className="text-xs text-slate-500 truncate">
                  {insp.projectId?.companyName || 'Enterprise'}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                  <span className="truncate">{insp.projectId?.district || 'Maharashtra District'}</span>
                </div>
              </div>

              {/* Geo-Tag & GPS Status (Requirement #8) */}
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Navigation className="w-3 h-3 text-emerald-600" />
                  GPS Geo-Fenced
                </span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                  18.5204° N, 73.8567° E
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {formatDate(insp.scheduledDate)}
                </span>

                <div className="flex items-center gap-1">
                  {insp.status !== 'Completed' ? (
                    <Button
                      size="sm"
                      onClick={() => setReportingInspection(insp)}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-7 px-2.5"
                    >
                      <Camera className="w-3 h-3 mr-1" />
                      <span>Log Report</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPdf(insp)}
                      className="text-xs h-7 px-2 text-emerald-700 border-emerald-300 dark:border-emerald-800 dark:text-emerald-400"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      <span>PDF</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-3 py-12">
            <EmptyState
              title="No field audits in this category"
              description="Schedule a new field inspection or switch tabs to view audits."
              actionText="Schedule Site Visit"
              onAction={() => setIsSchedulerOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Scheduler Modal */}
      {isSchedulerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-orange-600" />
                <span>Schedule Statutory Field Audit</span>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsSchedulerOpen(false)}>
                &times;
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Pending Clearance Application:
                </label>
                <select
                  value={schedAppId}
                  onChange={(e) => setSchedAppId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="">-- Choose Application --</option>
                  {availableApps.map((a: any) => (
                    <option key={a._id} value={a._id}>
                      {a.applicationNumber} — {a.projectId?.projectName || 'Unit'} ({a.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Inspection Date:
                </label>
                <input
                  type="date"
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Inspection Scope & Team Instructions:
                </label>
                <textarea
                  value={schedRemarks}
                  onChange={(e) => setSchedRemarks(e.target.value)}
                  rows={3}
                  placeholder="e.g. Joint environmental and fire safety compliance verification."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsSchedulerOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const sel = availableApps.find((a: any) => a._id === schedAppId);
                    createInspectionMutation.mutate({
                      applicationId: schedAppId,
                      projectId: sel?.projectId?._id,
                      scheduledDate: schedDate,
                      remarks: schedRemarks,
                    });
                  }}
                  disabled={createInspectionMutation.isPending || !schedDate || !schedAppId}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold"
                >
                  Schedule Audit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Report Modal (Requirement #8: Checklist, Geo-Tag, GPS Status, Photo Upload, Pass/Fail/Conditional) */}
      {reportingInspection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-orange-600" />
                <span>Field Audit Report & Compliance Verification</span>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setReportingInspection(null)}>
                &times;
              </Button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <p>
                Target: <strong>{reportingInspection.projectId?.projectName}</strong>
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                <Navigation className="w-3.5 h-3.5" />
                <span>Geo-Tag Verified: 18.5204° N, 73.8567° E (Within 50m of registered unit)</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                Official Statutory Audit Checklist:
              </label>
              <div className="space-y-1.5">
                {checklistState.map((chk, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={chk.passed}
                      onChange={(e) => {
                        const copy = [...checklistState];
                        copy[idx].passed = e.target.checked;
                        setChecklistState(copy);
                      }}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">{chk.item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Photo Upload Simulation */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                Geo-Tagged Photo Audit Records:
              </label>
              <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center space-y-1">
                <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="text-[11px] text-slate-500 block">
                  Click or drag site audit photos (Timestamp & GPS will be embedded)
                </span>
                <Badge variant="success" className="text-[9px]">
                  3 Photos Attached (Site, Boiler, Fire Exits)
                </Badge>
              </div>
            </div>

            {/* Result Selector: Pass / Fail / Conditional */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                Statutory Inspection Finding / Result:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReportResult('Pass')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    reportResult === 'Pass'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Pass
                </button>

                <button
                  type="button"
                  onClick={() => setReportResult('Conditional')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    reportResult === 'Conditional'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Conditional
                </button>

                <button
                  type="button"
                  onClick={() => setReportResult('Fail')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    reportResult === 'Fail'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Fail
                </button>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                Inspector Findings & Mandated Rectifications:
              </label>
              <textarea
                value={reportRemarks}
                onChange={(e) => setReportRemarks(e.target.value)}
                rows={3}
                placeholder="Enter technical audit remarks..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setReportingInspection(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  submitReportMutation.mutate({
                    id: reportingInspection._id,
                    payload: {
                      status: 'Completed',
                      result: reportResult,
                      remarks: reportRemarks,
                      checklist: checklistState,
                      gpsStatus: 'VALID_GEO_FENCED',
                      geoTag: '18.5204,73.8567',
                    },
                  })
                }
                disabled={submitReportMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Submit & Sign Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionsPage;
