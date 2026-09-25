import { createContext, useContext } from 'react';

// Site-wide admin counters (pending grades, online users, violations…) from
// GET /admin/sidebar-badges, polled ONCE by AdminDataProvider and shared by
// the Sidebar, the Dashboard's "Cần xử lý" panel and the Users page's
// online dots (which used to each fetch the same data separately).
export const AdminDataContext = createContext({ badges: null, reloadBadges: () => {} });

export function useAdminData() {
  return useContext(AdminDataContext);
}
