'use strict';
/**
 * backend/services/dictationReportService.js
 * "🚩 Báo lỗi câu này" on Luyện Dictation: students report a wrong sentence
 * (models/DictationReport.js); admin /dictation-reports lists them, fixes the
 * sentence in place (text / timing / drill answer, or removes it) and closes
 * every open report of that sentence at once. Config (on/off, reasons,
 * thank-you message) = models/DictationReportSettings.js.
 */
const mongoose = require('mongoose');
const SearchMatch = require('../utils/searchMatch');
const DictationReport = require('../models/DictationReport');
const DictationReportSettings = require('../models/DictationReportSettings');
const ListeningSection = require('../models/ListeningSection');
const DictationDrill = require('../models/DictationDrill');
const Message = require('../models/Message');

const STATUSES = ['open', 'fixed', 'dismissed'];
const MAX_NOTE = 500;
const MAX_REASONS = 12;

const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const displayName = (u) => (`${u.firstName || ''} ${u.lastName || ''}`.trim()) || u.username || '';
const roundT = (t) => Math.round(Number(t) * 100) / 100;

// ── Settings ─────────────────────────────────────────────────────────────────
function publicSettings(doc) {
  return {
    enabled: doc.enabled !== false,
    thankOnFix: doc.thankOnFix !== false,
    reasons: (doc.reasons || []).map(r => ({ key: r.key, label: r.label })),
  };
}

async function getSettings() {
  return publicSettings(await DictationReportSettings.getSingleton());
}

function slugKey(label, taken) {
  const base = String(label).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30) || 'reason';
  let key = base;
  for (let n = 2; taken.has(key); n++) key = `${base}_${n}`;
  taken.add(key);
  return key;
}

// body: { enabled?, thankOnFix?, reasons?: [{ key?, label }] }. A reason
// without a key (newly added) gets one from its label; keys of existing
// reasons never change, so old reports keep pointing at them.
async function updateSettings(body = {}) {
  const doc = await DictationReportSettings.getSingleton();
  if (typeof body.enabled === 'boolean') doc.enabled = body.enabled;
  if (typeof body.thankOnFix === 'boolean') doc.thankOnFix = body.thankOnFix;
  if (Array.isArray(body.reasons)) {
    const taken = new Set();
    const reasons = [];
    for (const r of body.reasons.slice(0, MAX_REASONS)) {
      const label = clip(r?.label, 120);
      if (!label) continue;
      let key = clip(r?.key, 40);
      if (!key || taken.has(key)) key = slugKey(label, taken);
      else taken.add(key);
      reasons.push({ key, label });
    }
    if (!reasons.length) return { status: 'no_reasons' };
    doc.reasons = reasons;
  }
  await doc.save();
  return { status: 'ok', settings: publicSettings(doc) };
}

// ── The sentence a report points at ─────────────────────────────────────────
async function loadTarget(kind, { sectionId, drillId, drillSlug }) {
  if (kind === 'section') {
    if (!mongoose.isValidObjectId(sectionId)) return null;
    const s = await ListeningSection.findById(sectionId).select('_id title audioUrl dictationSentences').lean();
    if (!s) return null;
    return {
      kind, id: s._id, title: s.title,
      sentences: (s.dictationSentences || []).map(x => ({ text: x.text, start: x.start, end: x.end, audioUrl: s.audioUrl, answer: '' })),
    };
  }
  const q = drillId && mongoose.isValidObjectId(drillId) ? { _id: drillId } : { slug: String(drillSlug || '') };
  const d = await DictationDrill.findOne(q).select('_id slug title items').lean();
  if (!d) return null;
  return {
    kind: 'drill', id: d._id, slug: d.slug, title: d.title,
    sentences: (d.items || []).map(x => ({ text: x.text, start: x.start, end: x.end, audioUrl: x.audioUrl, answer: x.answer, sourceTitle: x.sourceTitle || '' })),
  };
}

const targetFilter = (kind, id) => (kind === 'section' ? { kind, sectionId: id } : { kind, drillId: id });

