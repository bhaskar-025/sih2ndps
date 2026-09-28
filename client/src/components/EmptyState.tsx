import React from 'react';
import { Button } from './Button';
import { FolderPlus, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = FolderPlus,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 mb-4 shadow-sm">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} size="sm">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400">
      <AlertCircle className="h-8 w-8 mb-2" />
      <h4 className="text-sm font-bold">Failed to load data from server</h4>
      <p className="text-xs text-rose-600 dark:text-rose-400/80 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Retry Request</span>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
