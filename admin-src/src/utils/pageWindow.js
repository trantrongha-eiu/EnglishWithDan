// Windowed pagination: first, last, and 1 page either side of the current
// one, with "…" gaps — the old version rendered one button for EVERY page,
// which overflowed the row once a list passed ~15 pages.
export function pageWindow(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach(p => set.add(p));
  if (page >= pages - 2) [pages - 3, pages - 2, pages - 1].forEach(p => set.add(p));
  const nums = [...set].filter(p => p >= 1 && p <= pages).sort((a, b) => a - b);
  const out = [];
  nums.forEach((p, i) => {
    if (i > 0 && p - nums[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
}