// ── Student: report a sentence ──────────────────────────────────────────────
// body: { sectionId | drillSlug, sentenceIndex, reason, note?, typedText? }
async function submitReport(user, body = {}) {
  const settings = await getSettings();
  if (!settings.enabled) return { status: 'disabled' };
  const reason = settings.reasons.find(r => r.key === body.reason);
  if (!reason) return { status: 'bad_reason' };
  const kind = body.drillSlug ? 'drill' : 'section';
  const target = await loadTarget(kind, body);
  const index = Number(body.sentenceIndex);
  if (!target || !Number.isInteger(index) || index < 0 || index >= target.sentences.length) return { status: 'not_found' };
  const s = target.sentences[index];
  const note = clip(body.note, MAX_NOTE);
  if (reason.key === 'other' && !note) return { status: 'need_note' };

  const fields = {
    userName: displayName(user), lessonTitle: target.title,
    sentenceText: s.text, answer: s.answer || '', start: s.start, end: s.end,
    reason: reason.key, reasonLabel: reason.label, note, typedText: clip(body.typedText, MAX_NOTE),
    ...(kind === 'drill' && { drillSlug: target.slug }),
  };
  const key = { userId: user._id, ...targetFilter(kind, target.id), sentenceIndex: index, status: 'open' };
  const existing = await DictationReport.findOne(key).select('_id').lean();
  if (existing) {
    await DictationReport.updateOne({ _id: existing._id }, { $set: fields });
    return { status: 'ok', updated: true };
  }
  await DictationReport.create({ ...key, ...fields });
  return { status: 'ok', updated: false };
}

// ── Admin ───────────────────────────────────────────────────────────────────
async function countOpen() {
  return DictationReport.countDocuments({ status: 'open' });
}

// query: { status?, kind?, reason?, search?, page?, limit? }. Each row also
// carries the sentence as it is NOW (`current`, null when it no longer
// exists) and how many other open reports point at the same sentence.
async function listReports(query = {}) {
  const status = STATUSES.includes(query.status) ? query.status : (query.status === 'all' ? '' : 'open');
  const q = {};
  if (status) q.status = status;
  if (['section', 'drill'].includes(query.kind)) q.kind = query.kind;
  if (query.reason) q.reason = String(query.reason);
  if (query.search) Object.assign(q, SearchMatch.mongoFilter(String(query.search), ['lessonTitle', 'sentenceText', 'userName', 'note', 'answer']) || {});
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 30));
  const page = Math.max(1, parseInt(query.page, 10) || 1);

  const [rows, total, byStatus] = await Promise.all([
    DictationReport.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    DictationReport.countDocuments(q),
    DictationReport.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);

  const sectionIds = [...new Set(rows.filter(r => r.kind === 'section').map(r => String(r.sectionId)))];
  const drillIds = [...new Set(rows.filter(r => r.kind === 'drill').map(r => String(r.drillId)))];
  const [sections, drills, sameOpen] = await Promise.all([
    sectionIds.length ? ListeningSection.find({ _id: { $in: sectionIds } }).select('_id audioUrl dictationSentences').lean() : [],
    drillIds.length ? DictationDrill.find({ _id: { $in: drillIds } }).select('_id items').lean() : [],
    rows.length ? DictationReport.aggregate([
      { $match: { status: 'open', $or: rows.map(r => ({ ...targetFilter(r.kind, r.kind === 'section' ? r.sectionId : r.drillId), sentenceIndex: r.sentenceIndex })) } },
      { $group: { _id: { s: '$sectionId', d: '$drillId', i: '$sentenceIndex' }, n: { $sum: 1 } } },
    ]) : [],
  ]);
  const secMap = new Map(sections.map(s => [String(s._id), s]));
  const drillMap = new Map(drills.map(d => [String(d._id), d]));
  const sameMap = new Map(sameOpen.map(g => [`${g._id.s || g._id.d}:${g._id.i}`, g.n]));

  const reports = rows.map(r => {
    let current = null;
    if (r.sentenceRemoved) { /* the sentence was taken out of the lesson */ } else if (r.kind === 'section') {
      const s = secMap.get(String(r.sectionId));
      const x = s?.dictationSentences?.[r.sentenceIndex];
      if (x) current = { text: x.text, start: x.start, end: x.end, audioUrl: s.audioUrl, answer: '' };
    } else {
      const x = drillMap.get(String(r.drillId))?.items?.[r.sentenceIndex];
      if (x) current = { text: x.text, start: x.start, end: x.end, audioUrl: x.audioUrl, answer: x.answer };
    }
    const targetId = String(r.kind === 'section' ? r.sectionId : r.drillId);
    return { ...r, targetId, current, sameOpen: sameMap.get(`${targetId}:${r.sentenceIndex}`) || 0 };
  });

  const counts = { open: 0, fixed: 0, dismissed: 0 };
  byStatus.forEach(g => { if (g._id in counts) counts[g._id] = g.n; });
  return { reports, total, page, limit, counts };
}

