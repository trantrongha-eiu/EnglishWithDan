import { createContext, useContext } from 'react';

// ThemeProvider lives in ./ThemeProvider.jsx — split out so this file only
// exports the context/hook (react-refresh/only-export-components wants a
// file to export either components or non-components, not a mix).
export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);
