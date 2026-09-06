'use strict';

const { parseSpeakingText, buildCueCard } = require('../../../services/speakingImportParser');

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
