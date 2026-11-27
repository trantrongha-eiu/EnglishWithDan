'use strict';

// ⚔️ Đấu trường từ vựng — rooms of 2–4 students (models/VocabBattle.js,
// rules in constants/vocabBattle.js, questions in services/vocabBattleBank.js).
//
//   • The host picks 1–3 opponents, the game (quiz / Nối chữ), the question
//     kinds, how many questions/words, where the words come from, and a
//     stake. stake 0 = trận giao hữu: the winner gets FRIENDLY_WIN_FLAMES 🔥
//     (at most FRIENDLY_DAILY_WINS rewarded wins per VN day). stake > 0:
//     everyone who joins pays it, the winner(s) take the pot.
//   • quiz: whoever has joined can play straight away, at their own pace —
//     questions are served one at a time (/next) and timed on the server, so
//     peeking ahead or a slow reply doesn't pay. The room ends when every
//     invitee has answered and every player has finished, or at expiresAt.
//   • chain: a lobby until the host starts — at most LOBBY_MINUTES, then it
//     cancels itself; a player who goes into another room drops out of the
//     lobby (note 'moved', shown to the others). Then turns of turnSeconds, a
//     timeout costs a life, the last one standing (or the best score when
//     the word count is reached) wins. Timeouts are applied lazily on every
//     poll/move (tick), so no timer runs on the server.
// Every change goes through mutate(): read → change in memory → replace if
// `rev` is unchanged, retried on a clash. Wallet credits and inbox messages
// run only after the write that decided them landed.
const mongoose = require('mongoose');
const VocabBattle = require('../models/VocabBattle');
const User = require('../models/User');
const Message = require('../models/Message');
const Block = require('../models/Block');
const bank = require('./vocabBattleBank');
const presence = require('./presenceService');
const { getVNDay } = require('../utils/streak');
const { isFlameRole } = require('../constants/shop');
const R = require('../constants/vocabBattle');

const HOUR = 60 * 60 * 1000;
const OPEN = ['open', 'playing'];

const sid = (id) => String(id);
function displayName(u) {
  return (`${u.firstName || ''} ${u.lastName || ''}`.trim()) || u.username || 'Ai đó';
}
function credit(userId, n) {
  if (!n) return Promise.resolve();
  return User.updateOne({ _id: userId }, { $inc: { flameWallet: n } });
}
async function notify(fromId, fromName, toId, subject, body) {
  try {
    await Message.create({ fromId, fromName, toId, subject, body, type: 'personal' });
  } catch (err) {
    console.error('[vocab-battle] notify failed:', err.message);
  }
}
async function runEffects(effects) {
  for (const e of effects) {
    try {
      if (e.board) require('./vocabBattleLeaderboard').resetCache();
      else if (e.credit) await credit(e.credit, e.n);
      else if (e.notify) await notify(...e.notify);
    } catch (err) {
      console.error('[vocab-battle] effect failed:', err.message);
    }
  }
}

// fn(b, now) changes the lean doc in place and returns
//   { status: 'ok', effects?: [...], ...extra }  → written, then effects run
//   { status: <anything else> }                  → nothing written
//   { status: 'ok', write: false, ... }          → nothing to write
async function mutate(id, fn) {
  if (!mongoose.isValidObjectId(id)) return { status: 'gone' };
  for (let attempt = 0; attempt < 8; attempt++) {
    const b = await VocabBattle.findById(id).lean();
    if (!b) return { status: 'gone' };
    const now = new Date();
    const rev = b.rev || 0;
    const res = fn(b, now) || { status: 'ok' };
    if (res.status !== 'ok' || res.write === false) return { ...res, battle: b };
    b.rev = rev + 1;
    b.updatedAt = now;
    const w = await VocabBattle.replaceOne({ _id: b._id, rev }, b);
    if (w.matchedCount === 1) {
      await runEffects(res.effects || []);
      return { ...res, battle: b };
    }
  }
  return { status: 'busy' };
}

// When an open room stops waiting: a Nối chữ lobby lives LOBBY_MINUTES from
// its creation (older lobbies were made with a 24 h expiresAt — this caps
// them too), everything else at expiresAt.
function endsAt(b) {
  if (b.kind === 'chain' && b.status === 'open' && !b.solo && b.createdAt) {
    const lobby = new Date(new Date(b.createdAt).getTime() + R.LOBBY_MINUTES * 60000);
    if (!b.expiresAt || lobby < new Date(b.expiresAt)) return lobby;
  }
  return b.expiresAt;
}

const me = (b, userId) => b.players.find((p) => sid(p.userId) === sid(userId));
const joined = (b) => b.players.filter((p) => p.state === 'joined');

// ── settling ───────────────────────────────────────────────────────
function refundAll(b, effects, why, skipId = null) {
  for (const p of b.players) {
    if (p.paid) { effects.push({ credit: p.userId, n: p.paid }); p.reward = p.paid; p.paid = 0; }
  }
  b.status = 'cancelled';
  b.endedAt = new Date();
  for (const p of joined(b)) {
    if (skipId && sid(p.userId) === sid(skipId)) continue;
    effects.push({ notify: [b.hostId, 'Đấu trường từ vựng', p.userId, '⚔️ Trận đấu từ vựng đã hủy', why] });
  }
}

