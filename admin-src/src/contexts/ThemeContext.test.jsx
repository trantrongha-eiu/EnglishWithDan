import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function Consumer() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>{theme}</button>;
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to dark theme when nothing is persisted', () => {
    render(<ThemeProvider><Consumer /></ThemeProvider>);
    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('reads a persisted theme from localStorage on init', () => {
    localStorage.setItem('admin-theme', 'light');
    render(<ThemeProvider><Consumer /></ThemeProvider>);
    expect(screen.getByRole('button')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggle flips the theme, persists it, and updates the document attribute', () => {
    render(<ThemeProvider><Consumer /></ThemeProvider>);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('light');
    expect(localStorage.getItem('admin-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('dark');
    expect(localStorage.getItem('admin-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
