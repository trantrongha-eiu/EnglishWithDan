import { useState } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from './AuthContext';
import { AuthProvider } from './AuthProvider';

function Consumer({ onRender }) {
  const auth = useAuth();
  onRender?.(auth);
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="token">{String(auth.token)}</span>
      <span data-testid="isAdmin">{String(auth.isAdmin)}</span>
      <span data-testid="isTeacher">{String(auth.isTeacher)}</span>
    </div>
  );
}

describe('AuthContext', () => {
  let originalLocation;

  beforeEach(() => {
    localStorage.clear();
    originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('starts in a loading state and then reads token/user from localStorage', async () => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'admin', name: 'Dan' }));

    let latest;
    render(<AuthProvider><Consumer onRender={(a) => { latest = a; }} /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(latest.token).toBe('abc123');
    expect(latest.user).toEqual({ id: 1, role: 'admin', name: 'Dan' });
  });

  it('has null token/user when localStorage is empty', async () => {
    render(<AuthProvider><Consumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('token').textContent).toBe('null');
  });

  it('derives isTeacher true / isAdmin false for a teacher role', async () => {
    localStorage.setItem('token', 't1');
    localStorage.setItem('user', JSON.stringify({ role: 'teacher' }));
    render(<AuthProvider><Consumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('isTeacher').textContent).toBe('true');
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
  });

  it('derives both isTeacher and isAdmin true for an admin role', async () => {
    localStorage.setItem('token', 't1');
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
    render(<AuthProvider><Consumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('isTeacher').textContent).toBe('true');
    expect(screen.getByTestId('isAdmin').textContent).toBe('true');
  });

  it('logout clears token, user, and lastLoginAt from localStorage and redirects to login.html', async () => {
    localStorage.setItem('token', 't1');
    localStorage.setItem('user', JSON.stringify({ role: 'teacher' }));
    localStorage.setItem('lastLoginAt', '12345');

    let latest;
    render(<AuthProvider><Consumer onRender={(a) => { latest = a; }} /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    latest.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('lastLoginAt')).toBeNull();
    expect(window.location.href).toBe('/login.html');
  });

  it('keeps the same context value reference across unrelated parent re-renders (memoization)', async () => {
    localStorage.setItem('token', 't1');
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));

    const renders = [];
    function Harness() {
      const [, setTick] = useState(0);
      return (
        <div>
          <button onClick={() => setTick((t) => t + 1)}>tick</button>
          <AuthProvider>
            <Consumer onRender={(a) => renders.push(a)} />
          </AuthProvider>
        </div>
      );
    }

    render(<Harness />);
    await waitFor(() => expect(renders[renders.length - 1].loading).toBe(false));
    const stable = renders[renders.length - 1];
    const countBefore = renders.length;

    fireEvent.click(screen.getByText('tick'));

    await waitFor(() => expect(renders.length).toBeGreaterThan(countBefore));
    expect(renders[renders.length - 1]).toBe(stable);
  });
});
