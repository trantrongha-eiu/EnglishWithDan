'use strict';

// ⚔️ Đấu trường từ vựng — admin /vocab-battle (routes/admin/vocabBattle.js).
//   Tổng quan  counts + recent rooms; stop a room (stakes refunded)
//   Kho từ     BattleWord (pictures + Từ điển mở): edit / hide / add / delete;
//              what every other source holds (read-only, edited on its own page)
//   Nối chữ    words players got accepted online (ChainWord source 'player'):
//              remove = also blocked; blocked list lives in the settings
//   Cài đặt    services/vocabBattleSettings.js
const mongoose = require('mongoose');
const VocabBattle = require('../models/VocabBattle');
const BattleWord = require('../models/BattleWord');
const ChainWord = require('../models/ChainWord');
const SearchMatch = require('../utils/searchMatch');
const { escapeRegex } = require('../utils/strings');
const mediaStore = require('./mediaStore');
const bank = require('./vocabBattleBank');
const svc = require('./vocabBattleService');
const settings = require('./vocabBattleSettings');
const R = require('../constants/vocabBattle');

const DAY = 24 * 60 * 60 * 1000;
const sid = (x) => String(x);
const int = (v, d, lo, hi) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
const clean = (s, max) => String(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, max);

// ── Tổng quan ─────────────────────────────────────────────────────
async function overview() {
  const since = new Date(Date.now() - 7 * DAY);
  const since14 = new Date(Date.now() - 14 * DAY);
  const [byStatus, week, perDay] = await Promise.all([
    VocabBattle.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    VocabBattle.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $facet: {
        rooms: [{ $group: { _id: { kind: '$kind', solo: '$solo' }, n: { $sum: 1 } } }],
        players: [{ $unwind: '$players' }, { $match: { 'players.state': 'joined', 'players.bot': { $ne: true } } },
          { $group: { _id: '$players.userId' } }, { $count: 'n' }],
        staked: [{ $match: { stake: { $gt: 0 }, status: 'done' } }, { $group: { _id: null, pot: { $sum: '$pot' }, n: { $sum: 1 } } }],
        rated: [{ $match: { rated: true } }, { $count: 'n' }],
      } },
    ]),
    VocabBattle.aggregate([
      { $match: { createdAt: { $gte: since14 } } },
      { $group: { _id: { d: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+07:00' } }, kind: '$kind' }, n: { $sum: 1 } } },
    ]),
  ]);
  const status = Object.fromEntries(byStatus.map((x) => [x._id, x.n]));
  const w = week[0] || {};
  const rooms = { quiz: 0, chain: 0, solo: 0 };
  for (const r of w.rooms || []) { if (r._id.solo) rooms.solo += r.n; else rooms[r._id.kind] += r.n; }
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() + 7 * 3600 * 1000 - i * DAY).toISOString().slice(0, 10);
    const row = { day: d, quiz: 0, chain: 0 };
    for (const x of perDay) if (x._id.d === d) row[x._id.kind] += x.n;
    days.push(row);
  }
  return {
    status: 'ok',
    counts: { open: status.open || 0, playing: status.playing || 0, done: status.done || 0, cancelled: status.cancelled || 0 },
    week: {
      rooms, players: (w.players && w.players[0] && w.players[0].n) || 0,
      stakedRooms: (w.staked && w.staked[0] && w.staked[0].n) || 0, pot: (w.staked && w.staked[0] && w.staked[0].pot) || 0,
      rated: (w.rated && w.rated[0] && w.rated[0].n) || 0,
    },
    days,
    enabled: R.ENABLED,
  };
}

function battleRow(b) {
  const winners = new Set((b.winnerIds || []).map(sid));
  return {
    id: sid(b._id), kind: b.kind, solo: !!b.solo, stake: b.stake || 0, pot: b.pot || 0, status: b.status, rated: !!b.rated,
    game: svc.gameText(b), source: (R.SOURCES[b.config?.source] || {}).label || b.config?.source || '',
    lessonTitle: b.config?.lessonTitle || '',
    createdAt: b.createdAt, endedAt: b.endedAt, expiresAt: b.expiresAt,
    players: (b.players || []).map((p) => ({
      id: sid(p.userId), name: p.name, bot: !!p.bot, state: p.state, score: p.score || 0, correct: p.correct || 0,
      answered: (p.answers || []).length, paid: p.paid || 0, reward: p.reward || 0, rank: p.rank || 0,
      winner: winners.has(sid(p.userId)),
    })),
    total: b.kind === 'quiz' ? (b.questions || []).length : (b.chain?.words || []).length,
  };
}