// Ranks + payouts. `friendlyWinsToday` = { userId: rewarded wins today }.
function finish(b, now, effects, friendlyWinsToday = {}) {
  const players = joined(b);
  b.status = 'done';
  b.endedAt = now;
  const sorted = players.slice().sort((x, y) => y.score - x.score);
  let rank = 0;
  let last = null;
  sorted.forEach((p, i) => { if (p.score !== last) { rank = i + 1; last = p.score; } p.rank = rank; });
  const top = sorted.length ? sorted[0].score : 0;
  const winners = top > 0 ? sorted.filter((p) => p.score === top) : [];
  const allTied = !winners.length || winners.length === players.length;
  b.winnerIds = allTied ? [] : winners.map((p) => p.userId);
  const pot = players.reduce((s, p) => s + (p.paid || 0), 0);
  b.pot = pot;
  // Everyone really played: ≥ half the questions, or ≥ 1 word in Nối chữ
  const played = players.length >= 2 && players.every((p) => (b.kind === 'chain'
    ? (p.correct || 0) >= 1
    : (p.answers || []).length >= Math.ceil(b.questions.length / 2)));
  b.rated = !b.solo && played;
  effects.push({ board: true }); // BXH Đấu trường shows it straight away
  if (b.solo) {
    // Chơi một mình: no 🔥 and no inbox. A quiz has nobody to beat; Nối chữ
    // is you vs Lulu 🤖.
    if (b.kind === 'quiz') b.winnerIds = [];
    for (const p of b.players) { p.paid = 0; p.reward = 0; }
    return;
  }

  if (allTied) {
    // Nobody won: stakes go back, no friendly reward
    for (const p of players) { if (p.paid) effects.push({ credit: p.userId, n: p.paid }); p.reward = p.paid || 0; }
  } else if (pot > 0) {
    const share = Math.floor(pot / winners.length);
    let rest = pot - share * winners.length;
    for (const p of winners) {
      const n = share + (rest > 0 ? 1 : 0);
      if (rest > 0) rest -= 1;
      p.reward = n;
      effects.push({ credit: p.userId, n });
    }
  } else {
    // Trận giao hữu: only if everyone really played, within the daily cap
    if (played) {
      b.rewardDay = getVNDay(now);
      for (const p of winners) {
        if ((friendlyWinsToday[sid(p.userId)] || 0) >= R.FRIENDLY_DAILY_WINS) continue;
        p.reward = R.FRIENDLY_WIN_FLAMES;
        effects.push({ credit: p.userId, n: p.reward });
      }
    }
  }
  for (const p of b.players) p.paid = 0;

  const board = sorted.map((p) => `${p.rank}. ${p.name} — ${p.score} điểm`).join('\n');
  const title = b.kind === 'chain' ? 'Nối chữ' : 'Đấu từ vựng';
  for (const p of players) {
    const won = b.winnerIds.some((w) => sid(w) === sid(p.userId));
    const subject = allTied ? `🤝 ${title}: hòa!` : won ? `🏆 Bạn thắng trận ${title}!` : `⚔️ Kết quả trận ${title}`;
    const prize = p.reward ? `\nBạn nhận ${p.reward} 🔥 vào ví lửa.` : '';
    effects.push({ notify: [b.hostId, 'Đấu trường từ vựng', p.userId, subject, `${board}${prize}\n\nXem lại trận và lưu từ sai vào sổ: Đấu trường từ vựng.`] });
  }
}

async function friendlyWinsToday(userIds) {
  const day = getVNDay(new Date());
  const rows = await VocabBattle.find({ rewardDay: day, stake: 0, winnerIds: { $in: userIds } })
    .select('players.userId players.reward').lean();
  const out = {};
  for (const r of rows) for (const p of r.players) if (p.reward > 0) out[sid(p.userId)] = (out[sid(p.userId)] || 0) + 1;
  return out;
}

// The lazy clock: expiries, chain timeouts, finished quizzes.
// Returns true when it changed `b` (caller writes it).
function tick(b, now, effects, wins) {
  if (!OPEN.includes(b.status)) return false;
  let changed = false;

  if (b.kind === 'quiz') {
    const expired = now >= new Date(b.expiresAt);
    if (expired) {
      for (const p of b.players) {
        if (p.state === 'invited') { p.state = 'declined'; changed = true; }
        if (p.state === 'joined' && !p.finishedAt) { p.finishedAt = now; p.qAt = null; changed = true; }
      }
    } else {
      // A question left open past its limit counts as a timeout
      for (const p of joined(b)) {
        if (p.finishedAt || !p.qAt) continue;
        const q = b.questions[p.idx];
        if (q && now - new Date(p.qAt) > q.limit * 1000 + R.GRACE_MS * 3) {
          p.answers.push({ frac: 0, pts: 0, ms: q.limit * 1000, given: '', timeout: true });
          p.idx += 1; p.qAt = null; changed = true;
          if (p.idx >= b.questions.length) p.finishedAt = now;
        }
      }
    }
    const pending = b.players.some((p) => p.state === 'invited');
    const playing = joined(b).some((p) => !p.finishedAt);
    if (!pending && !playing) {
      if (joined(b).length >= 2 || (b.solo && joined(b).length === 1)) finish(b, now, effects, wins);
      else refundAll(b, effects, 'Không đủ người tham gia trận đấu — 🔥 cược đã về lại ví lửa.');
      return true;
    }
    return changed;
  }

  // chain
  if (b.status === 'open') {
    if (now >= new Date(endsAt(b))) {
      refundAll(b, effects, `Phòng chờ Nối chữ quá ${R.LOBBY_MINUTES} phút mà chưa bắt đầu nên đã tự hủy — 🔥 cược đã về lại ví lửa.`);
      return true;
    }
    return false;
  }
  const turnMs = b.config.turnSeconds * 1000;
  let guard = 0;
  while (b.status === 'playing' && b.chain.deadline && guard++ < 60) {
    const p = b.players[b.chain.turn];
    const dl = new Date(b.chain.deadline).getTime();
    if (p.bot) {
      // Lulu 🤖 answers BOT_MS into its turn
      const at = dl - turnMs + R.BOT_MS;
      if (now.getTime() < at) break;
      changed = true;
      if (!botMove(b, p, new Date(at), turnMs)) { endChain(b, now, effects, wins); return true; }
      continue;
    }
    if (now.getTime() <= dl) break;
    p.lives -= 1;
    if (p.lives <= 0) { p.lives = 0; p.out = true; }
    b.chain.words.push({ w: '', by: p.userId, pts: 0, timeout: true, at: b.chain.deadline });
    changed = true;
    const deadline = new Date(new Date(b.chain.deadline).getTime() + turnMs);
    if (!chainContinues(b)) { endChain(b, now, effects, wins); return true; }
    b.chain.turn = nextTurn(b, b.chain.turn);
    b.chain.deadline = deadline;
  }
  return changed;
}

