import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  FileCheck2,
  ShieldAlert,
  Coins,
  Building2,
  CalendarCheck,
  Users,
  FileText,
  Sparkles,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Badge } from './Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const role = user?.role || 'Entrepreneur';
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    {
      label: 'Main Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Entrepreneur', 'Officer', 'Admin', 'entrepreneur', 'officer', 'admin'],
    },
    {
      label: 'Industrial Units',
      to: '/projects',
      icon: Building2,
      badge: 'Units',
      roles: ['Entrepreneur', 'Officer', 'Admin', 'entrepreneur', 'officer', 'admin'],
    },
    {
      label: 'Industrial Approvals',
      to: '/applications',
      icon: FileCheck2,
      badge: 'Clearance',
      roles: ['Entrepreneur', 'Officer', 'Admin'],
    },
    {
      label: 'Smart Document Vault',
      to: '/documents',
      icon: FileText,
      badge: 'OCR',
      roles: ['Entrepreneur', 'Officer', 'Admin', 'entrepreneur', 'officer', 'admin'],
    },
    {
      label: 'Officer Workspace',
      to: '/officer',
      icon: UserCheck,
      badge: 'Scrutiny',
      roles: ['Officer', 'Admin', 'officer', 'admin'],
    },
    {
      label: 'Compliance Tracker',
      to: '/compliance',
      icon: ShieldAlert,
      badge: 'AI Audits',
      roles: ['Entrepreneur', 'Officer', 'Admin'],
    },
    {
      label: 'Incentives & Schemes',
      to: '/schemes',
      icon: Coins,
      badge: 'PSI 2026',
      roles: ['Entrepreneur', 'Officer', 'Admin'],
    },
    {
      label: 'Field Inspections',
      to: '/inspections',
      icon: CalendarCheck,
      roles: ['Officer', 'Admin'],
    },
    {
      label: 'Department Registry',
      to: '/departments',
      icon: Shield,
      roles: ['Admin', 'Officer'],
    },
    {
      label: 'User Directory',
      to: '/users',
      icon: Users,
      roles: ['Admin'],
    },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.map((r) => r.toLowerCase()).includes(role.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{
          width: isCollapsed ? 80 : 288,
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-white/95 dark:border-slate-800/80 dark:bg-slate-900/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header / Brand */}
        <div className="flex h-20 items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 via-amber-600 to-orange-500 text-white shadow-md shadow-orange-500/25">
              <Sparkles className="h-6 w-6" />
            </div>

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                    MAITRI<span className="text-orange-600">+</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                    SIH
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                  Govt. of Maharashtra
                </p>
              </motion.div>
            )}
          </div>

          {/* Desktop collapse toggle button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-orange-600" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* User Persona Chip */}
        {!isCollapsed ? (
          <div className="p-3 mx-3 my-3 rounded-xl bg-slate-50/80 border border-slate-200/70 dark:bg-slate-800/50 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Persona
              </span>
              <Badge
                variant={
                  role.toLowerCase() === 'admin'
                    ? 'destructive'
                    : role.toLowerCase() === 'officer'
                    ? 'saffron'
                    : 'success'
                }
                className="text-[10px] py-0 px-1.5 capitalize"
              >
                {role}
              </Badge>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.name || 'Enterprise User'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {user?.companyName || user?.department || user?.email}
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-3">
            <div
              className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 font-bold text-xs border border-orange-200 dark:border-orange-800/60"
              title={`${user?.name} (${role})`}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'MP'}
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operations & Clearances
            </div>
          )}

          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.to)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center rounded-xl py-2.5 text-xs font-semibold transition-all duration-150',
                      isCollapsed ? 'justify-center px-0' : 'justify-between px-3',
                      isActive
                        ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 text-orange-600 dark:from-orange-500/25 dark:to-transparent dark:text-orange-400 font-bold border-l-4 border-orange-600 dark:border-orange-500'
                        : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                    )
                  }
                >
                  <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
                    <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>

                {/* Floating tooltip for collapsed rail mode */}
                {isCollapsed && hoveredItem === item.to && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl dark:bg-slate-800 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-600 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info badge */}
        {!isCollapsed ? (
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-slate-900 p-3 border border-orange-200/60 dark:border-orange-900/40 text-xs shadow-sm">
              <div className="flex items-center gap-2 font-bold text-orange-800 dark:text-orange-300">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>PS-26130 Live SLA</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Streamlined approvals, document reuse & multi-department tracking intelligence.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-center">
            <div
              className="p-2 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
              title="PS-26130 Intelligence"
            >
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
