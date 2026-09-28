import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react';
import { Skeleton } from './Skeleton';
import { EmptyState, ErrorState } from './EmptyState';
import { cn } from '../utils/cn';

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T | string;
  cell?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  searchKey?: keyof T | ((item: T) => string);
  pageSize?: number;
  pagination?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
  stickyHeader?: boolean;
  actions?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load records from server',
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display matching the criteria.',
  searchPlaceholder = 'Search records...',
  searchable = true,
  searchKey,
  pageSize = 10,
  pagination = true,
  onRowClick,
  className,
  stickyHeader = true,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();
    return data.filter((item) => {
      if (searchKey) {
        if (typeof searchKey === 'function') {
          return searchKey(item).toLowerCase().includes(term);
        }
        const val = item[searchKey];
        return String(val ?? '').toLowerCase().includes(term);
      }

      // Default: inspect all primitive values of item
      return Object.values(item as Record<string, any>).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [data, searchTerm, searchKey]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(String(bVal));
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });
  }, [filteredData, sortField, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const handleSort = (key?: string) => {
    if (!key) return;
    if (sortField === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  return (
    <div className={cn('w-full rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900 overflow-hidden', className)}>
      {/* Top Filter and Controls Bar */}
      {(searchable || actions) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          {searchable ? (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          ) : <div />}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead
            className={cn(
              'border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold text-[11px]',
              stickyHeader && 'sticky top-0 z-10 backdrop-blur-sm'
            )}
          >
            <tr>
              {columns.map((col, index) => {
                const sortKey = (col.accessorKey as string) || '';
                const isCurrentSort = sortField === sortKey;

                return (
                  <th
                    key={index}
                    onClick={() => col.sortable && handleSort(sortKey)}
                    className={cn(
                      'py-3.5 px-4 font-semibold select-none',
                      col.sortable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors',
                      col.headerClassName
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isCurrentSort ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-orange-600" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-orange-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`}>
                  {columns.map((_, cIdx) => (
                    <td key={`scell-${cIdx}`} className="py-4 px-4">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <tr
                  key={keyExtractor(item, rowIndex)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    'transition-colors hover:bg-orange-50/40 dark:hover:bg-orange-950/20',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col, colIndex) => {
                    let content: React.ReactNode = null;
                    if (col.cell) {
                      content = col.cell(item, (currentPage - 1) * pageSize + rowIndex);
                    } else if (col.accessorKey) {
                      content = String((item as any)[col.accessorKey] ?? '—');
                    }

                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          'py-3.5 px-4 text-slate-700 dark:text-slate-300 align-middle',
                          col.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && !isLoading && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {(currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {sortedData.length}
            </span>{' '}
            entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-medium text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
