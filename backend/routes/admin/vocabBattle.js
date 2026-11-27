'use strict';
// ⚔️ Đấu trường từ vựng — admin side of /app/vocab-battle.
// Logic: services/vocabBattleAdmin.js (+ vocabBattleSettings.js).
//
//   GET    /vocab-battle/overview                 counts + 14-day chart
//   GET    /vocab-battle/battles?status=&kind=&solo=&search=&page=
//   POST   /vocab-battle/battles/:id/cancel       { reason } — stop, refund stakes
//   GET    /vocab-battle/bank                     every source's size + BattleWord sets
//   GET    /vocab-battle/words?kind=&set=&origin=&hidden=&edited=&search=&page=
//   POST   /vocab-battle/words                    add (picture / Từ điển mở)
//   PUT    /vocab-battle/words/:id                edit (meaning, example, picture, hide…)
//   POST   /vocab-battle/words/hide               { ids, hidden }
//   DELETE /vocab-battle/words/:id                (admin only)
//   GET    /vocab-battle/chain-words?source=player|all&search=&page=
//   POST   /vocab-battle/chain-words/block        { w } — delete + block in Nối chữ
//   POST   /vocab-battle/chain-words/unblock      { w }
//   GET    /vocab-battle/settings   PUT /vocab-battle/settings   POST /vocab-battle/settings/reset
const express = require('express');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const svc = require('../../services/vocabBattleAdmin');

const router = express.Router();

function send(res, r) {
  if (r.status === 'ok') { const out = { ...r }; delete out.status; return res.json({ success: true, ...out }); }
  const code = r.status === 'not_found' ? 404 : 400;
  return res.status(code).json({ success: false, message: r.message || (r.status === 'not_found' ? 'Không tìm thấy' : 'Dữ liệu không hợp lệ') });
}
const wrap = (fn) => async (req, res) => {
  try { send(res, await fn(req)); } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

router.get('/vocab-battle/overview', auth, teacherOnly, wrap(() => svc.overview()));
router.get('/vocab-battle/battles', auth, teacherOnly, wrap((req) => svc.battles(req.query)));
router.post('/vocab-battle/battles/:id/cancel', auth, teacherOnly, wrap((req) => svc.cancelBattle(req.params.id, (req.body || {}).reason)));

router.get('/vocab-battle/bank', auth, teacherOnly, wrap(() => svc.bankInfo()));
router.get('/vocab-battle/words', auth, teacherOnly, wrap((req) => svc.words(req.query)));
router.post('/vocab-battle/words/hide', auth, teacherOnly, wrap((req) => svc.hideWords((req.body || {}).ids, (req.body || {}).hidden)));
router.post('/vocab-battle/words', auth, teacherOnly, wrap((req) => svc.createWord(req.body || {})));
router.put('/vocab-battle/words/:id', auth, teacherOnly, wrap((req) => svc.updateWord(req.params.id, req.body || {})));
router.delete('/vocab-battle/words/:id', auth, teacherOnly, wrap((req) => svc.deleteWord(req.params.id)));

router.get('/vocab-battle/chain-words', auth, teacherOnly, wrap((req) => svc.chainWords(req.query)));
router.post('/vocab-battle/chain-words/block', auth, teacherOnly, wrap((req) => svc.blockChainWord((req.body || {}).w)));
router.post('/vocab-battle/chain-words/unblock', auth, teacherOnly, wrap((req) => svc.unblockChainWord((req.body || {}).w)));

router.get('/vocab-battle/settings', auth, teacherOnly, wrap(() => svc.getSettings()));
router.put('/vocab-battle/settings', auth, teacherOnly, wrap((req) => svc.saveSettings(req.body || {})));
router.post('/vocab-battle/settings/reset', auth, teacherOnly, wrap(() => svc.resetSettings()));

module.exports = router;
