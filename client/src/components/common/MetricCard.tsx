import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../Card';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'default';
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'primary',
  onClick,
  trend,
  className = '',
}) => {
  const colorMap = {
    primary: {
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-900',
      glow: 'shadow-orange-500/10',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-900',
      glow: 'shadow-emerald-500/10',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-900',
      glow: 'shadow-amber-500/10',
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-950/40',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-900',
      glow: 'shadow-red-500/10',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-900',
      glow: 'shadow-purple-500/10',
    },
    default: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      glow: 'shadow-slate-500/10',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={`relative overflow-hidden border p-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 shadow-sm hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {value}
            </span>
            {trend && (
              <span
                className={`text-[10px] font-bold ${
                  trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
              {subtext}
            </p>
          )}
        </div>

        <div className={`p-2.5 rounded-xl border ${scheme.bg} ${scheme.border} ${scheme.text} flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};

export const StatCard = MetricCard;
