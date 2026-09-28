import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl font-extrabold text-orange-600">404</div>
      <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The industrial service docket or route you are looking for does not exist or has been relocated under MAITRI+.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button>
            <Home className="w-4 h-4 mr-2" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
