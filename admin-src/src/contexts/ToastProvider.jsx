import { useState, useCallback } from 'react';
import { ToastContext } from './ToastContext';

// Mirrors the public site's toast icon-per-type idea (js/shared/toast.js),
// but as emoji rather than Font Awesome glyphs — admin has no FA stylesheet
// loaded anywhere (it uses emoji for every other icon in this app, e.g.
// Messages.jsx's 📤/📥/🚩/✏️/🗑), so FA classes here would just render blank.
const ICON = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Stacks (public site behaviour) instead of the previous single-slot
  // toast, which silently restarted/replaced itself if a second message
  // arrived before the first had finished showing.
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
