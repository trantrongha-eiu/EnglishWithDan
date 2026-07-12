'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('toast.js');
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('showToast', () => {
  test('creates a #toast-container in document.body on first call', () => {
    expect(document.getElementById('toast-container')).toBeNull();
    window.showToast('Hello world', 'success');
    const container = document.getElementById('toast-container');
    expect(container).not.toBeNull();
    expect(container.className).toBe('toast-container');
  });

  test('appends a .toast element with the "info" type class by default', () => {
    window.showToast('Default type message');
    const el = document.querySelector('.toast');
    expect(el).not.toBeNull();
    expect(el.classList.contains('info')).toBe(true);
  });

  test('appends a .toast element with the given type class and message text', () => {
    window.showToast('Saved successfully', 'success');
    const el = document.querySelector('.toast.success');
    expect(el).not.toBeNull();
    expect(el.querySelector('.toast-msg').textContent).toBe('Saved successfully');
    // No title element for the plain showToast() signature.
    expect(el.querySelector('.toast-title')).toBeNull();
  });

  test('reuses the same #toast-container across multiple calls', () => {
    window.showToast('first');
    const container1 = document.getElementById('toast-container');
    window.showToast('second');
    const container2 = document.getElementById('toast-container');
    expect(container1).toBe(container2);
    expect(container1.querySelectorAll('.toast').length).toBe(2);
  });
});

describe('showToastWithTitle', () => {
  test('renders both a title and a message', () => {
    window.showToastWithTitle('warning', 'Heads up', 'Something needs attention');
    const el = document.querySelector('.toast.warning');
    expect(el.querySelector('.toast-title').textContent).toBe('Heads up');
    expect(el.querySelector('.toast-msg').textContent).toBe('Something needs attention');
  });
});

describe('toast() / showVocabToast() aliases', () => {
  test('toast() defaults to type "success"', () => {
    window.toast('Word added');
    const el = document.querySelector('.toast');
    expect(el.classList.contains('success')).toBe(true);
    expect(el.querySelector('.toast-msg').textContent).toBe('Word added');
  });

  test('showVocabToast() behaves the same as toast()', () => {
    window.showVocabToast('Word removed', 'error');
    const el = document.querySelector('.toast.error');
    expect(el.querySelector('.toast-msg').textContent).toBe('Word removed');
  });
});

describe('XSS safety of caller-supplied text', () => {
  test('message text is set via textContent, so markup in the message is NOT parsed as HTML', () => {
    const malicious = '<img src=x onerror="alert(1)">';
    window.showToast(malicious, 'error');
    const msgEl = document.querySelector('.toast-msg');
    // textContent read-back is the literal string...
    expect(msgEl.textContent).toBe(malicious);
    // ...and no actual <img> element was created inside it.
    expect(msgEl.querySelector('img')).toBeNull();
    // Its serialized innerHTML has the tag escaped, proving it's inert text.
    expect(msgEl.innerHTML).toContain('&lt;img');
  });

  test('title text (showToastWithTitle) is also set via textContent and stays inert', () => {
    const malicious = '<script>alert(1)</script>';
    window.showToastWithTitle('error', malicious, 'body');
    const titleEl = document.querySelector('.toast-title');
    expect(titleEl.textContent).toBe(malicious);
    expect(titleEl.querySelector('script')).toBeNull();
  });
});
