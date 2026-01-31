const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =======================
// REGISTER
// =======================
router.post('/register', async (req, res) => {
  try {
    // Check trùng email hoặc username
    const existingUser = await User.findOne({
      $or: [
        { email: req.body.email },
        { username: req.body.username }
      ]
    });
    if (existingUser) {
      return res.json({ success: false, message: "Email hoặc Username đã tồn tại" });
    }

    // Hash password
    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      password: hashed
    });

    await user.save();
    res.json({ success: true });

  } catch (err) {
    res.json({ success: false, message: "Lỗi server" });
  }
});


// =======================
// LOGIN
// =======================
router.post('/login', async (req, res) => {
  try {
    // Cho phép login bằng email hoặc username
    const user = await User.findOne({
      $or: [
        { email: req.body.email },
        { username: req.body.email }
      ]
    });

    if (!user) {
      return res.json({ success: false, message: "User không tồn tại" });
    }

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      return res.json({ success: false, message: "Sai mật khẩu" });
    }

    // Tạo token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Trả dữ liệu an toàn (không gửi password)
    res.json({
      success: true,
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    res.json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;