// q = { status: open|playing|done|cancelled|active|all, kind, search (player name), page, limit }
async function battles(q = {}) {
  const filter = {};
  const st = String(q.status || 'all');
  if (st === 'active') filter.status = { $in: ['open', 'playing'] };
  else if (['open', 'playing', 'done', 'cancelled'].includes(st)) filter.status = st;
  if (['quiz', 'chain'].includes(q.kind)) filter.kind = q.kind;
  if (q.solo === 'yes') filter.solo = true;
  if (q.solo === 'no') filter.solo = { $ne: true };
  if (q.search) filter['players.name'] = { $regex: escapeRegex(clean(q.search, 60)), $options: 'i' };
  const limit = int(q.limit, 30, 5, 100);
  const page = int(q.page, 1, 1, 10000);
  const [rows, total] = await Promise.all([
    VocabBattle.find(filter).select('-questions').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    VocabBattle.countDocuments(filter),
  ]);
  return { status: 'ok', battles: rows.map(battleRow), total, page, limit };
}

async function cancelBattle(id, reason) {
  const res = await svc.adminCancel(String(id), clean(reason, 200));
  if (res.status !== 'ok') return { status: res.status === 'gone' ? 'not_found' : 'bad', message: res.status === 'gone' ? 'Trận đã kết thúc hoặc không còn.' : 'Không dừng được trận, thử lại.' };
  return { status: 'ok', battle: battleRow(res.battle) };
}

// ── Kho từ ────────────────────────────────────────────────────────
// What every source holds + the BattleWord sets
async function bankInfo() {
  const [stats, lessons, sets] = await Promise.all([
    bank.bankStats(),
    bank.lessonOptions(),
    BattleWord.aggregate([
      { $group: { _id: { kind: '$kind', set: '$set' }, title: { $first: '$setTitle' }, n: { $sum: 1 },
        hidden: { $sum: { $cond: ['$hidden', 1, 0] } }, ai: { $sum: { $cond: [{ $eq: ['$origin', 'ai'] }, 1, 0] } } } },
      { $sort: { '_id.kind': -1, '_id.set': 1 } },
    ]),
  ]);
  const bySrc = {};
  for (const l of lessons) {
    const g = (bySrc[l.src] = bySrc[l.src] || { sets: 0, words: 0 });
    g.sets += 1;
    g.words += l.count;
  }
  return {
    status: 'ok',
    stats,
    sources: Object.entries(R.SOURCES).map(([key, v]) => ({ key, label: v.label, sets: v.sets, types: v.types, words: stats.sources[key] || 0 })),
    setKinds: bySrc,
    battleSets: sets.map((s) => ({ kind: s._id.kind, set: s._id.set, title: s.title, count: s.n, hidden: s.hidden, ai: s.ai })),
  };
}

function wordRow(d) {
  return {
    id: sid(d._id), kind: d.kind, word: d.word, meaning: d.meaning, pos: d.pos, set: d.set, setTitle: d.setTitle,
    imageUrl: d.imageUrl, example: d.example, near: d.near || [], ant: d.ant, origin: d.origin, hidden: !!d.hidden,
    edited: !!d.edited, updatedAt: d.updatedAt,
  };
}

