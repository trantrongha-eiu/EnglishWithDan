// Unit tests for middleware/mongoSanitize.js — the app's primary NoSQL
// injection defense. Strips any key starting with '$' or containing '.'
// from req.body/params/query, recursing into nested objects and arrays up
// to a depth cap of 5, mutating each object's own keys in place (rather
// than reassigning req.query, which Express 5 disallows).
const mongoSanitize = require('../../../middleware/mongoSanitize');

function run(req) {
  const next = jest.fn();
  mongoSanitize(req, {}, next);
  return next;
}

describe('mongoSanitize middleware', () => {
  test('strips a top-level $-prefixed key from req.body', () => {
    const req = { body: { $where: 'evil', name: 'ok' }, params: {}, query: {} };
    const next = run(req);

    expect(req.body).not.toHaveProperty('$where');
    expect(req.body.name).toBe('ok');
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('strips a top-level $-prefixed key from req.params independently', () => {
    const req = { body: {}, params: { $gt: 'evil', id: '123' }, query: {} };
    run(req);

    expect(req.params).not.toHaveProperty('$gt');
    expect(req.params.id).toBe('123');
  });

  test('strips a top-level $-prefixed key from req.query independently', () => {
    const req = { body: {}, params: {}, query: { $ne: null, search: 'ielts' } };
    run(req);

    expect(req.query).not.toHaveProperty('$ne');
    expect(req.query.search).toBe('ielts');
  });

  test('strips a dotted key (e.g. "a.b")', () => {
    const req = { body: { 'a.b': 'x', safe: 'y' }, params: {}, query: {} };
    run(req);

    expect(req.body).not.toHaveProperty('a.b');
    expect(req.body.safe).toBe('y');
  });

  test('recurses into a nested object, stripping the inner $-key but keeping the parent object', () => {
    const req = { body: { user: { $gt: '' } }, params: {}, query: {} };
    run(req);

    expect(req.body.user).toBeDefined();
    expect(req.body.user).not.toHaveProperty('$gt');
    expect(Object.keys(req.body.user)).toHaveLength(0);
  });

  test('recurses into a nested object, preserving sibling safe keys', () => {
    const req = { body: { user: { $gt: '', name: 'Dan' } }, params: {}, query: {} };
    run(req);

    expect(req.body.user).not.toHaveProperty('$gt');
    expect(req.body.user.name).toBe('Dan');
  });

  test('recurses into an array of objects, stripping $-keys inside array elements', () => {
    const req = { body: { list: [{ $ne: null }, { safe: 'ok' }] }, params: {}, query: {} };
    run(req);

    expect(req.body.list[0]).not.toHaveProperty('$ne');
    expect(req.body.list[1].safe).toBe('ok');
  });

  test('leaves normal keys/values completely untouched (control case)', () => {
    const req = {
      body: { name: 'Dan', age: 30, nested: { a: 1, b: [1, 2, 3] } },
      params: { id: 'abc123' },
      query: { page: '2', filter: 'active' },
    };
    run(req);

    expect(req.body).toEqual({ name: 'Dan', age: 30, nested: { a: 1, b: [1, 2, 3] } });
    expect(req.params).toEqual({ id: 'abc123' });
    expect(req.query).toEqual({ page: '2', filter: 'active' });
  });

  test('a $-key at exactly depth 6 (beyond the depth>5 cap) is NOT stripped', () => {
    // stripMongoOperators(obj, depth=0) is called on req.body directly (depth 0).
    // It recurses into a nested object incrementing depth by 1 each call, but
    // the `depth > 5` guard only bails out BEFORE processing keys at that depth.
    // depth progression when descending object-by-object from req.body:
    // body call: depth=0 (processes keys, recurses at depth+1=1)
    // l1: depth=1 (processes keys, recurses at depth+1=2)
    // l2: depth=2, l3: depth=3, l4: depth=4, l5: depth=5 (still processes, depth>5 is false)
    // l6: depth=6 -> `depth > 5` true -> returns immediately without stripping.
    const deepEvil = { $where: 'evil at depth 6' };
    const req = {
      body: { l1: { l2: { l3: { l4: { l5: { l6: deepEvil } } } } } },
      params: {},
      query: {},
    };
    run(req);

    // l6 object itself (depth=6) is never processed, so its $where key survives.
    expect(req.body.l1.l2.l3.l4.l5.l6).toHaveProperty('$where', 'evil at depth 6');
  });

  test('a $-key at depth 5 or shallower IS stripped', () => {
    const req = {
      body: { l1: { l2: { l3: { l4: { $where: 'evil at depth 5' } } } } },
      params: {},
      query: {},
    };
    run(req);

    expect(req.body.l1.l2.l3.l4).not.toHaveProperty('$where');
  });

  test('calls next() exactly once with no arguments', () => {
    const req = { body: {}, params: {}, query: {} };
    const next = run(req);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('handles missing body/params/query gracefully without throwing', () => {
    const req = {};
    expect(() => run(req)).not.toThrow();
  });

  test('does not descend into non-plain-object values like Date or null', () => {
    const req = { body: { when: new Date(), nothing: null, count: 0 }, params: {}, query: {} };
    expect(() => run(req)).not.toThrow();
    expect(req.body.nothing).toBeNull();
    expect(req.body.count).toBe(0);
  });
});
