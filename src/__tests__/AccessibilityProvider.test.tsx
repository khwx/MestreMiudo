import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '@/components/AccessibilityProvider';

function TestComponent() {
  const { settings, setSettings, announceToScreenReader } = useAccessibility();
  return (
    <div>
      <span data-testid="keyboard-nav">{String(settings.keyboardNavigation)}</span>
      <span data-testid="sound-enabled">{String(settings.soundEnabled)}</span>
      <span data-testid="reduced-motion">{String(settings.reducedMotion)}</span>
      <span data-testid="high-contrast">{String(settings.highContrast)}</span>
      <button onClick={() => setSettings(s => ({ ...s, keyboardNavigation: !s.keyboardNavigation }))}>
        Toggle Keyboard
      </button>
      <button onClick={() => setSettings(s => ({ ...s, reducedMotion: !s.reducedMotion }))}>
        Toggle Motion
      </button>
      <button onClick={() => announceToScreenReader('Test message')}>
        Announce
      </button>
    </div>
  );
}

describe('AccessibilityProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('reduce-motion', 'high-contrast');
    vi.clearAllMocks();
  });

  it('provides default settings', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('keyboard-nav').textContent).toBe('true');
    expect(screen.getByTestId('sound-enabled').textContent).toBe('true');
    expect(screen.getByTestId('reduced-motion').textContent).toBe('false');
    expect(screen.getByTestId('high-contrast').textContent).toBe('false');
  });

  it('saves settings to localStorage', async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle keyboard/i });
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(JSON.parse(localStorage.getItem('a11y-settings') || '{}').keyboardNavigation).toBe(false);
  });

  it('adds reduce-motion class when reducedMotion is true', async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle motion/i });
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
  });

  it('creates an aria-live region when announcing', async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const announceButton = screen.getByRole('button', { name: /announce/i });
    await act(async () => {
      fireEvent.click(announceButton);
    });

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeDefined();
  });
});