// q = { kind, set, origin, hidden: yes|no, hasImage, search, page, limit }
async function words(q = {}) {
  const filter = {};
  if (['picture', 'dict'].includes(q.kind)) filter.kind = q.kind;
  if (q.set) filter.set = String(q.set);
  if (['wiktionary', 'ai', 'fluent', 'admin'].includes(q.origin)) filter.origin = q.origin;
  if (q.hidden === 'yes') filter.hidden = true;
  if (q.hidden === 'no') filter.hidden = { $ne: true };
  if (q.edited === 'yes') filter.edited = true;
  if (q.search) Object.assign(filter, SearchMatch.mongoFilter(clean(q.search, 80), ['word', 'meaning']) || {});
  const limit = int(q.limit, 50, 10, 200);
  const page = int(q.page, 1, 1, 10000);
  const [rows, total] = await Promise.all([
    BattleWord.find(filter).sort({ set: 1, word: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    BattleWord.countDocuments(filter),
  ]);
  return { status: 'ok', words: rows.map(wordRow), total, page, limit };
}

const slug = (s) => clean(s, 60).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

// Shared checks for create + update → { fields } | { status:'bad', message }
async function readFields(body, existing) {
  const f = {};
  if ('word' in body) {
    f.word = clean(body.word, 80);
    if (!/[A-Za-z]/.test(f.word)) return { status: 'bad', message: 'Từ tiếng Anh không hợp lệ.' };
  }
  if ('meaning' in body) {
    f.meaning = clean(body.meaning, 120);
    if (!f.meaning) return { status: 'bad', message: 'Cần nghĩa tiếng Việt.' };
  }
  if ('pos' in body) f.pos = clean(body.pos, 10).toLowerCase();
  if ('example' in body) f.example = clean(body.example, 300);
  if ('ant' in body) f.ant = clean(body.ant, 60);
  if ('hidden' in body) f.hidden = !!body.hidden;
  if ('near' in body) {
    const list = Array.isArray(body.near) ? body.near : String(body.near || '').split(',');
    f.near = [...new Set(list.map((x) => clean(x, 80)).filter(Boolean))].slice(0, 20);
  }
  if ('setTitle' in body && clean(body.setTitle, 120)) {
    // Move to a set by its title: an existing set of this kind, else a new one
    const title = clean(body.setTitle, 120);
    const kind = f.kind || existing?.kind || body.kind;
    const same = await BattleWord.findOne({ kind, setTitle: title }).select('set').lean();
    f.setTitle = title;
    f.set = same ? same.set : `admin-${slug(title) || 'set'}`;
  }
  if (body.imageBase64) {
    if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(body.imageBase64)) return { status: 'bad', message: 'Ảnh phải là PNG/JPG/WebP/GIF.' };
    if (body.imageBase64.length > 4 * 1024 * 1024) return { status: 'bad', message: 'Ảnh quá lớn (tối đa ~3 MB).' };
    f.imageUrl = (await mediaStore.uploadImage(body.imageBase64, 'vocab-battle')).url;
  } else if ('imageUrl' in body) {
    const u = clean(body.imageUrl, 500);
    if (u && !/^https:\/\//.test(u)) return { status: 'bad', message: 'Link ảnh phải bắt đầu bằng https://' };
    f.imageUrl = u;
  }
  return { fields: f };
}

async function updateWord(id, body = {}) {
  if (!mongoose.isValidObjectId(id)) return { status: 'not_found' };
  const cur = await BattleWord.findById(id).lean();
  if (!cur) return { status: 'not_found' };
  const r = await readFields(body, cur);
  if (!r.fields) return r;
  const f = r.fields;
  if (cur.kind === 'picture' && 'imageUrl' in f && !f.imageUrl) return { status: 'bad', message: 'Từ có hình phải có ảnh (hoặc ẩn từ này đi).' };
  // Hiding alone isn't an edit of the content — the seed may still refresh it
  const contentEdit = Object.keys(f).some((k) => k !== 'hidden');
  try {
    const doc = await BattleWord.findByIdAndUpdate(id, { $set: { ...f, ...(contentEdit ? { edited: true } : {}) } }, { new: true }).lean();
    bank.resetCache();
    return { status: 'ok', word: wordRow(doc) };
  } catch (err) {
    if (err && err.code === 11000) return { status: 'bad', message: 'Đã có từ này trong kho.' };
    throw err;
  }
}

// body = { kind: 'picture'|'dict', word, meaning, setTitle, pos?, example?, ant?, near?, imageBase64|imageUrl }
async function createWord(body = {}) {
  const kind = body.kind === 'picture' ? 'picture' : 'dict';
  if (!clean(body.word, 80) || !clean(body.meaning, 120)) return { status: 'bad', message: 'Cần từ tiếng Anh và nghĩa tiếng Việt.' };
  if (!clean(body.setTitle, 120)) return { status: 'bad', message: 'Chọn bộ từ (hoặc gõ tên bộ mới).' };
  const r = await readFields({ ...body, kind }, null);
  if (!r.fields) return r;
  const f = r.fields;
  if (kind === 'picture' && !f.imageUrl) return { status: 'bad', message: 'Từ có hình cần một ảnh.' };
  try {
    const doc = await BattleWord.create({ kind, near: [], ...f, origin: 'admin', edited: true });
    bank.resetCache();
    return { status: 'ok', word: wordRow(doc.toObject()) };
  } catch (err) {
    if (err && err.code === 11000) return { status: 'bad', message: 'Đã có từ này trong kho.' };
    throw err;
  }
}

async function deleteWord(id) {
  if (!mongoose.isValidObjectId(id)) return { status: 'not_found' };
  const d = await BattleWord.findByIdAndDelete(id).lean();
  if (!d) return { status: 'not_found' };
  bank.resetCache();
  return { status: 'ok' };
}

// Hide / show many at once: { ids: [...], hidden }
async function hideWords(ids, hidden) {
  const list = (Array.isArray(ids) ? ids : []).filter((x) => mongoose.isValidObjectId(x)).slice(0, 500);
  if (!list.length) return { status: 'bad', message: 'Chưa chọn từ nào.' };
  const r = await BattleWord.updateMany({ _id: { $in: list } }, { $set: { hidden: !!hidden } });
  bank.resetCache();
  return { status: 'ok', modified: r.modifiedCount };
}

// ── Nối chữ ───────────────────────────────────────────────────────
// q = { source: player|all, search, page, limit }
async function chainWords(q = {}) {
  const filter = {};
  if (q.source !== 'all') filter.source = 'player';
  if (q.search) filter.w = { $regex: '^' + escapeRegex(clean(q.search, 40).toLowerCase()) };
  const limit = int(q.limit, 50, 10, 200);
  const page = int(q.page, 1, 1, 10000);
  const [rows, total, players, all] = await Promise.all([
    ChainWord.find(filter).sort(q.source === 'all' ? { w: 1 } : { createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ChainWord.countDocuments(filter),
    ChainWord.countDocuments({ source: 'player' }),
    ChainWord.estimatedDocumentCount(),
  ]);
  const { settings: s } = await settings.get();
  return {
    status: 'ok',
    words: rows.map((d) => ({ w: d.w, pos: d.pos, def: d.def, source: d.source, createdAt: d.createdAt })),
    total, page, limit, counts: { players, all }, blocked: s.blockedWords,
  };
}

// Take a word out of Nối chữ: deleted from ChainWord AND blocked (else a
// dictionary lookup would let it straight back in)
async function blockChainWord(w) {
  const word = clean(w, 40).toLowerCase();
  if (!/^[a-z]+(-[a-z]+)*$/.test(word)) return { status: 'bad', message: 'Từ không hợp lệ.' };
  await ChainWord.deleteOne({ w: word });
  bank._internal.chainWords().all.delete(word);
  bank._internal.chainWords().lulu.delete(word);
  const { settings: s } = await settings.get();
  const res = await settings.update({ blockedWords: [...new Set([...s.blockedWords, word])] });
  bank.resetCache();
  return res.status === 'ok' ? { status: 'ok', blocked: res.settings.blockedWords } : res;
}

async function unblockChainWord(w) {
  const word = clean(w, 40).toLowerCase();
  const { settings: s } = await settings.get();
  const res = await settings.update({ blockedWords: s.blockedWords.filter((x) => x !== word) });
  bank.resetCache();
  return res.status === 'ok' ? { status: 'ok', blocked: res.settings.blockedWords } : res;
}

// ── Cài đặt ───────────────────────────────────────────────────────
async function getSettings() {
  const { settings: s, defaults } = await settings.get();
  return {
    status: 'ok', settings: s, defaults, ranges: settings.RANGES, limitRange: settings.LIMIT_RANGE,
    types: Object.entries(R.QUESTION_TYPES).map(([key, v]) => ({ key, label: v.label })),
    sources: Object.entries(R.SOURCES).filter(([k]) => k !== 'all').map(([key, v]) => ({ key, label: v.label })),
  };
}

async function saveSettings(body) {
  const res = await settings.update(body || {});
  if (res.status === 'ok') bank.resetCache();
  return res;
}

async function resetSettings() {
  const res = await settings.reset();
  bank.resetCache();
  return res;
}

module.exports = {
  overview, battles, cancelBattle, bankInfo, words, updateWord, createWord, deleteWord, hideWords,
  chainWords, blockChainWord, unblockChainWord, getSettings, saveSettings, resetSettings,
};
