'use strict';

const ExamTimetableProgress = require('../models/ExamTimetableProgress');
const { NotFoundError, ValidationError } = require('../errors/AppError');

const SKILLS = ['reading', 'listening', 'writing', 'speaking', 'full'];
// Matches the plan authored in reading-listening-strategy.html: 7 weeks x
// (3 class + 3 home) sessions = 42 checklist items. Kept as a constant here
// only to compute `totalItems` for the progress stat — the actual item
// keys/labels live in the frontend, not the DB (see model comment).
const TOTAL_CHECKLIST_ITEMS = 42;

function toChecklistObject(doc) {
  return doc.checklist instanceof Map ? Object.fromEntries(doc.checklist) : (doc.checklist || {});
}

function computeStats(doc) {
  const checklist = toChecklistObject(doc);
  const totalChecked = Object.values(checklist).filter(Boolean).length;
  const totalLogs = doc.testLogs.length;
  const totalReviewed = doc.testLogs.filter((l) => l.reviewed).length;
  return { totalChecked, totalItems: TOTAL_CHECKLIST_ITEMS, totalLogs, totalReviewed };
}

function serialize(doc) {
  return {
    checklist: toChecklistObject(doc),
    testLogs: doc.testLogs
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((l) => ({
        id: l._id,
        skill: l.skill,
        label: l.label,
        week: l.week,
        date: l.date,
        reviewed: l.reviewed,
        mistake: l.mistake,
      })),
    stats: computeStats(doc),
  };
}

async function getOrCreate(userId) {
  let doc = await ExamTimetableProgress.findOne({ userId });
  if (!doc) doc = await ExamTimetableProgress.create({ userId });
  return doc;
}

async function getProgress(userId) {
  const doc = await getOrCreate(userId);
  return serialize(doc);
}

// Checklist keys are plan-authored slugs like "w1-class2" — validated
// loosely (no dots/$ so a Map dot-path write is always safe) rather than
// against a fixed enum, since the plan's session list lives in the
// frontend and this endpoint shouldn't need a backend deploy every time a
// week's session count changes.
const CHECKLIST_KEY_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;

async function setChecklistItem(userId, key, checked) {
  if (typeof key !== 'string' || !CHECKLIST_KEY_RE.test(key)) {
    throw new ValidationError('Mã mục không hợp lệ');
  }
  const doc = await getOrCreate(userId);
  doc.checklist.set(key, !!checked);
  await doc.save();
  return serialize(doc);
}

async function addLog(userId, { skill, label, week, mistake }) {
  if (!SKILLS.includes(skill)) throw new ValidationError('Kỹ năng không hợp lệ');
  const weekNum = week === null || week === undefined || week === '' ? null : Number(week);
  if (weekNum !== null && (!Number.isInteger(weekNum) || weekNum < 1 || weekNum > 7)) {
    throw new ValidationError('Tuần phải từ 1 đến 7');
  }
  const doc = await getOrCreate(userId);
  doc.testLogs.push({
    skill,
    label: typeof label === 'string' ? label.slice(0, 120) : '',
    week: weekNum,
    mistake: typeof mistake === 'string' ? mistake.slice(0, 500) : '',
  });
  await doc.save();
  return serialize(doc);
}

async function updateLog(userId, logId, patch) {
  const doc = await getOrCreate(userId);
  const log = doc.testLogs.id(logId);
  if (!log) throw new NotFoundError('Không tìm thấy bài luyện');

  if (patch.skill !== undefined) {
    if (!SKILLS.includes(patch.skill)) throw new ValidationError('Kỹ năng không hợp lệ');
    log.skill = patch.skill;
  }
  if (patch.label !== undefined) log.label = String(patch.label).slice(0, 120);
  if (patch.mistake !== undefined) log.mistake = String(patch.mistake).slice(0, 500);
  if (patch.reviewed !== undefined) log.reviewed = !!patch.reviewed;
  if (patch.week !== undefined) {
    const weekNum = patch.week === null || patch.week === '' ? null : Number(patch.week);
    if (weekNum !== null && (!Number.isInteger(weekNum) || weekNum < 1 || weekNum > 7)) {
      throw new ValidationError('Tuần phải từ 1 đến 7');
    }
    log.week = weekNum;
  }

  await doc.save();
  return serialize(doc);
}

async function deleteLog(userId, logId) {
  const doc = await getOrCreate(userId);
  const log = doc.testLogs.id(logId);
  if (!log) throw new NotFoundError('Không tìm thấy bài luyện');
  log.deleteOne();
  await doc.save();
  return serialize(doc);
}

module.exports = { getProgress, setChecklistItem, addLog, updateLog, deleteLog, SKILLS };
