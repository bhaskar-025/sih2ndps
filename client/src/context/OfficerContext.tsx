import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/notification.api';
import { apiClient } from '../api/client';

export interface GlobalOfficerFilters {
  department: string;
  district: string;
  industry: string;
  status: string;
  priority: string;
  risk: string;
  search: string;
}

const defaultFilters: GlobalOfficerFilters = {
  department: 'ALL',
  district: 'ALL',
  industry: 'ALL',
  status: 'ALL',
  priority: 'ALL',
  risk: 'ALL',
  search: '',
};

interface OfficerContextType {
  // Scrutiny Workspace Drawer state
  selectedApplicationId: string | null;
  isReviewDrawerOpen: boolean;
  openReviewDrawer: (applicationId: string) => void;
  closeReviewDrawer: () => void;

  // Global Search state
  isGlobalSearchOpen: boolean;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;

  // Filters state
  filters: GlobalOfficerFilters;
  setFilter: (key: keyof GlobalOfficerFilters, value: string) => void;
  resetFilters: () => void;

  // Real-time Notifications state (polled every 30s)
  unreadNotificationsCount: number;
  refreshNotifications: () => Promise<void>;

  // System mode state
  isMockFallbackActive: boolean;
}

const OfficerContext = createContext<OfficerContextType | undefined>(undefined);

export const OfficerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [filters, setFilters] = useState<GlobalOfficerFilters>(defaultFilters);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(4);
  const [isMockFallbackActive, setIsMockFallbackActive] = useState<boolean>(false);

  const openReviewDrawer = useCallback((applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsReviewDrawerOpen(true);
  }, []);

  const closeReviewDrawer = useCallback(() => {
    setIsReviewDrawerOpen(false);
    setSelectedApplicationId(null);
  }, []);

  const openGlobalSearch = useCallback(() => {
    setIsGlobalSearchOpen(true);
  }, []);

  const closeGlobalSearch = useCallback(() => {
    setIsGlobalSearchOpen(false);
  }, []);

  const setFilter = useCallback((key: keyof GlobalOfficerFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const items = await notificationApi.getNotifications({ unreadOnly: true });
      setUnreadNotificationsCount(items.length);
      setIsMockFallbackActive(apiClient.isMockFallbackActive);
    } catch (err) {
      console.warn('[OfficerContext] Failed to poll notifications stream:', err);
    }
  }, []);

  // Real-time polling every 30 seconds
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  // Keyboard shortcut Ctrl+K / Cmd+K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <OfficerContext.Provider
      value={{
        selectedApplicationId,
        isReviewDrawerOpen,
        openReviewDrawer,
        closeReviewDrawer,
        isGlobalSearchOpen,
        openGlobalSearch,
        closeGlobalSearch,
        filters,
        setFilter,
        resetFilters,
        unreadNotificationsCount,
        refreshNotifications,
        isMockFallbackActive,
      }}
    >
      {children}
    </OfficerContext.Provider>
  );
};

export const useOfficer = (): OfficerContextType => {
  const context = useContext(OfficerContext);
  if (!context) {
    throw new Error('useOfficer must be used within an OfficerProvider');
  }
  return context;
};
