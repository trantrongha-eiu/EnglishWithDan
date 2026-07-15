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
} = {}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [page, setPage] = useState(1);

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

  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  return {
    search, setSearch,
    statusFilter, setStatusFilter,
    sortBy, setSortBy,
    page, setPage,
    paged,
    filteredCount: filtered.length,
    pageSize,
  };
}
