const catchAsync = require('../middleware/catchAsync');
const svc = require('../services/vocabBattleService');
const bank = require('../services/vocabBattleBank');
const R = require('../constants/vocabBattle');
const lb = require('../services/vocabBattleLeaderboard');
const presence = require('../services/presenceService');

// ⚔️ Đấu trường từ vựng — /api/vocab-battle (services/vocabBattleService.js)
const MESSAGES = {
  gone: [404, 'Không tìm thấy trận đấu (có thể đã kết thúc).'],
  forbidden: [403, 'Bạn không làm được thao tác này.'],
  not_enough: [400, 'Ví lửa chưa đủ để cược — học thêm để kiếm 🔥 nhé!'],
  bad_stake: [400, () => `Tiền cược là 0 (giao hữu) hoặc từ ${R.MIN_STAKE} đến ${R.MAX_STAKE} 🔥.`],
  closed: [403, 'Đấu trường đang tạm đóng — các trận đang chơi vẫn đánh tiếp được, quay lại sau nhé!'],
  bad_count: [400, 'Số câu không hợp lệ.'],
  bad_types: [400, 'Chọn ít nhất một dạng câu hỏi phù hợp với nguồn từ.'],
  no_questions: [400, 'Nguồn từ này chưa đủ câu hỏi — thử nguồn khác hoặc thêm dạng câu.'],
  no_opponents: [400, 'Chọn ít nhất 1 bạn để thách đấu.'],
  too_many: [400, () => `Tối đa ${R.MAX_PLAYERS} người một trận.`],
  self: [400, 'Không tự thách đấu chính mình được 😆'],
  target_not_found: [404, 'Không tìm thấy học viên này.'],
  blocked: [403, 'Không thách đấu được bạn này (một trong hai đã chặn người kia).'],
  limit: [400, () => `Bạn đang có ${R.MAX_OPEN} trận chưa xong — đánh xong rồi tạo thêm nhé.`],
  failed: [500, 'Không tạo được trận, thử lại nhé.'],
  not_invited: [400, 'Bạn đã trả lời lời mời này rồi.'],
  started: [400, 'Trận đã bắt đầu, không hủy được nữa.'],
  not_joined: [403, 'Bạn chưa vào trận này.'],
  finished: [400, 'Bạn đã làm xong lượt của mình.'],
  no_question: [400, 'Chưa mở câu hỏi.'],
  stale: [409, 'Câu này đã hết giờ.'],
  bad_kind: [400, 'Sai loại trận.'],
  need_players: [400, 'Cần ít nhất 2 người trong phòng mới bắt đầu được.'],
  expired: [410, () => `Phòng chờ đã quá ${R.LOBBY_MINUTES} phút nên tự hủy — 🔥 cược đã về lại ví lửa.`],
  not_playing: [400, 'Trận Nối chữ chưa bắt đầu hoặc đã kết thúc.'],
  not_your_turn: [400, 'Chưa tới lượt bạn.'],
  chain_letters: [400, 'Chỉ gõ 1 từ tiếng Anh (chữ cái a–z).'],
  chain_short: [400, () => `Từ phải có ít nhất ${R.CHAIN_MIN_LEN} chữ cái.`],
  chain_letter: [400, 'Từ phải bắt đầu bằng chữ cái được yêu cầu.'],
  chain_used: [400, 'Từ này đã có người dùng rồi!'],
  chain_unknown: [400, 'Không tìm thấy từ này trong từ điển.'],
  chain_blocked: [400, 'Từ này không dùng trong trò chơi nhé 🙂'],
  not_finished: [400, 'Làm xong lượt của bạn rồi mới xem đáp án nhé.'],
  busy: [409, 'Máy chủ đang bận, thử lại nhé.'],
  opponent_busy: [409, 'Có bạn đang làm đề luyện tập — xác nhận trước khi mời nhé.'],
};

function send(res, result) {
  if (result.status === 'ok') {
    const rest = { ...result };
    delete rest.status;
    return res.json({ success: true, ...rest });
  }
  const [code, msg] = MESSAGES[result.status] || [400, 'Không thực hiện được.'];
  const message = typeof msg === 'function' ? msg() : msg; // rules an admin can change (services/vocabBattleSettings.js)
  const rest = { ...result };
  delete rest.status;
  return res.status(code).json({ success: false, code: result.status, message, ...rest });
}

const id = (req) => String(req.params.id || '');

exports.list = catchAsync(async (req, res) => {
  const [out, stats] = await Promise.all([svc.list(req.user._id), lb.myStats(req.user._id)]);
  send(res, { ...out, stats, rules: svc.rules() });
});
exports.leaderboard = catchAsync(async (req, res) => {
  const q = req.query || {};
  send(res, await lb.leaderboard(req.user._id, {
    board: String(q.board || ''), period: String(q.period || ''), game: String(q.game || ''), scope: String(q.scope || ''),
  }));
});
exports.players = catchAsync(async (req, res) => {
  send(res, { status: 'ok', players: await svc.players(req.user._id, String(req.query.q || '').slice(0, 60)) });
});
// js/shared/battle-invites.js — every page, ~10 s: pending invites + what
// this student is doing (?act=listening|reading|none&mode=practice|simulation)
exports.invites = catchAsync(async (req, res) => {
  const q = req.query || {};
  // act=none → the test ended; no act → this tab knows nothing (another tab may be mid-test)
  const act = String(q.act || '');
  const activity = act === 'none' ? null : (presence.parse({ act, mode: String(q.mode || '') }) || undefined);
  send(res, { status: 'ok', invites: await svc.pendingInvites(req.user._id, activity) });
});
exports.lessons = catchAsync(async (req, res) => {
  const [lessons, stats] = await Promise.all([bank.lessonOptions(), bank.bankStats()]);
  send(res, { status: 'ok', lessons, stats });
});
exports.create = catchAsync(async (req, res) => {
  send(res, await svc.create(req.user._id, req.body || {}));
});
exports.get = catchAsync(async (req, res) => {
  const out = await svc.get(req.user._id, id(req));
  // The room page needs the labels too (and no longer loads the whole list for them)
  send(res, out.status === 'ok' ? { ...out, rules: svc.rules() } : out);
});
exports.accept = catchAsync(async (req, res) => send(res, await svc.respond(req.user._id, id(req), true)));
exports.decline = catchAsync(async (req, res) => send(res, await svc.respond(req.user._id, id(req), false)));
exports.cancel = catchAsync(async (req, res) => send(res, await svc.cancel(req.user._id, id(req))));
exports.leave = catchAsync(async (req, res) => send(res, await svc.leave(req.user._id, id(req))));
exports.next = catchAsync(async (req, res) => send(res, await svc.next(req.user._id, id(req))));
exports.answer = catchAsync(async (req, res) => {
  const { answer, idx } = req.body || {};
  send(res, await svc.answer(req.user._id, id(req), answer, idx));
});
exports.start = catchAsync(async (req, res) => send(res, await svc.start(req.user._id, id(req))));
exports.word = catchAsync(async (req, res) => {
  send(res, await svc.playWord(req.user._id, id(req), String((req.body && req.body.word) || '').slice(0, 40)));
});
exports.review = catchAsync(async (req, res) => send(res, await svc.review(req.user._id, id(req))));
