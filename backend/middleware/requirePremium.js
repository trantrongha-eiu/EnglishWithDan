/**
 * backend/middleware/requirePremium.js
 * Chặn truy cập nếu user không có full access: không phải premium, không
 * phải admin/teacher, và đã hết 24h dùng thử miễn phí kể từ lúc tạo tài
 * khoản (xem backend/utils/plan.js — hasFullAccess là nguồn sự thật duy
 * nhất cho luật này).
 * Phải dùng sau middleware `auth` (cần req.user đã được gán).
 */
const { hasFullAccess } = require('../utils/plan');

function requirePremium(message = 'Tài khoản dùng thử miễn phí 1 ngày của bạn đã hết hạn. Nâng cấp Premium để tiếp tục sử dụng.') {
  return (req, res, next) => {
    if (hasFullAccess(req.user)) return next();
    return res.status(403).json({ success: false, message, code: 'PLAN_REQUIRED', requiresPremium: true });
  };
}

module.exports = requirePremium;
