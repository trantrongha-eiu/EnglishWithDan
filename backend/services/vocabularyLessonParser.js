'use strict';

// ══════════════════════════════════════════════════════
// "EnglishWithDan Lesson Format" parser
//
//   @lesson
//   title=Week 12 - Environment
//   description=Environment Vocabulary
//   difficulty=B1
//   order=12
//
//   @word
//   word=sustainable
//   meaning=bền vững
//   ipa=/səˈsteɪnəbl/
//   pos=adjective
//   example=Solar energy is a sustainable source of power.
//   definition=Able to continue without harming the environment.
//   collocations=sustainable development|sustainable energy
//   distractors=renewable|temporary|harmful
//
// Deliberately not JSON/YAML — flat key=value lines an admin can paste
// straight from ChatGPT/Gemini output with zero markup discipline. This
// module never calls any AI API; it only parses text the admin already has.
//
// Extensibility: adding a brand new field (audio=, image=, synonyms=,
// antonyms=, notes=...) needs AT MOST one line added to ARRAY_FIELDS below
// (only if the new field holds a `|`-separated list) — the tokenizer and
// validation loop never need to change, and any unknown `key=value` line
// is kept as a plain string field automatically.
// ══════════════════════════════════════════════════════

// Raw format key → schema field name, only where they differ.
const FIELD_KEY_MAP = {
  pos: 'partOfSpeech',
};

// Keys whose value is a `|`-separated list rather than a plain string.
const ARRAY_FIELDS = new Set(['collocations', 'distractors', 'synonyms', 'antonyms']);

const WORD_REQUIRED_FIELDS = ['word', 'meaning', 'example', 'definition'];
const DIFFICULTY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function mapKey(rawKey) {
  return FIELD_KEY_MAP[rawKey] || rawKey;
}

function parseValue(rawKey, rawValue) {
  if (ARRAY_FIELDS.has(rawKey)) {
    return rawValue.split('|').map(s => s.trim()).filter(Boolean);
  }
  return rawValue.trim();
}

// Splits the raw pasted text into @lesson / @word blocks of {key: value}
// pairs, collecting line-numbered syntax errors along the way (a
// `key=value` line outside any block, or with no `=`).
function tokenize(raw) {
  const lines = String(raw || '').split(/\r?\n/);
  const errors = [];
  let current = null; // { type: 'lesson'|'word', fields: {}, line }
  const blocks = [];

  lines.forEach((rawLine, i) => {
    const lineNo = i + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return; // blank line / comment

    if (line === '@lesson' || line === '@word') {
      if (current) blocks.push(current);
      current = { type: line.slice(1), fields: {}, line: lineNo };
      return;
    }

    const eq = line.indexOf('=');
    if (eq === -1) {
      errors.push(`Dòng ${lineNo}: thiếu dấu "=" ("${line}")`);
      return;
    }
    if (!current) {
      errors.push(`Dòng ${lineNo}: nằm ngoài @lesson hoặc @word ("${line}")`);
      return;
    }
    const rawKey = line.slice(0, eq).trim();
    const rawValue = line.slice(eq + 1);
    if (!rawKey) {
      errors.push(`Dòng ${lineNo}: thiếu tên field trước dấu "="`);
      return;
    }
    current.fields[mapKey(rawKey)] = parseValue(rawKey, rawValue);
  });
  if (current) blocks.push(current);

  return { blocks, errors };
}

