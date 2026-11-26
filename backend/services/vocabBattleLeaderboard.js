'use strict';

// 🏆 BXH Đấu trường từ vựng — GET /api/vocab-battle/leaderboard
// (vocabBattleService.js plays the games; this only reads finished rooms).
//
//   board 'pvp'  — trận thách đấu: ranked by wins, then win rate, then
//                  points. Only `rated` rooms count (everyone really
//                  played), and at most WIN_CAP wins a VN day against the
//                  same opponent(s), so two friends can't farm the board
//                  by losing to each other on purpose.
//   board 'solo' — 🎯 kỷ lục chơi một mình: the best score per game
//                  (mix / synonym / … / chain), the same keys as the
//                  personal bests on the game cards.
//   period       — week (7 ngày) / month (30 ngày) / all (3 tháng: rooms
//                  are kept 90 days, models/VocabBattle.js TTL).
//   scope        — all (cả web) / class (the viewer's className).
//
// The per-period tallies are cached for CACHE_MS; names, avatars and
// classes are read per request (they change, and a ban must hide a row).
const VocabBattle = require('../models/VocabBattle');
const User = require('../models/User');
const { getVNDay } = require('../utils/streak');
const { isFlameRole } = require('../constants/shop');

const DAY = 24 * 60 * 60 * 1000;
const PERIODS = { week: 7, month: 30, all: 90 };
const GAME_KEYS = ['mix', 'synonym', 'antonym', 'meaning', 'match', 'order', 'listen', 'spell', 'image', 'chain'];
const WIN_CAP = 3;          // counted wins a day vs the same opponent(s)
const TOP = 50;
const RIVALS = 8;
const CACHE_MS = 60 * 1000;

const sid = (id) => String(id);
const cache = new Map(); // period → { at, stats }

function soloKey(b) {
  if (b.kind === 'chain') return 'chain';
  const t = (b.config && b.config.types) || [];
  return t.length === 1 ? t[0] : 'mix';
}

function displayName(u) {
  return (`${u.firstName || ''} ${u.lastName || ''}`.trim()) || u.username || 'Ai đó';
}

// One pass over the period's finished rooms →
//   pvp:    Map userId → { played, wins, losses, ties, points, flames, streak, bestStreak, last }
//   solo:   { gameKey: Map userId → { best, plays } }
//   rivals: Map userId → Map rivalId → { w, l, t, last }
async function tally(period) {
  const hit = cache.get(period);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.stats;
  const since = new Date(Date.now() - PERIODS[period] * DAY);
  const rows = await VocabBattle.find({ status: 'done', endedAt: { $gte: since } })
    .select('kind solo stake rated config.types players.userId players.state players.bot players.score players.reward winnerIds endedAt')
    .sort({ endedAt: 1 })
    .lean();

  const pvp = new Map();
  const solo = Object.fromEntries(GAME_KEYS.map((k) => [k, new Map()]));
  const rivals = new Map();
  const capCount = new Map(); // winner|rivals|day → counted wins

  for (const b of rows) {
    const humans = (b.players || []).filter((p) => p.state === 'joined' && !p.bot);
    if (b.solo) {
      const p = humans[0];
      const board = solo[soloKey(b)];
      if (!p || !board) continue;
      const cur = board.get(sid(p.userId)) || { best: 0, plays: 0 };
      cur.plays += 1;
      if (p.score > cur.best) cur.best = p.score;
      board.set(sid(p.userId), cur);
      continue;
    }
    if (!b.rated || humans.length < 2) continue;
    const winners = new Set((b.winnerIds || []).map(sid));
    const day = getVNDay(new Date(b.endedAt)).toISOString().slice(0, 10);
    for (const p of humans) {
      const id = sid(p.userId);
      const others = humans.filter((o) => sid(o.userId) !== id).map((o) => sid(o.userId)).sort();
      const won = winners.has(id);
      const tie = winners.size === 0;
      if (won) {
        const key = `${id}|${others.join(',')}|${day}`;
        const n = (capCount.get(key) || 0) + 1;
        capCount.set(key, n);
        if (n > WIN_CAP) continue; // farmed: not counted at all for the winner
      }
      const s = pvp.get(id) || { played: 0, wins: 0, losses: 0, ties: 0, points: 0, flames: 0, streak: 0, bestStreak: 0, last: null };
      s.played += 1;
      s.points += p.score || 0;
      s.last = b.endedAt;
      if (won) {
        s.wins += 1;
        s.streak += 1;
        s.bestStreak = Math.max(s.bestStreak, s.streak);
        s.flames += Math.max(0, (p.reward || 0) - (b.stake || 0));
      } else {
        if (tie) s.ties += 1; else s.losses += 1;
        s.streak = 0;
      }
      pvp.set(id, s);

      const mine = rivals.get(id) || new Map();
      for (const o of others) {
        const r = mine.get(o) || { w: 0, l: 0, t: 0, last: null };
        if (won) r.w += 1;
        else if (tie) r.t += 1;
        else if (winners.has(o)) r.l += 1;
        else r.t += 1; // both lost to a third player
        r.last = b.endedAt;
        mine.set(o, r);
      }
      rivals.set(id, mine);
    }
  }
  const stats = { pvp, solo, rivals };
  cache.set(period, { at: Date.now(), stats });
  return stats;
}

