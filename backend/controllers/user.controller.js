const User            = require('../models/User');
const TestAttempt     = require('../models/TestAttempt');
const ListeningAttempt = require('../models/ListeningAttempt');
const WritingAttempt  = require('../models/WritingAttempt');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const bcrypt          = require('bcryptjs');
const cloudinary      = require('cloudinary').v2;

// ── GET /api/user/profile ────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetOTP -resetOTPExpires');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/user/profile ────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    const update = {};
    if (firstName !== undefined) update.firstName = firstName.trim();
    if (lastName  !== undefined) update.lastName  = lastName.trim();
    if (bio       !== undefined) update.bio       = bio.trim().slice(0, 200);

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true })
      .select('-password -resetOTP -resetOTPExpires');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/user/change-password ────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await User.findById(req.user._id);
    // If social account with no password
    if (!user.password && !currentPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return res.json({ success: true, message: 'Đã đặt mật khẩu thành công' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Đã đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/user/avatar ────────────────────────────────────
exports.uploadAvatar = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Thiếu ảnh' });

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({ success: true, avatar: result.secure_url, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/user/stats ──────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      readingAttempts,
      listeningAttempts,
      writingAttempts,
      speakingAttempts,
      user
    ] = await Promise.all([
      TestAttempt.find({ userId, status: 'completed' })
        .select('bandScore createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
      ListeningAttempt.find({ userId, status: 'completed' })
        .select('bandScore createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
      WritingAttempt.find({ userId })
        .select('wordCount1 wordCount2 timeTaken createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
      SpeakingAttempt.find({ userId })
        .select('aiFeedback.overallBand createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
      User.findById(userId).select('learningStreak lastActivityDate totalStudyMinutes')
    ]);

    const avgReading = readingAttempts.length
      ? (readingAttempts.reduce((s, a) => s + a.bandScore, 0) / readingAttempts.length).toFixed(1)
      : null;
    const avgListening = listeningAttempts.length
      ? (listeningAttempts.reduce((s, a) => s + a.bandScore, 0) / listeningAttempts.length).toFixed(1)
      : null;

    res.json({
      success: true,
      stats: {
        streak:           user.learningStreak || 0,
        lastActivity:     user.lastActivityDate,
        totalStudyMinutes: user.totalStudyMinutes || 0,
        reading: {
          total:   readingAttempts.length,
          avgBand: avgReading,
          history: readingAttempts
        },
        listening: {
          total:   listeningAttempts.length,
          avgBand: avgListening,
          history: listeningAttempts
        },
        writing: {
          total:   writingAttempts.length,
          history: writingAttempts
        },
        speaking: {
          total:   speakingAttempts.length,
          history: speakingAttempts
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
