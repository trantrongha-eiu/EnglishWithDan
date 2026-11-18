// Cửa hàng lửa + BXH: request helper and the rules from js/shop.js and
// js/vocab-leaderboard.js.
import { apiFetch } from './api';

// Always resolves, with the server's { success, message } when it refused: a
// purchase or a 🎂 needs that message, and its button must recover offline.
export function shopApi(method, url, body) {
  return apiFetch(url, { method, body: body ? JSON.stringify(body) : undefined }).catch((err) => {
    if (err?.body) return err.body;
    if (err?.status) return { success: false };
    return { success: false, message: 'Không kết nối được máy chủ, thử lại nhé.' };
  });
}

export function fmtUntil(iso) {
  const ms = new Date(iso) - Date.now();
  if (ms <= 0) return 'sắp hết';
  const h = Math.floor(ms / 3600000);
  if (h >= 24) return `còn ${Math.ceil(h / 24)} ngày`;
  if (h >= 1) return `còn ${h} giờ`;
  return `còn ${Math.max(1, Math.round(ms / 60000))} phút`;
}

// The server's MAX_BUY_QTY
const MAX_QTY = 99;

// Most the student can take home right now
export function maxQty(item, wallet) {
  let n = Math.min(MAX_QTY, Math.floor(wallet / item.price));
  if (item.maxOwned) n = Math.min(n, item.maxOwned - item.owned);
  return Math.max(0, n);
}

export const canBuyItem = (item, wallet) => wallet >= item.price && !(item.maxOwned && item.owned >= item.maxOwned);

// The Búa Hi Vọng result is announced once, on the first shop visit after it
export function takeHopeResult(effects) {
  const last = effects?.hopeLast;
  if (!last?.day || effects.hope) return null;
  const key = `ews-hope-seen-${last.day}`;
  let seen = false;
  try {
    seen = localStorage.getItem(key) === '1';
    localStorage.setItem(key, '1');
  } catch { /* private mode: show it */ }
  return seen ? null : last;
}

export function cakeToast(d, name) {
  if (!d.success) return [d.message || 'Không ném được', 'error'];
  if (d.outcome === 'reflected') return [`⚡ Bốp! ${d.petName} của ${name} phản đòn — bánh úp ngược vào mặt bạn 😱`, 'error'];
  if (d.outcome === 'blocked') return [`🛡️ ${d.petName} của ${name} đã hộ thể chặn bánh! Mất 1 🎂 rồi…`, 'info'];
  return [`🎂 Bẹp! ${name} dính đầy kem rồi 😆`, 'success'];
}

export function streakSub(s) {
  let sub;
  if (!s.rank) sub = 'Học ít nhất 1 bài hôm nay để bắt đầu chuỗi và có tên trên bảng.';
  else if (s.rank === 1) sub = `${s.streak} ngày liên tiếp — bạn đang dẫn đầu, giữ vững nhé! 👑`;
  else if (s.nextStreak) sub = `${s.streak} ngày liên tiếp — kém người xếp trên ${s.nextStreak - s.streak} ngày. Đừng bỏ ngày nào!`;
  else sub = `${s.streak} ngày liên tiếp — học đều mỗi ngày để giữ hạng.`;
  if (s.hidden) sub += ' 👻 Bạn đang tàng hình — người khác chỉ thấy "???".';
  return sub;
}

export function quizSub(q) {
  if (!q.rank) return 'Làm một bài Quiz từ vựng (từ 5 câu trở lên) để có tên trên bảng.';
  let sub = `Điểm TB ${q.score}% · ${q.attempts} lượt Quiz`;
  if (q.rank === 1) sub += ' — bạn đang dẫn đầu! 👑';
  else if (q.nextScore != null && q.nextScore > q.score) sub += ` — kém hạng trên ${q.nextScore - q.score}%.`;
  else sub += ' — bằng điểm hạng trên, làm nhanh hơn để vượt lên.';
  return sub;
}

// Lulu's comment on the viewer's best rank. Staff are never ranked.
export function luluLine(streak, quiz) {
  const ranks = [streak, quiz].map((s) => s?.rank).filter(Boolean);
  const best = ranks.length ? Math.min(...ranks) : null;
  if (!streak && !quiz) return { pct: 60, mood: 'happy', text: 'Cùng xem ai đang chăm học nhất nào! 👀' };
  if (best === 1) return { pct: 100, text: 'Cậu đang đứng TOP 1 đó! Lulu tự hào quá trời 👑' };
  if (best && best <= 3) return { pct: 80, text: 'Top 3 rồi nè! Thêm chút nữa là lên đỉnh luôn 🚀' };
  if (best && best <= 10) return { pct: 60, text: 'Cậu đang trong Top 10 — giữ phong độ nha 💪' };
  if (best) return { pct: 40, text: `Hạng #${best} — mỗi ngày học một chút là leo hạng liền!` };
  return { pct: 40, text: 'Chưa thấy tên cậu trên bảng… học 1 bài hôm nay để Lulu thấy tên cậu nha 🍊' };
}
