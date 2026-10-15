const catchAsync = require('../middleware/catchAsync');
const shopService = require('../services/shopService');

const MESSAGES = {
  not_found: [404, 'Không tìm thấy vật phẩm.'],
  forbidden: [403, 'Chỉ học viên mới mua được vật phẩm.'],
  not_enough: [400, 'Ví lửa chưa đủ — học thêm để kiếm 🔥 nhé!'],
  max_owned: [400, 'Bạn đã giữ số lượng tối đa của vật phẩm này.'],
  already_owned: [400, 'Bạn đã có linh thú này rồi.'],
  not_owned: [400, 'Bạn chưa sở hữu linh thú này.'],
  not_manual: [400, 'Vật phẩm này không dùng trực tiếp được.'],
  none_left: [400, 'Bạn không còn vật phẩm này — mua thêm ở cửa hàng nhé.'],
  already_active: [400, 'Hôm nay bạn đã đập Búa Hi Vọng rồi!'],
  invalid_target: [400, 'Không ném bánh vào chính mình được 😆'],
  already_caked: [400, 'Bạn này đang dính kem rồi — để mai ném tiếp nhé!'],
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
exports.getFeed = catchAsync(async (req, res) => {
  res.json({ success: true, feed: await shopService.getFeed(req.user._id, req.query.since) });
});

// ── GET /api/shop/pet — the walking linh thú, for js/shared/pets.js ──
exports.getPet = catchAsync(async (req, res) => {
  res.json({ success: true, activePet: await shopService.getActivePet(req.user._id) });
});

// ── POST /api/shop/buy { kind: 'item'|'pet', key } ────────────
exports.buy = catchAsync(async (req, res) => {
  const { kind, key } = req.body || {};
  const result = kind === 'pet'
    ? await shopService.buyPet(req.user._id, String(key || ''))
    : await shopService.buyItem(req.user._id, String(key || ''));
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
