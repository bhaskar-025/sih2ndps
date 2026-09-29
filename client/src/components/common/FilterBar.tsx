import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '../Button';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}

export interface FilterBarProps {
  filters: FilterConfig[];
  onReset?: () => void;
  className?: string;
  extraActions?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onReset,
  className = '',
  extraActions,
}) => {
  const hasActiveFilters = filters.some((f) => f.value && f.value !== 'ALL' && f.value !== '');

  return (
    <div
      className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] uppercase tracking-wider mr-1">
          <Filter className="w-3.5 h-3.5 text-orange-600" />
          <span>Filters:</span>
        </div>

        {filters.map((filter) => (
          <div key={filter.id} className="min-w-[130px]">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors cursor-pointer"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {hasActiveFilters && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-[11px] h-7 px-2 text-slate-500 hover:text-orange-600"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {extraActions && <div className="flex items-center gap-2">{extraActions}</div>}
    </div>
  );
};
