import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/50 px-6 py-4 dark:border-slate-800/80 dark:bg-slate-900/50 backdrop-blur-sm text-xs text-slate-500 dark:text-slate-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <span>
            <strong className="text-slate-700 dark:text-slate-300">MAITRI+</strong> &bull; Maharashtra AI-powered Industrial Registration & Tracking Intelligence
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
            SIH Problem Statement: PS-26130
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hover:text-orange-600 cursor-pointer transition-colors">
            Right to Public Services Act (RTS)
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hover:text-orange-600 cursor-pointer transition-colors">
            Helpdesk: 1800-120-8040
          </span>
        </div>
      </div>
    </footer>
  );
};
