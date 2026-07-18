/**
 * shared/confirm-dialog.js — ConfirmDialogService
 *
 * Single source of truth for the "are you sure?" confirmation prompt,
 * replacing dashboard.js's confirm2() (which depended on static markup
 * baked into dashboard.html) and inbox.js's showConfirm() (which built its
 * own one-off modal DOM with inline styles).
 *
 * Builds its own modal on first use via css/components.css's
 * .modal-overlay/.modal-box/.modal-body/.modal-footer classes (Phase 2) —
 * no page-specific markup required, so this is safe to use on any page.
 *
 * Both original call signatures are preserved as aliases so no call site
 * needed to change:
 *   confirm2(title, msg, onOk)       — dashboard.js's 7 call sites
 *   showConfirm(msg, onOk)           — inbox.js's 2 call sites
 */
(function () {
  'use strict';

  function ensureModal() {
    var modal = document.getElementById('shared-confirm-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'shared-confirm-modal';
    modal.className = 'modal-overlay hidden';
    modal.innerHTML =
      '<div class="modal-box modal-sm">' +
        '<div class="modal-body" style="text-align:center;padding-top:24px">' +
          '<h3 id="shared-confirm-title" style="margin-bottom:8px"></h3>' +
          '<p id="shared-confirm-msg" style="color:var(--text2);font-size:14px"></p>' +
        '</div>' +
        '<div class="modal-footer" style="justify-content:center">' +
          '<button class="btn btn-ghost" id="shared-confirm-cancel">Hủy</button>' +
          '<button class="btn" id="shared-confirm-ok"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    function close() { modal.classList.add('hidden'); }
    modal._close = close;
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

    return modal;
  }

  window.confirmDialog = function (title, message, onOk, opts) {
    opts = opts || {};
    var modal = ensureModal();
    document.getElementById('shared-confirm-title').textContent = title;
    document.getElementById('shared-confirm-msg').textContent = message;
    var okBtn = document.getElementById('shared-confirm-ok');
    okBtn.textContent = opts.confirmLabel || 'Xóa';
    // Red/danger by default (matches every existing call site, all
    // destructive deletes) — non-destructive confirmations (switch mode,
    // restart, etc.) can opt into a neutral style via opts.confirmClass.
    okBtn.className = 'btn ' + (opts.confirmClass || 'btn-danger');
    okBtn.onclick = function () { modal._close(); onOk(); };
    document.getElementById('shared-confirm-cancel').onclick = modal._close;
    modal.classList.remove('hidden');
  };

  // Back-compat aliases — exact original button labels preserved.
  window.confirm2 = function (title, msg, onOk) {
    window.confirmDialog(title, msg, onOk, { confirmLabel: 'Confirm delete' });
  };
  window.showConfirm = function (msg, onOk) {
    window.confirmDialog('Xác nhận', msg, onOk, { confirmLabel: 'Xóa' });
  };
})();
