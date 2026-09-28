import React from 'react';
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case 'Approved':
    case 'Compliant':
    case 'Verified':
    case 'Completed':
      return <Badge variant="success" className={className}>● {status.replace(/_/g, ' ')}</Badge>;

    case 'Ready to Apply':
      return <Badge variant="success" className={className}>✓ {status}</Badge>;

    case 'Applied':
    case 'In_Progress':
    case 'Under_Review':
    case 'Under Review':
    case 'Scheduled':
      return <Badge variant="saffron" className={className}>◐ {status.replace(/_/g, ' ')}</Badge>;

    case 'Inspection Pending':
      return <Badge variant="saffron" className={className}>⚲ Inspection Pending</Badge>;

    case 'Recommended':
      return <Badge variant="secondary" className={`bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800 ${className || ''}`}>★ Recommended</Badge>;

    case 'Pending':
    case 'Submitted':
    case 'Draft':
      return <Badge variant="warning" className={className}>○ {status.replace(/_/g, ' ')}</Badge>;

    case 'Documents Missing':
      return <Badge variant="warning" className={`bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 ${className || ''}`}>⚠ Documents Missing</Badge>;

    case 'Clarification_Required':
    case 'Overdue':
    case 'Rejected':
    case 'Cancelled':
      return <Badge variant="destructive" className={className}>✕ {status.replace(/_/g, ' ')}</Badge>;

    default:
      return <Badge variant="secondary" className={className}>{status}</Badge>;
  }

};
