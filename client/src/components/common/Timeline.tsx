import React from 'react';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

export interface TimelineEvent {
  id?: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: 'completed' | 'in_progress' | 'pending' | 'warning' | 'rejected';
  author?: string;
  tag?: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  if (!events || events.length === 0) {
    return <p className="text-xs text-slate-400 py-4 text-center">No timeline events recorded.</p>;
  }

  const iconMap = {
    completed: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    in_progress: <Clock className="w-3.5 h-3.5 text-orange-500 animate-spin" />,
    pending: <Clock className="w-3.5 h-3.5 text-slate-400" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    rejected: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  };

  const ringMap = {
    completed: 'ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-950',
    in_progress: 'ring-orange-500/20 bg-orange-50 dark:bg-orange-950',
    pending: 'ring-slate-400/20 bg-slate-50 dark:bg-slate-800',
    warning: 'ring-amber-500/20 bg-amber-50 dark:bg-amber-950',
    rejected: 'ring-red-500/20 bg-red-50 dark:bg-red-950',
  };

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 ${className}`}>
      {events.map((evt, idx) => {
        const st = evt.status || 'completed';
        return (
          <div key={evt.id || idx} className="relative group">
            <div
              className={`absolute -left-6 top-1 h-4 w-4 rounded-full ring-4 flex items-center justify-center ${ringMap[st]}`}
            >
              {iconMap[st]}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {evt.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDateTime(evt.timestamp)}
                </span>
              </div>

              {evt.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {evt.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-0.5">
                {evt.author && (
                  <span className="text-[10px] font-medium text-slate-400">By: {evt.author}</span>
                )}
                {evt.tag && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {evt.tag}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
