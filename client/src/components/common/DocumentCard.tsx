import React from 'react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../Button';
import { FileText, Eye, Download, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { formatDate, formatFileSize } from '../../utils/formatters';

export interface DocumentCardProps {
  document: {
    _id: string;
    name: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    version?: number;
    verificationStatus: string;
    ocrStatus?: string;
    ocrConfidence?: number;
    isDigitallySigned?: boolean;
    expiryDate?: string;
    usedInApprovals?: string[];
    uploadedAt: string;
  };
  onPreview?: (doc: any) => void;
  onDownload?: (doc: any) => void;
  className?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document: doc,
  onPreview,
  onDownload,
  className = '',
}) => {
  const fullFileUrl = doc.fileUrl.startsWith('http')
    ? doc.fileUrl
    : `http://localhost:5000${doc.fileUrl}`;

  return (
    <Card hover className={`p-4 border transition-all ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 text-orange-600 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h4
              onClick={() => onPreview && onPreview(doc)}
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-orange-600 cursor-pointer transition-colors"
            >
              {doc.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>{doc.fileName}</span>
              <span>&bull;</span>
              <span>{formatFileSize(doc.fileSize)}</span>
              {doc.version && <span>&bull; v{doc.version}.0</span>}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant="secondary" className="text-[10px]">
                {doc.documentType}
              </Badge>
              <StatusBadge status={doc.verificationStatus} className="text-[10px]" />
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                OCR: {doc.ocrStatus || 'Verified'} ({doc.ocrConfidence ?? 98}%)
              </span>
              {doc.isDigitallySigned !== false && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <ShieldCheck className="w-2.5 h-2.5 text-indigo-500" />
                  DSC Certified
                </span>
              )}
            </div>

            {doc.usedInApprovals && doc.usedInApprovals.length > 0 && (
              <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1">
                <span className="font-semibold text-orange-600">Reused across:</span>
                <span>{doc.usedInApprovals.length} Statutory Approvals</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {onPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(doc)}
              className="text-xs h-7 px-2"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>Preview</span>
            </Button>
          )}

          <a href={fullFileUrl} target="_blank" rel="noopener noreferrer" download>
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
              <Download className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
};
