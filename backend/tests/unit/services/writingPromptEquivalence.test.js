const { groupEquivalentDocs, normalizePrompt } = require('../../../services/resourceCompletionService');

describe('writing prompt equivalence (homework twin copies)', () => {
  test('normalizePrompt ignores case, punctuation and spacing', () => {
    expect(normalizePrompt('The way people  communicate. Do you agree?'))
      .toBe(normalizePrompt('the way peoplecommunicate - do you agree'));
  });

  test('groups identical text and duplicateOf links; leaves others alone', () => {
    const { groupOf } = groupEquivalentDocs([
      { _id: 'a', prompt: 'Chart about websites' },
      { _id: 'b', prompt: 'Two pie charts, male and female students', duplicateOf: 'a' },
      { _id: 'c', prompt: 'chart about  WEBSITES!' },
      { _id: 'd', prompt: 'Milk production diagram' },
      { _id: 'e', prompt: '' },
      { _id: 'f', prompt: '' },
    ]);
    expect(groupOf.get('a')).toBe(groupOf.get('b'));
    expect(groupOf.get('a')).toBe(groupOf.get('c'));
    expect(groupOf.get('d')).not.toBe(groupOf.get('a'));
    // Empty prompts must not all collapse into one group.
    expect(groupOf.get('e')).not.toBe(groupOf.get('f'));
  });
});
