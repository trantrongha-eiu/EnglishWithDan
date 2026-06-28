const User   = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');

// ── Helpers ────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function userPayload(user) {
  return {
    id:        user._id,
    firstName: user.firstName,
    lastName:  user.lastName,
    username:  user.username,
    email:     user.email,
    role:      user.role,
    avatar:    user.avatar || '',
    plan:      user.plan || 'free',
    planExpiresAt: user.planExpiresAt || null
  };
}

// ── POST /api/auth/register ─────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email hoặc Username đã tồn tại' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, username, email, password: hashed });
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: userPayload(user) });
  } catch (err) {
    console.error('[Auth] register error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── POST /api/auth/login ────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    });

    if (!user) return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });

    // Social-only accounts have no password
    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Tài khoản này đăng nhập bằng Google/Facebook' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Sai mật khẩu' });

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị cấm. Vui lòng liên hệ giáo viên để mở khóa.'
      });
    }

    const token = signToken(user._id);
    res.json({ success: true, token, user: userPayload(user) });
  } catch (err) {
    console.error('[Auth] login error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── POST /api/auth/forgot-password ──────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi sẽ gửi mã xác nhận.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send email if nodemailer is configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
          from: `"EnglishWithDan" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Mã xác nhận đặt lại mật khẩu - EnglishWithDan',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 10px;">
              <h2 style="color: #667eea;">EnglishWithDan</h2>
              <p>Xin chào <strong>${user.firstName || user.username}</strong>,</p>
              <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã xác nhận của bạn là:</p>
              <div style="background: linear-gradient(135deg,#667eea,#764ba2); color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px;">${otp}</span>
              </div>
              <p style="color: #888;">Mã có hiệu lực trong <strong>15 phút</strong>. Không chia sẻ mã này với ai.</p>
              <p style="color: #888; font-size: 12px;">Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('[Auth] Email error:', mailErr.message);
        // Still return success but log the error
      }
    } else {
      // Dev mode: log OTP to console
      console.log(`[Auth] OTP for ${email}: ${otp}`);
    }

    res.json({ success: true, message: 'Mã xác nhận đã được gửi đến email của bạn.' });
  } catch (err) {
    console.error('[Auth] forgotPassword error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── POST /api/auth/verify-otp ───────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Mã không hợp lệ hoặc đã hết hạn' });
    }

    // Issue a short-lived reset token
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ success: true, resetToken });
  } catch (err) {
    console.error('[Auth] verifyOTP error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── POST /api/auth/reset-password ──────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = '';
    user.resetOTPExpires = null;
    await user.save();

    res.json({ success: true, message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (err) {
    console.error('[Auth] resetPassword error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ── GET /api/auth/google/callback (called by passport) ──────
exports.googleCallback = (req, res) => {
  try {
    const user = req.user;
    user.updateStreak();
    user.save().catch(console.error);
    const token = signToken(user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const payload = encodeURIComponent(JSON.stringify(userPayload(user)));
    res.redirect(`${frontendUrl}/auth-callback.html?token=${token}&user=${payload}`);
  } catch (err) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login.html?error=social_auth_failed`);
  }
};
