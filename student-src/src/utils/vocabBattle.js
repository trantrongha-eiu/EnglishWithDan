// ⚔️ Đấu trường từ vựng — request helper + labels
// (backend/routes/vocabBattle.js, services/vocabBattleService.js)
import { apiFetch } from './api';

// Always resolves: { success: false, message } when the server refused or
// the network failed, so a button can recover and show why.
export function battleApi(method, url, body) {
  return apiFetch(`/vocab-battle${url}`, { method, body: body ? JSON.stringify(body) : undefined }).catch((err) => {
    if (err?.body) return err.body;
    return { success: false, message: err?.coldStart ? err.message : 'Không kết nối được máy chủ, thử lại nhé.' };
  });
}

// Nối chữ: the earlier word `w` repeats (itself, its plural, with/without
// hyphen) — or null. Same rule as backend services/vocabBattleBank.js
// chainUsedAs; checked here first so the player hears it instantly.
function chainForms(w) {
  const x = String(w || '').toLowerCase().replace(/-/g, '');
  const forms = [x];
  if (x.length > 3 && x.endsWith('s') && !/(ss|us|is)$/.test(x)) {
    forms.push(x.slice(0, -1));
    if (x.endsWith('es')) forms.push(x.slice(0, -2));
    if (x.length > 4 && x.endsWith('ies')) forms.push(x.slice(0, -3) + 'y');
  }
  return forms;
}
export function chainUsedAs(words, w) {
  const mine = new Set(chainForms(w));
  const hit = (words || []).find((x) => x.w && chainForms(x.w).some((f) => mine.has(f)));
  return hit ? hit.w : null;
}

export const KIND_LABEL = { quiz: 'Đấu tổng hợp', chain: 'Nối chữ' };
export const KIND_EMOJI = { quiz: '🧠', chain: '🔗' };

export const TYPE_EMOJI = {
  synonym: '🟰', antonym: '↔️', meaning: '📖', image: '🖼️', match: '🧩', order: '🧱', listen: '🎧', spell: '🔤',
};

export const STAKES = [0, 5, 10, 20, 50, 100];

// The games a student picks from. `types` = the quiz kinds it asks (null =
// all of them); `key` is also the personal-best key (services soloKey).
export const GAMES = [
  { key: 'mix', kind: 'quiz', emoji: '🧠', name: 'Tổng hợp', desc: 'Trộn cả 8 dạng câu. Thử tài từ vựng toàn diện!', types: null },
  { key: 'synonym', kind: 'quiz', emoji: '🟰', name: 'Đồng nghĩa', desc: 'Chọn cụm paraphrase cùng nghĩa (từ bài Reading Cambridge và Từ điển).', types: ['synonym'] },
  { key: 'antonym', kind: 'quiz', emoji: '↔️', name: 'Trái nghĩa', desc: 'Chọn từ mang nghĩa ngược lại: hơn 400 cặp, hỏi cả hai chiều.', types: ['antonym'] },
  { key: 'meaning', kind: 'quiz', emoji: '📖', name: 'Nghĩa của từ', desc: 'Anh → Việt và Việt → Anh, hơn 16.000 từ: Vocab Topics, Reading, Listening, Writing, Từ điển + Từ điển mở (Wiktionary).', types: ['meaning'] },
  { key: 'match', kind: 'quiz', emoji: '🧩', name: 'Nối từ – nghĩa', desc: 'Nối 5 từ với nghĩa đúng của chúng.', types: ['match'] },
  { key: 'order', kind: 'quiz', emoji: '🧱', name: 'Ghép câu', desc: 'Sắp xếp các từ thành câu hoàn chỉnh.', types: ['order'] },
  { key: 'listen', kind: 'quiz', emoji: '🎧', name: 'Nghe & điền', desc: 'Nghe câu ví dụ, điền từ còn thiếu.', types: ['listen'] },
  { key: 'spell', kind: 'quiz', emoji: '🔤', name: 'Nghe & gõ', desc: 'Nghe từ rồi gõ lại đúng chính tả.', types: ['spell'] },
  { key: 'image', kind: 'quiz', emoji: '🖼️', name: 'Nhìn hình đoán từ', desc: 'Xem hình, chọn từ đúng: hơn 700 hình con vật, đồ ăn, đồ vật, nghề nghiệp, thời tiết, idiom…', types: ['image'] },
  { key: 'chain', kind: 'chain', emoji: '🔗', name: 'Nối chữ', desc: 'tea → apple → egg… Từ sau bắt đầu bằng chữ cuối của từ trước, từ đã nối không được dùng lại. Chơi một mình là đấu với Lulu 🤖.', types: null },
];

