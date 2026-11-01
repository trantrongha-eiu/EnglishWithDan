"use strict";

// Shared helper: converts a terse lesson-definition object into the full
// {category, lessonKey, blocks:[...]} document shape expected by
// EssentialGrammarLesson. Keeps each per-category data file focused on
// content instead of repeating block-wrapping boilerplate.
// Minimum content thresholds enforced at build time (not just documented) —
// a lesson that doesn't meet these throws immediately instead of silently
// shipping thin content. Keep in sync with the QA spec: examples>=10,
// mistakes>=5, quiz>=5, practice exercises>=15 spanning 9 distinct types.
const MIN_EXAMPLES = 10;
const MIN_MISTAKES = 5;
const MIN_QUIZ = 5;
const MIN_EXERCISES = 15;
const REQUIRED_EXERCISE_TYPES = [
  "multiple_choice", "fill_blank", "error_correction", "translation_vn_en",
  "translation_en_vn", "sentence_transformation", "rewrite", "find_mistake", "mini_dialogue"
];

// Optional extra blocks (used by the Tenses lessons — see tenseExtras.js).
// Validated here so a typo in the hand-written data fails the seed loudly
// instead of shipping a broken drill.
const YOUTUBE_ID_RE = /^[\w-]{11}$/;
const VERB_FORM_TARGETS = ["past", "pastParticiple"];

function nonEmptyStrings(arr) {
  return Array.isArray(arr) && arr.length > 0 && arr.every(s => typeof s === "string" && s.trim());
}

function validateExtras(label, { videos, verbForms, conjugationDrill, translationDrill }) {
  (videos || []).forEach((v, i) => {
    if (!v || !YOUTUBE_ID_RE.test(v.youtubeId || "")) throw new Error(label + ": video #" + (i + 1) + " has an invalid youtubeId");
    if (!v.title) throw new Error(label + ": video #" + (i + 1) + " needs a title");
  });
  if (verbForms) {
    if (!VERB_FORM_TARGETS.includes(verbForms.target)) throw new Error(label + ": verbForms.target must be one of " + VERB_FORM_TARGETS.join("/"));
    const seen = new Set();
    (verbForms.items || []).forEach(v => {
      if (!v.base || !v.meaning || !nonEmptyStrings(v.past) || !nonEmptyStrings(v.pastParticiple)) {
        throw new Error(label + ": verbForms item is incomplete: " + JSON.stringify(v));
      }
      if (seen.has(v.base)) throw new Error(label + ": duplicate verbForms item: " + v.base);
      seen.add(v.base);
    });
    if (!seen.size) throw new Error(label + ": verbForms has no items");
  }
  (conjugationDrill || []).forEach(item => {
    if (!item.sentence || !item.sentence.includes("___") || !nonEmptyStrings(item.answers)) {
      throw new Error(label + ": conjugation item needs a sentence with ___ and answers: " + JSON.stringify(item));
    }
  });
  (translationDrill || []).forEach(item => {
    if (!item.vi || !nonEmptyStrings(item.answers)) {
      throw new Error(label + ": translation item needs vi + answers: " + JSON.stringify(item));
    }
  });
}

function lesson({
  category, lessonKey, title, icon, orderIndex,
  overview, formula, usage, signalWords, examples, image, mistakes, tips, comparison, exercises, quiz, summary,
  videos, verbForms, conjugationDrill, translationDrill
}) {
  const label = category + " / " + title;
  validateExtras(label, { videos, verbForms, conjugationDrill, translationDrill });

  if (!examples || examples.length < MIN_EXAMPLES) {
    throw new Error(label + ": needs >=" + MIN_EXAMPLES + " examples, has " + (examples ? examples.length : 0));
  }
  if (!mistakes || mistakes.length < MIN_MISTAKES) {
    throw new Error(label + ": needs >=" + MIN_MISTAKES + " mistakes, has " + (mistakes ? mistakes.length : 0));
  }
  if (!quiz || quiz.length < MIN_QUIZ) {
    throw new Error(label + ": needs >=" + MIN_QUIZ + " quiz questions, has " + (quiz ? quiz.length : 0));
  }
  if (!exercises || exercises.length < MIN_EXERCISES) {
    throw new Error(label + ": needs >=" + MIN_EXERCISES + " practice exercises, has " + (exercises ? exercises.length : 0));
  }
  const exerciseTypesPresent = new Set(exercises.map(e => e.type));
  const missingTypes = REQUIRED_EXERCISE_TYPES.filter(t => !exerciseTypesPresent.has(t));
  if (missingTypes.length) {
    throw new Error(label + ": missing exercise type(s): " + missingTypes.join(", "));
  }
  const seenExerciseQuestions = new Set();
  exercises.forEach(e => {
    const key = e.type + "|" + e.question;
    if (seenExerciseQuestions.has(key)) throw new Error(label + ": duplicate exercise question: " + e.question);
    seenExerciseQuestions.add(key);
  });

  // Fixed block order (QA spec): overview, video, formula, usage, signal_words,
  // examples, common_mistakes, ielts_tips, comparison, practice_exercises,
  // verb_forms, conjugation_drill, translation_drill, quiz, summary
  const blocks = [];
  if (overview) blocks.push({ type: "overview", data: { text: overview } });
  if (videos && videos.length) blocks.push({ type: "video", data: { videos } });
  if (formula) blocks.push({ type: "formula", data: { forms: formula } });
  if (usage) blocks.push({ type: "usage", data: { points: usage } });
  if (signalWords) blocks.push({ type: "signal_words", data: { words: signalWords } });
  if (image) blocks.push({ type: "image", data: image });
  blocks.push({ type: "examples", data: { items: examples } });
  blocks.push({ type: "common_mistakes", data: { items: mistakes } });
  if (tips) blocks.push({ type: "ielts_tips", data: { tips } });
  if (comparison) blocks.push({ type: "comparison", data: comparison });
  blocks.push({ type: "practice_exercises", data: { exercises } });
  if (verbForms) blocks.push({ type: "verb_forms", data: verbForms });
  if (conjugationDrill && conjugationDrill.length) blocks.push({ type: "conjugation_drill", data: { items: conjugationDrill } });
  if (translationDrill && translationDrill.length) blocks.push({ type: "translation_drill", data: { items: translationDrill } });
  blocks.push({ type: "quiz", data: { questions: quiz } });
  if (summary) blocks.push({ type: "summary", data: { text: summary } });

  return {
    category, lessonKey, title,
    icon: icon || "📘",
    summary: summary || "",
    blocks,
    orderIndex,
    isActive: true
  };
}

module.exports = { lesson };
