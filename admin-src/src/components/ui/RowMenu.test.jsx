import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RowMenu from './RowMenu';

function renderInTable(items) {
  return render(
    <div className="table-wrap" data-testid="wrap">
      <table><tbody><tr><td><RowMenu items={items} /></td></tr></tbody></table>
    </div>,
  );
}

describe('RowMenu', () => {
  it('renders the open menu outside the (overflow-clipping) table wrapper', () => {
    renderInTable([{ label: 'Xem chi tiết', onClick: () => {} }]);
    fireEvent.click(screen.getByRole('button', { name: 'Thêm thao tác' }));
    const menu = screen.getByRole('menu');
    expect(screen.getByTestId('wrap').contains(menu)).toBe(false);
    expect(menu.parentElement).toBe(document.body);
    expect(menu.className).toContain('menu--floating');
  });

  it('runs the item action and closes; outside click and Escape close it', () => {
    const onClick = vi.fn();
    renderInTable([{ label: 'Xem chi tiết', onClick }, 'sep', { label: 'Ẩn', onClick: () => {}, hidden: true }]);
    const toggle = screen.getByRole('button', { name: 'Thêm thao tác' });

    fireEvent.click(toggle);
    expect(screen.queryAllByRole('separator')).toHaveLength(0); // trailing sep dropped with the hidden item
    fireEvent.mouseDown(screen.getByRole('menuitem', { name: 'Xem chi tiết' }));
    expect(screen.getByRole('menu')).toBeTruthy(); // a click inside the portalled menu is not "outside"
    fireEvent.click(screen.getByRole('menuitem', { name: 'Xem chi tiết' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.click(toggle);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.click(toggle);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders nothing when every item is hidden', () => {
    const { container } = renderInTable([{ label: 'A', onClick: () => {}, hidden: true }]);
    expect(container.querySelector('.menu-wrap')).toBeNull();
  });
});