// The bot's turn → false when the game is over after it
function botMove(b, p, at, turnMs) {
  const played = b.chain.words.filter((w) => w.w && w.bot).length;
  const miss = Math.random() < R.BOT_FAIL[0] + R.BOT_FAIL[1] * played;
  const used = new Set(b.chain.words.map((w) => w.w).filter(Boolean));
  const got = miss ? null : bank.botWord(b.chain.letter, used);
  if (got) {
    const pts = 10 + Math.max(0, got.w.length - 4) * 2 + (got.bank ? R.CHAIN_BANK_BONUS : 0);
    b.chain.words.push({ w: got.w, by: p.userId, pts, bank: got.bank, bot: true, at });
    p.score += pts;
    p.correct += 1;
    b.chain.letter = got.w.slice(-1);
  } else {
    p.lives -= 1;
    if (p.lives <= 0) { p.lives = 0; p.out = true; }
    b.chain.words.push({ w: '', by: p.userId, pts: 0, timeout: true, at });
  }
  if (!chainContinues(b)) return false;
  b.chain.turn = nextTurn(b, b.chain.turn);
  b.chain.deadline = new Date(at.getTime() + turnMs);
  return true;
}

function alive(b) { return b.players.filter((p) => p.state === 'joined' && !p.out); }
function chainContinues(b) {
  const words = b.chain.words.filter((w) => w.w && !w.start).length;
  return alive(b).length >= 2 && words < b.config.count;
}
function nextTurn(b, from) {
  const n = b.players.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + k) % n;
    const p = b.players[i];
    if (p.state === 'joined' && !p.out) return i;
  }
  return from;
}
function endChain(b, now, effects, wins) {
  const left = alive(b);
  if (left.length === 1) left[0].score += R.CHAIN_SURVIVOR_BONUS;
  b.chain.deadline = null;
  finish(b, now, effects, wins);
}

// ── what a client sees ─────────────────────────────────────────────
function view(b, viewerId, now = new Date()) {
  const mine = me(b, viewerId);
  const showAll = b.status === 'done' || b.status === 'cancelled';
  return {
    id: sid(b._id),
    kind: b.kind,
    solo: !!b.solo,
    status: b.status,
    stake: b.stake,
    pot: b.status === 'done' ? b.pot : b.players.reduce((s, p) => s + (p.paid || 0), 0),
    config: b.config,
    total: b.kind === 'quiz' ? b.questions.length : b.config.count,
    isHost: sid(b.hostId) === sid(viewerId),
    hostId: sid(b.hostId),
    expiresAt: endsAt(b),
    startedAt: b.startedAt,
    endedAt: b.endedAt,
    createdAt: b.createdAt,
    winnerIds: (b.winnerIds || []).map(sid),
    serverNow: now,
    players: b.players.map((p) => ({
      id: sid(p.userId),
      name: p.name,
      avatar: p.avatar,
      bot: !!p.bot,
      state: p.state,
      note: p.note || '',
      me: sid(p.userId) === sid(viewerId),
      online: !!p.bot || (!!p.seenAt && now - new Date(p.seenAt) < 20000),
      idx: p.idx,
      finished: !!p.finishedAt,
      score: p.score,
      correct: p.correct,
      lives: p.lives,
      out: p.out,
      rank: p.rank,
      reward: showAll || sid(p.userId) === sid(viewerId) ? p.reward : 0,
    })),
    me: mine ? { state: mine.state, idx: mine.idx, finished: !!mine.finishedAt, score: mine.score } : null,
    chain: b.kind === 'chain' ? {
      words: b.chain.words.slice(-80).map((w) => ({
        w: w.w, by: w.by ? sid(w.by) : null, pts: w.pts, bank: !!w.bank, timeout: !!w.timeout, vi: w.w ? bank.meaningOf(w.w) : '',
      })),
      turnId: b.status === 'playing' ? sid(b.players[b.chain.turn].userId) : null,
      letter: b.chain.letter,
      deadline: b.chain.deadline,
    } : null,
  };
}

// ── actions ────────────────────────────────────────────────────────
function gameText(b) {
  const c = b.config || {};
  return b.kind === 'chain'
    ? `Nối chữ (${c.count} từ, ${c.turnSeconds}s/lượt)`
    : `${c.count} câu: ${(c.types || []).map((t) => (R.QUESTION_TYPES[t] || { label: t }).label).join(', ')}`;
}

function openCount(userId) {
  return VocabBattle.countDocuments({
    status: { $in: OPEN },
    solo: { $ne: true },
    players: { $elemMatch: { userId, state: { $in: ['invited', 'joined'] } } },
  });
}

