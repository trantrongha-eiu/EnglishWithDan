'use strict';

// Extracted from routes/contact.js. All interpolated fields are user
// input from the public contact form, so they're HTML-escaped before
// going into the email body — the original inline version interpolated
// them raw, which was a real HTML-injection vector into an email opened
// by the site admin.
const config = require('../config');
const { escapeHtml } = require('../utils/escapeHtml');

function buildInquiryEmailHtml({ name, phone, email, course, message }) {
  const n = escapeHtml(name);
  const p = escapeHtml(phone);
  const e = escapeHtml(email);
  const c = escapeHtml(course);
  const m = escapeHtml(message);
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#3d8bff,#e53935);padding:24px 28px">
        <h2 style="color:#fff;margin:0;font-size:20px">&#128233; Có học viên muốn tư vấn!</h2>
      </div>
      <div style="padding:28px;background:#fff">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b7280;width:130px">Họ &amp; tên</td>
              <td style="padding:8px 0;font-weight:700;color:#111827">${n}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Số điện thoại</td>
              <td style="padding:8px 0;font-weight:700;color:#111827">${p}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Email</td>
              <td style="padding:8px 0;color:#111827">${e || '–'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Khóa học</td>
              <td style="padding:8px 0;color:#3d8bff;font-weight:600">${c || 'Chưa chọn'}</td></tr>
        </table>
        ${m ? `
        <div style="margin-top:16px;padding:14px;background:#f9fafb;border-radius:8px;border-left:3px solid #3d8bff">
          <p style="margin:0;font-size:13px;color:#374151"><strong>Tin nhắn:</strong><br>${m}</p>
        </div>` : ''}
      </div>
      <div style="padding:14px 28px;background:#f9fafb;font-size:12px;color:#9ca3af">
        Gửi tự động từ form tư vấn trên website EnglishWithDan
      </div>
    </div>
  `;
}

// Subject line uses the raw (unescaped) name/course — Resend's API takes
// structured JSON fields, not raw SMTP headers, so header-injection via
// CRLF isn't a concern here the way the HTML body injection was.
async function sendInquiry({ name, phone, email, course, message }) {
  if (!config.email.resendApiKey) return { sent: false };
  const { Resend } = require('resend');
  const resend = new Resend(config.email.resendApiKey);
  await resend.emails.send({
    from: 'EnglishWithDan <onboarding@resend.dev>',
    to: 'tranhaforwork@gmail.com',
    subject: `[Tư Vấn Khóa Học] ${name} – ${course || 'Chưa chọn khóa'}`,
    html: buildInquiryEmailHtml({ name, phone, email, course, message }),
  });
  console.log('[Contact] Sent via Resend');
  return { sent: true };
}

module.exports = { sendInquiry };
