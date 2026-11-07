// Display helpers for the admin "Thời gian online" views.

const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function fmtMinutes(sec) {
  const m = Math.round((sec || 0) / 60);
  if (!sec) return '0 phút';
  if (m < 1) return '< 1 phút';
  if (m < 60) return `${m} phút`;
  return `${Math.floor(m / 60)} giờ ${m % 60 ? `${m % 60} phút` : ''}`.trim();
}

export function fmtSpan(sec) {
  const s = Math.round(sec || 0);
  if (s < 60) return `${s} giây`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút${s % 60 ? ` ${s % 60} giây` : ''}`;
  return `${Math.floor(m / 60)} giờ ${m % 60} phút`;
}

export function fmtClock(d) {
  return new Date(d).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
}

export function fmtDayLabel(key) {
  const [y, m, d] = key.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAY[wd]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}
