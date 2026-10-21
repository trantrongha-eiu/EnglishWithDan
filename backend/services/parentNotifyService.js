'use strict';

// Alerts for parents (phụ huynh) about one of their children: vắng học,
// bài tập quá hạn, học phí tới hạn / nhắc học phí. Two channels:
//   - in-app: a ParentNotification row per linked parent (parent.html bell);
//   - email: one message per parent per notify() call, only when the parent
//     has a real email (staff may create a parent with phone only — those get
//     a placeholder @parent.invalid address that must never be mailed).
//
// Each item carries a `key` naming the real-world event; the unique
// (parentId, key) index makes every caller idempotent — re-saving an
// attendance sheet or the next daily sweep never alerts twice.
//
// Callers: classAttendance.controller (absence, on save), cron/
// parentNotifySweep (overdue homework, tuition due), tuitionService (staff
// reminders). Never throws into the caller's real work: failures are logged.

const config = require('../config');
const ParentLink = require('../models/ParentLink');
const ParentNotification = require('../models/ParentNotification');
const User = require('../models/User');
const emailService = require('./emailService');
const { escapeHtml } = require('../utils/escapeHtml');
const { displayName } = require('../middleware/classAccess');
const logger = require('../utils/logger');

const PUBLIC_SITE_URL = 'https://ieltsthayha.com';

function parentPageUrl() {
  const base = (config.frontendUrl || process.env.FRONTEND_URL || PUBLIC_SITE_URL).split(',')[0].trim().replace(/\/$/, '');
  return `${base}/phu-huynh`;
}

function hasRealEmail(u) {
  return !!(u && u.email && !/@parent\.invalid$/i.test(u.email));
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
}

