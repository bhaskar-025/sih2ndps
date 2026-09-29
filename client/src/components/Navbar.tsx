import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  Sparkles,
  Building2,
  FileCheck2,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useOfficer } from '../context/OfficerContext';
import { ThemeToggle } from './ThemeToggle';
import { RoleSwitcher } from './RoleSwitcher';
import { Badge } from './Badge';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { openGlobalSearch } = useOfficer();

  const {
    notifications: liveNotifications,
    unreadCount,
    markAsRead,
  } = useNotifications();

  // Purely dynamic notification stream from API/Mock Service Layer - zero hardcoding
  const displayNotifications = liveNotifications.map((n) => ({
    id: n._id,
    title: n.title,
    desc: n.message,
    time: n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
    type: n.type?.toLowerCase() || 'approval',
    unread: !n.read,
    link: n.actionUrl || (n.type === 'Inspection' ? '/officer' : '/applications'),
  }));

  // Keyboard shortcut Ctrl+K or Cmd+K to open spotlight search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchIndex = [
    { title: 'Industrial Units (Projects)', category: 'Module', path: '/projects', icon: Building2 },
    { title: 'Register New Industrial Unit', category: 'Action', path: '/projects/new', icon: Sparkles },
    { title: 'Industrial Approvals (Single Window)', category: 'Module', path: '/applications', icon: FileCheck2 },
    { title: 'Smart Document Intelligence Vault', category: 'Module', path: '/documents', icon: FileText },
    { title: 'Upload Project Artifact', category: 'Action', path: '/documents', icon: FileText },
    { title: 'Officer Scrutiny Workspace', category: 'Module', path: '/officer', icon: UserCheck },
    { title: 'Compliance & AI Audits', category: 'Module', path: '/compliance', icon: ShieldAlert },
    { title: 'Incentives & Subsidies (PSI 2026)', category: 'Module', path: '/schemes', icon: Sparkles },
  ];

  const filteredSearchResults = searchIndex.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-6 dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
        {/* Left: Mobile hamburger & Spotlight trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Spotlight Search trigger */}
          <div
            onClick={() => openGlobalSearch()}
            className="relative hidden sm:flex items-center w-64 md:w-80 lg:w-96 rounded-xl border border-slate-200/90 bg-slate-50/80 pl-9 pr-3 py-2 text-xs text-slate-400 hover:border-orange-500/50 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-orange-500/50 dark:hover:bg-slate-800 cursor-pointer transition-all shadow-sm group"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
            <span className="truncate">Search units, NOCs, tracking ID...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search trigger icon */}
          <button
            onClick={() => openGlobalSearch()}
            className="sm:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Role Switcher for Hackathon Evaluation */}
          <div className="hidden sm:block">
            <RoleSwitcher />
          </div>

          {/* Dark / Light Mode Toggle */}
          <ThemeToggle />

          {/* Notifications Icon with Popover */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        liveNotifications.forEach((n) => markAsRead(n._id));
                      }}
                      className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="mt-2 space-y-2 max-h-80 overflow-y-auto pr-1">
                  {displayNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.unread && !n.id.startsWith('mock')) {
                          markAsRead(n.id);
                        }
                        navigate(n.link);
                        setShowNotifications(false);
                      }}
                      className={`p-3 rounded-xl cursor-pointer transition-colors text-xs ${
                        n.unread
                          ? 'bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/40 dark:border-orange-900/30'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="truncate pr-2">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar & Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-transparent hover:border-slate-200/80 hover:bg-slate-100/70 dark:hover:border-slate-800 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'MP'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user?.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize">
                  {user?.role || 'Guest'}
                </div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                  <Badge variant="saffron" className="mt-2 text-[10px] capitalize">
                    {user?.role} Workspace
                  </Badge>
                </div>

                <div className="p-1 space-y-1">
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spotlight Command Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-orange-600 mr-3 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command, project, approval, or document..."
                className="w-full py-4 text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2">
              {filteredSearchResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No matching modules or actions found for "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Navigation & Operations
                  </div>
                  {filteredSearchResults.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          navigate(item.path);
                          setShowSearchModal(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-orange-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                              {item.title}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {item.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Press <kbd className="font-mono bg-white dark:bg-slate-700 px-1 rounded border">Esc</kbd> to exit</span>
              <span>MAITRI+ Quick Command Center</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
