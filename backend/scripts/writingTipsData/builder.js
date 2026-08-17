'use strict';
// Reuses overview/steps/list/callout/table/summary/lesson from
// readingTipsData/builder.js verbatim (identical shape) — only `example`
// is redefined here with a more flexible data shape, since Writing content
// pairs up all sorts of things (Cause/Solution, Idea/Why/Example/Result,
// ❌Band 6/✅Band 7+, ...) rather than Reading/Listening's fixed
// passage/statement pair. See frontend/js/writing-tips.js's wstRenderExample.
const shared = require('../readingTipsData/builder');

// items: [{ label, lines: [{ tag, text }], note }]
function example(items) { return { type: 'example', data: items }; }

module.exports = {
  overview: shared.overview,
  steps: shared.steps,
  list: shared.list,
  callout: shared.callout,
  table: shared.table,
  summary: shared.summary,
  lesson: shared.lesson,
  example,
};
