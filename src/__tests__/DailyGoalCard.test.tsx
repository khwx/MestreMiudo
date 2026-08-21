import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DailyGoalCard } from '@/components/dashboard/DailyGoalCard';

vi.mock('@/app/actions/daily-goals', () => ({
  setDailyGoalAction: vi.fn(),
}));

import { setDailyGoalAction } from '@/app/actions/daily-goals';

describe('DailyGoalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the progress for an incomplete goal', () => {
    render(<DailyGoalCard name="Joana" target={3} quizzesToday={1} />);
    expect(screen.getByText('1/3')).toBeDefined();
    expect(screen.getByText(/Faltam 2 quizzes/i)).toBeDefined();
  });

  it('celebrates when the goal is achieved', () => {
    render(<DailyGoalCard name="Joana" target={2} quizzesToday={2} />);
    expect(screen.getByText(/Objetivo cumprido por hoje/i)).toBeDefined();
  });

  it('opens the editor and saves a new target', async () => {
    (setDailyGoalAction as ReturnType<typeof vi.fn>).mockResolvedValue(5);
    render(<DailyGoalCard name="Joana" target={3} quizzesToday={1} />);

    fireEvent.click(screen.getByLabelText(/Definir objetivo diário/i));
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(setDailyGoalAction).toHaveBeenCalledWith('Joana', 5);
    });

    await waitFor(() => {
      expect(screen.getByText('1/5')).toBeDefined();
    });
  });

  it('does not save an invalid target', async () => {
    render(<DailyGoalCard name="Joana" target={3} quizzesToday={1} />);

    fireEvent.click(screen.getByLabelText(/Definir objetivo diário/i));
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(setDailyGoalAction).not.toHaveBeenCalled();
    });
  });
});
