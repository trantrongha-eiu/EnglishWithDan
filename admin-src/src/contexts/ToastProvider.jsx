import { useState, useCallback } from 'react';
import { ToastContext } from './ToastContext';

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div key={toast.id} className={`toast show ${toast.type}`}>
          <div className="toast-dot" />
          <span id="toast-msg">{toast.msg}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}
