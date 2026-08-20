const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Không có token xác thực' });
    }

    const token   = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    // ── Chặn token cũ nếu tài khoản đã bị cấm sau khi login ──
    if (user.isBanned) {
      // Worth a security-audit log line: a still-valid token was rejected
      // because the account was banned after issuance. Routine 401s
      // (expired/invalid tokens, extremely high-volume) are deliberately
      // NOT logged here to avoid drowning this signal in noise.
      logger.auth('Rejected request from banned user', { userId: String(user._id) });
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ giáo viên để mở khóa.'
      });
    }

    // Auto-expire plan nếu đã hết hạn. planExpiresAt/planStartedAt are
    // deliberately left in place (not cleared) — they're the only signal
    // the frontend has to tell "this account WAS premium and it just
    // expired" (show renew-Premium copy) apart from "this is a free
    // account whose 24h trial ran out" (show trial-expired copy); see
    // frontend/js/nav.js's _showTrialExpiredModalOnce().
    if (user.plan === 'premium' && user.planExpiresAt && user.planExpiresAt < new Date()) {
      user.plan = 'free';
      User.updateOne({ _id: user._id }, { plan: 'free' }).catch(() => {});
    }

    req.user = user;
    // Cập nhật lastSeen — fire-and-forget, không chặn request
    User.updateOne({ _id: user._id }, { lastSeen: new Date() }).catch(() => {});
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};