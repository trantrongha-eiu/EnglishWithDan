'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('task2-highlight.js');
});

beforeEach(() => {
  try { localStorage.clear(); } catch (_) { /* ignore */ }
});

const BODY = 'There are several reasons. One reason is cost. This is because prices rose. '
  + 'For instance, rents doubled. Another reason is time. People work longer.';
const HL = [
  { role: 'topic', text: 'There are several reasons.' },
  { role: 'idea1', text: 'One reason is cost.' },
  { role: 'support1', text: 'This is because prices rose.' },
  { role: 'support1', text: 'For instance, rents doubled.' },
  { role: 'idea2', text: 'Another reason is time.' },
  { role: 'support2', text: 'People work longer.' },
];

function render(text, hl) {
  const div = document.createElement('div');
  div.innerHTML = window.T2Highlight.html(text, hl);
  return div;
}

describe('T2Highlight.html', () => {
  test('wraps every tagged sentence with its role class and keeps the text intact', () => {
    const div = render(BODY, HL);
    const spans = div.querySelectorAll('.t2hl');
    expect(spans).toHaveLength(6);
    expect([...spans].map(s => s.className.replace('t2hl t2hl--', ''))).toEqual(
      ['topic', 'idea1', 'support1', 'support1', 'idea2', 'support2']);
    // ::before labels are CSS-only, so copying via textContent is unchanged.
    expect(div.textContent).toBe(BODY);
  });

  test('only the first sentence of a same-role run carries the label', () => {
    const spans = render(BODY, HL).querySelectorAll('.t2hl--support1');
    expect(spans[0].getAttribute('data-label')).toBe('Support 1');
    expect(spans[1].hasAttribute('data-label')).toBe(false);
  });

  test('matches across different whitespace (line breaks / double spaces)', () => {
    const text = 'There  are several\nreasons. One reason is cost.';
    const div = render(text, HL.slice(0, 2));
    expect(div.querySelectorAll('.t2hl')).toHaveLength(2);
    expect(div.textContent).toBe(text);
  });

  test('skips highlights that no longer match and unknown roles', () => {
    const div = render(BODY, [
      { role: 'topic', text: 'This sentence was edited away.' },
      { role: 'bogus', text: 'One reason is cost.' },
      { role: 'idea2', text: 'Another reason is time.' },
    ]);
    const spans = div.querySelectorAll('.t2hl');
    expect(spans).toHaveLength(1);
    expect(spans[0].classList.contains('t2hl--idea2')).toBe(true);
  });

  test('escapes HTML in the body and in the highlighted text', () => {
    const div = render('A <b>bold</b> claim. Second.', [{ role: 'hook', text: 'A <b>bold</b> claim.' }]);
    expect(div.querySelector('b')).toBeNull();
    expect(div.querySelector('.t2hl--hook').textContent).toBe('A <b>bold</b> claim.');
  });

  test('handles regex metacharacters and repeated sentences without overlap', () => {
    const text = 'Costs rose (by 40%)? Yes. Yes.';
    const div = render(text, [
      { role: 'idea1', text: 'Costs rose (by 40%)?' },
      { role: 'support1', text: 'Yes.' },
      { role: 'support1', text: 'Yes.' },
    ]);
    expect(div.querySelectorAll('.t2hl')).toHaveLength(3);
    expect(div.textContent).toBe(text);
  });

  test('no highlights → plain escaped text', () => {
    expect(window.T2Highlight.html('a < b', [])).toBe('a &lt; b');
    expect(window.T2Highlight.html('a < b', undefined)).toBe('a &lt; b');
  });
});

describe('T2Highlight legend + toggle', () => {
  test('hasAny detects sections with highlights', () => {
    expect(window.T2Highlight.hasAny([{ content: 'x' }])).toBe(false);
    expect(window.T2Highlight.hasAny([{ content: 'x', highlights: [] }, { highlights: HL }])).toBe(true);
  });

  test('legend lists only the roles in use, in reading order', () => {
    const div = document.createElement('div');
    div.innerHTML = window.T2Highlight.legend([{ highlights: [HL[4], HL[0]] }]);
    const chips = [...div.querySelectorAll('.t2hl-chip')].map(c => c.className.replace('t2hl-chip t2hl-chip--', ''));
    expect(chips).toEqual(['topic', 'idea2']);
  });

  test('toggle flips the root class and remembers the choice', () => {
    const root = document.createElement('div');
    root.className = 't2hl-root';
    root.innerHTML = window.T2Highlight.legend([{ highlights: HL }]);
    document.body.appendChild(root);
    const btn = root.querySelector('.t2hl-toggle');

    window.T2Highlight.toggle(btn);
    expect(root.classList.contains('t2hl-off')).toBe(true);
    expect(window.T2Highlight.isOff()).toBe(true);

    const other = document.createElement('div');
    window.T2Highlight.applyPref(other);
    expect(other.classList.contains('t2hl-off')).toBe(true);

    window.T2Highlight.toggle(btn);
    expect(root.classList.contains('t2hl-off')).toBe(false);
    expect(window.T2Highlight.isOff()).toBe(false);
    root.remove();
  });
});
