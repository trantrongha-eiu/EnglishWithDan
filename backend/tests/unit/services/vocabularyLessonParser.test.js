// "EnglishWithDan Lesson Format" parser — a flat key=value block format
// (not JSON/YAML) admins paste directly from AI output. These tests cover
// the validation contract the Import page's Validate/Preview/Import flow
// depends on: exact per-word error messages ("Word N: Missing X",
// "Word N: Duplicate word", "Invalid difficulty"), line-numbered syntax
// errors, and the "never hand back a partially-valid parse" guarantee.
const { parseLessonText, lessonToText, DIFFICULTY_LEVELS } = require('../../../services/vocabularyLessonParser');

const GOOD_LESSON = `@lesson
title=Week 12 - Environment
description=Environment Vocabulary
difficulty=B1
order=12

@word
word=sustainable
meaning=bền vững
ipa=/səˈsteɪnəbl/
pos=adjective
example=Solar energy is a sustainable source of power.
definition=Able to continue without harming the environment.
collocations=sustainable development|sustainable energy
distractors=renewable|temporary|harmful

@word
word=renewable
meaning=tái tạo
example=Wind power is renewable.
definition=Can naturally be replaced.
`;

describe('parseLessonText — valid input', () => {
  test('parses a well-formed lesson into lesson + words', () => {
    const result = parseLessonText(GOOD_LESSON);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.lesson).toEqual({
      title: 'Week 12 - Environment',
      description: 'Environment Vocabulary',
      difficulty: 'B1',
      order: 12,
    });
    expect(result.words).toHaveLength(2);
  });

  test('splits pipe-separated fields into arrays, trimming whitespace', () => {
    const result = parseLessonText(GOOD_LESSON);
    expect(result.words[0].collocations).toEqual(['sustainable development', 'sustainable energy']);
    expect(result.words[0].distractors).toEqual(['renewable', 'temporary', 'harmful']);
  });

  test('maps pos= to partOfSpeech', () => {
    const result = parseLessonText(GOOD_LESSON);
    expect(result.words[0].partOfSpeech).toBe('adjective');
  });

  test('defaults difficulty to B1 and order to 0 when omitted', () => {
    const minimal = `@lesson
title=Minimal Lesson

@word
word=cat
meaning=con mèo
example=I have a cat.
definition=A small domesticated animal.
`;
    const result = parseLessonText(minimal);
    expect(result.valid).toBe(true);
    expect(result.lesson.difficulty).toBe('B1');
    expect(result.lesson.order).toBe(0);
  });

  test('best-effort `title` is populated even when unused elsewhere', () => {
    const result = parseLessonText(GOOD_LESSON);
    expect(result.title).toBe('Week 12 - Environment');
  });

  test('an unrecognized key=value line becomes a plain string field with no parser change needed (extensibility)', () => {
    const withExtraField = GOOD_LESSON.replace(
      'word=sustainable\n',
      'word=sustainable\naudio=https://example.com/sustainable.mp3\n'
    );
    const result = parseLessonText(withExtraField);
    expect(result.valid).toBe(true);
    expect(result.words[0].audio).toBe('https://example.com/sustainable.mp3');
  });

  test('comment lines (#) and blank lines are ignored', () => {
    const withComments = `# This is a lesson about the environment
@lesson
title=Week 12
difficulty=B1

# first word
@word
word=cat
meaning=con mèo
example=I have a cat.
definition=A small domesticated animal.
`;
    const result = parseLessonText(withComments);
    expect(result.valid).toBe(true);
    expect(result.words).toHaveLength(1);
  });
});