// The sentence + its neighbours (to re-time it against), for the fix dialog.
async function getSentence(kind, targetId, index) {
  if (!['section', 'drill'].includes(kind)) return null;
  const target = await loadTarget(kind, kind === 'section' ? { sectionId: targetId } : { drillId: targetId });
  const i = Number(index);
  if (!target || !Number.isInteger(i) || !target.sentences[i]) return null;
  return {
    kind, targetId: String(target.id), title: target.title, index: i, total: target.sentences.length,
    sentence: target.sentences[i],
    prev: target.sentences[i - 1] || null,
    next: target.sentences[i + 1] || null,
  };
}

async function thankReporters(reports, admin, title) {
  const seen = new Set();
  const docs = [];
  for (const r of reports) {
    const uid = String(r.userId);
    if (seen.has(uid)) continue;
    seen.add(uid);
    docs.push({
      fromId: admin._id, fromName: admin.username || 'Admin', toId: r.userId, type: 'personal',
      subject: '🚩 Câu Dictation bạn báo lỗi đã được sửa',
      body: `Cảm ơn bạn đã báo lỗi câu ${r.sentenceIndex + 1} của bài "${title || r.lessonTitle}" trên Luyện Dictation. Thầy cô đã sửa xong — bạn có thể luyện lại câu này nhé! 💪`,
    });
  }
  if (docs.length) await Message.insertMany(docs).catch(() => {});
}

// Closes every open report of one sentence (the one just fixed / removed).
async function closeSentenceReports(kind, targetId, index, admin, { status = 'fixed', adminNote = '', title = '' } = {}) {
  const filter = { ...targetFilter(kind, targetId), sentenceIndex: index, status: 'open' };
  const open = await DictationReport.find(filter).select('userId sentenceIndex lessonTitle').lean();
  if (!open.length) return 0;
  await DictationReport.updateMany({ _id: { $in: open.map(r => r._id) } }, {
    $set: { status, adminNote: clip(adminNote, MAX_NOTE), resolvedBy: admin._id, resolvedAt: new Date() },
  });
  if (status === 'fixed' && (await getSettings()).thankOnFix) await thankReporters(open, admin, title);
  return open.length;
}

// body: { text?, start?, end?, answer?, adminNote? } — the sentence's wording
// and timing (seconds into its audio file). Closes its open reports as fixed.
async function updateSentence(kind, targetId, index, body = {}, admin) {
  const i = Number(index);
  const Model = kind === 'section' ? ListeningSection : kind === 'drill' ? DictationDrill : null;
  if (!Model || !mongoose.isValidObjectId(targetId) || !Number.isInteger(i) || i < 0) return { status: 'not_found' };
  const doc = await Model.findById(targetId);
  const list = kind === 'section' ? doc?.dictationSentences : doc?.items;
  const s = list?.[i];
  if (!s) return { status: 'not_found' };

  const text = body.text !== undefined ? clip(body.text, 1000) : s.text;
  const start = body.start !== undefined ? roundT(body.start) : s.start;
  const end = body.end !== undefined ? roundT(body.end) : s.end;
  if (!text) return { status: 'invalid', message: 'Câu không được để trống' };
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) {
    return { status: 'invalid', message: 'Mốc thời gian không hợp lệ (bắt đầu ≥ 0 và kết thúc > bắt đầu)' };
  }
  s.text = text;
  s.start = start;
  s.end = end;
  if (kind === 'drill' && body.answer !== undefined) {
    const answer = clip(body.answer, 200);
    if (!answer) return { status: 'invalid', message: 'Đáp án không được để trống' };
    s.answer = answer;
  }
  doc.markModified(kind === 'section' ? 'dictationSentences' : 'items');
  await doc.save();
  const closed = await closeSentenceReports(kind, doc._id, i, admin, { adminNote: body.adminNote, title: doc.title });
  return { status: 'ok', closed, sentence: { text: s.text, start: s.start, end: s.end, answer: s.answer || '' } };
}

