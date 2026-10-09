'use strict';

// Class page "✉️ Nhắn tin": the class's teacher (or an admin) sends a private
// message to one or more students on the class roster. One personal Message
// per student (never a broadcast), flagged mustRead so the student gets the
// "Bạn có tin nhắn mới" popup until they open it (userMessageService.listMustRead).
const Message = require('../models/Message');
const ClassEnrollment = require('../models/ClassEnrollment');

const MAX_BODY = 5000;
const MAX_SUBJECT = 200;

async function sendToClassStudents(cls, sender, { studentIds, subject, body }) {
  const text = String(body || '').trim();
  if (!text) return { status: 'empty' };
  if (text.length > MAX_BODY) return { status: 'too_long' };
  const ids = [...new Set((Array.isArray(studentIds) ? studentIds : []).map(String))];
  if (!ids.length) return { status: 'no_recipients' };

  // Only students currently on this class's roster — the ids come from the
  // client, so this is what stops a teacher messaging arbitrary users here.
  const enrolled = await ClassEnrollment.find({ classId: cls._id, removedAt: null, studentId: { $in: ids } })
    .select('studentId').lean();
  const recipients = [...new Set(enrolled.map(e => String(e.studentId)))];
  if (!recipients.length) return { status: 'no_recipients' };

  const title = String(subject || '').trim().slice(0, MAX_SUBJECT) || `Tin nhắn từ lớp ${cls.name}`;
  const messages = await Message.insertMany(recipients.map(toId => ({
    fromId: sender._id,
    fromName: sender.username,
    toId,
    subject: title,
    body: text,
    type: 'personal',
    mustRead: true,
  })));
  return { status: 'ok', sent: messages.length };
}

module.exports = { sendToClassStudents };