// Parses + validates in one pass. Returns:
//   { valid, errors: string[], lesson: {...}|null, words: [...] }
// lesson/words are only populated when valid === true — "Không import nếu
// lỗi" means callers must never be handed a partially-valid parse to save.
function parseLessonText(raw) {
  const { blocks, errors } = tokenize(raw);

  const lessonBlocks = blocks.filter(b => b.type === 'lesson');
  const wordBlocks = blocks.filter(b => b.type === 'word');

  if (lessonBlocks.length === 0) {
    errors.push('Thiếu khối @lesson');
  } else if (lessonBlocks.length > 1) {
    errors.push(`Có ${lessonBlocks.length} khối @lesson — chỉ được phép 1 khối @lesson mỗi lần import`);
  }
  if (wordBlocks.length === 0) {
    errors.push('Thiếu khối @word — lesson phải có ít nhất 1 từ');
  }

  const lessonFields = lessonBlocks[0]?.fields || {};
  if (!lessonFields.title || !String(lessonFields.title).trim()) {
    errors.push('Lesson: thiếu "title"');
  }
  if (lessonFields.difficulty && !DIFFICULTY_LEVELS.includes(lessonFields.difficulty)) {
    errors.push(`Lesson: Invalid difficulty "${lessonFields.difficulty}" (chỉ chấp nhận ${DIFFICULTY_LEVELS.join(', ')})`);
  }
  if (lessonFields.order != null && lessonFields.order !== '' && Number.isNaN(Number(lessonFields.order))) {
    errors.push(`Lesson: "order" phải là số, nhận được "${lessonFields.order}"`);
  }

  // Non-blocking quality hints — shown in Preview but never prevent import.
  // Thresholds match what the Copy-AI-Prompt text already asks the AI for
  // (>=3 distractors, >=2 collocations), so a warning here means the AI/admin
  // undershot its own brief, not that the lesson is unusable. Distractor
  // count in particular affects whether the quiz engine can generate a real
  // Multiple Choice question for that word at all (see dashboard-lesson.js's
  // eligibleTypesFor/MIN_MCQ_OPTIONS) — words with <3 distractors just fall
  // back to other question types instead of blocking anything.
  const warnings = [];

  const seenWords = new Map(); // từ (lowercase) -> Word # xuất hiện đầu tiên
  const words = wordBlocks.map((block, i) => {
    const n = i + 1;
    const f = block.fields;

    WORD_REQUIRED_FIELDS.forEach(key => {
      if (!f[key] || !String(f[key]).trim()) {
        errors.push(`Word ${n}: Missing ${key}`);
      }
    });

    const distractorCount = Array.isArray(f.distractors) ? f.distractors.length : 0;
    if (distractorCount < 3) {
      warnings.push(`Word ${n}${f.word ? ` ("${f.word}")` : ''}: chỉ có ${distractorCount}/3 distractors`);
    }
    const collocationCount = Array.isArray(f.collocations) ? f.collocations.length : 0;
    if (collocationCount < 2) {
      warnings.push(`Word ${n}${f.word ? ` ("${f.word}")` : ''}: chỉ có ${collocationCount}/2 collocations`);
    }

    if (f.word) {
      const key = String(f.word).trim().toLowerCase();
      if (seenWords.has(key)) {
        errors.push(`Word ${n}: Duplicate word ("${f.word}" đã xuất hiện ở Word ${seenWords.get(key)})`);
      } else {
        seenWords.set(key, n);
      }
    }

    return {
      // Spread first so a not-yet-schema'd future field (audio, image,
      // synonyms, antonyms, notes...) survives parsing untouched — the
      // explicit keys below just normalize/default the fields this schema
      // already knows about, overwriting the raw pass-through value.
      ...f,
      word:         String(f.word || '').trim(),
      meaning:      String(f.meaning || '').trim(),
      ipa:          String(f.ipa || '').trim(),
      partOfSpeech: String(f.partOfSpeech || '').trim(),
      example:      String(f.example || '').trim(),
      definition:   String(f.definition || '').trim(),
      collocations: Array.isArray(f.collocations) ? f.collocations : [],
      distractors:  Array.isArray(f.distractors) ? f.distractors : [],
    };
  });

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    // Best-effort title even on a failed parse — so a failed Import History
    // entry can still show *something* recognizable ("__UITEST Broken")
    // instead of "(không có tiêu đề)". `lesson`/`words` stay null/[] unless
    // fully valid — Preview must never render a partially-valid parse.
    title: lessonFields.title ? String(lessonFields.title).trim() : null,
    lesson: valid ? {
      title:       String(lessonFields.title).trim(),
      description: String(lessonFields.description || '').trim(),
      difficulty:  lessonFields.difficulty || 'B1',
      order:       lessonFields.order != null && lessonFields.order !== '' ? Number(lessonFields.order) : 0,
    } : null,
    words: valid ? words : [],
  };
}

// Serializes a lesson doc back into Lesson Format text — used to prefill
// the Edit page's textarea so admins can tweak-and-re-import instead of
// retyping the whole lesson from scratch.
function lessonToText(lesson) {
  const lines = ['@lesson'];
  lines.push(`title=${lesson.title}`);
  if (lesson.description) lines.push(`description=${lesson.description}`);
  lines.push(`difficulty=${lesson.difficulty}`);
  lines.push(`order=${lesson.order ?? 0}`);
  lines.push('');

  (lesson.words || []).forEach(w => {
    lines.push('@word');
    lines.push(`word=${w.word}`);
    lines.push(`meaning=${w.meaning}`);
    if (w.ipa) lines.push(`ipa=${w.ipa}`);
    if (w.partOfSpeech) lines.push(`pos=${w.partOfSpeech}`);
    lines.push(`example=${w.example}`);
    lines.push(`definition=${w.definition}`);
    if (w.collocations?.length) lines.push(`collocations=${w.collocations.join('|')}`);
    if (w.distractors?.length) lines.push(`distractors=${w.distractors.join('|')}`);
    lines.push('');
  });

  return lines.join('\n').trim() + '\n';
}

module.exports = {
  DIFFICULTY_LEVELS,
  WORD_REQUIRED_FIELDS,
  parseLessonText,
  lessonToText,
};
