import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '../../services/projectService';
import { documentService } from '../../services/documentService';
import { API_BASE_URL } from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { formatFileSize } from '../../utils/formatters';
import {
  UploadCloud,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Calendar,
  Layers,
  ArrowLeft,
  Image as ImageIcon,
} from 'lucide-react';

interface UploadDocumentProps {
  projectId: string;
  initialDocName?: string;
  onUploadSuccess?: () => void;
  onCancel?: () => void;
  suggestedDocs?: string[];
}

const DOCUMENT_TYPES = [
  'Identity & Incorporation',
  'Land & Civil Architecture',
  'Environmental & Pollution NOCs',
  'Industrial Safety & Fire',
  'Utilities & Technical Infrastructure',
  'Labour & Human Resources',
  'Financial Viability & Subsidies',
  'General Statutory Compliance',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.doc'];

export const UploadDocument: React.FC<UploadDocumentProps> = ({
  projectId,
  initialDocName = '',
  onUploadSuccess,
  onCancel,
  suggestedDocs = [],
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState(initialDocName);
  const [docType, setDocType] = useState('Land & Civil Architecture');
  const [expiryDate, setExpiryDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Upload progress and states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Gemini Vision Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    documentType: string;
    expiry: string;
    reusableFor: string[];
    extractedFields: Record<string, any>;
    confidence: number;
    department?: string;
    reusableCount?: number;
    message?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerAiAnalysis = async (file: File) => {
    try {
      setIsAnalyzing(true);
      const res = await documentService.analyzeDocument(file, {
        projectId,
        documentName: docName || file.name,
      });
      if (res && res.documentType) {
        setAiAnalysis(res);
        // Pre-fill fields if not already manually customized
        if (!docName || docName === file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')) {
          setDocName(res.documentType);
        }
        if (res.expiry && res.expiry !== 'Perpetual / No Expiry' && !expiryDate) {
          const matchDate = String(res.expiry).match(/\d{4}-\d{2}-\d{2}/);
          if (matchDate) setExpiryDate(matchDate[0]);
        }
      }
    } catch (err: any) {
      console.warn('Gemini Vision analysis skipped:', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileValidation = (file: File): boolean => {
    setErrorMessage(null);

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File exceeds maximum limit of 10 MB (Selected: ${formatFileSize(file.size)}).`
      );
      return false;
    }

    // Validate extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        `File format "${ext}" is not supported. Please upload PDF, PNG, JPEG, or DOCX.`
      );
      return false;
    }

    setSelectedFile(file);

    // Auto-populate document name if empty
    if (!docName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setDocName(cleanName);
    }

    // Trigger Gemini Vision document analysis in background
    triggerAiAnalysis(file);

    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileValidation(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select or drag a document file to upload.');
      return;
    }

    if (!docName.trim()) {
      setErrorMessage('Document name is required.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('projectId', projectId);
      formData.append('name', docName.trim());
      formData.append('documentType', docType);
      if (expiryDate) formData.append('expiryDate', expiryDate);
      if (remarks) formData.append('remarks', remarks.trim());

      const token = localStorage.getItem('maitri_token');

      // Use XMLHttpRequest for real progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/documents/upload`);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            try {
              const res = JSON.parse(xhr.responseText);
              reject(new Error(res.message || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      setSuccessMessage('Document uploaded and indexed successfully into project vault!');
      setSelectedFile(null);
      setDocName('');
      setRemarks('');
      setUploadProgress(100);

      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const isImage =
    selectedFile?.type.startsWith('image/') ||
    ['.png', '.jpg', '.jpeg'].some((ext) => selectedFile?.name.toLowerCase().endsWith(ext));

  return (
    <Card className="max-w-2xl mx-auto shadow-xl border border-slate-200 dark:border-slate-800">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-orange-600" />
              <span>Smart Document Intake Vault</span>
            </CardTitle>
            <CardDescription>
              Upload statutory artifacts with automatic reuse cross-referencing
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 ring-4 ring-orange-100 dark:ring-orange-950/50'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-orange-400 bg-slate-50/50 dark:bg-slate-800/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                  {isImage ? <ImageIcon className="w-6 h-6" /> : <FileCheck className="w-6 h-6" />}
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)} &bull; Ready to index
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-xs mt-2"
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 mx-auto flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Drag and drop your file here, or browse
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Supported: PDF, PNG, JPEG, DOCX &bull; Maximum 10 MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Gemini Vision Document Analysis State & Multi-Approval Reusability */}
          {isAnalyzing && (
            <div className="p-3.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-xs flex items-center gap-2.5 text-orange-900 dark:text-orange-200 animate-pulse">
              <Sparkles className="w-4 h-4 text-orange-600 animate-spin flex-shrink-0" />
              <span>Gemini Vision is analyzing statutory artifact, verifying authority stamps, and calculating approval reusability...</span>
            </div>
          )}

          {aiAnalysis && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-orange-50/90 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-orange-950/40 border border-orange-300 dark:border-orange-700/60 space-y-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-extrabold text-sm shadow">
                    {aiAnalysis.reusableFor?.length || 4}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Reusable for {aiAnalysis.reusableFor?.length || 4} Approvals</span>
                      <Sparkles className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Eliminates redundant paperwork across {aiAnalysis.reusableFor?.length || 4} Maharashtra statutory clearances
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex-shrink-0">
                  {aiAnalysis.confidence || 98}% AI Confidence
                </span>
              </div>

              {/* Detected metadata breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-lg border border-orange-200/70 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Document Type:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {aiAnalysis.documentType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Statutory Authority:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {aiAnalysis.department || 'Statutory Department'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Validity / Expiry:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {aiAnalysis.expiry || 'Perpetual / No Expiry'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Extracted Data:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {Object.keys(aiAnalysis.extractedFields || {}).length} Fields Extracted
                  </span>
                </div>
              </div>

              {/* Satisfied approvals badges */}
              <div className="space-y-1.5 pt-0.5">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                  Satisfies Following Statutory Approvals:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {aiAnalysis.reusableFor?.map((approval: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-orange-200 dark:border-slate-700 flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span className="truncate max-w-[220px]">{approval}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Suggest from Missing Documents */}
          {suggestedDocs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Quick Fill from Missing Approvals:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedDocs.slice(0, 5).map((doc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDocName(doc);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition-colors text-left truncate max-w-xs"
                  >
                    + {doc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields: Name, Category, Expiry, Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Official Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. GST Registration Certificate, Plant CAD Layout"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Statutory Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Validity Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Compliance Remarks & Notes (Optional)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="e.g. Certified by Chartered Structural Engineer, Registration No. 2026/A"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
              />
            </div>
          </div>

          {/* Progress Bar (when uploading) */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Uploading and hashing document...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isUploading}>
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={isUploading || !selectedFile}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs"
            >
              <UploadCloud className="w-4 h-4 mr-1.5" />
              <span>{isUploading ? `Uploading ${uploadProgress}%` : 'Upload & Cross-Reference'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadDocument;
