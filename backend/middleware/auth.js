const jwt  = require('jsonwebtoken');
const User = require('../models/User');

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
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ giáo viên để mở khóa.'
      });
    }

    req.user = user;
    // Cập nhật lastSeen — fire-and-forget, không chặn request
    User.updateOne({ _id: user._id }, { lastSeen: new Date() }).catch(() => {});
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};