/* ═══════════════════════════════════════════════════════
   highlight-remove.js — click a <span class="hl"> highlight to get a
   small floating panel right above it: a row of color swatches to
   re-color the highlight, plus a trash icon to remove it.
   Shared between reading.html (reading-v2.js) and listening.html, which
   both create highlights the same way (wrap the selection in
   <span class="hl">...</span> via Range.surroundContents) but previously
   had no way to remove or re-color one short of re-loading the page.
   Self-contained: no dependency on either page's own state object, so it
   works the same regardless of which tool (highlight/dict/none) is active.
   Any change (recolor or remove) fires a 'hl:changed' event on document —
   each page listens for that to persist its own highlights to localStorage
   (see the mouseup handler right next to it in reading-v2.js/listening.html
   for the save functions this mirrors).
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // key === '' is the original/default color (no extra class — the .hl
  // base rule's color, unchanged from before this palette existed, so
  // every highlight ever saved with plain class="hl" keeps looking the
  // same). The others add a modifier class defined in reading.css/listening.css.
  var COLORS = [
    { key: '', hex: '#fbbf24', label: 'Vàng (mặc định)' },
    { key: 'green', hex: '#4ade80', label: 'Xanh lá' },
    { key: 'purple', hex: '#c084fc', label: 'Tím' },
    { key: 'pink', hex: '#f472b6', label: 'Hồng' },
    { key: 'orange', hex: '#fb923c', label: 'Cam' },
  ];

  var _panel = null;
  var _activeSpan = null;

  // Two-phase so a page whose save routing depends on which container the
  // highlight lives in (e.g. listening.html's main-test vs practice-mode
  // storage) can inspect the span's still-attached ancestry in
  // 'hl:willChange' and remember it, then actually persist in 'hl:changed'
  // once the DOM mutation (recolor/removal) below has already happened —
  // by then the span may be detached (removal unwraps it), so ancestry
  // checks must happen in the "will" phase, not the "changed" one.
  function _fireWillChange() {
    document.dispatchEvent(new CustomEvent('hl:willChange', { detail: { span: _activeSpan } }));
  }
  function _fireChanged() {
    document.dispatchEvent(new CustomEvent('hl:changed'));
  }

  function _currentColorKey(span) {
    for (var i = 1; i < COLORS.length; i++) {
      if (span.classList.contains('hl-' + COLORS[i].key)) return COLORS[i].key;
    }
    return '';
  }

  function _applyColor(span, key) {
    for (var i = 1; i < COLORS.length; i++) span.classList.remove('hl-' + COLORS[i].key);
    if (key) span.classList.add('hl-' + key);
  }

  function _ensurePanel() {
    if (_panel) return _panel;
    _panel = document.createElement('div');
    _panel.id = 'hl-edit-panel';
    _panel.style.cssText = [
      'position:fixed', 'z-index:3000', 'display:none',
      'align-items:center', 'gap:6px',
      'background:#1f2937', 'border-radius:9px',
      'padding:6px 8px', 'box-shadow:0 6px 16px rgba(0,0,0,.25)', 'white-space:nowrap'
    ].join(';');

    COLORS.forEach(function (c) {
      var sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'hl-edit-swatch';
      sw.dataset.colorKey = c.key;
      sw.title = c.label;
      sw.style.cssText = [
        'width:20px', 'height:20px', 'border-radius:50%', 'cursor:pointer',
        'background:' + c.hex, 'padding:0', 'box-sizing:border-box'
      ].join(';');
      sw.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!_activeSpan) return;
        _fireWillChange();
        _applyColor(_activeSpan, c.key);
        _fireChanged();
        _hide();
      });
      _panel.appendChild(sw);
    });

    var divider = document.createElement('span');
    divider.style.cssText = 'width:1px;align-self:stretch;background:rgba(255,255,255,.25);margin:0 2px';
    _panel.appendChild(divider);

    var trash = document.createElement('button');
    trash.type = 'button';
    trash.id = 'hl-remove-btn';
    trash.title = 'Xóa highlight';
    trash.innerHTML = '<i class="fas fa-trash-alt"></i>';
    trash.style.cssText = [
      'background:none', 'border:none', 'color:#fff', 'font-size:13px',
      'cursor:pointer', 'padding:4px 2px', 'line-height:1'
    ].join(';');
    trash.addEventListener('click', function (e) {
      e.stopPropagation();
      _fireWillChange();
      _removeActiveHighlight();
      _fireChanged();
      _hide();
    });
    _panel.appendChild(trash);

    document.body.appendChild(_panel);
    return _panel;
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
    if (_panel) _panel.style.display = 'none';
    _activeSpan = null;
  }

  function _showFor(span) {
    var panel = _ensurePanel();
    _activeSpan = span;
    var activeKey = _currentColorKey(span);
    panel.querySelectorAll('.hl-edit-swatch').forEach(function (sw) {
      var isActive = sw.dataset.colorKey === activeKey;
      sw.style.boxShadow = isActive ? '0 0 0 2px #1f2937, 0 0 0 4px #fff' : 'none';
    });
    panel.style.display = 'flex';
    var rect = span.getBoundingClientRect();
    var left = rect.left + rect.width / 2 - panel.offsetWidth / 2;
    left = Math.max(6, Math.min(left, window.innerWidth - panel.offsetWidth - 6));
    var top = rect.top - panel.offsetHeight - 8;
    if (top < 6) top = rect.bottom + 8; // flip below when too close to the top of the viewport
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
  }

  document.addEventListener('click', function (e) {
    if (e.target === _panel || (_panel && _panel.contains(e.target))) return; // its own click handlers deal with this
    var span = e.target.closest && e.target.closest('span.hl');
    // A click that ends a drag-selection (extending/re-selecting across a
    // highlight) shouldn't pop the edit panel — only a plain click.
    var sel = window.getSelection();
    var hasLiveSelection = sel && !sel.isCollapsed && sel.toString().trim().length > 0;
    if (span && !hasLiveSelection) _showFor(span);
    else _hide();
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') _hide(); });
  window.addEventListener('scroll', _hide, true);
  window.addEventListener('resize', _hide);
})();