function resetCache() { cache.clear(); }

async function people(ids) {
  if (!ids.length) return new Map();
  const users = await User.find({ _id: { $in: ids } })
    .select('firstName lastName username avatar className role isBanned').lean();
  return new Map(users.filter((u) => isFlameRole(u.role) && !u.isBanned).map((u) => [sid(u._id), u]));
}

// Ranks with ties (equal sort value = same rank)
function rank(list, same) {
  let r = 0;
  list.forEach((e, i) => {
    if (i === 0 || !same(list[i - 1], e)) r = i + 1;
    e.rank = r;
  });
  return list;
}

const winRate = (s) => (s.played ? Math.round((s.wins / s.played) * 100) : 0);

async function leaderboard(userId, query = {}) {
  const board = query.board === 'solo' ? 'solo' : 'pvp';
  const period = PERIODS[query.period] ? query.period : 'week';
  const game = GAME_KEYS.includes(query.game) ? query.game : 'mix';
  const scope = query.scope === 'class' ? 'class' : 'all';
  const me = sid(userId);

  const stats = await tally(period);
  const viewer = await User.findById(userId).select('className').lean();
  const cls = (viewer && viewer.className) || '';

  let entries;
  if (board === 'pvp') {
    entries = [...stats.pvp.entries()].map(([id, s]) => ({ id, ...s, winRate: winRate(s) }));
  } else {
    entries = [...stats.solo[game].entries()].map(([id, s]) => ({ id, best: s.best, plays: s.plays }));
  }
  const users = await people(entries.map((e) => e.id));
  entries = entries.filter((e) => users.has(e.id) && (scope === 'all' || (cls && users.get(e.id).className === cls)));
  if (board === 'pvp') {
    entries.sort((a, b) => (b.wins - a.wins) || (b.winRate - a.winRate) || (b.points - a.points));
    rank(entries, (a, b) => a.wins === b.wins && a.winRate === b.winRate && a.points === b.points);
  } else {
    entries.sort((a, b) => b.best - a.best);
    rank(entries, (a, b) => a.best === b.best);
  }
  const shape = (e) => {
    const u = users.get(e.id);
    const out = { id: e.id, rank: e.rank, name: displayName(u), avatar: u.avatar || '', me: e.id === me, classmate: !!cls && u.className === cls };
    if (board === 'pvp') {
      Object.assign(out, {
        wins: e.wins, losses: e.losses, ties: e.ties, played: e.played, winRate: e.winRate,
        points: e.points, flames: e.flames, streak: e.streak, bestStreak: e.bestStreak,
      });
    } else Object.assign(out, { best: e.best, plays: e.plays });
    return out;
  };
  const mine = entries.find((e) => e.id === me);

  // Kỳ phùng địch thủ: the viewer's head-to-head record (pvp only)
  let rivalRows = [];
  if (board === 'pvp') {
    const mineR = stats.rivals.get(me);
    if (mineR) {
      const list = [...mineR.entries()]
        .map(([id, r]) => ({ id, ...r, games: r.w + r.l + r.t }))
        .sort((a, b) => (b.games - a.games) || (new Date(b.last) - new Date(a.last)))
        .slice(0, RIVALS * 2);
      const ru = await people(list.map((r) => r.id));
      rivalRows = list.filter((r) => ru.has(r.id)).slice(0, RIVALS).map((r) => {
        const u = ru.get(r.id);
        return { id: r.id, name: displayName(u), avatar: u.avatar || '', w: r.w, l: r.l, t: r.t, games: r.games };
      });
    }
  }

  return {
    status: 'ok',
    board, period, game, scope,
    className: cls,
    total: entries.length,
    rows: entries.slice(0, TOP).map(shape),
    me: mine ? shape(mine) : null,
    rivals: rivalRows,
    winCap: WIN_CAP,
  };
}

// The hero strip on the Đấu trường page: this week's wins, rank, streak
async function myStats(userId) {
  const stats = await tally('week');
  const s = stats.pvp.get(sid(userId));
  if (!s) return { wins: 0, played: 0, streak: 0, rank: 0 };
  // Rank among everyone with a counted game this week (bans are rare; the
  // full board filters them)
  const ahead = [...stats.pvp.values()].filter((o) => o.wins > s.wins
    || (o.wins === s.wins && (winRate(o) > winRate(s) || (winRate(o) === winRate(s) && o.points > s.points)))).length;
  return { wins: s.wins, played: s.played, streak: s.streak, rank: ahead + 1 };
}

module.exports = { leaderboard, myStats, resetCache, PERIODS, GAME_KEYS, WIN_CAP, _internal: { tally, soloKey } };
