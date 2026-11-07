'use strict';

// Matching a parsed "EnglishWithDan Speaking Format" paste (see
// speakingImportParser.js) against the live question bank — shared by the
// admin parse/import routes and any one-off import script, so both resolve
// topics/questions the same way.

const SpeakingQuestion = require('../models/SpeakingQuestion');
const { normQuestionKey, normTopicKey } = require('./speakingImportParser');

// Index of the live bank, keyed loosely (normTopicKey / normQuestionKey) so
// an AI's small rewording — "Comedy/Jokes" vs "Comedy / Jokes", "What’s
// your favorite" vs "What is your favourite" — resolves to the question
// that's already there instead of silently creating a second copy.
async function loadBankIndex() {
  const existing = await SpeakingQuestion
    .find({ isActive: { $ne: false } })
    .select('topic part question group')
    .lean();
  const topics = new Map();      // topicKey -> { name, count, group }
  const byTopicQ = new Map();    // "topicKey|part|qKey" -> doc
  const qToTopics = new Map();   // "part|qKey" -> Set(topicKey)
  for (const e of existing) {
    const tk = normTopicKey(e.topic);
    const t = topics.get(tk) || { name: e.topic, count: 0, group: null };
    t.count++;
    if (!t.group && e.group) t.group = e.group;
    topics.set(tk, t);
    const qk = `${e.part}|${normQuestionKey(e.question)}`;
    if (!byTopicQ.has(`${tk}|${qk}`)) byTopicQ.set(`${tk}|${qk}`, e);
    if (!qToTopics.has(qk)) qToTopics.set(qk, new Set());
    qToTopics.get(qk).add(tk);
  }
  return { topics, byTopicQ, qToTopics };
}

const short = q => `${q.slice(0, 60)}${q.length > 60 ? '…' : ''}`;

// Cross-check a valid parse against the bank and append non-blocking
// warnings: a topic name that already exists (import merges into it), a
// question already in that topic with slightly different wording (import
// updates it rather than adding a copy), and an identical { part, question }
// under a DIFFERENT topic (likely an accidental duplicate).
async function warnAboutExisting(parsed, bank) {
  if (!parsed.valid || !parsed.topics.length) return parsed;
  bank = bank || await loadBankIndex();
  const warnings = parsed.warnings.slice();
  for (const t of parsed.topics) {
    const tk = normTopicKey(t.topic);
    const existingTopic = bank.topics.get(tk);
    if (existingTopic) {
      const renamed = existingTopic.name !== t.topic ? ` (tên trên web: "${existingTopic.name}")` : '';
      warnings.push(`Topic "${t.topic}": đã có sẵn trên web (${existingTopic.count} câu)${renamed} — import sẽ cập nhật / bổ sung vào topic này`);
    }
    const parts = [
      ...t.part1.map(q => [1, q]),
      ...(t.part2 ? [[2, t.part2.question]] : []),
      ...t.part3.map(q => [3, q]),
    ];
    for (const [part, q] of parts) {
      const qk = `${part}|${normQuestionKey(q)}`;
      const same = bank.byTopicQ.get(`${tk}|${qk}`);
      if (same && same.question !== q) {
        warnings.push(`Part ${part} — "${short(q)}": gần giống câu đã có "${short(same.question)}" — import sẽ cập nhật câu cũ, không tạo câu mới`);
        continue;
      }
      const others = [...(bank.qToTopics.get(qk) || [])].filter(o => o !== tk);
      if (!same && others.length) {
        warnings.push(`Part ${part} — "${short(q)}": câu hỏi này đã tồn tại ở topic khác ("${bank.topics.get(others[0]).name}")`);
      }
    }
  }
  return { ...parsed, warnings };
}

// bulkWrite ops for a valid parse. Upsert keyed on { topic, part, question }
// after resolving the topic name / question text to their existing spelling,
// so a re-import updates instead of duplicating. Only isActive, cueCard (when
// the paste has one) and group (when the paste or the topic has one) are
// written — sampleAnswer/hints cached later are never touched.
function buildImportOps(parsed, bank) {
  return parsed.questionDocs.map(d => {
    const tk = normTopicKey(d.topic);
    const existingTopic = bank.topics.get(tk);
    const topic = existingTopic ? existingTopic.name : d.topic;
    const same = bank.byTopicQ.get(`${tk}|${d.part}|${normQuestionKey(d.question)}`);
    const question = same ? same.question : d.question;
    const $set = { topic, part: d.part, question, isActive: true };
    if (d.cueCard) $set.cueCard = d.cueCard;
    const group = d.part === 1 ? null : (d.group || existingTopic?.group || null);
    if (group) $set.group = group;
    return {
      updateOne: {
        filter: same ? { _id: same._id } : { topic, part: d.part, question },
        update: { $set },
        upsert: true,
      },
    };
  });
}

module.exports = { loadBankIndex, warnAboutExisting, buildImportOps };
