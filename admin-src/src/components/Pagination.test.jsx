import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';
import { pageWindow } from '../utils/pageWindow';

describe('Pagination', () => {
  it('renders nothing when everything fits on a single page', () => {
    const { container } = render(<Pagination page={1} total={5} pageSize={10} onPage={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when total is 0', () => {
    const { container } = render(<Pagination page={1} total={0} pageSize={10} onPage={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the current range, one button per page plus prev/next', () => {
    render(<Pagination page={2} total={25} pageSize={10} onPage={vi.fn()} />);
    expect(screen.getByText('11–20 / 25')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Trang \d+$/ })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeEnabled();
  });

  it('marks the current page button as active and others as not', () => {
    render(<Pagination page={2} total={25} pageSize={10} onPage={vi.fn()} />);
    expect(screen.getByText('2')).toHaveClass('active');
    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
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

  it('prev is disabled on the first page, next on the last', () => {
    const { rerender } = render(<Pagination page={1} total={25} pageSize={10} onPage={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeDisabled();
    rerender(<Pagination page={3} total={25} pageSize={10} onPage={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
  });

  it('clamps the displayed end of the range to total on the last (partial) page', () => {
    render(<Pagination page={3} total={25} pageSize={10} onPage={vi.fn()} />);
    expect(screen.getByText('21–25 / 25')).toBeInTheDocument();
  });

  it('windows long page lists instead of rendering every page', () => {
    render(<Pagination page={10} total={2000} pageSize={20} onPage={vi.fn()} />);
    const nums = screen.getAllByRole('button', { name: /^Trang \d+$/ }).map(b => b.textContent);
    expect(nums).toEqual(['1', '9', '10', '11', '100']);
  });
});

describe('pageWindow', () => {
  it('shows all pages when there are few', () => {
    expect(pageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it('adds gaps around the current page', () => {
    expect(pageWindow(50, 100)).toEqual([1, 'gap-49', 49, 50, 51, 'gap-100', 100]);
  });
  it('keeps the first pages contiguous near the start', () => {
    expect(pageWindow(2, 100)).toEqual([1, 2, 3, 4, 'gap-100', 100]);
  });
  it('keeps the last pages contiguous near the end', () => {
    expect(pageWindow(99, 100)).toEqual([1, 'gap-97', 97, 98, 99, 100]);
  });
});
