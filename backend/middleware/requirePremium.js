/**
 * backend/middleware/requirePremium.js
 * Chặn truy cập nếu user không phải premium (hoặc admin/teacher).
 * Phải dùng sau middleware `auth` (cần req.user đã được gán).
 */
function requirePremium(message = 'Bạn cần nâng cấp lên Premium để dùng tính năng này') {
  return (req, res, next) => {
    const isPremium = req.user.plan === 'premium' || ['admin', 'teacher'].includes(req.user.role);
    if (isPremium) return next();
    return res.status(403).json({ success: false, message, code: 'PLAN_REQUIRED', requiresPremium: true });
  };
}

module.exports = requirePremium;
