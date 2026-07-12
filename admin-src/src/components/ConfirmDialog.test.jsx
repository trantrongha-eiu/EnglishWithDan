import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from './ConfirmDialog';

function Consumer({ onOk }) {
  const confirm = useConfirm();
  return <button onClick={() => confirm('Are you sure?', onOk)}>ask</button>;
}

describe('ConfirmDialog / useConfirm', () => {
  it('does not render the dialog until confirm() is called', () => {
    render(<ConfirmProvider><Consumer onOk={vi.fn()} /></ConfirmProvider>);
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('renders the dialog with the given message once confirm() is triggered', () => {
    render(<ConfirmProvider><Consumer onOk={vi.fn()} /></ConfirmProvider>);
    fireEvent.click(screen.getByText('ask'));
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls the onOk callback and closes the dialog when the confirm button is clicked', () => {
    const onOk = vi.fn();
    render(<ConfirmProvider><Consumer onOk={onOk} /></ConfirmProvider>);
    fireEvent.click(screen.getByText('ask'));
    // The modal title is also literally "Xác nhận", so scope to the button.
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(onOk).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('does not call onOk and closes the dialog when cancel is clicked', () => {
    const onOk = vi.fn();
    render(<ConfirmProvider><Consumer onOk={onOk} /></ConfirmProvider>);
    fireEvent.click(screen.getByText('ask'));
    fireEvent.click(screen.getByText('Huỷ'));
    expect(onOk).not.toHaveBeenCalled();
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('does not call onOk when clicking the overlay outside the modal', () => {
    const onOk = vi.fn();
    render(<ConfirmProvider><Consumer onOk={onOk} /></ConfirmProvider>);
    fireEvent.click(screen.getByText('ask'));
    fireEvent.click(document.querySelector('.modal-overlay'));
    expect(onOk).not.toHaveBeenCalled();
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });
});
