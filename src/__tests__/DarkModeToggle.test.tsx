import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DarkModeToggle } from '@/components/DarkModeToggle';

vi.mock('@/lib/sounds', () => ({
  useSound: () => ({
    playClick: vi.fn(),
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playLevelUp: vi.fn(),
  }),
}));

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.clearAllMocks();
  });

  it('renders toggle button', async () => {
    render(<DarkModeToggle />);
    
    const button = await screen.findByRole('button');
    expect(button).toBeDefined();
    expect(button.getAttribute('aria-label')).toMatch(/modo escuro|modo claro/);
  });

  it('toggles dark mode when clicked', async () => {
    render(<DarkModeToggle />);
    
    const button = await screen.findByRole('button');
    
    await act(async () => {
      fireEvent.click(button);
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('reads stored preference from localStorage', () => {
    localStorage.setItem('darkMode', 'true');
    render(<DarkModeToggle />);
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class when localStorage is false', () => {
    localStorage.setItem('darkMode', 'false');
    render(<DarkModeToggle />);
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('respects system preference when no localStorage value', () => {
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('matchMedia', matchMediaMock);
    
    render(<DarkModeToggle />);
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
