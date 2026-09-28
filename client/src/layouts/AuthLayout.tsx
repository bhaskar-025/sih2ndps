import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 text-white relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 shadow-lg shadow-orange-600/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            MAITRI<span className="text-orange-500">+</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Center Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 z-10 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-orange-500" />
        <span>Smart India Hackathon &bull; Single Window Industrial Clearance Portal</span>
      </footer>
    </div>
  );
};
