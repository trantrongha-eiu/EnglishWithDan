import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDataContext } from '../contexts/AdminDataContext';

const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => mockUseAuth() }));

import Sidebar from './Sidebar';

function renderSidebar(badges = null, path = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AdminDataContext.Provider value={{ badges, reloadBadges: () => {} }}>
        <Sidebar mobileOpen={false} onClose={() => {}} compact={false} onToggleCompact={() => {}} />
      </AdminDataContext.Provider>
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseAuth.mockReset();
  });

  it('hides admin-only entries from teachers', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'test', role: 'teacher' }, isAdmin: false, logout: vi.fn() });
    renderSidebar();
    expect(screen.queryByText('Học phí')).not.toBeInTheDocument();
    expect(screen.queryByText('Yêu cầu nâng cấp')).not.toBeInTheDocument();
    expect(screen.getByText('Người dùng')).toBeInTheDocument();
  });

  it('shows admin-only entries to admins', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'dan', role: 'admin' }, isAdmin: true, logout: vi.fn() });
    renderSidebar();
    expect(screen.getByText('Học phí')).toBeInTheDocument();
  });

  it('filters entries with the menu search', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'dan', role: 'admin' }, isAdmin: true, logout: vi.fn() });
    renderSidebar();
    fireEvent.change(screen.getByLabelText('Tìm chức năng trong menu'), { target: { value: 'listening' } });
    expect(screen.getByText('Đề Listening')).toBeInTheDocument();
    expect(screen.queryByText('Người dùng')).not.toBeInTheDocument();
  });

  it('shows badge counts and marks the current page', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'dan', role: 'admin' }, isAdmin: true, logout: vi.fn() });
    renderSidebar({ pendingGrades: 4, onlineUsers: [], onlineIds: new Set() }, '/writing-grades');
    const link = screen.getByText('Chấm bài Writing').closest('a');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveTextContent('4');
  });

  it('remembers collapsed groups', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'dan', role: 'admin' }, isAdmin: true, logout: vi.fn() });
    renderSidebar();
    fireEvent.click(screen.getByRole('button', { name: /Đề thi IELTS/ }));
    expect(screen.queryByText('Bộ đề Reading')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('admin-nav-closed'))).toContain('exams');
  });
});
