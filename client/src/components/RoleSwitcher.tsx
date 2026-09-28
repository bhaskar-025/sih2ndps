import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth.types';
import { UserCheck, ShieldCheck, Briefcase } from 'lucide-react';
import { cn } from '../utils/cn';

export const RoleSwitcher: React.FC = () => {
  const { user, switchRoleDemo } = useAuth();

  const roles: { role: UserRole; label: string; icon: React.ComponentType<any> }[] = [
    { role: 'Entrepreneur', label: 'Entrepreneur', icon: Briefcase },
    { role: 'Officer', label: 'Nodal Officer', icon: UserCheck },
    { role: 'Admin', label: 'Apex Admin', icon: ShieldCheck },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 px-2 tracking-wider">
        Demo Persona:
      </span>
      {roles.map(({ role, label, icon: Icon }) => {
        const isActive = user?.role === role;
        return (
          <button
            key={role}
            onClick={() => switchRoleDemo(role)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all',
              isActive
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
