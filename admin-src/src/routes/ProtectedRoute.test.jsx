import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Imported after the mock so it picks up the mocked useAuth.
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
  let originalLocation;

  beforeEach(() => {
    mockUseAuth.mockReset();
    originalLocation = window.location;
    delete window.location;
    // ProtectedRoute redirects via window.location.href, not react-router's
    // Navigate (the import is unused in the source) — jsdom doesn't
    // implement real navigation, so we swap in a plain mock object.
    window.location = { href: '', hash: '#/dashboard' };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('shows a loading state while auth is still resolving', () => {
    mockUseAuth.mockReturnValue({ token: null, loading: true, isAdmin: false, isTeacher: false });
    render(<ProtectedRoute><div>secret</div></ProtectedRoute>);
    expect(screen.getByText(/Đang kiểm tra quyền truy cập/)).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('renders children when authenticated with the default (teacher) role', () => {
    mockUseAuth.mockReturnValue({ token: 'abc', loading: false, isAdmin: false, isTeacher: true });
    render(<ProtectedRoute><div>secret content</div></ProtectedRoute>);
    expect(screen.getByText('secret content')).toBeInTheDocument();
  });

  it('renders children when authenticated as admin on an admin-only route', () => {
    mockUseAuth.mockReturnValue({ token: 'abc', loading: false, isAdmin: true, isTeacher: true });
    render(<ProtectedRoute role="admin"><div>admin content</div></ProtectedRoute>);
    expect(screen.getByText('admin content')).toBeInTheDocument();
  });

  it('redirects to login when there is no token', () => {
    mockUseAuth.mockReturnValue({ token: null, loading: false, isAdmin: false, isTeacher: false });
    const { container } = render(<ProtectedRoute><div>secret</div></ProtectedRoute>);
    expect(window.location.href).toContain('/login.html?next=');
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects a logged-in teacher away from an admin-only route', () => {
    mockUseAuth.mockReturnValue({ token: 'abc', loading: false, isAdmin: false, isTeacher: true });
    const { container } = render(<ProtectedRoute role="admin"><div>admin secret</div></ProtectedRoute>);
    expect(window.location.href).toContain('/login.html?next=');
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('admin secret')).not.toBeInTheDocument();
  });

  it('encodes the current hash into the redirect-back "next" param', () => {
    window.location.hash = '#/writing-grades';
    mockUseAuth.mockReturnValue({ token: null, loading: false, isAdmin: false, isTeacher: false });
    render(<ProtectedRoute><div>secret</div></ProtectedRoute>);
    expect(window.location.href).toBe(
      '/login.html?next=' + encodeURIComponent('/admin/#/writing-grades')
    );
  });
});
