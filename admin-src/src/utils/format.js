import { formatDate } from './api';

// Shared display formatters — these were copy-pasted per page (formatDur ×5,
// formatLastSeen ×2, name composition inline in many rows).

export function formatDur(sec) {
  if (sec == null || !Number.isFinite(Number(sec))) return '–';
  const total = Math.max(0, Math.round(Number(sec)));
  const m = Math.floor(total / 60), s = total % 60;
  return `${m}m${String(s).padStart(2, '0')}s`;
}

export function displayName(u) {
  if (!u) return '–';
  return [u.firstName, u.lastName].map(x => (x || '').trim()).filter(Boolean).join(' ') || u.username || '–';
}

export function initials(u) {
  const n = displayName(u);
  return (n && n !== '–' ? n : '?').trim().charAt(0).toUpperCase();
}

// "5 phút trước" style relative time; `tone` maps to a CSS color var so
// online-recency reads at a glance.
export function formatLastSeen(date) {
  if (!date) return { text: 'Chưa có', color: 'var(--text3)' };
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)   return { text: 'Vừa online', color: 'var(--green)' };
  if (mins < 60)  return { text: `${mins} phút trước`, color: 'var(--green)' };
  if (hours < 24) return { text: `${hours} giờ trước`, color: 'var(--yellow)' };
  if (days < 7)   return { text: `${days} ngày trước`, color: 'var(--text2)' };
  return { text: formatDate(date).split(' ')[0], color: 'var(--text3)' };
}

export function formatDay(date) {
  return date ? formatDate(date).split(' ')[0] : '–';
}

export function formatNumber(n) {
  return n == null ? '–' : Number(n).toLocaleString('vi-VN');
}

export function formatVnd(n) {
  return n == null ? '–' : `${Number(n).toLocaleString('vi-VN')} ₫`;
}

export function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date) - new Date()) / 86_400_000);
}
