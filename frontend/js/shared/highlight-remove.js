/* ═══════════════════════════════════════════════════════
   highlight-remove.js — click a <span class="hl"> highlight to get a
   small "Xóa" button right above it, letting the student undo it.
   Shared between reading.html (reading-v2.js) and listening.html, which
   both create highlights the same way (wrap the selection in
   <span class="hl">...</span> via Range.surroundContents) but previously
   had no way to remove one short of re-loading the page.
   Self-contained: no dependency on either page's own state object, so it
   works the same regardless of which tool (highlight/dict/none) is active.
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var _btn = null;
  var _activeSpan = null;

  function _ensureButton() {
    if (_btn) return _btn;
    _btn = document.createElement('button');
    _btn.type = 'button';
    _btn.id = 'hl-remove-btn';
    _btn.innerHTML = '<i class="fas fa-trash-alt"></i> Xóa highlight';
    _btn.style.cssText = [
      'position:fixed', 'z-index:3000', 'display:none',
      'background:#1f2937', 'color:#fff', 'border:none', 'border-radius:7px',
      'padding:6px 12px', 'font-size:12px', 'font-weight:600', 'cursor:pointer',
      'box-shadow:0 6px 16px rgba(0,0,0,.25)', 'white-space:nowrap'
    ].join(';');
    document.body.appendChild(_btn);
    _btn.addEventListener('click', function (e) {
      e.stopPropagation();
      _removeActiveHighlight();
      _hide();
    });
    return _btn;
  }

  function _removeActiveHighlight() {
    var span = _activeSpan;
    if (!span || !span.parentNode) return;
    var parent = span.parentNode;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
    parent.normalize(); // merge the now-adjacent text nodes back together
  }

  function _hide() {
    if (_btn) _btn.style.display = 'none';
    _activeSpan = null;
  }

  function _showFor(span) {
    var btn = _ensureButton();
    _activeSpan = span;
    btn.style.display = 'block';
    var rect = span.getBoundingClientRect();
    var left = rect.left + rect.width / 2 - btn.offsetWidth / 2;
    left = Math.max(6, Math.min(left, window.innerWidth - btn.offsetWidth - 6));
    var top = rect.top - btn.offsetHeight - 8;
    if (top < 6) top = rect.bottom + 8; // flip below when too close to the top of the viewport
    btn.style.left = left + 'px';
    btn.style.top = top + 'px';
  }

  document.addEventListener('click', function (e) {
    if (e.target === _btn || (_btn && _btn.contains(e.target))) return; // its own click handler deals with this
    var span = e.target.closest && e.target.closest('span.hl');
    // A click that ends a drag-selection (extending/re-selecting across a
    // highlight) shouldn't pop the delete button — only a plain click.
    var sel = window.getSelection();
    var hasLiveSelection = sel && !sel.isCollapsed && sel.toString().trim().length > 0;
    if (span && !hasLiveSelection) _showFor(span);
    else _hide();
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') _hide(); });
  window.addEventListener('scroll', _hide, true);
  window.addEventListener('resize', _hide);
})();
