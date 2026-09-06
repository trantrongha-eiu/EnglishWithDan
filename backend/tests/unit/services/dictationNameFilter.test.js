'use strict';

const { nameFlag, dropNameHeavySentences, buildLexicon } = require('../../../services/dictationNameFilter');

describe('dictationNameFilter.nameFlag', () => {
  it('flags a sentence spelled out letter by letter', () => {
    expect(nameFlag('It is spelled W-O-O-D-S-I-D-E for the record.')).toMatch(/spelled-out/);
    expect(nameFlag("It's K-I-double-P-A-X.")).toMatch(/spelled-out/);
  });

  it('flags a sentence built around an unspellable proper name', () => {
    expect(nameFlag('Today I will talk about the language Bishlama.')).toMatch(/proper name/);
    expect(nameFlag('The ferry crossing from England to Santander takes a day.')).toMatch(/proper name/);
    expect(nameFlag('The first one is in Wivenhoe Street.')).toMatch(/proper name/);
    expect(nameFlag('the ideas of Marc Prensky,')).toMatch(/proper name/);
  });

  it('keeps a sentence whose only proper nouns are common and spellable', () => {
    expect(nameFlag('The ferry from England to France takes a day.')).toBe('');
    expect(nameFlag('On Monday she flies to Australia for a conference.')).toBe('');
    expect(nameFlag("Hello, this is Amber - you said to phone on Tuesday.")).toBe('');
    expect(nameFlag('We arrived in Aberdeen before the ferry left.')).toBe('');
  });

  it('keeps real English words that are only capitalised because of a title', () => {
    expect(nameFlag("It's one of the few places in the Southern Hemisphere.")).toBe('');
    expect(nameFlag('and it is called the Prescription Drug Assistance,')).toBe('');
    expect(nameFlag('has been used to take X-rays of the mechanism.')).toBe('');
    expect(nameFlag('as Bell-miner Associated Die-back.')).toBe('');
  });

  it('does not flag a proper noun that merely starts the sentence', () => {
    expect(nameFlag('Wivenhoe is a small town near the river.')).toBe('');
  });

  it('is not fooled by contractions', () => {
    expect(nameFlag("I'll be moving to a new flat, and I'm bringing the cat.")).toBe('');
  });
});

describe('dictationNameFilter.dropNameHeavySentences', () => {
  it('splits a unit list into kept / dropped with reasons', () => {
    const units = [
      { text: 'She joined the marketing team in March.', start: 0, end: 3 },
      { text: 'It is held at Waiohika Vineyard,', start: 3, end: 6 },
      { text: 'Around the corner is Mahia Peninsula,', start: 6, end: 9 },
      { text: 'You should also visit the hot springs.', start: 9, end: 12 },
    ];
    const { kept, dropped } = dropNameHeavySentences(units);
    expect(kept.map(u => u.text)).toEqual([
      'She joined the marketing team in March.',
      'You should also visit the hot springs.',
    ]);
    expect(dropped).toHaveLength(2);
    expect(dropped[0].reason).toMatch(/proper name/);
  });

  it('a supplied corpus lexicon rescues a real word seen lowercase elsewhere', () => {
    const lex = buildLexicon(['the vineyard was full of visitors that afternoon']);
    const units = [{ text: 'It is held at the Vineyard this year,', start: 0, end: 3 }];
    expect(dropNameHeavySentences(units, lex).dropped).toHaveLength(0);
  });
});
