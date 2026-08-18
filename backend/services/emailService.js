'use strict';

// Shared nodemailer helper — factored out because a 3rd call site
// (tuitionService.js's reminder emails) would otherwise be a 3rd copy of the
// same createTransport/gate/fail-open boilerplate already duplicated between
// authService.js (password-reset OTP) and routes/admin/writingGrading.js
// (grading-complete notification).
const config = require('../config');

async function sendEmail(to, subject, html) {
  if (!config.email.user || !config.email.pass) {
    console.error('[Email] EMAIL_USER/EMAIL_PASS not configured — cannot send email');
    return false;
  }
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: config.email.user, pass: config.email.pass },
    });
    await transporter.sendMail({
      from: `"EnglishWithDan" <${config.email.user}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    // Fail-open, same as every other email call site in this codebase — a
    // down SMTP provider must never block the caller's real work (here, the
    // in-app Message notification has already been created either way).
    console.error('[Email] send error:', err.message);
    return false;
  }
}

module.exports = { sendEmail };
