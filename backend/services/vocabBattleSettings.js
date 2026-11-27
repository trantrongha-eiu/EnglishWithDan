'use strict';

// ⚔️ Đấu trường từ vựng — admin settings (models/VocabBattleSettings.js)
// applied on top of constants/vocabBattle.js. The constants object is changed
// IN PLACE, so the service, the bank and the controller (which all read R.X
// when they need it) follow a save at once, and every other process within
// REFRESH_MS (routes/vocabBattle.js calls refresh() before each request).
const R = require('../constants/vocabBattle');
const VocabBattleSettings = require('../models/VocabBattleSettings');

const REFRESH_MS = 30 * 1000;
let loadedAt = 0;
let loading = null;

// The shipped rules, before any admin change
const DEFAULTS = {
  enabled: R.ENABLED,
  limits: Object.fromEntries(Object.entries(R.QUESTION_TYPES).map(([k, v]) => [k, v.limit])),
  minStake: R.MIN_STAKE,
  maxStake: R.MAX_STAKE,
  maxOpen: R.MAX_OPEN,
  inviteHours: R.INVITE_HOURS,
  lobbyMinutes: R.LOBBY_MINUTES,
  friendlyWinFlames: R.FRIENDLY_WIN_FLAMES,
  friendlyDailyWins: R.FRIENDLY_DAILY_WINS,
  speedBonus: R.SPEED_BONUS,
  chainBankBonus: R.CHAIN_BANK_BONUS,
  chainSurvivorBonus: R.CHAIN_SURVIVOR_BONUS,
  botFailBase: Math.round(R.BOT_FAIL[0] * 100),
  botFailPerWord: Math.round(R.BOT_FAIL[1] * 100),
};

// field → [min, max] (whole numbers)
const RANGES = {
  minStake: [1, 1000],
  maxStake: [1, 10000],
  maxOpen: [1, 20],
  inviteHours: [1, 168],
  lobbyMinutes: [1, 60],
  friendlyWinFlames: [0, 50],
  friendlyDailyWins: [0, 50],
  speedBonus: [0, 500],
  chainBankBonus: [0, 100],
  chainSurvivorBonus: [0, 500],
  botFailBase: [0, 50],
  botFailPerWord: [0, 20],
};
const LIMIT_RANGE = [5, 120];

const intIn = (v, [lo, hi]) => Number.isInteger(v) && v >= lo && v <= hi;

// The effective settings (defaults + saved values) — what the admin form shows
function effective(doc = {}) {
  const pick = (k) => (doc[k] === undefined || doc[k] === null ? DEFAULTS[k] : doc[k]);
  const out = { enabled: doc.enabled === undefined || doc.enabled === null ? DEFAULTS.enabled : !!doc.enabled };
  for (const k of Object.keys(RANGES)) out[k] = pick(k);
  out.limits = { ...DEFAULTS.limits };
  for (const [t, s] of Object.entries(doc.limits || {})) if (t in out.limits && intIn(s, LIMIT_RANGE)) out.limits[t] = s;
  out.disabledTypes = (doc.disabledTypes || []).filter((t) => t in R.QUESTION_TYPES);
  out.disabledSources = (doc.disabledSources || []).filter((s) => s in R.SOURCES && s !== 'all');
  out.blockedWords = [...new Set((doc.blockedWords || []).map((w) => String(w).toLowerCase().trim()).filter(Boolean))].sort();
  return out;
}

function apply(doc) {
  const e = effective(doc || {});
  R.ENABLED = e.enabled;
  for (const [t, s] of Object.entries(e.limits)) R.QUESTION_TYPES[t].limit = s;
  R.MIN_STAKE = e.minStake;
  R.MAX_STAKE = Math.max(e.maxStake, e.minStake);
  R.MAX_OPEN = e.maxOpen;
  R.INVITE_HOURS = e.inviteHours;
  R.LOBBY_MINUTES = e.lobbyMinutes;
  R.FRIENDLY_WIN_FLAMES = e.friendlyWinFlames;
  R.FRIENDLY_DAILY_WINS = e.friendlyDailyWins;
  R.SPEED_BONUS = e.speedBonus;
  R.CHAIN_BANK_BONUS = e.chainBankBonus;
  R.CHAIN_SURVIVOR_BONUS = e.chainSurvivorBonus;
  R.BOT_FAIL = [e.botFailBase / 100, e.botFailPerWord / 100];
  R.DISABLED_TYPES = e.disabledTypes;
  R.DISABLED_SOURCES = e.disabledSources;
  R.BLOCKED_WORDS = new Set(e.blockedWords);
  loadedAt = Date.now();
  return e;
}

