'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('confirm-dialog.js');
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('confirmDialog — lazy modal construction', () => {
  test('builds the modal DOM only on first call', () => {
    expect(document.getElementById('shared-confirm-modal')).toBeNull();
    window.confirmDialog('Title', 'Message', () => {});
    expect(document.getElementById('shared-confirm-modal')).not.toBeNull();
    expect(document.querySelectorAll('#shared-confirm-modal').length).toBe(1);
  });

  test('reuses the same modal node on a second call rather than creating a duplicate', () => {
    window.confirmDialog('First', 'Msg 1', () => {});
    const first = document.getElementById('shared-confirm-modal');

    window.confirmDialog('Second', 'Msg 2', () => {});
    const second = document.getElementById('shared-confirm-modal');

    expect(second).toBe(first);
    expect(document.querySelectorAll('#shared-confirm-modal').length).toBe(1);
  });

  test('updates title and message text on each call', () => {
    window.confirmDialog('Delete item?', 'This cannot be undone.', () => {});
    expect(document.getElementById('shared-confirm-title').textContent).toBe('Delete item?');
    expect(document.getElementById('shared-confirm-msg').textContent).toBe('This cannot be undone.');

    window.confirmDialog('Log out?', 'Are you sure?', () => {});
    expect(document.getElementById('shared-confirm-title').textContent).toBe('Log out?');
    expect(document.getElementById('shared-confirm-msg').textContent).toBe('Are you sure?');
  });

  test('modal is visible (hidden class removed) after calling', () => {
    window.confirmDialog('T', 'M', () => {});
    expect(document.getElementById('shared-confirm-modal').classList.contains('hidden')).toBe(false);
  });
});

describe('confirmDialog — button behavior', () => {
  test('clicking the OK/confirm button invokes the callback and hides the modal', () => {
    const onOk = jest.fn();
    window.confirmDialog('Delete?', 'Sure?', onOk);

    const okBtn = document.getElementById('shared-confirm-ok');
    okBtn.click();

    expect(onOk).toHaveBeenCalledTimes(1);
    expect(document.getElementById('shared-confirm-modal').classList.contains('hidden')).toBe(true);
  });

  test('clicking the cancel button does NOT invoke the callback, and hides the modal', () => {
    const onOk = jest.fn();
    window.confirmDialog('Delete?', 'Sure?', onOk);

    const cancelBtn = document.getElementById('shared-confirm-cancel');
    cancelBtn.click();

    expect(onOk).not.toHaveBeenCalled();
    expect(document.getElementById('shared-confirm-modal').classList.contains('hidden')).toBe(true);
  });

  test('default confirmLabel is "Xóa"', () => {
    window.confirmDialog('T', 'M', () => {});
    expect(document.getElementById('shared-confirm-ok').textContent).toBe('Xóa');
  });

  test('opts.confirmLabel overrides the OK button label', () => {
    window.confirmDialog('T', 'M', () => {}, { confirmLabel: 'Yes, delete' });
    expect(document.getElementById('shared-confirm-ok').textContent).toBe('Yes, delete');
  });
});

describe('confirm2 (dashboard.js back-compat alias)', () => {
  test('delegates to confirmDialog with confirmLabel "Confirm delete"', () => {
    const onOk = jest.fn();
    window.confirm2('Remove student', 'This will remove the record.', onOk);

    expect(document.getElementById('shared-confirm-title').textContent).toBe('Remove student');
    expect(document.getElementById('shared-confirm-ok').textContent).toBe('Confirm delete');

    document.getElementById('shared-confirm-ok').click();
    expect(onOk).toHaveBeenCalledTimes(1);
  });
});

describe('showConfirm (inbox.js back-compat alias)', () => {
  test('delegates to confirmDialog with a fixed "Xác nhận" title and "Xóa" confirm label', () => {
    const onOk = jest.fn();
    window.showConfirm('Delete this message?', onOk);

    expect(document.getElementById('shared-confirm-title').textContent).toBe('Xác nhận');
    expect(document.getElementById('shared-confirm-msg').textContent).toBe('Delete this message?');
    expect(document.getElementById('shared-confirm-ok').textContent).toBe('Xóa');

    document.getElementById('shared-confirm-cancel').click();
    expect(onOk).not.toHaveBeenCalled();
  });
});