// Takes the sentence out of the lesson. Later sentences move up one, so the
// reports pointing at them are re-numbered to keep matching.
async function deleteSentence(kind, targetId, index, admin, adminNote = '') {
  const i = Number(index);
  const Model = kind === 'section' ? ListeningSection : kind === 'drill' ? DictationDrill : null;
  if (!Model || !mongoose.isValidObjectId(targetId) || !Number.isInteger(i) || i < 0) return { status: 'not_found' };
  const doc = await Model.findById(targetId);
  const field = kind === 'section' ? 'dictationSentences' : 'items';
  const list = doc?.[field];
  if (!list?.[i]) return { status: 'not_found' };
  if (list.length <= 1) return { status: 'invalid', message: 'Đây là câu duy nhất của bài — không xoá được.' };
  list.splice(i, 1);
  doc.markModified(field);
  await doc.save();
  const closed = await closeSentenceReports(kind, doc._id, i, admin, { adminNote: adminNote || 'Đã xoá câu khỏi bài', title: doc.title });
  // Every report of the removed sentence (also older handled ones) now
  // points at nothing; flag them so their index isn't read as the next one.
  await DictationReport.updateMany(
    { ...targetFilter(kind, doc._id), sentenceIndex: i, sentenceRemoved: { $ne: true } },
    { $set: { sentenceRemoved: true } },
  );
  await DictationReport.updateMany(
    { ...targetFilter(kind, doc._id), sentenceIndex: { $gt: i }, sentenceRemoved: { $ne: true } },
    { $inc: { sentenceIndex: -1 } },
  );
  return { status: 'ok', closed, remaining: list.length };
}

// body: { status: 'open'|'fixed'|'dismissed', adminNote?, sameSentence? } —
// with sameSentence every open report of that sentence gets the same status.
async function setStatus(id, body = {}, admin) {
  if (!mongoose.isValidObjectId(id)) return { status: 'not_found' };
  if (!STATUSES.includes(body.status)) return { status: 'invalid', message: 'Trạng thái không hợp lệ' };
  const r = await DictationReport.findById(id).lean();
  if (!r) return { status: 'not_found' };
  const resolved = body.status !== 'open';
  const set = {
    status: body.status, adminNote: clip(body.adminNote, MAX_NOTE),
    resolvedBy: resolved ? admin._id : null, resolvedAt: resolved ? new Date() : null,
  };
  if (body.sameSentence && resolved) {
    const targetId = r.kind === 'section' ? r.sectionId : r.drillId;
    const affected = await DictationReport.find({ ...targetFilter(r.kind, targetId), sentenceIndex: r.sentenceIndex, $or: [{ status: 'open' }, { _id: r._id }] })
      .select('userId sentenceIndex lessonTitle').lean();
    await DictationReport.updateMany({ _id: { $in: affected.map(a => a._id) } }, { $set: set });
    if (body.status === 'fixed' && (await getSettings()).thankOnFix) await thankReporters(affected, admin, r.lessonTitle);
    return { status: 'ok', updated: affected.length };
  }
  await DictationReport.updateOne({ _id: r._id }, { $set: set });
  if (body.status === 'fixed' && r.status !== 'fixed' && (await getSettings()).thankOnFix) await thankReporters([r], admin, r.lessonTitle);
  return { status: 'ok', updated: 1 };
}

async function deleteReport(id) {
  if (!mongoose.isValidObjectId(id)) return { status: 'not_found' };
  const r = await DictationReport.findByIdAndDelete(id);
  return { status: r ? 'ok' : 'not_found' };
}

module.exports = {
  STATUSES, getSettings, updateSettings, submitReport,
  countOpen, listReports, getSentence, updateSentence, deleteSentence, setStatus, deleteReport,
};
