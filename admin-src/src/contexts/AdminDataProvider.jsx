import { useEffect, useMemo } from 'react';
import { AdminDataContext } from './AdminDataContext';
import { useApi } from '../hooks/useApi';

export function AdminDataProvider({ children }) {
  const { data, reload } = useApi('/admin/sidebar-badges', { pollMs: 60_000 });

  // Refresh once when the tab becomes visible again (the poll skips hidden tabs).
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') reload(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [reload]);

  const value = useMemo(() => {
    const d = data || {};
    return {
      badges: data ? {
        onlineUsers: (d.onlineUsers || []).filter(u => u.role !== 'admin'),
        onlineIds: new Set((d.onlineUsers || []).map(u => u._id)),
        pendingGrades: d.pendingGrades || 0,
        pendingUpgrades: d.pendingUpgrades || 0,
        pendingTuition: d.pendingTuition || 0,
        pendingMessages: d.pendingMessages || 0,
        violations: (d.mockViolations || 0) + (d.simViolations || 0),
        pendingEntranceReviews: d.pendingEntranceReviews || 0,
      } : null,
      reloadBadges: reload,
    };
  }, [data, reload]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}
