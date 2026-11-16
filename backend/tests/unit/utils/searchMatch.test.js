'use strict';

const fs = require('fs');
const path = require('path');
const S = require('../../../utils/searchMatch');
const User = require('../../../models/User');
const { createStudent } = require('../../factories/userFactory');

describe('searchMatch', () => {
  // stale copy → run `node scripts/sync-search-match.js` from the repo root
  describe('copies are in sync with backend/utils/searchMatch.js', () => {
    const read = p => fs.readFileSync(path.join(__dirname, '../../../..', p), 'utf8').replace(/\r\n/g, '\n');
    const src = read('backend/utils/searchMatch.js');
    it('frontend/js/shared/search-match.js', () => {
      expect(read('frontend/js/shared/search-match.js')).toBe(src);
    });
    it('admin-src/src/utils/searchMatch.js', () => {
      const { adminModule } = require('../../../../scripts/sync-search-match.js');
      expect(read('admin-src/src/utils/searchMatch.js')).toBe(adminModule(src));
    });
  });

  describe('matches', () => {
    it.each([
      ['Cam 18 - Test 4', 'cam 18 test 4'],
      ['Cam 18 - Test 4', 'cam18t4'],
      ['Cam 18 - Test 4', 'test 4 cam 18'],
      ['Cam 18 - Test 4', 'Cambridge 18'],
      ['Cam 15 - Test 3 – Part 1', 'cam 15 test 3 section 1'],
      ['Actual Mocktest 71', 'mock test 71'],
      ['BEECHEN FESTIVAL', 'fest'],
      ['MockTest  Đề Random', 'de random'],
      ['Theatre Booking', 'đề theatre'],
      [['Nguyễn Văn', 'An'], 'nguyen van an'],
      ['Từ vựng chủ đề Môi trường', 'tu vung moi truong'],
    ])('%j ← %j', (text, q) => {
      expect(S.matches(text, q)).toBe(true);
    });

    it.each([
      ['Vol 10 - Test 4', 'vol 1'],
      ['Swimming Lessons', 'xyz'],
      ['Cam 18 - Test 3', 'cam 18 test 4'],
    ])('%j ✗ %j', (text, q) => {
      expect(S.matches(text, q)).toBe(false);
    });

    it('an empty query matches everything', () => {
      expect(S.matches('anything', '  ')).toBe(true);
      expect(S.filter(['b', 'a'], '')).toEqual(['b', 'a']);
    });
  });

  it('filter ranks exact > starts-with > anywhere; a number must follow its word', () => {
    const list = ['Vol 10 - Test 1', 'Vol 1 - Test 10', 'Vol 1 - Test 1 (old)', 'Old Vol 1 - Test 1', 'Vol 1 - Test 1'];
    expect(S.filter(list, 'vol 1 test 1')).toEqual(['Vol 1 - Test 1', 'Vol 1 - Test 1 (old)', 'Old Vol 1 - Test 1']);
    expect(S.filter(list, 'test 1 vol 1')).toHaveLength(3);
    expect(S.matches('Cam 18 - Test 4', 'c18t4')).toBe(true);
    expect(S.filter([{ t: 'Booking' }, { t: 'x' }], 'book', o => o.t)).toEqual([{ t: 'Booking' }]);
  });

  describe('mongoFilter (server-side)', () => {
    it('returns null for an empty query', () => {
      expect(S.mongoFilter('  ', ['a'])).toBeNull();
    });

    it('finds a full name split across fields, with or without accents', async () => {
      const u = await createStudent({ extra: { firstName: 'Nguyễn Văn', lastName: 'An', username: 'an_nv' } });
      await createStudent({ extra: { firstName: 'Trần', lastName: 'Bình' } });
      const fields = ['username', 'email', 'firstName', 'lastName'];
      for (const q of ['Nguyễn Văn An', 'nguyen van an', 'an nguyen', 'NGUYEN', 'an_nv']) {
        const found = await User.find(S.mongoFilter(q, fields)).select('_id').lean();
        expect(found.map(x => String(x._id))).toEqual([String(u._id)]);
      }
    });

    it('treats regex characters literally', async () => {
      const re = new RegExp(S.wordRegexSource('c++'), 'i');
      expect(re.test('C++ basics')).toBe(true);
      expect(re.test('cc')).toBe(false);
    });
  });
});