async function create(userId, body = {}) {
  if (!R.ENABLED) return { status: 'closed' };
  const kind = body.kind === 'chain' ? 'chain' : 'quiz';
  const solo = body.solo === true;
  const stake = solo ? 0 : Number(body.stake || 0);
  if (!Number.isInteger(stake) || (stake !== 0 && (stake < R.MIN_STAKE || stake > R.MAX_STAKE))) {
    return { status: 'bad_stake', min: R.MIN_STAKE, max: R.MAX_STAKE };
  }
  const count = Number(body.count);
  if (!R.COUNTS.includes(count)) return { status: 'bad_count' };
  const source = R.SOURCES[body.source] && !R.DISABLED_SOURCES.includes(body.source) ? body.source : 'all';
  const ids = solo ? [] : [...new Set((Array.isArray(body.opponents) ? body.opponents : []).map(String))];
  if (!solo && !ids.length) return { status: 'no_opponents' };
  if (ids.length > R.MAX_PLAYERS - 1) return { status: 'too_many', max: R.MAX_PLAYERS - 1 };
  if (ids.some((id) => !mongoose.isValidObjectId(id))) return { status: 'target_not_found' };
  if (ids.includes(sid(userId))) return { status: 'self' };

  const host = await User.findById(userId).select('role firstName lastName username avatar isBanned').lean();
  if (!host || !isFlameRole(host.role) || host.isBanned) return { status: 'forbidden' };
  const rivals = solo ? [] : await User.find({ _id: { $in: ids } }).select('role firstName lastName username avatar isBanned').lean();
  if (rivals.length !== ids.length || rivals.some((u) => !isFlameRole(u.role) || u.isBanned)) return { status: 'target_not_found' };
  const blocked = solo ? null : await Block.findOne({ $or: [{ blockerId: userId, blockedId: { $in: ids } }, { blockerId: { $in: ids }, blockedId: userId }] }).lean();
  if (blocked) return { status: 'blocked' };

  await sweepDue();
  if (!solo && (await openCount(userId)) >= R.MAX_OPEN) return { status: 'limit', max: R.MAX_OPEN };
  // Someone mid-test (js/shared/battle-invites.js reports it): the host is
  // warned first and re-sends with confirmBusy. Exam-mode ones only see the
  // popup once they've finished.
  if (!solo && body.confirmBusy !== true) {
    const busy = rivals.map((u) => ({ id: sid(u._id), name: displayName(u), activity: presence.get(u._id) })).filter((x) => x.activity);
    if (busy.length) return { status: 'opponent_busy', busy };
  }

  const config = { types: [], count, source, lessonId: '', lessonTitle: '', turnSeconds: 15, lives: 2 };
  let questions = [];
  if (kind === 'quiz') {
    const types = bank.usableTypes((Array.isArray(body.types) ? body.types : []).filter((t) => R.TYPE_KEYS.includes(t)), source);
    if (!types.length) return { status: 'bad_types' };
    if (body.lessonId) {
      const lesson = bank.findSet(await bank.loadPools(), body.lessonId, source);
      if (lesson) { config.lessonId = lesson.id; config.lessonTitle = lesson.title; }
    }
    config.types = types;
    questions = await bank.buildQuestions({ types, count, source, lessonId: config.lessonId });
    if (questions.length < Math.min(count, 5)) return { status: 'no_questions' };
  } else {
    config.turnSeconds = R.TURN_SECONDS.includes(Number(body.turnSeconds)) ? Number(body.turnSeconds) : 15;
    config.lives = R.LIVES.includes(Number(body.lives)) ? Number(body.lives) : 2;
  }

  let paid = null;
  if (stake) {
    paid = await User.findOneAndUpdate({ _id: userId, flameWallet: { $gte: stake } }, { $inc: { flameWallet: -stake } }, { new: true })
      .select('flameWallet').lean();
    if (!paid) {
      const cur = await User.findById(userId).select('flameWallet').lean();
      return { status: 'not_enough', wallet: (cur && cur.flameWallet) || 0, price: stake };
    }
  }
  const now = new Date();
  const hostName = displayName(host);
  const players = [
    { userId, name: hostName, avatar: host.avatar || '', state: 'joined', paid: stake, joinedAt: now, seenAt: now, lives: config.lives },
    ...ids.map((id) => {
      const u = rivals.find((r) => sid(r._id) === id);
      return { userId: u._id, name: displayName(u), avatar: u.avatar || '', state: 'invited', lives: config.lives };
    }),
  ];
  const doc = {
    hostId: userId, kind, solo, stake, config, players, memberIds: players.map((p) => p.userId),
    questions,
    expiresAt: new Date(now.getTime() + (solo ? R.SOLO_HOURS * HOUR : kind === 'chain' ? R.LOBBY_MINUTES * 60000 : R.INVITE_HOURS * HOUR)),
  };
  if (solo && kind === 'chain') {
    // vs Lulu 🤖, starting straight away
    players.push({ userId: new mongoose.Types.ObjectId(R.BOT.id), name: R.BOT.name, bot: true, state: 'joined', joinedAt: now, lives: config.lives });
    const first = await bank.chainStartWord();
    Object.assign(doc, {
      status: 'playing', startedAt: now,
      chain: { words: [{ w: first, by: null, pts: 0, start: true, at: now }], letter: first.slice(-1), turn: 0, deadline: new Date(now.getTime() + config.turnSeconds * 1000 + 3000) },
    });
  }
  let b;
  try {
    b = await VocabBattle.create(doc);
  } catch (err) {
    if (stake) await credit(userId, stake);
    console.error('[vocab-battle] create failed:', err.message);
    return { status: 'failed' };
  }

  await movedOn(userId, b._id);
  if (solo) return { status: 'ok', battle: view(b.toObject(), userId, now) };
  const game = gameText(b);
  const when = kind === 'chain'
    ? `Phòng chờ chỉ mở ${R.LOBBY_MINUTES} phút — vào ngay ở BXH vocab → Đấu trường từ vựng.`
    : `Nhận lời trong ${R.INVITE_HOURS} giờ ở BXH vocab → Đấu trường từ vựng.`;
  const bet = stake ? `Cược ${stake} 🔥 — người thắng ẵm cả pot!` : 'Trận giao hữu — người thắng được thưởng 🔥.';
  for (const id of ids) {
    await notify(userId, hostName, id, `⚔️ ${hostName} thách đấu từ vựng với bạn!`,
      `${hostName} mời bạn vào trận ${game}. ${bet}\n${when}`);
  }
  return { status: 'ok', wallet: paid ? paid.flameWallet : undefined, battle: view(b.toObject(), userId, now) };
}

