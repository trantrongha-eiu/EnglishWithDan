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
