import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useToast } from './ToastContext';
import { ToastProvider } from './ToastProvider';

function Consumer() {
  const showToast = useToast();
  return (
    <div>
      <button onClick={() => showToast('Saved!', 'success')}>trigger-success</button>
      <button onClick={() => showToast('Something broke')}>trigger-default</button>
    </div>
  );
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a toast with the message and type when triggered', () => {
    render(<ToastProvider><Consumer /></ToastProvider>);
    fireEvent.click(screen.getByText('trigger-success'));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
    expect(document.querySelector('.toast.show.success')).toBeInTheDocument();
  });

  it('defaults the toast type to "success" when none is passed', () => {
    render(<ToastProvider><Consumer /></ToastProvider>);
    fireEvent.click(screen.getByText('trigger-default'));
    expect(document.querySelector('.toast.show.success')).toBeInTheDocument();
  });

  it('auto-dismisses the toast after 3.2 seconds', () => {
    render(<ToastProvider><Consumer /></ToastProvider>);
    fireEvent.click(screen.getByText('trigger-success'));
    expect(screen.getByText('Saved!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3200);
    });

    expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
  });

  it('renders nothing before any toast has been triggered', () => {
    render(<ToastProvider><Consumer /></ToastProvider>);
    expect(document.querySelector('.toast')).not.toBeInTheDocument();
  });
});
