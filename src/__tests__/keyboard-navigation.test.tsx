import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { TicTacToe } from '@/components/TicTacToe';
import { MemoryGame } from '@/components/MemoryGame';

describe('TicTacToe keyboard navigation', () => {
  it('moves focus between squares with arrow keys (roving tabindex)', () => {
    render(<TicTacToe />);
    fireEvent.click(screen.getByText('Jogar com um amigo'));

    const grid = document.querySelector('[role="grid"]') as HTMLElement;
    const squares = within(grid).getAllByRole('button');
    expect(squares).toHaveLength(9);

    // Only the focused square is in the tab order.
    expect(squares[0]).toHaveAttribute('tabindex', '0');
    expect(squares[1]).toHaveAttribute('tabindex', '-1');

    squares[0].focus();
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(squares[1]);

    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(squares[4]);

    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(squares[3]);

    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(squares[0]);
  });
});

describe('MemoryGame keyboard navigation', () => {
  it('moves focus between cards with arrow keys in a 4-column grid', () => {
    render(<MemoryGame />);

    const grid = document.querySelector('[role="grid"]') as HTMLElement;
    const cards = within(grid).getAllByRole('button');
    expect(cards).toHaveLength(16);

    expect(cards[0]).toHaveAttribute('tabindex', '0');

    cards[0].focus();
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cards[1]);

    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cards[5]); // row 1, col 1 (4 cols)

    fireEvent.keyDown(grid, { key: 'End' });
    expect(document.activeElement).toBe(cards[7]); // last cell of row 1
  });
});
