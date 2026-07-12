'use strict';

// Deliberately NOT using catchAsync here: catchAsync responds with the raw
// err.message, but every handler in the original routes/tuition.js caught
// errors manually and always responded with the generic 'Lỗi server' —
// switching to catchAsync would change the client-visible error message on
// every failure in this file. `guard()` below preserves that exact shape
// while still removing the repeated try/catch boilerplate.
const tuitionService = require('../services/tuitionService');

function guard(logTag, handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      console.error(`[Tuition] ${logTag}`, e);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
}

exports.getSettings = guard('error:', async (req, res) => {
  const settings = await tuitionService.getSettings();
  res.json({ success: true, settings });
});

exports.updateSettings = guard('error:', async (req, res) => {
  const settings = await tuitionService.updateSettings(req.body);
  res.json({ success: true, settings });
});

exports.uploadQr = guard('error:', async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Chưa có file' });
  const qrImageUrl = await tuitionService.uploadQr(req.file);
  res.json({ success: true, qrImageUrl });
});

exports.deleteQr = guard('error:', async (req, res) => {
  await tuitionService.deleteQr();
  res.json({ success: true });
});

exports.listFees = guard('error:', async (req, res) => {
  const { fees, total, stats } = await tuitionService.listFees(req.query);
  res.json({ success: true, fees, total, stats });
});

exports.getSummary = guard('error:', async (req, res) => {
  const { summary, courseSummary } = await tuitionService.getSummary(req.query.year);
  res.json({ success: true, summary, courseSummary });
});

exports.getAdminSummary = guard('error:', async (req, res) => {
  const unpaidStudentCount = await tuitionService.getAdminSummary();
  res.json({ success: true, unpaidStudentCount });
});

exports.listStudents = guard('error:', async (req, res) => {
  const students = await tuitionService.listStudents();
  res.json({ success: true, students });
});

exports.createFee = guard('POST / error:', async (req, res) => {
  const { studentId, feeType, month, year, courseName, amount, note } = req.body;
  if (!studentId || !feeType || amount === undefined) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
  }
  try {
    const fee = await tuitionService.createFee({ studentId, feeType, month, year, courseName, amount, note, createdBy: req.user._id });
    res.status(201).json({ success: true, fee });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Học phí tháng này đã tồn tại cho học viên này' });
    throw e;
  }
});

exports.updateFee = guard('error:', async (req, res) => {
  const fee = await tuitionService.updateFee(req.params.id, req.body);
  if (!fee) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  res.json({ success: true, fee });
});

exports.deleteFee = guard('error:', async (req, res) => {
  await tuitionService.deleteFee(req.params.id);
  res.json({ success: true });
});

exports.sendReminder = guard('error:', async (req, res) => {
  const sent = await tuitionService.sendReminder(req.params.id, req.body.customMessage, req.user);
  if (!sent) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  res.json({ success: true, message: 'Đã gửi nhắc nhở' });
});

exports.sendBulkReminders = guard('error:', async (req, res) => {
  const { month, year, customMessage } = req.body;
  if (!month || !year || isNaN(Number(month)) || isNaN(Number(year))) {
    return res.status(400).json({ success: false, message: 'Thiếu hoặc sai tháng/năm' });
  }
  const sent = await tuitionService.sendBulkReminders({ month, year, customMessage }, req.user);
  res.json({ success: true, sent });
});

exports.getMySummary = guard('error:', async (req, res) => {
  const { unpaidCount, totalUnpaid } = await tuitionService.getMySummary(req.user._id);
  res.json({ success: true, unpaidCount, totalUnpaid });
});

exports.getMyFees = guard('error:', async (req, res) => {
  const { fees, settings } = await tuitionService.getMyFees(req.user._id);
  res.json({ success: true, fees, settings });
});

exports.notifyPayment = guard('error:', async (req, res) => {
  const result = await tuitionService.notifyPayment(req.params.id, req.user);
  if (result.status === 'not_found') return res.status(404).json({ success: false, message: 'Không tìm thấy' });
  if (result.status === 'already_paid') return res.json({ success: true, message: 'Học phí đã được xác nhận' });
  res.json({ success: true, message: 'Đã gửi thông báo đến admin' });
});
