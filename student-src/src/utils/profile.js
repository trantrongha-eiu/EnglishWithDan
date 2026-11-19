// Hồ sơ (pages/Profile.jsx): the rules from js/profile.js, without the page.

export const VALID_TABS = ['overview', 'goal', 'edit', 'security', 'history', 'inventory'];

// ?focus=<id> sections that live inside a tab
export const FOCUS_TABS = {
  readingHistoryCard: 'history',
  listeningHistoryCard: 'history',
  writingHistoryCard: 'history',
  speakingHistoryCard: 'history',
};

export const BAND_OPTIONS = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9'];

export const ACCENT_KEY = 'profileAccent';
export const BRAND_DEFAULT = '#e53935';
export const ACCENTS = [
  { primary: '#e53935', dark: '#c62828', background: '#e53935', title: 'Đỏ (Mặc định)' },
  { primary: '#f5576c', dark: '#d63651', background: 'linear-gradient(135deg,#f093fb,#f5576c)', title: 'Hồng' },
  { primary: '#667eea', dark: '#5a67d8', background: '#667eea', title: 'Tím' },
  { primary: '#10b981', dark: '#059669', background: '#10b981', title: 'Xanh lá' },
  { primary: '#06b6d4', dark: '#0891b2', background: '#06b6d4', title: 'Xanh cyan' },
  { primary: '#f59e0b', dark: '#d97706', background: '#f59e0b', title: 'Vàng cam' },
  { primary: '#3b82f6', dark: '#2563eb', background: '#3b82f6', title: 'Xanh dương' },
];

// Must recolour exactly what theme.js recolours on every page load
export function applyAccent(primary, dark) {
  const s = document.documentElement.style;
  s.setProperty('--primary', primary);
  s.setProperty('--primary-dark', dark);
  s.setProperty('--brand', primary);
  s.setProperty('--brand-dark', dark);
  const light = window.hexToRgba?.(primary, 0.12);
  if (light) s.setProperty('--brand-light', light);
}

export function savedAccent() {
  try { return JSON.parse(localStorage.getItem(ACCENT_KEY) || 'null'); } catch { return null; }
}

// Every other page reads name / avatar / targetBand from the login payload
// cached in localStorage: merge the display fields into it, never replace it.
const CACHED_PROFILE_FIELDS = ['firstName', 'lastName', 'username', 'email', 'avatar', 'role', 'targetBand',
  'plan', 'planExpiresAt', 'planStartedAt', 'emailVerified', 'mustChangePassword', 'createdAt', 'trialStartedAt'];

export function syncCachedUser(u) {
  const auth = window.AuthService;
  if (!u || !auth?.setUser) return;
  const cached = auth.getUser?.() || {};
  CACHED_PROFILE_FIELDS.forEach((k) => { if (u[k] !== undefined) cached[k] = u[k]; });
  if (!cached.id && u._id) cached.id = u._id;
  auth.setUser(cached);
}

export const userInitial = (u) => (u.firstName || u.username || '?')[0].toUpperCase();

// The avatar in the site menu belongs to nav.js
export function setNavAvatar(u) {
  const el = document.getElementById('navAvatar');
  if (!el) return;
  el.textContent = '';
  if (!u.avatar) { el.textContent = userInitial(u); return; }
  const img = document.createElement('img');
  img.src = u.avatar;
  img.alt = 'avatar';
  img.style.cssText = 'width:34px;height:34px;object-fit:cover;display:block;';
  el.appendChild(img);
}

export const formFromUser = (u) => ({
  firstName: u.firstName || '',
  lastName: u.lastName || '',
  username: u.username || '',
  email: u.email || '',
  bio: u.bio || '',
  studyMotto: u.studyMotto || '',
  targetBand: u.targetBand != null ? String(u.targetBand) : '',
  // straight off the ISO string: new Date() can shift the day in UTC+ zones
  targetExamDate: String(u.targetExamDate || '').slice(0, 10),
});

export const EMPTY_FORM = formFromUser({});

const fmtDay = (d) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const DAY = 86400000;
// planStartedAt is missing on old accounts: guess the plan length from what is left
const PLAN_TIERS = [30, 90, 180, 365, 1095];

export function planInfo(u, now = new Date()) {
  const expiresAt = u.planExpiresAt ? new Date(u.planExpiresAt) : null;
  const isPremium = (u.plan || 'free') === 'premium';
  const isExpired = !!expiresAt && expiresAt < now;
  const running = isPremium && !isExpired;

  let badge = { cls: 'plan-tag--free', text: '🆓 Free' };
  if (running) badge = { cls: 'plan-tag--premium', text: '⭐ Premium' };
  else if (isExpired) badge = { cls: 'plan-tag--expired', text: '⏰ Hết hạn' };

  const info = {
    badge,
    memberSince: fmtDay(new Date(u.createdAt)),
    expires: expiresAt ? fmtDay(expiresAt) : '',
    countdown: null,
    upgrade: null,
  };

  const daysLeft = running && expiresAt ? Math.ceil((expiresAt - now) / DAY) : null;
  if (daysLeft !== null) {
    const start = u.planStartedAt ? new Date(u.planStartedAt) : null;
    const total = start
      ? Math.max(Math.ceil((expiresAt - start) / DAY), daysLeft)
      : (PLAN_TIERS.find((t) => daysLeft <= t) || PLAN_TIERS[PLAN_TIERS.length - 1]);
    info.countdown = {
      daysLeft,
      pct: Math.max(0, Math.min(100, (daysLeft / Math.max(total, 1)) * 100)),
      cls: daysLeft <= 7 ? 'warn' : daysLeft <= 30 ? 'mid' : 'ok',
      color: daysLeft <= 7 ? '#ef4444' : daysLeft <= 30 ? '#f59e0b' : '#22c55e',
    };
  }

  if (!running) info.upgrade = { label: isExpired ? 'Gia hạn Premium' : 'Nâng cấp Premium' };
  else if (daysLeft !== null && daysLeft <= 7) {
    info.upgrade = {
      label: `Gia hạn ngay — còn ${daysLeft} ngày`,
      background: daysLeft <= 3 ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#d97706,#f59e0b)',
    };
  }
  return info;
}

