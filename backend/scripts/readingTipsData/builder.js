'use strict';
// Small block-builder helpers for authoring Reading Tips content — deliberately
// lighter than Essential Grammar's builder.js (no quiz/exercise minimums,
// this is reference strategy material, not gradeable drills). Each helper
// returns one { type, data } block matching ReadingTip's blockSchema; a
// lesson's `blocks` array is just these called in the order they should render.

function overview(text) { return { type: 'overview', data: text }; }

// items: [{ title, description }] — numbered/step-by-step procedures
// ("Bước 1...", "Chiến thuật...").
function steps(items) { return { type: 'steps', data: items }; }

// A plain bullet list, optionally titled.
function list(title, items) { return { type: 'list', data: { title: title || '', items } }; }

// items: [{ label, passage, statement, note }] — a worked example showing a
// passage excerpt vs. a question statement and why they do/don't match.
// Any field may be omitted (e.g. a paraphrase example has no `passage`
// beyond a single reference phrase); the renderer only shows what's present.
function example(items) { return { type: 'example', data: items }; }

// A highlighted note/warning/tip box.
function callout(title, text) { return { type: 'callout', data: { title: title || '', text } }; }

function table(title, headers, rows) { return { type: 'table', data: { title: title || '', headers, rows } }; }

function summary(text) { return { type: 'summary', data: text }; }

function lesson({ category, lessonKey, title, icon, orderIndex, summaryText, blocks }) {
  return {
    category, lessonKey, title,
    icon: icon || '📖',
    summary: summaryText || '',
    orderIndex: orderIndex || 0,
    blocks,
    isActive: true,
  };
}

module.exports = { overview, steps, list, example, callout, table, summary, lesson };