// Re-read the saved settings when they're older than REFRESH_MS. Never throws
// (a DB hiccup keeps the rules as they were).
async function refresh(force = false) {
  if (!force && Date.now() - loadedAt < REFRESH_MS) return;
  if (!loading) {
    loading = VocabBattleSettings.findOne({ _singleton: 'main' }).lean()
      .then((doc) => { apply(doc); })
      .catch(() => { loadedAt = Date.now(); })
      .finally(() => { loading = null; });
  }
  await loading;
}

async function get() {
  const doc = await VocabBattleSettings.findOne({ _singleton: 'main' }).lean();
  return { settings: effective(doc || {}), defaults: { ...DEFAULTS, limits: { ...DEFAULTS.limits } } };
}

// body = any subset of the effective() fields → { status, settings } | { status:'bad', message }
async function update(body = {}) {
  const set = {};
  if ('enabled' in body) set.enabled = !!body.enabled;
  for (const [k, range] of Object.entries(RANGES)) {
    if (!(k in body)) continue;
    const v = Number(body[k]);
    if (!intIn(v, range)) return { status: 'bad', message: `"${k}" phải là số nguyên từ ${range[0]} đến ${range[1]}.` };
    set[k] = v;
  }
  if ('limits' in body) {
    const limits = {};
    for (const [t, s] of Object.entries(body.limits || {})) {
      if (!(t in R.QUESTION_TYPES)) continue;
      const v = Number(s);
      if (!intIn(v, LIMIT_RANGE)) return { status: 'bad', message: `Thời gian mỗi câu phải từ ${LIMIT_RANGE[0]} đến ${LIMIT_RANGE[1]} giây.` };
      limits[t] = v;
    }
    set.limits = limits;
  }
  if ('disabledTypes' in body) {
    const list = [...new Set((body.disabledTypes || []).map(String))].filter((t) => t in R.QUESTION_TYPES);
    if (list.length >= Object.keys(R.QUESTION_TYPES).length) return { status: 'bad', message: 'Phải bật ít nhất một dạng câu hỏi.' };
    set.disabledTypes = list;
  }
  if ('disabledSources' in body) {
    set.disabledSources = [...new Set((body.disabledSources || []).map(String))].filter((s) => s in R.SOURCES && s !== 'all');
  }
  if ('blockedWords' in body) {
    const raw = Array.isArray(body.blockedWords) ? body.blockedWords : String(body.blockedWords || '').split(/[\s,;]+/);
    const words = [...new Set(raw.map((w) => String(w).toLowerCase().trim()).filter(Boolean))];
    if (words.some((w) => !/^[a-z]+(-[a-z]+)*$/.test(w))) return { status: 'bad', message: 'Từ cấm chỉ gồm chữ cái a–z (có thể có dấu gạch nối).' };
    if (words.length > 5000) return { status: 'bad', message: 'Tối đa 5000 từ cấm.' };
    set.blockedWords = words.sort();
  }
  const cur = effective({ ...(await VocabBattleSettings.findOne({ _singleton: 'main' }).lean() || {}), ...set });
  if (cur.maxStake < cur.minStake) return { status: 'bad', message: 'Cược tối đa phải ≥ cược tối thiểu.' };
  await VocabBattleSettings.getSingleton();
  const doc = await VocabBattleSettings.findOneAndUpdate({ _singleton: 'main' }, { $set: set }, { new: true }).lean();
  return { status: 'ok', settings: apply(doc) };
}

// Back to the shipped rules (keeps the Nối chữ blocked words)
async function reset() {
  await VocabBattleSettings.getSingleton();
  const doc = await VocabBattleSettings.findOneAndUpdate(
    { _singleton: 'main' },
    { $unset: Object.fromEntries([...Object.keys(RANGES), 'enabled', 'limits', 'disabledTypes', 'disabledSources'].map((k) => [k, ''])) },
    { new: true },
  ).lean();
  return { status: 'ok', settings: apply(doc) };
}

module.exports = { refresh, get, update, reset, effective, DEFAULTS, RANGES, LIMIT_RANGE, _apply: apply };
