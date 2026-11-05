'use strict';

// Sorts a passage's / section's question groups into the IELTS question
// types students filter by on the Bài lẻ list (Reading + Listening).
// groupType alone isn't enough — e.g. a 'matching-options' block can be
// Matching Information, Matching Features or a "Choose TWO letters" MCQ,
// and 'note-form' holds summaries, notes and sentence completion — so the
// instruction text decides first and groupType / question type is the
// fallback. Returns keys only; the labels live in the frontend.

const strip = s => String(s || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .toLowerCase();

const FORM_GROUPS = ['note-form', 'table', 'bullet-list', 'summary-completion'];

// module: 'reading' | 'listening'
function classifyGroup(group, module) {
  const ins = strip(`${group.groupTitle || ''} ${group.instruction || ''}`);
  const gt = group.groupType || 'plain';
  const qt = new Set((group.questions || []).map(q => q.type));
  const reading = module === 'reading';

  if (gt === 'matching-headings' || qt.has('matching-headings')) return 'matching-headings';
  if (qt.has('true-false-ng')) return 'tfng';
  if (qt.has('yes-no-ng')) return 'ynng';

  if (/\blabel the\b|complete the (diagram|map|plan)\b|listen to the directions/.test(ins)) return 'diagram-labelling';
  // Flow-charts / timetables count as form completion (official IELTS grouping)
  if (/flow[\s-]*chart|timetable/.test(ins)) return 'summary-completion';
  if (reading && /which (paragraph|section)s?\b|paragraphs? contains?/.test(ins)) return 'matching-information';
  if (gt === 'sentence-endings' || /correct ending/.test(ins)) return reading ? 'sentence-endings' : 'matching';

  if (qt.has('multiple-choice') || qt.has('multi-answer-group') || qt.has('checkbox')) return 'multiple-choice';

  if (gt === 'matching-options' || gt === 'drag-drop' || qt.has('matching-info') || qt.has('matching')) {
    // "Choose TWO letters" stored as a matching block is really an MCQ.
    // "Choose the correct letter" alone stays matching (one letter per item).
    if (/choose (two|three|four|five) letters/.test(ins)) return 'multiple-choice';
    if (/complete the (notes|summary|table|form)/.test(ins)) return 'summary-completion';
    return reading ? 'matching-features' : 'matching';
  }

  if (/answer the questions|short answer/.test(ins)) return 'short-answer';
  if (/complete (the|each of the following) (sentences?|statements)|complete each sentence/.test(ins)) return 'sentence-completion';
  if (/summ[ae]ry|\bnotes?\b|\btables?\b|\bform\b/.test(ins) || FORM_GROUPS.includes(gt)) return 'summary-completion';
  if (gt === 'map' || qt.has('map-labelling')) return 'diagram-labelling';
  if (qt.has('sentence-completion') || qt.has('fill-blank')) return 'sentence-completion';
  return null;
}

// Unique type keys of a passage/section, in the order they appear.
function questionTypesOf(groups, module) {
  const out = [];
  for (const g of groups || []) {
    const k = classifyGroup(g, module);
    if (k && !out.includes(k)) out.push(k);
  }
  return out;
}

module.exports = { classifyGroup, questionTypesOf };
