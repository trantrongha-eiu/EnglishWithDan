'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('route-params.js');
});

// Changing window.location.pathname directly triggers jsdom's "not
// implemented: navigation" warning; history.pushState is the standard
// jsdom-safe way to change the visible URL without a real navigation.
function setPath(path) {
  window.history.pushState({}, '', path);
}

describe('RouteParams.match', () => {
  const READING_TEST_ROUTE = { pattern: /^\/reading\/test\/([^/?#]+)\/?$/, param: 'testId' };
  const LISTENING_ROUTE = { pattern: /^\/listening\/([^/?#]+)\/?$/, param: 'listeningId' };

  test('matches a realistic pattern and extracts the captured param', () => {
    setPath('/reading/test/68abc123');
    const result = window.RouteParams.match([READING_TEST_ROUTE]);
    expect(result).toEqual({ testId: '68abc123' });
  });

  test('checks routes in order and returns the first match', () => {
    setPath('/listening/xyz789');
    const result = window.RouteParams.match([READING_TEST_ROUTE, LISTENING_ROUTE]);
    expect(result).toEqual({ listeningId: 'xyz789' });
  });

  test('URL-decodes the captured param', () => {
    setPath('/reading/test/hello%20world');
    const result = window.RouteParams.match([READING_TEST_ROUTE]);
    expect(result).toEqual({ testId: 'hello world' });
  });

  test('returns null when the path does not match any given route', () => {
    setPath('/dashboard.html');
    const result = window.RouteParams.match([READING_TEST_ROUTE, LISTENING_ROUTE]);
    expect(result).toBeNull();
  });

  test('returns null for an empty routes array', () => {
    setPath('/reading/test/68abc123');
    expect(window.RouteParams.match([])).toBeNull();
  });

  test('does not match a path missing the required trailing id segment', () => {
    setPath('/reading/test/');
    const result = window.RouteParams.match([READING_TEST_ROUTE]);
    expect(result).toBeNull();
  });
});

describe('RouteParams.examMode / examSuffix', () => {
  test('reads a valid ?exam= mode', () => {
    setPath('/reading.html?passageId=abc&exam=simulation');
    expect(window.RouteParams.examMode()).toBe('simulation');
    setPath('/reading.html?testId=abc&exam=practice');
    expect(window.RouteParams.examMode()).toBe('practice');
  });

  test('ignores a missing or unknown mode', () => {
    setPath('/reading.html?passageId=abc');
    expect(window.RouteParams.examMode()).toBeNull();
    setPath('/reading.html?passageId=abc&exam=hack');
    expect(window.RouteParams.examMode()).toBeNull();
  });

  test('examSuffix only emits valid modes', () => {
    expect(window.RouteParams.examSuffix('simulation')).toBe('&exam=simulation');
    expect(window.RouteParams.examSuffix(null)).toBe('');
    expect(window.RouteParams.examSuffix('x')).toBe('');
  });
});

describe('RouteParams.findTip / syncTip', () => {
  const LESSONS = [
    { category: 'Kỹ thuật', lessonKey: '30-second-strategy' },
    { category: 'Band', lessonKey: 'band-6' },
    { category: 'Band khác', lessonKey: 'band-6' },
  ];

  test('findTip resolves ?tip= to its lesson', () => {
    setPath('/listening.html?mode=tips&tip=30-second-strategy');
    expect(window.RouteParams.findTip(LESSONS)).toBe(LESSONS[0]);
  });

  test('findTip uses &tcat= to pick between duplicate keys', () => {
    setPath('/listening.html?mode=tips&tip=band-6&tcat=' + encodeURIComponent('Band khác'));
    expect(window.RouteParams.findTip(LESSONS)).toBe(LESSONS[2]);
  });

  test('findTip returns null for no/unknown tip', () => {
    setPath('/listening.html?mode=tips');
    expect(window.RouteParams.findTip(LESSONS)).toBeNull();
    setPath('/listening.html?mode=tips&tip=nope');
    expect(window.RouteParams.findTip(LESSONS)).toBeNull();
  });

  test('syncTip pushes the lesson key, keeping other params and history.state', () => {
    window.history.replaceState({ screen: 'list', mode: 'tips' }, '', '/reading.html?mode=tips');
    const before = window.history.length;
    window.RouteParams.syncTip(LESSONS[0], LESSONS, true);
    expect(window.location.search).toBe('?mode=tips&tip=30-second-strategy');
    expect(window.history.state).toEqual({ screen: 'list', mode: 'tips', tip: '30-second-strategy' });
    expect(window.history.length).toBe(before + 1);
  });

  test('syncTip adds tcat only for an ambiguous key, and replace adds no entry', () => {
    window.history.replaceState({}, '', '/reading.html?mode=tips&tip=30-second-strategy');
    const before = window.history.length;
    window.RouteParams.syncTip(LESSONS[1], LESSONS, false);
    const p = new URLSearchParams(window.location.search);
    expect(p.get('tip')).toBe('band-6');
    expect(p.get('tcat')).toBe('Band');
    expect(window.history.length).toBe(before);
    window.RouteParams.syncTip(LESSONS[0], LESSONS, false);
    expect(new URLSearchParams(window.location.search).get('tcat')).toBeNull();
  });

  test('syncTip is a no-op when the URL already points at the lesson', () => {
    window.history.replaceState({ a: 1 }, '', '/reading.html?mode=tips&tip=30-second-strategy');
    const before = window.history.length;
    window.RouteParams.syncTip(LESSONS[0], LESSONS, true);
    expect(window.history.length).toBe(before);
    expect(window.history.state).toEqual({ a: 1 });
  });
});
