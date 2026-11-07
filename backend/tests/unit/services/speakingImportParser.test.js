'use strict';

const { parseSpeakingText, buildCueCard, normalizeGroup, normQuestionKey, normTopicKey } = require('../../../services/speakingImportParser');

const GOOD = `@topic
topic=A TV/online programme you enjoy

@part1
What kinds of TV programmes do you like to watch?
How often do you watch television?
Do you prefer watching TV alone or with other people?

@part2
cue=what it is about | how often you watch it | who you watch it with | and explain why you enjoy it
Describe a TV or online programme that you enjoy watching

@part3
Why do some people spend so much time watching TV and online programmes?
Do younger and older people enjoy watching similar programmes or shows?
What types of programmes are popular in your country?
Do you agree there are too many programmes to choose from these days?
`;

describe('speakingImportParser.parseSpeakingText', () => {
  it('parses a full 3-part topic', () => {
    const r = parseSpeakingText(GOOD);
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
    expect(r.counts).toEqual({ topics: 1, part1: 3, part2: 1, part3: 4, total: 8 });
    expect(r.questionDocs).toHaveLength(8);
    const p2 = r.questionDocs.find(d => d.part === 2);
    expect(p2.question).toBe('Describe a TV or online programme that you enjoy watching');
    expect(p2.cueCard).toBe('You should say:\n- what it is about\n- how often you watch it\n- who you watch it with\n- and explain why you enjoy it');
    expect(r.questionDocs.filter(d => d.part === 1)).toHaveLength(3);
    expect(r.questionDocs.filter(d => d.part === 3)).toHaveLength(4);
  });

  it('accepts multiple @topic blocks in one paste', () => {
    const r = parseSpeakingText(GOOD + '\n@topic\ntopic=Your hometown\n@part1\nWhere is your hometown?\nWhat is it famous for?\n');
    expect(r.valid).toBe(true);
    expect(r.counts.topics).toBe(2);
    expect(r.topics[1].topic).toBe('Your hometown');
  });

  it('allows a topic with only one part', () => {
    const r = parseSpeakingText('@topic\ntopic=Just Part 3\n@part3\nWhy do people move to cities?\nWhat problems does that cause?\nHow can governments respond?\n');
    expect(r.valid).toBe(true);
    expect(r.counts).toMatchObject({ topics: 1, part1: 0, part2: 0, part3: 3 });
  });

  it('errors on a missing topic name', () => {
    const r = parseSpeakingText('@topic\n@part1\nA question here?\n');
    expect(r.valid).toBe(false);
    expect(r.errors.join(' ')).toMatch(/thiếu "topic=/);
  });

  it('errors when @part1 appears outside a @topic', () => {
    const r = parseSpeakingText('@part1\nWhat is your name?\n');
    expect(r.valid).toBe(false);
    expect(r.errors.join(' ')).toMatch(/ngoài một khối @topic/);
  });

  it('errors on more than one Part 2 question line', () => {
    const r = parseSpeakingText('@topic\ntopic=T\n@part2\nDescribe a book.\nDescribe a film.\n');
    expect(r.valid).toBe(false);
    expect(r.errors.join(' ')).toMatch(/Part 2: chỉ được 1 dòng/);
  });

  it('errors on a duplicate topic and a duplicate question', () => {
    const dup = '@topic\ntopic=Food\n@part1\nWhat do you like to eat?\nWhat do you like to eat?\n\n@topic\ntopic=Food\n@part1\nDo you cook?\n';
    const r = parseSpeakingText(dup);
    expect(r.valid).toBe(false);
    expect(r.errors.join(' ')).toMatch(/trùng topic/);
    expect(r.errors.join(' ')).toMatch(/câu hỏi trùng/);
  });

  it('warns (not errors) on a thin Part 1 or missing cue', () => {
    const r = parseSpeakingText('@topic\ntopic=T\n@part1\nOnly one question?\n@part2\nDescribe something.\n');
    expect(r.valid).toBe(true);
    expect(r.warnings.join(' ')).toMatch(/Part 1: chỉ có 1 câu/);
    expect(r.warnings.join(' ')).toMatch(/chưa có "cue="/);
  });

  it('errors when there is no @topic at all', () => {
    expect(parseSpeakingText('   ').valid).toBe(false);
    expect(parseSpeakingText('hello world').valid).toBe(false);
  });
});

describe('speakingImportParser.buildCueCard', () => {
  it('turns a pipe list into a bulleted "You should say" block', () => {
    expect(buildCueCard('a | b | c')).toBe('You should say:\n- a\n- b\n- c');
  });
  it('passes through a value that already starts with "You should say"', () => {
    expect(buildCueCard('You should say:\n- x\n- y')).toBe('You should say:\n- x\n- y');
  });
  it('returns empty string for empty input', () => {
    expect(buildCueCard('')).toBe('');
    expect(buildCueCard('  ')).toBe('');
  });
});

// What ChatGPT/Gemini actually send back for the admin "Copy AI Prompt"
// flow — the format, wrapped in the usual AI habits.
const AI_STYLE = `Dưới đây là bộ đề theo đúng định dạng:
\`\`\`
**@topic**
topic: A person you only met once
group=people

@Part 2
1. Describe a person you only met once recently and want to know more about
You should say:
• Who he/she is
• When you met him/her
• And explain how you feel about him/her

@Part 3:
1. What can we do to leave a good impression on people?
2. How do people make friends in your country?
3. What qualities make true friends?
# Ghi chú: Part 3 trong đề gốc thiếu 1 câu

@topic
topic=Tiredness
@part1
- Do you often feel tired?
- What do you do when you feel tired? Don\'t you rest?
\`\`\`
Chúc bạn học tốt!`;

describe('speakingImportParser — tolerates AI output habits', () => {
  const r = parseSpeakingText(AI_STYLE);

  it('is valid despite fences, bold, preamble and list markers', () => {
    expect(r.errors).toEqual([]);
    expect(r.valid).toBe(true);
    expect(r.counts).toMatchObject({ topics: 2, part1: 2, part2: 1, part3: 3 });
  });

  it('keeps the numbered Describe line as the prompt and bullets as the cue card', () => {
    const p2 = r.questionDocs.find(d => d.part === 2);
    expect(p2.question).toBe('Describe a person you only met once recently and want to know more about');
    expect(p2.cueCard).toBe('You should say:\n- Who he/she is\n- When you met him/her\n- And explain how you feel about him/her');
  });

  it('strips list markers and \\\' escapes from questions', () => {
    expect(r.topics[0].part3[0]).toBe('What can we do to leave a good impression on people?');
    expect(r.topics[1].part1).toEqual(['Do you often feel tired?', "What do you do when you feel tired? Don't you rest?"]);
  });

  it('carries group onto Part 2/3 docs only', () => {
    expect(r.topics[0].group).toBe('people');
    expect(r.questionDocs.filter(d => d.topic === 'A person you only met once').every(d => d.group === 'people')).toBe(true);
    expect(r.questionDocs.filter(d => d.part === 1).every(d => d.group === null)).toBe(true);
  });

  it('surfaces "# Ghi chú:" comments and the skipped preamble as warnings', () => {
    const w = r.warnings.join(' | ');
    expect(w).toMatch(/Part 3 trong đề gốc thiếu 1 câu/);
    expect(w).toMatch(/bỏ qua 2 dòng nằm ngoài khung/);
  });

  it('errors on an unknown group', () => {
    const bad = parseSpeakingText('@topic\ntopic=T\ngroup=animals-ish\n@part2\nDescribe a thing.\n');
    expect(bad.valid).toBe(false);
    expect(bad.errors.join(' ')).toMatch(/group="animals-ish" không hợp lệ/);
  });
});

describe('speakingImportParser.normalizeGroup', () => {
  it('accepts codes, textbook numbers and loose spellings', () => {
    expect(normalizeGroup('people')).toBe('people');
    expect(normalizeGroup('Nhóm 5')).toBe('activities_skills');
    expect(normalizeGroup('7')).toBe('culture_media');
    expect(normalizeGroup('Nature / Science')).toBe('nature_science');
    expect(normalizeGroup('whatever')).toBe('');
  });
});

describe('speakingImportParser loose match keys', () => {
  it('treat AI rewordings of the same question as equal', () => {
    expect(normQuestionKey('What’s your favorite type of shoes?')).toBe(normQuestionKey('What is your favourite type of shoes?'));
    expect(normQuestionKey('Do you recycle now? (Why?)')).toBe(normQuestionKey('Do you recycle now?'));
    expect(normQuestionKey('Do you cook?')).not.toBe(normQuestionKey('Do you bake?'));
  });
  it('treat "Comedy/Jokes" and "comedy / jokes" as one topic', () => {
    expect(normTopicKey('Comedy/Jokes')).toBe(normTopicKey('comedy / jokes'));
  });
});
