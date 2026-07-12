import { createContext, useContext } from 'react';

// AuthProvider lives in ./AuthProvider.jsx — split out so this file only
// exports the context/hook (react-refresh/only-export-components wants a
// file to export either components or non-components, not a mix).
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}
