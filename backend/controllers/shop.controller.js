const catchAsync = require('../middleware/catchAsync');
const shopService = require('../services/shopService');
const duelService = require('../services/duelService');

const MESSAGES = {
  not_found: [404, 'Không tìm thấy vật phẩm.'],
  forbidden: [403, 'Chỉ học viên và giáo viên mới mua được vật phẩm.'],
  not_enough: [400, 'Ví lửa chưa đủ — học thêm để kiếm 🔥 nhé!'],
  max_owned: [400, 'Vượt quá số lượng tối đa được giữ của vật phẩm này.'],
  invalid_qty: [400, 'Số lượng không hợp lệ.'],
  already_owned: [400, 'Bạn đã có linh thú này rồi.'],
  not_owned: [400, 'Bạn chưa sở hữu linh thú này.'],
  not_sellable: [400, 'Vật phẩm này không bán lại được.'],
  not_manual: [400, 'Vật phẩm này không dùng trực tiếp được.'],
  none_left: [400, 'Bạn không còn vật phẩm này — mua thêm ở cửa hàng nhé.'],
  already_active: [400, 'Hôm nay bạn đã đập Búa Hi Vọng rồi!'],
  invalid_target: [400, 'Không ném bánh vào chính mình được 😆'],
  already_caked: [400, 'Bạn này đang dính kem rồi — để mai ném tiếp nhé!'],
  cake_blocked: [403, 'Không ném bánh được vào bạn này (một trong hai đã chặn người kia).'],
  not_caked: [400, 'Ảnh đại diện của bạn đang sạch, chưa cần lau đâu ✨'],
  target_not_found: [404, 'Không tìm thấy bạn này.'],
  gift_self: [400, 'Không tự tặng quà cho chính mình được 😆'],
  gift_blocked: [403, 'Không tặng được cho bạn này (một trong hai đã chặn người kia).'],
  target_full: [400, 'Bạn ấy đã giữ (tính cả quà chờ nhận trong hộp thư) đủ số lượng tối đa của vật phẩm này rồi.'],
  target_has_pet: [400, 'Bạn ấy đã có (hoặc đang có quà chờ nhận) linh thú này rồi — chọn bé khác nhé!'],
  gift_failed: [500, 'Không gửi được quà — vật phẩm vẫn còn trong Kho đồ của bạn, thử lại sau nhé.'],
  gift_pending: [400, 'Bạn đang có quà là linh thú này trong Hộp thư — vào Hộp thư bấm "Nhận quà" là có, khỏi mua nhé!'],
  hope_too_late: [400, 'Hôm nay bạn đã kiếm gần hết 🔥 tối đa trong ngày — không còn đủ chỗ để đạt chỉ tiêu Búa Hi Vọng. Hãy đập búa vào đầu ngày mai, trước khi học nhé!'],
  no_pet: [400, 'Bạn chưa dắt linh thú nào đi dạo — vào Kho đồ chọn một bé nhé.'],
  gift_claimed: [400, 'Hôm nay bạn đã mở quà linh thú rồi — mai quay lại nhé!'],
  gift_study: [400, 'Học 1 bài và kiếm ít nhất 1 🔥 hôm nay thì linh thú mới mang quà về nhé!'],
  invalid_lens_target: [400, 'Không tự soi chính mình được 😆'],
  not_hidden: [400, 'Bạn này không mặc Áo Tàng Hình (hoặc áo vừa hết hạn).'],
  duel_stake: [400, 'Tiền cược phải là số nguyên từ 5 đến 100 🔥.'],
  duel_self: [400, 'Không tự thách đấu chính mình được 😆'],
  duel_blocked: [403, 'Không thách đấu được bạn này (một trong hai đã chặn người kia).'],
  duel_limit_me: [400, 'Bạn đang có đủ 3 trận thách đấu chưa xong — chờ xong bớt rồi thách tiếp nhé.'],
  duel_limit_target: [400, 'Bạn ấy đang bận đủ 3 trận thách đấu rồi — thử lại sau nhé.'],
  duel_exists: [400, 'Hai bạn đang có một trận thách đấu chưa xong rồi.'],
  duel_gone: [400, 'Trận thách đấu này không còn chờ nữa (đã được trả lời, hủy hoặc hết hạn).'],
  duel_failed: [500, 'Không tạo được trận thách đấu — 🔥 đã được hoàn lại, thử lại sau nhé.'],
};

function send(res, result) {
  if (result.status === 'ok') {
    const rest = { ...result };
    delete rest.status;
    return res.json({ success: true, ...rest });
  }
  const [code, message] = MESSAGES[result.status] || [400, 'Không thực hiện được.'];
  return res.status(code).json({ success: false, code: result.status, message, ...result });
}

// ── GET /api/shop ─────────────────────────────────────────────
exports.getState = catchAsync(async (req, res) => {
  const state = await shopService.getState(req.user._id);
  if (!state) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  res.json({ success: true, ...state });
});

