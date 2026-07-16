import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BadgePopup, BADGE_DEFINITIONS } from '@/components/BadgePopup';

describe('BadgePopup', () => {
  const defaultProps = {
    badgeName: 'Test Badge',
    badgeDescription: 'Test description',
    badgeIcon: '🏆',
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders badge information', () => {
    render(<BadgePopup {...defaultProps} />);
    
    expect(screen.getByText('Test Badge')).toBeDefined();
    expect(screen.getByText('Test description')).toBeDefined();
    expect(screen.getByText('🏆')).toBeDefined();
    expect(screen.getByText('Nova Conquista!')).toBeDefined();
  });

  it('closes when clicking the close button', async () => {
    vi.useFakeTimers();
    render(<BadgePopup {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /fechar/i });
    
    await act(async () => {
      fireEvent.click(closeButton);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    
    expect(defaultProps.onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('uses default icon when badgeIcon is not provided', () => {
    render(<BadgePopup badgeName="Test" badgeDescription="Desc" onClose={vi.fn()} />);
    
    expect(screen.getByText('🏆')).toBeDefined();
  });
});

describe('BADGE_DEFINITIONS', () => {
  it('has required badge definitions', () => {
    expect(BADGE_DEFINITIONS['primeiro_quiz']).toBeDefined();
    expect(BADGE_DEFINITIONS['perfeicao']).toBeDefined();
    expect(BADGE_DEFINITIONS['streak_3']).toBeDefined();
    expect(BADGE_DEFINITIONS['streak_7']).toBeDefined();
    expect(BADGE_DEFINITIONS['streak_30']).toBeDefined();
  });

  it('each badge has required properties', () => {
    Object.values(BADGE_DEFINITIONS).forEach(badge => {
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.icon).toBeTruthy();
    });
  });
});