async function respond(userId, id, accept) {
  // Load first to know the stake (the wallet is charged before the write)
  const pre = mongoose.isValidObjectId(id) ? await VocabBattle.findById(id).select('stake players status').lean() : null;
  if (!pre || pre.status !== 'open') return { status: 'gone' };
  const p0 = me(pre, userId);
  if (!p0 || p0.state !== 'invited') return { status: 'not_invited' };
  const stake = accept ? pre.stake : 0;
  if (stake) {
    const paid = await User.findOneAndUpdate({ _id: userId, flameWallet: { $gte: stake } }, { $inc: { flameWallet: -stake } }).lean();
    if (!paid) {
      const cur = await User.findById(userId).select('flameWallet').lean();
      return { status: 'not_enough', wallet: (cur && cur.flameWallet) || 0, price: stake };
    }
  }
  const wins = await friendlyWinsToday(pre.players.map((p) => p.userId));
  const res = await mutate(id, (b, now) => {
    const effects = [];
    tick(b, now, effects, wins);
    const p = me(b, userId);
    if (b.status !== 'open' || !p || p.state !== 'invited') {
      return effects.length ? { status: 'ok', effects, refused: true } : { status: 'gone' };
    }
    if (accept) {
      p.state = 'joined'; p.paid = stake; p.joinedAt = now; p.seenAt = now;
    } else {
      p.state = 'declined';
      effects.push({ notify: [userId, p.name, b.hostId, `⚔️ ${p.name} từ chối trận đấu từ vựng`, `${p.name} không tham gia trận lần này.`] });
    }
    tick(b, now, effects, wins);
    return { status: 'ok', effects };
  });
  if (stake && (res.status !== 'ok' || res.refused)) await credit(userId, stake);
  if (res.refused) return { status: 'gone' };
  if (res.status !== 'ok') return res;
  if (accept) await movedOn(userId, id);
  return { status: 'ok', battle: view(res.battle, userId) };
}

// The student went into another room (created one, or accepted an invite):
// their other Nối chữ lobbies stop counting on them, and the others there
// see it (note 'moved') instead of waiting for nobody —
//   • host → the lobby is cancelled, stakes refunded, joined players told
//   • joined → they leave it (stake refunded)
//   • invited → the invite lapses
// Quiz rooms are untouched: they're played at each one's own pace.
async function movedOn(userId, exceptId) {
  try {
    const rows = await VocabBattle.find({
      _id: { $ne: exceptId }, kind: 'chain', status: 'open', solo: { $ne: true },
      players: { $elemMatch: { userId, state: { $in: ['invited', 'joined'] } } },
    }).select('_id').limit(20).lean();
    for (const r of rows) {
      await mutate(r._id, (b, now) => {
        const effects = [];
        const ticked = tick(b, now, effects, {});
        const p = me(b, userId);
        if (b.status !== 'open' || !p || !['invited', 'joined'].includes(p.state)) {
          return ticked ? { status: 'ok', effects } : { status: 'ok', write: false };
        }
        p.note = 'moved';
        if (sid(b.hostId) === sid(userId)) {
          refundAll(b, effects, `${p.name} (chủ phòng) đã vào phòng khác nên phòng chờ Nối chữ đã hủy — 🔥 cược đã về lại ví lửa.`, userId);
        } else if (p.state === 'joined') {
          if (p.paid) { effects.push({ credit: p.userId, n: p.paid }); p.paid = 0; }
          p.state = 'left';
        } else {
          p.state = 'declined';
        }
        return { status: 'ok', effects };
      });
    }
  } catch (err) {
    console.error('[vocab-battle] movedOn failed:', err.message);
  }
}

// Host, before anyone else has joined (or a chain lobby that hasn't started)
async function cancel(userId, id) {
  const res = await mutate(id, (b) => {
    if (sid(b.hostId) !== sid(userId)) return { status: 'forbidden' };
    if (b.status !== 'open') return { status: 'gone' };
    if (b.kind === 'quiz' && joined(b).some((p) => sid(p.userId) !== sid(userId))) return { status: 'started' };
    const effects = [];
    refundAll(b, effects, 'Chủ phòng đã hủy trận — 🔥 cược đã về lại ví lửa.', userId);
    return { status: 'ok', effects };
  });
  if (res.status !== 'ok') return res;
  return { status: 'ok', battle: view(res.battle, userId) };
}

// Admin /vocab-battle: stop an open or running room — every stake goes back
// to its player's ví lửa and the players get a note.
async function adminCancel(id, reason = '') {
  const why = 'Ban quản trị đã dừng trận này' + (reason ? ' (' + reason + ')' : '') + ' — 🔥 cược đã về lại ví lửa.';
  return mutate(id, (b) => {
    if (!OPEN.includes(b.status)) return { status: 'gone' };
    const effects = [{ board: true }];
    refundAll(b, effects, why);
    return { status: 'ok', effects };
  });
}

