'use strict';

// What a student is doing right now — only "doing a Listening / Reading
// test" so far. Reported by js/shared/battle-invites.js on its invite poll
// (GET /api/vocab-battle/invites?act=…), read by the ⚔️ Đấu trường so the
// inviter is warned before challenging someone mid-test, and so the popup
// stays quiet during an exam-mode (simulation) test.
//
// In memory on purpose: it's live presence (stale after TTL_MS), one Render
// instance serves the API, and a restart just forgets who's mid-test for one
// poll. Never worth a DB write every few seconds per student.
const TTL_MS = 90 * 1000;  // the page reports every ~10 s while it's in front
const MAX = 20000;

const SKILLS = { listening: 'Listening', reading: 'Reading' };
const MODES = { practice: 'luyện tập', simulation: 'chế độ thi' };

const _map = new Map(); // userId → { skill, mode, at } (no test name: classmates see this)

function parse(q = {}) {
  const skill = SKILLS[q.act] ? q.act : null;
  if (!skill) return null;
  return {
    skill,
    mode: q.mode === 'simulation' ? 'simulation' : 'practice',
  };
}

function set(userId, activity, now = Date.now()) {
  const k = String(userId);
  if (!activity) { _map.delete(k); return; }
  if (!_map.has(k) && _map.size >= MAX) {
    for (const [key, v] of _map) if (now - v.at > TTL_MS) _map.delete(key);
    if (_map.size >= MAX) _map.delete(_map.keys().next().value);
  }
  _map.set(k, { ...activity, at: now });
}

// → { skill, mode, label } or null
function get(userId, now = Date.now()) {
  const v = _map.get(String(userId));
  if (!v) return null;
  if (now - v.at > TTL_MS) { _map.delete(String(userId)); return null; }
  return { skill: v.skill, mode: v.mode, label: `đề ${SKILLS[v.skill]} (${MODES[v.mode]})` };
}

module.exports = { parse, set, get, TTL_MS, _reset: () => _map.clear() };
