import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    projects: 'Industrial Units (Projects)',
    new: 'New Unit Registration',
    edit: 'Edit Docket',
    applications: 'Industrial Approvals',
    compliance: 'Compliance Tracker',
    schemes: 'Incentives & Schemes',
    documents: 'Document Vault',
    inspections: 'Field Inspections',
    users: 'User Management',
    settings: 'Settings',
  };

  return (
    <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 py-1">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>MAITRI+</span>
      </Link>
      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-200">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
