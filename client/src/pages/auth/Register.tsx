import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth.types';
import { Lock, Mail, User, Building, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/Button';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Entrepreneur');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        companyName: role === 'Entrepreneur' ? companyName : undefined,
        department: role === 'Officer' ? department : undefined,
        phone,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Create <span className="text-orange-500">MAITRI+</span> Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Register your industrial entity or government nodal officer account
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {error && (
          <div className="mb-5 flex items-center gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Account Registration Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Entrepreneur', 'Officer', 'Admin'] as UserRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    role === r
                      ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/30'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Authorized Signatory Name"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {role === 'Entrepreneur' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Industrial Unit / Enterprise Name
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Sahyadri Bio-Tech Pvt Ltd"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {role === 'Officer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Regulatory Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="">Select Department</option>
                <option value="Maharashtra Pollution Control Board (MPCB)">
                  Maharashtra Pollution Control Board (MPCB)
                </option>
                <option value="Maharashtra Industrial Development Corporation (MIDC)">
                  Maharashtra Industrial Development Corporation (MIDC)
                </option>
                <option value="Directorate of Industries">Directorate of Industries</option>
                <option value="Fire Services Department">Fire Services Department</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@entity.in"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Secure Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full py-2.5 mt-2">
            <span>Create {role} Account</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="text-orange-400 font-semibold hover:underline">
          Sign In here
        </Link>
      </div>
    </div>
  );
};
