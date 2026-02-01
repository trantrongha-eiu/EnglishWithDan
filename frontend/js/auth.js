const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Đường dẫn đến User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ============================================
// ROUTE: ĐĂNG KÝ
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.json({ 
        success: false, 
        message: 'Email đã được sử dụng!' 
      });
    }

    // Kiểm tra username đã tồn tại
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.json({ 
        success: false, 
        message: 'Username đã được sử dụng!' 
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      role: 'student'
    });

    await newUser.save();

    res.json({ 
      success: true, 
      message: 'Đăng ký thành công!' 
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server!' 
    });
  }
});

// ============================================
// ROUTE: ĐĂNG NHẬP (HỖ TRỢ EMAIL HOẶC USERNAME)
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo EMAIL hoặc USERNAME
    const user = await User.findOne({
      $or: [
        { email: email },
        { username: email }
      ]
    });

    if (!user) {
      return res.json({ 
        success: false, 
        message: 'Email/Username hoặc mật khẩu không đúng!' 
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.json({ 
        success: false, 
        message: 'Email/Username hoặc mật khẩu không đúng!' 
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'danielha-ielts-secret-key-2024',
      { expiresIn: '7d' }
    );

    // Trả về thông tin user và token
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server!' 
    });
  }
});

// ============================================
// ROUTE: LẤY THÔNG TIN USER (CẦN TOKEN)
// ============================================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User không tồn tại!' 
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server!' 
    });
  }
});

// ============================================
// MIDDLEWARE: XÁC THỰC TOKEN
// ============================================
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Không có token!' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'danielha-ielts-secret-key-2024');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token không hợp lệ!' 
    });
  }
}

module.exports = router;