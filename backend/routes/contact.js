const router = require('express').Router();

/**
 * POST /api/contact
 * Public – không cần đăng nhập
 * Body: { name, phone, email, course, message }
 */
router.post('/', async (req, res) => {
  const { name, phone, email = '', course = '', message = '' } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền họ tên và số điện thoại' });
  }

  // Ghi log dù có email hay không
  console.log(`[Contact] ${name} | ${phone} | ${course}`);

  try {
    if (process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from:    'EnglishWithDan <onboarding@resend.dev>',
        to:      'tranhaforwork@gmail.com',
        subject: `[Tư Vấn Khóa Học] ${name} – ${course || 'Chưa chọn khóa'}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#3d8bff,#e53935);padding:24px 28px">
              <h2 style="color:#fff;margin:0;font-size:20px">&#128233; Có học viên muốn tư vấn!</h2>
            </div>
            <div style="padding:28px;background:#fff">
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr><td style="padding:8px 0;color:#6b7280;width:130px">Họ &amp; tên</td>
                    <td style="padding:8px 0;font-weight:700;color:#111827">${name}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280">Số điện thoại</td>
                    <td style="padding:8px 0;font-weight:700;color:#111827">${phone}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280">Email</td>
                    <td style="padding:8px 0;color:#111827">${email || '–'}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280">Khóa học</td>
                    <td style="padding:8px 0;color:#3d8bff;font-weight:600">${course || 'Chưa chọn'}</td></tr>
              </table>
              ${message ? `
              <div style="margin-top:16px;padding:14px;background:#f9fafb;border-radius:8px;border-left:3px solid #3d8bff">
                <p style="margin:0;font-size:13px;color:#374151"><strong>Tin nhắn:</strong><br>${message}</p>
              </div>` : ''}
            </div>
            <div style="padding:14px 28px;background:#f9fafb;font-size:12px;color:#9ca3af">
              Gửi tự động từ form tư vấn trên website EnglishWithDan
            </div>
          </div>
        `
      });
    }
    res.json({ success: true, message: 'Đã nhận thông tin! Chúng tôi sẽ liên hệ bạn sớm nhất.' });
  } catch (err) {
    console.error('[Contact] Mail error:', err.message);
    res.json({ success: true, message: 'Đã nhận thông tin! Chúng tôi sẽ liên hệ bạn sớm.' });
  }
});

module.exports = router;
