import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { officerService, DepartmentRegistryItem } from '../../services/officerService';
import { departmentApi } from '../../api/department.api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { EmptyState, ErrorState } from '../../components/EmptyState';
import { DepartmentCard } from '../../components/officer/OfficerComponents';
import {
  Building2,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  Search,
  ExternalLink,
  RefreshCw,
  MapPin,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Globe,
  Mail,
  Phone,
  Layers,
  X,
} from 'lucide-react';

export const DepartmentRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<DepartmentRegistryItem | null>(null);

  // TanStack Query: Fetch live department registry with dynamic KPI aggregations
  const {
    data: departments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<any[]>({
    queryKey: ['department-registry'],
    queryFn: () => departmentApi.getDepartments(),
    staleTime: 1000 * 60,
  });

  const filteredDepts = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.jurisdiction || '').toLowerCase().includes(q)
    );
  }, [departments, search]);

  const totalOfficers = useMemo(
    () => departments.reduce((acc, d) => acc + (d.officerCount || 0), 0),
    [departments]
  );
  const totalPending = useMemo(
    () => departments.reduce((acc, d) => acc + (d.pendingCases || 0), 0),
    [departments]
  );
  const totalCompleted = useMemo(
    () => departments.reduce((acc, d) => acc + (d.completedCases || 0), 0),
    [departments]
  );

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
        <Skeleton className="h-10 w-96 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <ErrorState
          message={(error as Error)?.message || 'Failed to load Government Department Registry.'}
          onRetry={() => refetch()}
        />
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
              Statutory Bodies
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Registered Agencies: {departments.length}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Government Department & Clearance Agency Registry
          </h1>
          <p className="text-xs text-slate-500">
            State-level clearing authorities, scrutinizing officers, real-time caseloads, and SLA adherence.
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
            <span>Sync Registry</span>
          </Button>

          <Link to="/officer">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 mr-1" />
              <span>Officer Workspace</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Aggregate KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>State Departments</span>
            <Building2 className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {departments.length}
          </div>
          <span className="text-[10px] text-slate-400">Integrated bodies</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Officers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-2">
            {totalOfficers}
          </div>
          <span className="text-[10px] text-blue-500 font-medium">Scrutinizing officers</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Clearance Cases</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
            {totalPending}
          </div>
          <span className="text-[10px] text-amber-500 font-medium">In scrutiny pipeline</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completed Clearances</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {totalCompleted}
          </div>
          <span className="text-[10px] text-emerald-500 font-medium">NOCs Granted</span>
        </Card>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search department name or agency code (e.g., MPCB, DISH, MIDC)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">
          Showing {filteredDepts.length} of {departments.length} state agencies
        </span>
      </div>

      {/* Departments Grid (Requirement #9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.length > 0 ? (
          filteredDepts.map((dept) => (
            <DepartmentCard
              key={dept._id}
              name={dept.name}
              code={dept.code}
              officerCount={dept.officerCount}
              pendingCases={dept.pendingCases}
              completedCases={dept.completedCases}
              averageSla={dept.averageSla}
              performancePercent={dept.performancePercent}
              jurisdiction={dept.jurisdiction}
              onOpen={() => setSelectedDept(dept)}
            />
          ))
        ) : (
          <div className="col-span-3 py-12">
            <EmptyState
              title="No departments match your search"
              description="Clear search input to view all state clearing departments."
            />
          </div>
        )}
      </div>

      {/* Department Details Modal */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="saffron" className="text-[10px] font-mono mb-1">
                  {selectedDept.code}
                </Badge>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {selectedDept.name}
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDept(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedDept.description || 'Statutory authority responsible for single window clearances across Maharashtra state.'}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">Officers Deployed</span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedDept.officerCount} Officers
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">Average SLA</span>
                <strong className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {selectedDept.averageSla} Days
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">Active In-Flight Cases</span>
                <strong className="text-sm font-bold text-amber-600">
                  {selectedDept.pendingCases} Pending
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">SLA Compliance Rate</span>
                <strong className="text-sm font-bold text-emerald-600">
                  {selectedDept.performancePercent}%
                </strong>
              </div>
            </div>

            {/* Approval Types (Requirement #9) */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Issued Clearances & Approvals:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDept.approvalTypes && selectedDept.approvalTypes.length > 0 ? (
                  selectedDept.approvalTypes.map((t, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-400 italic text-[11px]">
                    Standard statutory approvals and NOCs
                  </span>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
              {selectedDept.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <a
                    href={selectedDept.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {selectedDept.website}
                  </a>
                </div>
              )}
              {selectedDept.contactEmail && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedDept.contactEmail}</span>
                </div>
              )}
              {selectedDept.officeAddress && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{selectedDept.officeAddress}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedDept(null)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  navigate(`/applications`);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold"
              >
                <span>View Department Cases &rarr;</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentRegistryPage;
