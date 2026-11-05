"use strict";

// Short constructors for the Writing Foundation lessons
// (writingFoundationBasics.js + writingFoundationConnecting.js).
// Every lesson walks the same 5 steps, so practice questions are tagged
// with the step they train: Hiểu nghĩa → Chọn cấu trúc → Viết câu →
// Mở rộng câu → Kết nối câu.

const CATEGORY = "Writing Foundation";

const STEP = {
  meaning: "[Hiểu nghĩa] ",
  structure: "[Chọn cấu trúc] ",
  write: "[Viết câu] ",
  expand: "[Mở rộng câu] ",
  connect: "[Kết nối câu] "
};

const eg = (en, vi) => ({ en, vi });
const err = (wrong, right, note) => ({ wrong, right, note });
const mc = (question, options, answerIndex, explanation) => ({ type: "multiple_choice", question, options, answerIndex, explanation });
const ex = (type, question, answer, explanation) => ({ type, question, answer, explanation });
const qz = (question, options, answerIndex, explanation) => ({ question, options, answerIndex, explanation });
const table = (title, headers, rows) => ({ title, headers, rows });
// Drill items — answers: one string or a list of accepted answers. The
// student page already treats contractions = long forms and ignores case,
// punctuation and number words vs digits, so only list wording differences.
const c = (sentence, answers, explanation) => ({ sentence, answers: [].concat(answers), explanation });
const t = (vi, answers, hint) => ({ vi, answers: [].concat(answers), ...(hint ? { hint } : {}) });

module.exports = { CATEGORY, STEP, eg, err, mc, ex, qz, table, c, t };
