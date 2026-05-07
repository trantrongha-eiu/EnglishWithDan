import { useState, useCallback, createContext, useContext } from 'react';

const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((msg, onOk) => {
    setState({ msg, onOk });
  }, []);

  function ok() { state?.onOk(); setState(null); }
  function cancel() { setState(null); }

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={cancel}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Xác nhận</h3>
            </div>
            <div style={{ padding: '20px 24px', color: 'var(--text2)', lineHeight: 1.6 }}>
              {state.msg}
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '0 24px 20px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={cancel}>Huỷ</button>
              <button className="btn btn-danger" onClick={ok}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmCtx);
}
