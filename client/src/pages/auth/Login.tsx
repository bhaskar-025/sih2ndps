import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_CREDENTIALS } from '../../data/mockData';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Sign In to <span className="text-orange-500">MAITRI+</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Maharashtra Single Window Clearance & Regulatory Intelligence
        </p>
      </div>

      {/* Main card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {error && (
          <div className="mb-5 flex items-center gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.in or name@gov.in"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <a href="#forgot" className="text-xs text-orange-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full py-2.5 mt-2">
            <span>Authenticate Secure Session</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Demo Fast Track for SIH Evaluators */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SIH Jury Demo Credentials</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1-Click Fill</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_CREDENTIALS.map((demo) => (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleQuickDemoSelect(demo.email, demo.password)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all text-left text-xs group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-orange-400 transition-colors">
                    {demo.role}: {demo.email}
                  </div>
                  <div className="text-[10px] text-slate-400">{demo.label}</div>
                </div>
                <Badge
                  variant={
                    demo.role === 'Admin'
                      ? 'destructive'
                      : demo.role === 'Officer'
                      ? 'saffron'
                      : 'success'
                  }
                  className="text-[10px]"
                >
                  {demo.badge}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Register redirect */}
      <div className="text-center text-xs text-slate-400">
        New industrial enterprise or MSME?{' '}
        <Link to="/register" className="text-orange-400 font-semibold hover:underline">
          Register on MAITRI+ Single Window
        </Link>
      </div>
    </div>
  );
};
