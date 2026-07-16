import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkipNav } from '@/components/SkipNav';

describe('SkipNav', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main-content"></main>';
  });

  it('renders skip navigation link', () => {
    render(<SkipNav />);
    
    const skipLink = screen.getByRole('link', { name: /saltar para o conteúdo principal/i });
    expect(skipLink).toBeDefined();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('link is visually hidden by default', () => {
    render(<SkipNav />);
    
    const skipLink = screen.getByRole('link', { name: /saltar para o conteúdo principal/i });
    expect(skipLink.className).toContain('sr-only');
  });

  it('focuses main content on Escape key', () => {
    render(<SkipNav />);
    
    const mainContent = document.getElementById('main-content');
    const focusSpy = vi.spyOn(mainContent!, 'focus');
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(focusSpy).toHaveBeenCalled();
  });
});
