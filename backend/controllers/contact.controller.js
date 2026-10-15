'use strict';

const catchAsync = require('../middleware/catchAsync');
const contactService = require('../services/contactService');
const { isHoneypotTripped } = require('../utils/honeypot');

// POST /api/contact — public, no auth. Mail failure is deliberately
// swallowed (the contact form itself succeeded even if the notification
// email didn't go out) — note the two success messages differ slightly
// ("...sớm nhất." vs "...sớm.") depending on whether the email sent;
// preserved exactly from the original inline route.
exports.submitInquiry = catchAsync(async (req, res) => {
  // Bot filled the hidden field — answer exactly like a success so it
  // learns nothing, but send no email.
  if (isHoneypotTripped(req, 'contact')) {
    return res.json({ success: true, message: 'Đã nhận thông tin! Chúng tôi sẽ liên hệ bạn sớm nhất.' });
  }
  const { name, phone, email = '', course = '', message = '' } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền họ tên và số điện thoại' });
  }

  console.log(`[Contact] ${name} | ${phone} | ${course}`);

  try {
    await contactService.sendInquiry({ name, phone, email, course, message });
    res.json({ success: true, message: 'Đã nhận thông tin! Chúng tôi sẽ liên hệ bạn sớm nhất.' });
  } catch (err) {
    console.error('[Contact] Mail error:', err.message);
    res.json({ success: true, message: 'Đã nhận thông tin! Chúng tôi sẽ liên hệ bạn sớm.' });
  }
});
