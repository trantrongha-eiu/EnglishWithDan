import { createContext, useContext } from 'react';

// ToastProvider lives in ./ToastProvider.jsx — split out so this file only
// exports the context/hook (react-refresh/only-export-components wants a
// file to export either components or non-components, not a mix).
export const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}