function emailHtml(studentName, items) {
  const rows = items.map((it) => `
    <div style="padding:14px 0;border-bottom:1px solid #eee">
      <div style="font-weight:700;color:#111">${escapeHtml(it.title)}</div>
      ${it.body ? `<div style="color:#444;white-space:pre-line;margin-top:4px">${escapeHtml(it.body)}</div>` : ''}
    </div>`).join('');
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8f9fb;padding:28px 20px;border-radius:12px">
      <div style="text-align:center;margin-bottom:16px;font-size:20px;font-weight:800">
        <span style="color:#3d8bff">Daniel</span><span style="color:#e53935">Hà</span>
      </div>
      <div style="background:#fff;border-radius:12px;padding:8px 22px 20px;border:1px solid #e5e7eb;font-size:14px;line-height:1.6">
        <p style="color:#555;margin:14px 0 0">Thông báo về việc học của <b>${escapeHtml(studentName)}</b>:</p>
        ${rows}
        <div style="text-align:center;margin-top:20px">
          <a href="${parentPageUrl()}" style="display:inline-block;background:#e53935;color:#fff;text-decoration:none;font-weight:700;padding:10px 22px;border-radius:8px">Xem chi tiết</a>
        </div>
      </div>
    </div>`;
}

// items: [{ kind, key, title, body, updateIfExists? }]. updateIfExists
// rewrites the text of an already-sent alert for the same event (absence
// re-marked excused ↔ unexcused) without alerting again.
// Returns the number of NEW in-app notifications created.
async function notify(studentId, items) {
  try {
    if (!items || !items.length) return 0;
    const links = await ParentLink.find({ studentId }).select('parentId').lean();
    if (!links.length) return 0;
    const [parents, student] = await Promise.all([
      User.find({ _id: { $in: links.map((l) => l.parentId) }, role: 'parent' }).select('email').lean(),
      User.findById(studentId).select('username firstName lastName').lean(),
    ]);
    const studentName = displayName(student) || 'học sinh';

    let created = 0;
    for (const parent of parents) {
      const fresh = [];
      for (const it of items) {
        try {
          const doc = await ParentNotification.create({
            parentId: parent._id, studentId, kind: it.kind, key: it.key, title: it.title, body: it.body || '',
          });
          fresh.push({ it, id: doc._id });
        } catch (e) {
          if (e && e.code === 11000) {
            if (it.updateIfExists) {
              await ParentNotification.updateOne({ parentId: parent._id, key: it.key }, { $set: { title: it.title, body: it.body || '' } });
            }
            continue;
          }
          throw e;
        }
      }
      created += fresh.length;
      if (fresh.length && hasRealEmail(parent)) {
        const subject = fresh.length === 1 ? fresh[0].it.title : `${fresh.length} thông báo mới về ${studentName}`;
        // Fire-and-forget: SMTP can take seconds and must not hold up the
        // teacher's save / the sweep. The in-app row above is the guarantee.
        emailService.sendEmail(parent.email, `${subject} — EnglishWithDan`, emailHtml(studentName, fresh.map((f) => f.it)))
          .then((ok) => ok && ParentNotification.updateMany({ _id: { $in: fresh.map((f) => f.id) } }, { $set: { emailedAt: new Date() } }))
          .catch((err) => logger.error('parent', 'Parent alert email failed', { errorMessage: err.message }));
      }
    }
    return created;
  } catch (err) {
    logger.error('parent', 'Parent notify failed', { errorMessage: err.message, studentId: String(studentId) });
    return 0;
  }
}

// The event turned out not to happen (absence corrected to present/late):
// drop the alert if no parent has opened it yet. An already-sent email
// can't be recalled.
async function retract(studentId, key) {
  try {
    await ParentNotification.deleteMany({ studentId, key, readAt: null });
  } catch (err) {
    logger.error('parent', 'Parent notify retract failed', { errorMessage: err.message });
  }
}

const ABSENCE_LABEL = { absent: 'vắng không phép', excused: 'vắng có phép' };

// One alert per absent/excused student of a saved session; a mark that is
// no longer absent retracts that session's alert.
// marks: [{ studentId, status }]; statsByStudent: Map(studentId → enrollment.stats);
// policy: the class policy with defaults applied.
async function notifyAttendance({ cls, session, marks, statsByStudent, policy }) {
  const p = policy || {};
  const lateNote = p.lateToAbsenceRatio ? ` (${p.lateToAbsenceRatio} lần đi trễ tính là 1 buổi nghỉ)` : '';
  const key = `absence:${session._id}`;
  for (const m of marks) {
    if (ABSENCE_LABEL[m.status]) {
      const st = statsByStudent.get(String(m.studentId)) || {};
      const total = st.absenceEquivalent != null ? st.absenceEquivalent : null;
      const student = await User.findById(m.studentId).select('username firstName lastName').lean();
      const name = displayName(student) || 'Học sinh';
      await notify(m.studentId, [{
        kind: 'absence',
        key,
        updateIfExists: true,
        title: `${name} ${ABSENCE_LABEL[m.status]} buổi học ngày ${fmtDate(session.date)}`,
        body: `Lớp ${cls.name} — buổi ${session.sessionNumber}.` +
          (total != null ? `\nSố buổi nghỉ tính đến nay: ${total}${p.maxAbsencesAllowed != null ? ` / tối đa ${p.maxAbsencesAllowed} buổi` : ''}${lateNote}.` : ''),
      }]);
    } else {
      await retract(m.studentId, key);
    }
  }
}

async function listForParent(parentId, { limit = 50 } = {}) {
  const [rows, unreadCount] = await Promise.all([
    ParentNotification.find({ parentId }).sort({ createdAt: -1 }).limit(limit).lean(),
    ParentNotification.countDocuments({ parentId, readAt: null }),
  ]);
  const students = await User.find({ _id: { $in: [...new Set(rows.map((r) => String(r.studentId)))] } })
    .select('username firstName lastName').lean();
  const nameMap = new Map(students.map((s) => [String(s._id), displayName(s)]));
  return {
    unreadCount,
    notifications: rows.map((r) => ({
      _id: r._id, kind: r.kind, title: r.title, body: r.body, createdAt: r.createdAt,
      read: !!r.readAt, studentId: r.studentId, studentName: nameMap.get(String(r.studentId)) || '',
    })),
  };
}

async function markAllRead(parentId) {
  const r = await ParentNotification.updateMany({ parentId, readAt: null }, { $set: { readAt: new Date() } });
  return r.modifiedCount || 0;
}

module.exports = { notify, retract, notifyAttendance, listForParent, markAllRead, fmtDate, hasRealEmail };