// A joined player leaves a chain lobby (refunded)
async function leave(userId, id) {
  const res = await mutate(id, (b, now) => {
    const p = me(b, userId);
    if (!p || p.state !== 'joined' || sid(b.hostId) === sid(userId)) return { status: 'forbidden' };
    if (b.kind !== 'chain' || b.status !== 'open') return { status: 'started' };
    const effects = [];
    if (p.paid) { effects.push({ credit: p.userId, n: p.paid }); p.paid = 0; }
    p.state = 'left';
    tick(b, now, effects, {});
    return { status: 'ok', effects };
  });
  if (res.status !== 'ok') return res;
  return { status: 'ok', battle: view(res.battle, userId) };
}

async function get(userId, id) {
  if (!mongoose.isValidObjectId(id)) return { status: 'gone' };
  const pre = await VocabBattle.findById(id).select('players.userId status').lean();
  if (!pre || !me(pre, userId)) return { status: 'gone' };
  const wins = OPEN.includes(pre.status) ? await friendlyWinsToday(pre.players.map((p) => p.userId)) : {};
  const res = await mutate(id, (b, now) => {
    const effects = [];
    let changed = tick(b, now, effects, wins);
    const p = me(b, userId);
    // Presence (lobby dots), written at most every 8s per player
    if (p && OPEN.includes(b.status) && (!p.seenAt || now - new Date(p.seenAt) > 8000)) { p.seenAt = now; changed = true; }
    return changed ? { status: 'ok', effects } : { status: 'ok', write: false };
  });
  if (res.status !== 'ok') return res;
  const out = { status: 'ok', battle: view(res.battle, userId) };
  if (res.battle.solo && res.battle.status === 'done') {
    out.best = (await soloBests(userId, res.battle._id))[soloKey(res.battle)] || 0;
  }
  return out;
}

// quiz: the player's current question (served once; a reload gets the same
// question with the time already used).
async function next(userId, id) {
  const res = await mutate(id, (b, now) => {
    if (b.kind !== 'quiz') return { status: 'bad_kind' };
    const effects = [];
    tick(b, now, effects, {});
    const p = me(b, userId);
    if (!p || p.state !== 'joined') return effects.length ? { status: 'ok', effects, deny: 'not_joined' } : { status: 'not_joined' };
    if (b.status !== 'open' || p.finishedAt) return effects.length ? { status: 'ok', effects, deny: 'finished' } : { status: 'finished' };
    const fresh = !p.qAt;
    if (fresh) p.qAt = now;
    p.seenAt = now;
    return { status: 'ok', effects, idx: p.idx, qAt: p.qAt };
  });
  if (res.status !== 'ok') return res;
  if (res.deny) return { status: res.deny };
  const q = res.battle.questions[res.idx];
  const elapsed = Date.now() - new Date(res.qAt).getTime();
  return {
    status: 'ok',
    question: bank.publicQuestion(q, res.idx),
    total: res.battle.questions.length,
    remainingMs: Math.max(0, q.limit * 1000 - elapsed),
  };
}

async function answer(userId, id, given, idx) {
  const pre = mongoose.isValidObjectId(id) ? await VocabBattle.findById(id).select('players.userId').lean() : null;
  const wins = pre ? await friendlyWinsToday(pre.players.map((p) => p.userId)) : {};
  let out = null;
  const res = await mutate(id, (b, now) => {
    if (b.kind !== 'quiz') return { status: 'bad_kind' };
    const p = me(b, userId);
    if (!p || p.state !== 'joined') return { status: 'not_joined' };
    if (b.status !== 'open' || p.finishedAt) return { status: 'finished' };
    if (!p.qAt) return { status: 'no_question' };
    // Answer for a question already timed out by tick / another tab
    if (Number.isInteger(idx) && idx !== p.idx) return { status: 'stale' };
    const q = b.questions[p.idx];
    const ms = now - new Date(p.qAt);
    const late = ms > q.limit * 1000 + R.GRACE_MS;
    const g = bank.grade(q, given);
    const frac = late ? 0 : g.frac;
    const speed = Math.max(0, 1 - ms / (q.limit * 1000));
    const pts = frac > 0 ? Math.round(frac * (100 + R.SPEED_BONUS * speed)) : 0;
    p.answers.push({ frac, pts, ms, given: g.given, timeout: late });
    p.score += pts;
    if (frac === 1) p.correct += 1;
    p.idx += 1;
    p.qAt = null;
    p.seenAt = now;
    if (p.idx >= b.questions.length) p.finishedAt = now;
    out = { frac, pts, late, correct: bank.answerText(q), right: q.answer, note: q.note || '', word: q.word || '', meaning: q.meaning || '', score: p.score, done: !!p.finishedAt };
    const effects = [];
    tick(b, now, effects, wins);
    return { status: 'ok', effects };
  });
  if (res.status !== 'ok') return res;
  // MCQ: the right option's index; match: the right column per row
  const right = Array.isArray(out.right) || Number.isInteger(out.right) ? out.right : undefined;
  return { status: 'ok', ...out, right, battle: view(res.battle, userId) };
}

// chain: host starts the game with whoever has joined
async function start(userId, id) {
  const first = await bank.chainStartWord();
  const res = await mutate(id, (b, now) => {
    if (b.kind !== 'chain') return { status: 'bad_kind' };
    if (sid(b.hostId) !== sid(userId)) return { status: 'forbidden' };
    if (b.status !== 'open') return { status: 'started' };
    if (joined(b).length < 2) return { status: 'need_players' };
    const effects = [];
    // Invitees who didn't come drop out (they paid nothing)
    for (const p of b.players) if (p.state === 'invited') p.state = 'declined';
    for (const p of joined(b)) { p.lives = b.config.lives; p.out = false; p.score = 0; p.correct = 0; }
    b.status = 'playing';
    b.startedAt = now;
    b.chain.words = [{ w: first, by: null, pts: 0, start: true, at: now }];
    b.chain.letter = first.slice(-1);
    b.chain.turn = b.players.findIndex((p) => p.state === 'joined');
    b.chain.deadline = new Date(now.getTime() + b.config.turnSeconds * 1000 + 2000); // +2s to get ready
    return { status: 'ok', effects };
  });
  if (res.status !== 'ok') return res;
  return { status: 'ok', battle: view(res.battle, userId) };
}

