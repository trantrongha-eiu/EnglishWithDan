import { useState, useCallback } from 'react';
import { ToastContext } from './ToastContext';

const ICON = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { msg, type, id }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast show ${t.type}`}>
            <span className="toast-icon">{ICON[t.type] || ICON.info}</span>
            <span className="toast-msg">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
