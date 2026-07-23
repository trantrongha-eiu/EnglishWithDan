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

function lesson({
  category, lessonKey, title, icon, orderIndex,
  overview, formula, usage, signalWords, examples, image, mistakes, tips, comparison, exercises, quiz, summary
}) {
  const label = category + " / " + title;

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

  // Fixed block order (QA spec): overview, formula, usage, signal_words,
  // examples, common_mistakes, ielts_tips, comparison, practice_exercises, quiz, summary
  const blocks = [];
  if (overview) blocks.push({ type: "overview", data: { text: overview } });
  if (formula) blocks.push({ type: "formula", data: { forms: formula } });
  if (usage) blocks.push({ type: "usage", data: { points: usage } });
  if (signalWords) blocks.push({ type: "signal_words", data: { words: signalWords } });
  if (image) blocks.push({ type: "image", data: image });
  blocks.push({ type: "examples", data: { items: examples } });
  blocks.push({ type: "common_mistakes", data: { items: mistakes } });
  if (tips) blocks.push({ type: "ielts_tips", data: { tips } });
  if (comparison) blocks.push({ type: "comparison", data: comparison });
  blocks.push({ type: "practice_exercises", data: { exercises } });
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