async function playWord(userId, id, raw) {
  // The turn is judged on when the word arrived, not after an online
  // dictionary check made it wait
  const received = new Date();
  const w = String(raw || '').trim().toLowerCase();
  if (!/^[a-z]+(-[a-z]+)?$/.test(w)) return { status: 'chain_letters' };
  if (w.replace(/-/g, '').length < R.CHAIN_MIN_LEN) return { status: 'chain_short', min: R.CHAIN_MIN_LEN };
  const pre = mongoose.isValidObjectId(id)
    ? await VocabBattle.findById(id).select('players.userId kind status chain.letter chain.turn chain.words.w').lean() : null;
  // Cheap refusals first on the player's own turn (no dictionary lookup for
  // a word that can't count anyway)
  if (pre && pre.kind === 'chain' && pre.status === 'playing' && sid(pre.players[pre.chain.turn]?.userId) === sid(userId)) {
    if (w[0] !== pre.chain.letter) return { status: 'chain_letter', letter: pre.chain.letter };
    if (pre.chain.words.some((x) => x.w === w)) return { status: 'chain_used' };
  }
  const info = await bank.chainWordInfo(w);
  const wins = pre ? await friendlyWinsToday(pre.players.map((p) => p.userId)) : {};
  const res = await mutate(id, (b, now) => {
    if (b.kind !== 'chain') return { status: 'bad_kind' };
    const effects = [];
    const ticked = tick(b, received < now ? received : now, effects, wins);
    const deny = (status, extra) => (ticked ? { status: 'ok', effects, deny: status, ...extra } : { status, ...extra });
    if (b.status !== 'playing') return deny('not_playing');
    const p = b.players[b.chain.turn];
    if (sid(p.userId) !== sid(userId)) return deny('not_your_turn');
    if (w[0] !== b.chain.letter) return deny('chain_letter', { letter: b.chain.letter });
    if (b.chain.words.some((x) => x.w === w)) return deny('chain_used');
    if (info.blocked) return deny('chain_blocked');
    if (!info.known) return deny('chain_unknown');
    const pts = 10 + Math.max(0, w.length - 4) * 2 + (info.bank ? R.CHAIN_BANK_BONUS : 0);
    b.chain.words.push({ w, by: p.userId, pts, bank: info.bank, at: now });
    p.score += pts;
    p.correct += 1;
    p.seenAt = now;
    b.chain.letter = w.slice(-1);
    if (!chainContinues(b)) { endChain(b, now, effects, wins); return { status: 'ok', effects, pts }; }
    b.chain.turn = nextTurn(b, b.chain.turn);
    b.chain.deadline = new Date(now.getTime() + b.config.turnSeconds * 1000);
    return { status: 'ok', effects, pts };
  });
  if (res.status !== 'ok') return res;
  if (res.deny) return { status: res.deny, letter: res.letter, battle: view(res.battle, userId) };
  return { status: 'ok', pts: res.pts, bank: info.bank, battle: view(res.battle, userId) };
}

// Questions + the player's answers, once their own run is over
async function review(userId, id) {
  if (!mongoose.isValidObjectId(id)) return { status: 'gone' };
  const b = await VocabBattle.findById(id).lean();
  const p = b && me(b, userId);
  if (!p) return { status: 'gone' };
  if (b.kind === 'chain') {
    if (b.status === 'open' || b.status === 'playing') return { status: 'not_finished' };
    return { status: 'ok', items: [] };
  }
  if (!p.finishedAt && b.status !== 'done' && b.status !== 'cancelled') return { status: 'not_finished' };
  const items = b.questions.map((q, i) => {
    const a = p.answers[i] || null;
    return {
      i, type: q.type, label: R.QUESTION_TYPES[q.type]?.label || q.type,
      prompt: q.type === 'image' ? '' : q.prompt, image: q.image || '',
      correct: bank.answerText(q), given: a ? a.given : '', frac: a ? a.frac : 0, pts: a ? a.pts : 0, timeout: !!(a && a.timeout),
      words: q.type === 'match' ? q.pairs : [{ word: q.word, meaning: q.meaning, example: q.example || '' }],
    };
  });
  return { status: 'ok', items };
}

// Chơi một mình personal bests: { mix|<type>|chain: score }
function soloKey(b) {
  if (b.kind === 'chain') return 'chain';
  return b.config.types.length === 1 ? b.config.types[0] : 'mix';
}
async function soloBests(userId, exceptId = null) {
  const q = { memberIds: userId, solo: true, status: 'done' };
  if (exceptId) q._id = { $ne: exceptId };
  const rows = await VocabBattle.find(q).select('kind config.types players.userId players.score').lean();
  const out = {};
  for (const r of rows) {
    const p = me(r, userId);
    const k = soloKey(r);
    if (p && p.score > (out[k] || 0)) out[k] = p.score;
  }
  return out;
}

async function list(userId) {
  await sweepDue();
  const since = new Date(Date.now() - 14 * 24 * HOUR);
  const rows = await VocabBattle.find({
    memberIds: userId,
    $or: [{ status: { $in: OPEN } }, { updatedAt: { $gte: since } }],
  }).sort({ updatedAt: -1 }).limit(60).lean();
  const visible = rows.filter((b) => {
    const p = me(b, userId);
    return p && (p.state !== 'declined' || b.status !== 'open');
  });
  const u = await User.findById(userId).select('flameWallet').lean();
  return { status: 'ok', wallet: (u && u.flameWallet) || 0, battles: visible.map((b) => view(b, userId)), bests: await soloBests(userId) };
}