// The GAMES entry a room was made from
export function gameOf(b) {
  if (b.kind === 'chain') return GAMES.find((g) => g.key === 'chain');
  const t = b.config.types || [];
  return (t.length === 1 && GAMES.find((g) => g.key === t[0])) || GAMES[0];
}

export function gameLine(b, rules) {
  if (b.kind === 'chain') return `${b.config.count} từ · ${b.config.turnSeconds}s/lượt · ${b.config.lives} ❤️${b.solo ? ' · vs Lulu 🤖' : ''}`;
  const names = (b.config.types || []).map((t) => rules?.types.find((x) => x.key === t)?.label || t);
  return `${b.total} câu · ${names.join(', ')}`;
}

export function stakeLine(b) {
  if (b.solo) return '🎯 Chơi một mình';
  return b.stake ? `Cược ${b.stake} 🔥` : 'Giao hữu';
}

export function fmtLeft(iso, offset = 0) {
  const ms = new Date(iso) - (Date.now() + offset);
  if (ms <= 0) return 'hết hạn';
  const h = Math.floor(ms / 3600000);
  if (h >= 1) return `còn ${h} giờ`;
  return `còn ${Math.max(1, Math.round(ms / 60000))} phút`;
}

// Where the viewer stands in a finished room
export function outcome(b) {
  if (b.status === 'cancelled') return { cls: 'vb-out--off', text: 'Đã hủy' };
  if (b.status !== 'done') return null;
  const me = b.players.find((p) => p.me);
  if (b.solo && b.kind === 'quiz') return { cls: 'vb-out--solo', text: `🎯 ${me?.score || 0} điểm` };
  if (!b.winnerIds.length) return { cls: 'vb-out--tie', text: '🤝 Hòa' };
  if (me && b.winnerIds.includes(me.id)) return { cls: 'vb-out--win', text: `🏆 Thắng${me.reward ? ` +${me.reward} 🔥` : ''}` };
  return { cls: 'vb-out--lose', text: me?.rank ? `Hạng ${me.rank}` : 'Thua' };
}

export function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(-1)[0].slice(0, 1).toUpperCase();
}

// While a battle is being played: the site's floating cards (daily-goal
// nudge, shop ticker, pets — js/nav.js etc.) stay away, as they do during a
// vocab quiz, and one already up is closed so it can't cover the answers.
export function battleFocus(isActive) {
  const prev = window._isActivePractice;
  window._isActivePractice = () => isActive() || (typeof prev === 'function' && prev());
  document.getElementById('nav-vocab-goal-nudge')?.remove();
  return () => {
    if (prev) window._isActivePractice = prev;
    else delete window._isActivePractice;
  };
}

// "Lulu 🤖" → "Lulu", "Nguyễn Văn An" → "An" (chips under the Nối chữ words)
export function shortName(p) {
  if (!p) return '';
  if (p.bot) return 'Lulu';
  return String(p.name || '').trim().split(/\s+/).slice(-1)[0];
}

// The create body that replays a finished room: same game, same settings,
// and (for a thách đấu) the same people + stake. `everyone` = all who were
// invited, not only those who joined (a lobby that closed before it started).
export function replayBody(b, { solo, everyone = false }) {
  const c = b.config || {};
  const body = {
    kind: b.kind, solo, count: c.count, types: c.types, source: c.source, lessonId: c.lessonId || undefined,
    turnSeconds: c.turnSeconds, lives: c.lives,
  };
  if (!solo) {
    body.stake = b.stake || 0;
    body.opponents = b.players.filter((p) => !p.me && !p.bot && (everyone || p.state === 'joined')).map((p) => p.id);
  }
  return body;
}

export const PERIODS = [
  { key: 'week', label: '7 ngày' },
  { key: 'month', label: '30 ngày' },
  { key: 'all', label: '3 tháng' },
];
