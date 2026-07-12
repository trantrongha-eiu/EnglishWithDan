import { createContext, useContext } from 'react';

// ConfirmProvider lives in ./ConfirmProvider.jsx — split out so this file
// only exports the context/hook (react-refresh/only-export-components
// wants a file to export either components or non-components, not a mix).
export const ConfirmCtx = createContext(null);

export function useConfirm() {
  return useContext(ConfirmCtx);
}
