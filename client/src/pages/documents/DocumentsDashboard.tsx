import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/documentService';
import { projectService } from '../../services/projectService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';
import {
  ProjectDocumentItem,
  DocumentReadinessData,
  VerificationStatus,
} from '../../types/document.types';
import { UploadDocument } from './UploadDocument';
import { DocumentDetails } from './DocumentDetails';
import { formatFileSize, formatDate } from '../../utils/formatters';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileDown,
  FilePlus,
  FileText,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  UserCheck,
  X,
} from 'lucide-react';

export const DocumentsDashboard: React.FC = () => {
  const { id: paramProjectId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // If no paramProjectId, load user's projects to select the first active project
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects({ limit: 10 }),
    enabled: !paramProjectId,
  });

  const activeProjectId = paramProjectId || projectsData?.data?.[0]?._id;

  // Active view tab: 'table' | 'readiness' | 'reuse' | 'missing'
  const [activeTab, setActiveTab] = useState<'table' | 'readiness' | 'reuse' | 'missing'>('table');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedVerification, setSelectedVerification] = useState('ALL');

  // Modals & Panels
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [prefilledDocName, setPrefilledDocName] = useState<string>('');
  const [selectedDocDetails, setSelectedDocDetails] = useState<ProjectDocumentItem | null>(null);

  // Fetch Project Details
  const { data: project } = useQuery({
    queryKey: ['project', activeProjectId],
    queryFn: () => projectService.getProject(activeProjectId!),
    enabled: !!activeProjectId,
  });

  // Fetch Documents
  const {
    data: documents = [],
    isLoading: isDocsLoading,
    refetch: refetchDocs,
  } = useQuery({
    queryKey: ['documents', activeProjectId, selectedStatus, selectedVerification, searchQuery],
    queryFn: () =>
      documentService.getProjectDocuments(activeProjectId!, {
        status: selectedStatus,
        verificationStatus: selectedVerification,
        search: searchQuery,
      }),
    enabled: !!activeProjectId,
  });

  // Fetch Document Readiness & Reuse Metrics
  const {
    data: readiness,
    isLoading: isReadinessLoading,
    refetch: refetchReadiness,
  } = useQuery({
    queryKey: ['document-readiness', activeProjectId],
    queryFn: () => documentService.getDocumentReadiness(activeProjectId!),
    enabled: !!activeProjectId,
  });

  // Quick verification toggle
  const verifyMutation = useMutation({
    mutationFn: ({ docId, status }: { docId: string; status: VerificationStatus }) =>
      documentService.updateDocument(docId, { verificationStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', activeProjectId] });
      queryClient.invalidateQueries({ queryKey: ['document-readiness', activeProjectId] });
    },
  });

  const handleOpenUploadForDoc = (docName?: string) => {
    setPrefilledDocName(docName || '');
    setShowUploadModal(true);
  };

  if (!activeProjectId && isProjectsLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 animate-in fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!activeProjectId) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          No Industrial Project Selected
        </h2>
        <p className="text-xs text-slate-500">
          Please select or register an industrial project to access its Smart Document Intelligence Vault.
        </p>
        <Link to="/projects/new">
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
            Register Project First
          </Button>
        </Link>
      </div>
    );
  }

  const readinessScore = readiness?.readinessScore || 0;
  const totalVerified = readiness?.totalVerified || 0;
  const missingCount = readiness?.missingDocuments?.length || 0;
  const expiredCount = readiness?.expiredDocuments?.length || 0;
  const totalDocsCount = documents.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to={`/projects/${activeProjectId}`}
          className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Project: {project?.projectName || 'Industrial Dossier'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchDocs();
              refetchReadiness();
            }}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Sync Vault</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenUploadForDoc()}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-md shadow-orange-600/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Upload Document</span>
          </Button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="saffron">Smart Document Intelligence</Badge>
              <Badge variant="secondary">Zero-Redundancy Artifact Vault</Badge>
              <span className="text-slate-400 text-xs">&bull;</span>
              <span className="text-xs text-slate-300">
                Unit: {project?.projectName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Project Statutory Document Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span>{project?.companyName}</span>
              <span className="text-slate-500">&bull;</span>
              <span>{project?.district} District</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Document Readiness:</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {readinessScore}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Cross-referenced with {readiness?.approvalBreakdown?.length || 0} statutory approvals
            </span>
          </div>
        </div>
      </div>

      {/* Top 5 KPI Cards: Total Documents, Verified, Missing, Expired, Readiness Score */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Documents */}
        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Uploaded</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {totalDocsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Indexed in repository</p>
        </Card>

        {/* Verified */}
        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Verified Documents</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {totalVerified}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Audit-ready status</p>
        </Card>

        {/* Missing */}
        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Missing Clearances</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
            {missingCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Required for approvals</p>
        </Card>

        {/* Expired */}
        <Card hover>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Expired / Overdue</span>
            <Clock className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-2">
            {expiredCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Needs statutory re-filing</p>
        </Card>

        {/* Readiness Score with Circular Gauge */}
        <Card hover className="bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-800/40 dark:to-orange-950/10">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Overall Readiness</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-orange-600 transition-all duration-1000 ease-out"
                  strokeDasharray={`${readinessScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-900 dark:text-white">
                {readinessScore}%
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                {readinessScore >= 80 ? 'Application Ready' : readinessScore >= 50 ? 'Substantial' : 'Action Required'}
              </span>
              <span className="text-[10px] text-slate-400">Cross-departmental</span>
            </div>
          </div>
        </Card>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'table' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('table')}
            className="text-xs"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            <span>Document Repository ({documents.length})</span>
          </Button>

          <Button
            variant={activeTab === 'readiness' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('readiness')}
            className="text-xs"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            <span>Readiness Widget & Breakdown</span>
          </Button>

          <Button
            variant={activeTab === 'reuse' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('reuse')}
            className="text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            <span>Document Reuse Matrix</span>
          </Button>

          <Button
            variant={activeTab === 'missing' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('missing')}
            className="text-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            <span>Missing Documents ({missingCount})</span>
          </Button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:block">
          Auto-linked with MAITRI Single Window
        </span>
      </div>

      {/* TAB 1: DOCUMENT TABLE VIEW */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents by name, type, remarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="ALL">All Document Statuses</option>
                <option value="Uploaded">Uploaded</option>
                <option value="Verified">Verified</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Expired">Expired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <select
                value={selectedVerification}
                onChange={(e) => setSelectedVerification(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="ALL">All Verification States</option>
                <option value="Uploaded">Uploaded</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 backdrop-blur-md bg-slate-50/95 dark:bg-slate-800/95 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Document Name</th>
                    <th className="py-3.5 px-4">Type / Category</th>
                    <th className="py-3.5 px-4">Version</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Expiry Date</th>
                    <th className="py-3.5 px-4">Used In (Reuse)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {documents.length > 0 ? (
                    documents.map((doc) => {
                      const fullFileUrl = doc.fileUrl.startsWith('http')
                        ? doc.fileUrl
                        : `http://localhost:5000${doc.fileUrl}`;

                      return (
                        <tr
                          key={doc._id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Name & Size */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 dark:text-white block hover:text-orange-600 transition-colors cursor-pointer" onClick={() => setSelectedDocDetails(doc)}>
                                {doc.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {doc.fileName} &bull; {formatFileSize(doc.fileSize)}
                              </span>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <Badge variant="secondary" className="text-[10px]">
                              {doc.documentType}
                            </Badge>
                          </td>

                          {/* Version */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                              v{doc.version}.0
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <StatusBadge status={doc.verificationStatus} className="text-[11px]" />
                          </td>

                          {/* Expiry */}
                          <td className="py-3.5 px-4">
                            {doc.expiryDate ? (
                              <span className="text-slate-600 dark:text-slate-400 font-medium">
                                {formatDate(doc.expiryDate)}
                              </span>
                            ) : (
                              <span className="text-slate-400">Permanent</span>
                            )}
                          </td>

                          {/* Used In */}
                          <td className="py-3.5 px-4">
                            {doc.usedInApprovals && doc.usedInApprovals.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <Badge variant="saffron" className="text-[10px]">
                                  {doc.usedInApprovals.length} Approvals
                                </Badge>
                                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                  {doc.usedInApprovals[0]}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Direct Filing</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDocDetails(doc)}
                                className="text-xs h-7 px-2"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                <span>Preview</span>
                              </Button>

                              <a href={fullFileUrl} target="_blank" rel="noopener noreferrer" download>
                                <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-sm">No documents matching your filter criteria.</p>
                        <p className="text-xs mt-1">Upload required compliance documents or clear search filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: READINESS WIDGET & BREAKDOWN */}
      {activeTab === 'readiness' && (
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Statutory Approval Readiness Widget ({readinessScore}% Overall)</span>
                </CardTitle>
                <CardDescription>
                  Approval-by-approval checklist showing which clearances have 100% complete verification documentation
                </CardDescription>
              </div>

              <Badge variant="saffron" className="text-xs font-mono font-bold">
                {readiness?.approvalBreakdown?.filter((a) => a.isComplete).length || 0} /{' '}
                {readiness?.approvalBreakdown?.length || 0} Approvals Complete
              </Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readiness?.approvalBreakdown?.map((app) => (
                  <div
                    key={app.approvalId}
                    className={`p-4 rounded-xl border transition-all ${
                      app.isComplete
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 block uppercase">
                          {app.department}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {app.approvalName}
                        </h4>
                      </div>

                      {app.isComplete ? (
                        <Badge variant="success" className="text-[10px] whitespace-nowrap">
                          ✓ Documents Complete
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px] whitespace-nowrap">
                          ⚠ Missing {app.missingCount} {app.missingCount === 1 ? 'Doc' : 'Docs'}
                        </Badge>
                      )}
                    </div>

                    {/* Progress ratio */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                        <span>Artifacts Verified</span>
                        <span>
                          {app.uploadedCount} of {app.totalRequired}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            app.isComplete ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{
                            width: `${(app.uploadedCount / (app.totalRequired || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Missing items list if incomplete */}
                    {!app.isComplete && app.missingDocuments.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-slate-500 block">
                          Pending Verification:
                        </span>
                        <ul className="space-y-1 pl-4 list-disc text-[11px] text-slate-600 dark:text-slate-400">
                          {app.missingDocuments.map((mDoc, idx) => (
                            <li key={idx} className="truncate">
                              <span className="cursor-pointer hover:text-orange-600 font-medium" onClick={() => handleOpenUploadForDoc(mDoc)}>
                                {mDoc} &rarr; <span className="underline">Upload</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: DOCUMENT REUSE MATRIX */}
      {activeTab === 'reuse' && (
        <div className="space-y-4">
          <Card className="p-6">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-600" />
                <span>Multi-Departmental Document Reuse Engine</span>
              </CardTitle>
              <CardDescription>
                How single artifacts uploaded by the entrepreneur satisfy compliance requirements across multiple Maharashtra departments.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                {readiness?.reusableDocuments?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.documentName}
                        </span>
                        {item.isUploaded ? (
                          <Badge variant="success" className="text-[10px]">
                            ✓ Uploaded & Active
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px]">
                            Pending Upload
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Satisfies Requirements For:
                        </span>
                        {item.usedBy.map((approvalTitle, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 font-semibold text-[10px] border border-orange-200 dark:border-orange-900"
                          >
                            {approvalTitle}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {item.isUploaded ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (item.documentId) {
                              const found = documents.find((d) => d._id === item.documentId);
                              if (found) setSelectedDocDetails(found);
                            }
                          }}
                          className="text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>View Artifact</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOpenUploadForDoc(item.documentName)}
                          className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          <span>Upload Once (Satisfies {item.usedCount})</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: MISSING DOCUMENTS PANEL */}
      {activeTab === 'missing' && (
        <div className="space-y-4">
          <Card className="p-6">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Missing Statutory Documents Panel ({readiness?.missingDocuments?.length || 0})</span>
                </CardTitle>
                <CardDescription>
                  Mandatory artifacts required by departments before licenses can be approved
                </CardDescription>
              </div>

              <Button
                size="sm"
                onClick={() => handleOpenUploadForDoc()}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Upload New Document</span>
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {readiness?.missingDocuments && readiness.missingDocuments.length > 0 ? (
                readiness.missingDocuments.map((mDoc, idx) => {
                  const priorityVariant =
                    mDoc.priority === 'Critical'
                      ? 'destructive'
                      : mDoc.priority === 'High'
                      ? 'saffron'
                      : 'warning';

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-400 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {mDoc.documentName}
                          </h4>
                          <Badge variant={priorityVariant} className="text-[10px] uppercase font-bold">
                            {mDoc.priority} Priority
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                          <span>Mandatory for:</span>
                          {mDoc.requiredFor.map((r, i) => (
                            <span
                              key={i}
                              className="font-semibold text-slate-700 dark:text-slate-300"
                            >
                              {r}
                              {i < mDoc.requiredFor.length - 1 ? ',' : ''}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleOpenUploadForDoc(mDoc.documentName)}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs flex-shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        <span>Upload Artifact</span>
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    All Required Documents Uploaded!
                  </p>
                  <p className="mt-1">Your project dossier is 100% complete for statutory review.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Modal Drawer */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl">
            <UploadDocument
              projectId={activeProjectId}
              initialDocName={prefilledDocName}
              suggestedDocs={readiness?.missingDocuments?.map((d) => d.documentName) || []}
              onCancel={() => setShowUploadModal(false)}
              onUploadSuccess={() => {
                setShowUploadModal(false);
                refetchDocs();
                refetchReadiness();
              }}
            />
          </div>
        </div>
      )}

      {/* Document Details Modal Drawer */}
      {selectedDocDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <DocumentDetails
              documentId={selectedDocDetails._id}
              projectId={activeProjectId}
              onClose={() => setSelectedDocDetails(null)}
              onDeleteSuccess={() => {
                setSelectedDocDetails(null);
                refetchDocs();
                refetchReadiness();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsDashboard;