const SKILLS = ['reading', 'listening', 'writing', 'speaking'];
export const SKILL_LABELS = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };

// One absent field must not blank the whole page
export function normalizeStats(raw) {
  const s = { ...raw };
  SKILLS.forEach((k) => {
    s[k] = { total: 0, avgBand: null, ...s[k] };
    if (!Array.isArray(s[k].history)) s[k].history = [];
  });
  return s;
}

// Bars use a 4–9 scale, the realistic IELTS floor, not 0–9
const BAND_MIN = 4;
const BAND_MAX = 9;
export const bandToPct = (b) => Math.max(0, Math.min(100,
  ((Math.min(BAND_MAX, Math.max(BAND_MIN, b)) - BAND_MIN) / (BAND_MAX - BAND_MIN)) * 100));
export function bandWidth(v) {
  const b = parseFloat(v);
  return b ? `${bandToPct(b)}%` : '0%';
}

// Oldest first per skill; a skill with no scored attempt is left out
export function trendSeries(s) {
  const at = (a) => new Date(a.createdAt).getTime();
  const series = {
    reading: s.reading.history.map((a) => ({ t: at(a), y: a.bandScore })),
    listening: s.listening.history.map((a) => ({ t: at(a), y: a.bandScore })),
    writing: s.writing.history.filter((a) => a.grading?.overallBand != null).map((a) => ({ t: at(a), y: a.grading.overallBand })),
    speaking: s.speaking.history.map((a) => ({ t: at(a), y: a.aiFeedback?.overallBand })).filter((p) => p.y != null),
  };
  return SKILLS.filter((k) => series[k].length).map((k) => ({
    key: k,
    points: series[k].sort((a, b) => a.t - b.t),
  }));
}

// The weakest skill among those with a real band (a skill never tried is not "weak")
export function studyPlan(s, user, now = new Date()) {
  const tried = SKILLS.filter((k) => s[k]?.total > 0 && parseFloat(s[k].avgBand) > 0);
  if (!tried.length) return null;
  const weakest = tried.reduce((min, k) => (parseFloat(s[k].avgBand) < parseFloat(s[min].avgBand) ? k : min));
  let daysLeft = null;
  if (user?.targetExamDate) {
    const n = Math.ceil((new Date(user.targetExamDate) - now) / DAY);
    if (n >= 0) daysLeft = n;
  }
  return { label: SKILL_LABELS[weakest], band: s[weakest].avgBand, daysLeft };
}

export function recentActivities(s) {
  const list = [];
  const add = (key, icon, color, get) => s[key].history.slice(0, 3).forEach((a) => {
    list.push({ icon, color, date: a.createdAt, ...get(a) });
  });
  add('reading', '📖', 'rgba(102,126,234,.1)', (a) => ({ text: 'Reading test – Band ', band: a.bandScore }));
  add('listening', '🎧', 'rgba(16,185,129,.1)', (a) => ({ text: 'Listening test – Band ', band: a.bandScore }));
  add('speaking', '🎤', 'rgba(245,158,11,.1)', (a) => {
    const band = a.aiFeedback?.overallBand;
    return band ? { text: 'Speaking – Band ', band } : { text: 'Speaking practice' };
  });
  add('writing', '✍️', 'rgba(139,92,246,.1)', (a) => {
    const band = a.grading?.overallBand;
    return band != null ? { text: 'Writing – Band ', band } : { text: 'Writing practice' };
  });
  return list.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
}

// Groups the student has started are open; the rest fold away
export function badgeGroups(bd) {
  const cats = bd.categories?.length
    ? bd.categories
    : [...new Set(bd.badges.map((b) => b.category))].map((id) => ({ id, name: id, icon: '🏅' }));
  const groups = cats.map((c) => {
    const list = bd.badges.filter((b) => b.category === c.id);
    const got = list.filter((b) => b.earned).length;
    return { ...c, list, got, open: got > 0 || list.some((b) => b.progress.current > 0) };
  }).filter((g) => g.list.length);
  if (groups.length && !groups.some((g) => g.open)) groups[0] = { ...groups[0], open: true };
  return groups;
}

export const HEAT_WEEKS = 26;

// Full weeks from a Sunday through today. Local dates, not toISOString(): that
// would shift every day back in Vietnam against the server's VN-day buckets.
export function heatCells(activity, now = new Date()) {
  const counts = Object.fromEntries(activity.map((d) => [d.date, d.count]));
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const cur = new Date(today);
  cur.setDate(cur.getDate() - (HEAT_WEEKS * 7 - 1));
  cur.setDate(cur.getDate() - cur.getDay());
  const pad = (n) => String(n).padStart(2, '0');
  const level = (n) => (n === 0 ? 0 : n === 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 3 : 4);
  const cells = [];
  for (; cur <= today; cur.setDate(cur.getDate() + 1)) {
    const key = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
    const n = counts[key] || 0;
    cells.push({ key, n, level: level(n) });
  }
  return cells;
}

export const MAX_AVATAR_BYTES = 20 * 1024 * 1024; // a sanity cap before the file is read

// JPEG has no alpha channel: without the white fill a transparent PNG turns black
export function compressImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) { height = Math.round((height * maxSize) / width); width = maxSize; }
          else { width = Math.round((width * maxSize) / height); height = maxSize; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
