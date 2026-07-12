import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('renders nothing when everything fits on a single page', () => {
    const { container } = render(<Pagination page={1} total={5} pageSize={10} onPage={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when total is 0', () => {
    const { container } = render(<Pagination page={1} total={0} pageSize={10} onPage={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the current range and one button per page', () => {
    render(<Pagination page={2} total={25} pageSize={10} onPage={vi.fn()} />);
    expect(screen.getByText('11–20 / 25')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('marks the current page button as active and others as not', () => {
    render(<Pagination page={2} total={25} pageSize={10} onPage={vi.fn()} />);
    expect(screen.getByText('2')).toHaveClass('active');
    expect(screen.getByText('1')).not.toHaveClass('active');
    expect(screen.getByText('3')).not.toHaveClass('active');
  });

  it('calls onPage with the clicked page number', () => {
    const onPage = vi.fn();
    render(<Pagination page={1} total={25} pageSize={10} onPage={onPage} />);
    fireEvent.click(screen.getByText('3'));
    expect(onPage).toHaveBeenCalledWith(3);
    expect(onPage).toHaveBeenCalledTimes(1);
  });

  it('clamps the displayed end of the range to total on the last (partial) page', () => {
    render(<Pagination page={3} total={25} pageSize={10} onPage={vi.fn()} />);
    expect(screen.getByText('21–25 / 25')).toBeInTheDocument();
  });
});
