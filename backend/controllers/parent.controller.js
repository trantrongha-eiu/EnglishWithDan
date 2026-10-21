'use strict';

// Parent (phụ huynh) read-only API — routes/parent.js. A parent token can
// reach nothing else (middleware/auth.js PARENT_ALLOWED), and every
// /children/:childId/* call goes through loadLinkedChild first.

const mongoose = require('mongoose');
const parentService = require('../services/parentService');
const assignmentService = require('../services/assignmentService');
const tuitionService = require('../services/tuitionService');
const parentNotifyService = require('../services/parentNotifyService');
const { overviewForStudent, enrollmentsForStudent } = require('./classAttendance.controller');
const logger = require('../utils/logger');

function fail(res, err) {
  logger.error('parent', 'Parent view request failed', { errorMessage: err && err.message });
  res.status(500).json({ success: false, message: 'Lỗi server' });
}

exports.parentOnly = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ success: false, message: 'Chỉ dành cho tài khoản phụ huynh' });
  }
  next();
};

// 404 (not 403) for a child that isn't theirs — doesn't confirm the id
// belongs to a real student.
exports.loadLinkedChild = async (req, res, next) => {
  try {
    const { childId } = req.params;
    if (!mongoose.isValidObjectId(childId)) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    }
    const link = await parentService.findLink(req.user._id, childId);
    if (!link) return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    req.childId = link.studentId;
    next();
  } catch (err) {
    fail(res, err);
  }
};

exports.listChildren = async (req, res) => {
  try {
    res.json({ success: true, children: await parentService.listChildren(req.user._id) });
  } catch (err) {
    fail(res, err);
  }
};

// Classes: the same per-class summary the student sees on their dashboard,
// plus the session-by-session marks for the attendance strip.
exports.getClasses = async (req, res) => {
  try {
    const [classes, enrollments] = await Promise.all([
      overviewForStudent(req.childId),
      enrollmentsForStudent(req.childId),
    ]);
    const sessionsByClass = new Map(enrollments.filter((e) => e.class).map((e) => [String(e.class._id), e.sessions]));
    res.json({
      success: true,
      classes: classes.map((c) => {
        // missedAssignments ids/links stay out — titles + deadlines only.
        const { missedAssignments, ...rest } = c;
        return {
          ...rest,
          missedAssignments: (missedAssignments || []).map((m) => ({ title: m.title, deadline: m.deadline, done: m.done, total: m.total })),
          sessions: sessionsByClass.get(String(c.classId)) || [],
        };
      }),
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.getHomework = async (req, res) => {
  try {
    // persist: false — a parent looking must not write progress rows.
    const data = await assignmentService.getStudentAssignments(req.childId, new Date(), { persist: false });
    res.json({ success: true, ...parentService.shapeHomework(data) });
  } catch (err) {
    fail(res, err);
  }
};

exports.getScores = async (req, res) => {
  try {
    res.json({ success: true, ...(await parentService.getScores(req.childId)) });
  } catch (err) {
    fail(res, err);
  }
};

exports.getTuition = async (req, res) => {
  try {
    const { fees, settings } = await tuitionService.getMyFees(req.childId);
    res.json({
      success: true,
      fees: fees.map((f) => ({
        _id: f._id, feeType: f.feeType, month: f.month, year: f.year, courseName: f.courseName,
        amount: f.amount, isPaid: f.isPaid, paidDate: f.paidDate || null,
        studentNotified: !!f.studentNotified, note: f.note || '',
      })),
      // Bank details + QR only — not the admin's auto-remind config.
      payment: {
        bankName: settings?.bankName || '', bankAccount: settings?.bankAccount || '',
        accountName: settings?.accountName || '', qrImageUrl: settings?.qrImageUrl || '',
        paymentNote: settings?.paymentNote || '',
      },
    });
  } catch (err) {
    fail(res, err);
  }
};

exports.listNotifications = async (req, res) => {
  try {
    res.json({ success: true, ...(await parentNotifyService.listForParent(req.user._id)) });
  } catch (err) {
    fail(res, err);
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    res.json({ success: true, marked: await parentNotifyService.markAllRead(req.user._id) });
  } catch (err) {
    fail(res, err);
  }
};
