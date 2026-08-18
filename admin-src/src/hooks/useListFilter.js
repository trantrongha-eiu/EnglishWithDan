import { useState } from 'react';
import { sortItems } from '../utils/sort';

const DEFAULT_PAGE_SIZE = 20;

// Shared search + status-filter + sort + pagination for admin list pages
// (tests, prompts, samples...). Consolidates the identical filter/paginate
// boilerplate that used to be hand-rolled per page (ListeningTests,
// ReadingTests) so new list pages (WritingTests' 4 tabs) get the same
// search/status/sort/pagination behavior without re-deriving it.
export function useListFilter(items, {
  searchKeys = ['name'],
  nameKey = searchKeys[0],
  dateKey = 'createdAt',
  statusKey = 'isActive',
  pageSize = DEFAULT_PAGE_SIZE,
  initialPage = 1,
} = {}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [page, setPage] = useState(initialPage);

  const filtered = items.filter(item => {
    if (search) {
      const q = search.toLowerCase();
      if (!searchKeys.some(k => String(item[k] || '').toLowerCase().includes(q))) return false;
    }
    if (statusFilter === 'active' && item[statusKey] === false) return false;
    if (statusFilter === 'hidden' && item[statusKey] !== false) return false;
    return true;
  });

  const sorted = sortItems(filtered, sortBy, { nameKey, dateKey });

  // Adjust-during-render (not an effect): reset to page 1 whenever a filter
  // or the sort changes, in the same render rather than a post-commit effect.
  const [prev, setPrev] = useState([search, statusFilter, sortBy]);
  if (prev[0] !== search || prev[1] !== statusFilter || prev[2] !== sortBy) {
    setPrev([search, statusFilter, sortBy]);
    if (page !== 1) setPage(1);
  }

  // Also clamp when the item count itself shrinks (e.g. a delete/hide
  // action on the current page's last remaining rows, or a caller-side
  // filter — like a Part dropdown applied before this hook — narrowing
  // `items` down). The filter/sort reset above only fires on search/
  // statusFilter/sortBy changing; nothing previously caught `items`
  // getting shorter, so `page` could point past the end, `paged` would be
  // `[]`, and Pagination hides its own nav controls once pages<=1 — a
  // dead-end empty page with no way back except changing the search box.
  const maxPage = Math.max(1, Math.ceil(sorted.length / pageSize));
  if (page > maxPage) setPage(maxPage);

  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  return {
    search, setSearch,
    statusFilter, setStatusFilter,
    sortBy, setSortBy,
    page, setPage,
    paged,
    // Full filtered (but unpaginated) list — needed by bulk actions like
    // "hide/show all" that must act on everything matching the current
    // search/status filter, not just the current page's 20 rows.
    filtered: sorted,
    filteredCount: filtered.length,
    pageSize,
  };
}