// ── GET /api/shop/feed?since=ISO — "X vừa mua Y" ticker (shop-feed.js) ──
// Also carries `caked` — the cake on the viewer's own avatar, if any — and
// `announce`, the huyền thoại announcements newer than ?asince=ISO
// (Thập Vĩ bought / its owner logged in).
exports.getFeed = catchAsync(async (req, res) => {
  // Duels whose time is up get settled here too, so results (and their
  // "X thắng Y" ticker rows) arrive while people are online. Best-effort.
  await duelService.settleDue().catch(err => console.error('[duel] settleDue failed:', err.message));
  const [feed, caked, announce] = await Promise.all([
    shopService.getFeed(req.user._id, req.query.since),
    shopService.getCakeNotice(req.user._id),
    shopService.getAnnouncements(req.user._id, req.query.asince),
  ]);
  res.json({ success: true, feed, caked, announce });
});

// ── GET /api/shop/pet — the walking linh thú (+ its 🎁 status), for js/shared/pets.js ──
exports.getPet = catchAsync(async (req, res) => {
  res.json({ success: true, ...(await shopService.getPetState(req.user._id)) });
});

// ── POST /api/shop/pet-gift — open today's 🎁 Quà linh thú ──────
exports.claimPetGift = catchAsync(async (req, res) => {
  send(res, await shopService.claimPetGift(req.user._id));
});

// ── POST /api/shop/lens { targetId } — 🔍 Kính Soi ─────────────
exports.useLens = catchAsync(async (req, res) => {
  send(res, await shopService.useLens(req.user._id, String((req.body || {}).targetId || '')));
});

// ── ⚔️ Thách đấu (services/duelService.js) ─────────────────────
exports.listDuels = catchAsync(async (req, res) => {
  res.json({ success: true, ...(await duelService.listDuels(req.user._id)) });
});
exports.challenge = catchAsync(async (req, res) => {
  const { toId, stake } = req.body || {};
  send(res, await duelService.challenge(req.user._id, String(toId || ''), stake));
});
exports.acceptDuel = catchAsync(async (req, res) => {
  send(res, await duelService.respond(req.user._id, String(req.params.id || ''), true));
});
exports.declineDuel = catchAsync(async (req, res) => {
  send(res, await duelService.respond(req.user._id, String(req.params.id || ''), false));
});
exports.cancelDuel = catchAsync(async (req, res) => {
  send(res, await duelService.cancel(req.user._id, String(req.params.id || '')));
});

// ── POST /api/shop/buy { kind: 'item'|'pet', key, qty? } ──────
// qty (items only, default 1) — linh thú are one of each.
exports.buy = catchAsync(async (req, res) => {
  const { kind, key, qty } = req.body || {};
  const result = kind === 'pet'
    ? await shopService.buyPet(req.user._id, String(key || ''))
    : await shopService.buyItem(req.user._id, String(key || ''), qty === undefined ? 1 : qty);
  send(res, result);
});

// ── POST /api/shop/sell { kind: 'item'|'pet', key } — half price back ──
exports.sell = catchAsync(async (req, res) => {
  const { kind, key } = req.body || {};
  const result = kind === 'pet'
    ? await shopService.sellPet(req.user._id, String(key || ''))
    : await shopService.sellItem(req.user._id, String(key || ''));
  send(res, result);
});

// ── POST /api/shop/use { key } ────────────────────────────────
exports.use = catchAsync(async (req, res) => {
  send(res, await shopService.useItem(req.user._id, String((req.body || {}).key || '')));
});

// ── POST /api/shop/cake { targetId } ──────────────────────────
exports.throwCake = catchAsync(async (req, res) => {
  send(res, await shopService.throwCake(req.user._id, String((req.body || {}).targetId || '')));
});

// ── PUT /api/shop/pet { petId } ('' = cất linh thú) ───────────
exports.setPet = catchAsync(async (req, res) => {
  send(res, await shopService.setActivePet(req.user._id, String((req.body || {}).petId || '')));
});

// ── GET /api/shop/gift-recipients?q= — who the 🎁 Tặng dialog can pick ──
exports.giftRecipients = catchAsync(async (req, res) => {
  res.json({ success: true, users: await shopService.searchGiftRecipients(req.user._id, req.query.q) });
});

// ── POST /api/shop/gift { kind: 'item'|'pet', key, toId, qty? } ──
exports.gift = catchAsync(async (req, res) => {
  const { kind, key, toId, qty } = req.body || {};
  const result = kind === 'pet'
    ? await shopService.giftPet(req.user._id, String(key || ''), String(toId || ''))
    : await shopService.giftItem(req.user._id, String(key || ''), String(toId || ''), qty === undefined ? 1 : qty);
  send(res, result);
});