describe('parseLessonText — non-blocking quality warnings', () => {
  test('warns (but stays valid) when a word has fewer than 3 distractors or 2 collocations', () => {
    const result = parseLessonText(GOOD_LESSON);
    // Word 1 (sustainable) has 3 distractors + 2 collocations — no warning.
    // Word 2 (renewable) has neither field at all — both warnings fire.
    expect(result.valid).toBe(true);
    expect(result.warnings).toContain('Word 2 ("renewable"): chỉ có 0/3 distractors');
    expect(result.warnings).toContain('Word 2 ("renewable"): chỉ có 0/2 collocations');
    expect(result.warnings.some(w => w.startsWith('Word 1'))).toBe(false);
  });

  test('does not warn when the minimums are met exactly', () => {
    const exact = `@lesson
title=X

@word
word=cat
meaning=con mèo
example=I have a cat.
definition=A small animal.
collocations=a|b
distractors=x|y|z
`;
    const result = parseLessonText(exact);
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  test('import never blocks on warnings alone', () => {
    const noExtras = `@lesson
title=X

@word
word=cat
meaning=con mèo
example=I have a cat.
definition=A small animal.
`;
    const result = parseLessonText(noExtras);
    expect(result.valid).toBe(true); // still importable
    expect(result.warnings.length).toBe(2); // 0 distractors, 0 collocations
  });
});

describe('parseLessonText — validation errors', () => {
  test('reports "Word N: Missing <field>" for each missing required field', () => {
    const missing = `@lesson
title=X
difficulty=B1

@word
word=cat
meaning=con mèo
`; // missing example + definition
    const result = parseLessonText(missing);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Word 1: Missing example');
    expect(result.errors).toContain('Word 1: Missing definition');
  });

  test('reports the correct Word number for a later word in a multi-word lesson', () => {
    const missing = `@lesson
title=X

@word
word=cat
meaning=con mèo
example=I have a cat.
definition=A small animal.

@word
word=dog
meaning=con chó
`; // word 2 missing example/definition
    const result = parseLessonText(missing);
    expect(result.errors).toContain('Word 2: Missing example');
    expect(result.errors).toContain('Word 2: Missing definition');
    expect(result.errors.some(e => e.startsWith('Word 1:'))).toBe(false);
  });

  test('reports a duplicate word (case-insensitive) with both word numbers', () => {
    const dup = `@lesson
title=X

@word
word=Cat
meaning=con mèo
example=I have a cat.
definition=A small animal.

@word
word=cat
meaning=con mèo khác
example=Another cat.
definition=A small animal.
`;
    const result = parseLessonText(dup);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Word 2') && e.includes('Duplicate word'))).toBe(true);
  });

  test('rejects an invalid difficulty value', () => {
    const bad = GOOD_LESSON.replace('difficulty=B1', 'difficulty=Z9');
    const result = parseLessonText(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid difficulty'))).toBe(true);
  });

  test.each(DIFFICULTY_LEVELS)('accepts difficulty=%s as valid', (level) => {
    const text = GOOD_LESSON.replace('difficulty=B1', `difficulty=${level}`);
    expect(parseLessonText(text).valid).toBe(true);
  });

  test('reports a non-numeric order as an error', () => {
    const bad = GOOD_LESSON.replace('order=12', 'order=twelve');
    const result = parseLessonText(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('order'))).toBe(true);
  });

  test('reports a missing title', () => {
    const noTitle = `@lesson
difficulty=B1

@word
word=cat
meaning=con mèo
example=I have a cat.
definition=A small animal.
`;
    const result = parseLessonText(noTitle);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('title'))).toBe(true);
  });

  test('reports a missing @lesson block', () => {
    const noLesson = `@word
word=cat
meaning=con mèo
example=I have a cat.
definition=A small animal.
`;
    const result = parseLessonText(noLesson);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Thiếu khối @lesson');
  });

  test('reports a lesson with no words at all', () => {
    const noWords = `@lesson
title=X
difficulty=B1
`;
    const result = parseLessonText(noWords);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('@word'))).toBe(true);
  });

  test('reports more than one @lesson block as an error', () => {
    const twoLessons = `@lesson
title=First

@lesson
title=Second

@word
word=cat
meaning=con mèo
example=I have a cat.
definition=A small animal.
`;
    const result = parseLessonText(twoLessons);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('@lesson'))).toBe(true);
  });

  test('reports a syntax error (no "=") with the correct line number', () => {
    const bad = `@lesson
title X

@word
word=cat
meaning=con mèo
example=I have a cat.
definition=A small animal.
`;
    const result = parseLessonText(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Dòng 2'))).toBe(true);
  });

  test('reports a key=value line that appears before any @lesson/@word block', () => {
    const bad = `title=Orphan line
@lesson
title=X
difficulty=B1

@word
word=cat
meaning=con mèo
example=I have a cat.
definition=A small animal.
`;
    const result = parseLessonText(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Dòng 1') && e.includes('ngoài'))).toBe(true);
  });

  test('never returns a populated `lesson`/`words` when invalid ("không import nếu lỗi")', () => {
    const bad = GOOD_LESSON.replace('difficulty=B1', 'difficulty=Z9');
    const result = parseLessonText(bad);
    expect(result.lesson).toBeNull();
    expect(result.words).toEqual([]);
  });
});

describe('lessonToText — round-trip', () => {
  test('serializes a parsed lesson back into a format that re-parses to the same data', () => {
    const parsed = parseLessonText(GOOD_LESSON);
    const text = lessonToText({ ...parsed.lesson, words: parsed.words });
    const reparsed = parseLessonText(text);

    expect(reparsed.valid).toBe(true);
    expect(reparsed.lesson).toEqual(parsed.lesson);
    expect(reparsed.words).toEqual(parsed.words);
  });

  test('omits optional fields cleanly when absent', () => {
    const minimal = { title: 'X', description: '', difficulty: 'B1', order: 0, words: [
      { word: 'cat', meaning: 'con mèo', ipa: '', partOfSpeech: '', example: 'I have a cat.', definition: 'A small animal.', collocations: [], distractors: [] },
    ] };
    const text = lessonToText(minimal);
    expect(text).not.toContain('description=');
    expect(text).not.toContain('collocations=');
    expect(text).not.toContain('distractors=');
    const reparsed = parseLessonText(text);
    expect(reparsed.valid).toBe(true);
  });
});
