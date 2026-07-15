// Shared sort options for admin list pages (tests, prompts, samples...).
// Value format: '<field>-<direction>' where field is 'name' or 'date'.
export const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Mới nhất' },
  { value: 'date-asc', label: 'Cũ nhất' },
  { value: 'name-asc', label: 'Tên A → Z' },
  { value: 'name-desc', label: 'Tên Z → A' },
];

export function sortItems(items, sortBy, { nameKey = 'name', dateKey = 'createdAt' } = {}) {
  const arr = [...items];
  switch (sortBy) {
    case 'name-asc':
      return arr.sort((a, b) => String(a[nameKey] || '').localeCompare(String(b[nameKey] || ''), 'vi'));
    case 'name-desc':
      return arr.sort((a, b) => String(b[nameKey] || '').localeCompare(String(a[nameKey] || ''), 'vi'));
    case 'date-asc':
      return arr.sort((a, b) => new Date(a[dateKey] || 0) - new Date(b[dateKey] || 0));
    case 'date-desc':
    default:
      return arr.sort((a, b) => new Date(b[dateKey] || 0) - new Date(a[dateKey] || 0));
  }
}