// Expired rooms nobody is looking at (list / create run it)
async function sweepDue() {
  const now = new Date();
  const due = await VocabBattle.find({ $or: [
    { status: 'open', expiresAt: { $lte: now } },
    { status: 'open', kind: 'chain', solo: { $ne: true }, createdAt: { $lte: new Date(now - R.LOBBY_MINUTES * 60000) } },
    { status: 'playing', 'chain.deadline': { $lte: now } }, // Nối chữ left mid-game
  ] }).select('_id players.userId').limit(50).lean();
  for (const d of due) {
    const wins = await friendlyWinsToday(d.players.map((p) => p.userId));
    await mutate(d._id, (b, t) => {
      const effects = [];
      return tick(b, t, effects, wins) ? { status: 'ok', effects } : { status: 'ok', write: false };
    });
  }
  return due.length;
}

// Invites still waiting for this student's answer — polled every ~10 s on
// every page by js/shared/battle-invites.js, which pops them up ("Vào trận
// ngay"). The same poll reports what the student is doing (`activity`,
// services/presenceService.js) so an inviter can be warned.
async function pendingInvites(userId, activity) {
  if (activity !== undefined) presence.set(userId, activity);
  const now = new Date();
  const rows = await VocabBattle.find({
    memberIds: userId, status: 'open', solo: { $ne: true }, expiresAt: { $gt: now },
    players: { $elemMatch: { userId, state: 'invited' } },
  }).select('kind status solo stake config players hostId expiresAt createdAt').sort({ createdAt: -1 }).limit(5).lean();
  return rows.filter((b) => new Date(endsAt(b)) > now).map((b) => {
    const host = b.players.find((p) => sid(p.userId) === sid(b.hostId)) || {};
    return {
      id: sid(b._id),
      kind: b.kind,
      stake: b.stake || 0,
      game: gameText(b),
      fromName: host.name || 'Một bạn',
      fromAvatar: host.avatar || '',
      others: b.players
        .filter((p) => ![sid(userId), sid(b.hostId)].includes(sid(p.userId)) && p.state !== 'declined')
        .map((p) => p.name),
      createdAt: b.createdAt,
      expiresAt: endsAt(b),
    };
  });
}

// Who can be invited: classmates first, then anyone matching `q`
async function players(userId, q) {
  const { userSearchFilter } = require('../utils/userSearch');
  const viewer = await User.findById(userId).select('className').lean();
  const blocks = await Block.find({ $or: [{ blockerId: userId }, { blockedId: userId }] }).select('blockerId blockedId').lean();
  const hidden = new Set(blocks.map((x) => (sid(x.blockerId) === sid(userId) ? sid(x.blockedId) : sid(x.blockerId))));
  hidden.add(sid(userId));
  const base = { role: 'student', isBanned: { $ne: true } };
  const filter = userSearchFilter(q, ['firstName', 'lastName', 'username']);
  let rows;
  if (filter) {
    rows = await User.find({ ...base, ...filter }).select('firstName lastName username avatar className lastSeen').limit(40).lean();
  } else {
    const cls = viewer && viewer.className ? await User.find({ ...base, className: viewer.className })
      .select('firstName lastName username avatar className lastSeen').limit(60).lean() : [];
    const recent = await User.find({ ...base, lastSeen: { $gte: new Date(Date.now() - 10 * 60 * 1000) } })
      .select('firstName lastName username avatar className lastSeen').sort({ lastSeen: -1 }).limit(30).lean();
    const seen = new Set();
    rows = [...cls, ...recent].filter((u) => (seen.has(sid(u._id)) ? false : seen.add(sid(u._id))));
  }
  const now = Date.now();
  const cls = viewer && viewer.className;
  return rows
    .filter((u) => !hidden.has(sid(u._id)))
    .map((u) => ({
      id: sid(u._id),
      name: displayName(u),
      avatar: u.avatar || '',
      classmate: !!cls && u.className === cls,
      online: !!u.lastSeen && now - new Date(u.lastSeen) < 5 * 60 * 1000,
      busy: presence.get(u._id, now), // mid Listening/Reading test → the form warns
    }))
    .sort((a, b) => (b.online - a.online) || (b.classmate - a.classmate) || a.name.localeCompare(b.name, 'vi'))
    .slice(0, 40);
}

function rules() {
  return {
    enabled: R.ENABLED,
    types: Object.entries(R.QUESTION_TYPES).filter(([key]) => !R.DISABLED_TYPES.includes(key))
      .map(([key, v]) => ({ key, label: v.label, limit: v.limit })),
    sources: Object.entries(R.SOURCES).filter(([key]) => !R.DISABLED_SOURCES.includes(key))
      .map(([key, v]) => ({ key, label: v.label, types: v.types.filter((t) => !R.DISABLED_TYPES.includes(t)), sets: v.sets })),
    counts: R.COUNTS, maxPlayers: R.MAX_PLAYERS, minStake: R.MIN_STAKE, maxStake: R.MAX_STAKE,
    turnSeconds: R.TURN_SECONDS, lives: R.LIVES, inviteHours: R.INVITE_HOURS, lobbyMinutes: R.LOBBY_MINUTES,
    friendlyWin: R.FRIENDLY_WIN_FLAMES, friendlyDaily: R.FRIENDLY_DAILY_WINS,
    chainMinLen: R.CHAIN_MIN_LEN, chainBankBonus: R.CHAIN_BANK_BONUS,
  };
}

module.exports = {
  create, respond, cancel, leave, get, next, answer, start, playWord, review, list, players, rules, sweepDue, pendingInvites, adminCancel, gameText,
  _internal: { tick, finish, view, mutate, endsAt, movedOn },
};
