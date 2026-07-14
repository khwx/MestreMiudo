"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface AccessibilitySettings {
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  soundEnabled: boolean;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  setSettings: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReaderOptimized: false,
    keyboardNavigation: true,
    reducedMotion: false,
    highContrast: false,
    soundEnabled: true,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('a11y-settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {}
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('a11y-settings', JSON.stringify(settings));

    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings, mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!settings.keyboardNavigation) return;
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.remove('keyboard-nav');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [settings.keyboardNavigation]);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const el = document.createElement('div');
    el.setAttribute('aria-live', priority);
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
    document.body.appendChild(el);

    setTimeout(() => {
      el.textContent = message;
    }, 100);

    setTimeout(() => {
      document.body.removeChild(el);
    }, 1000);
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, setSettings, announceToScreenReader }}>
      <div
        data-reduce-motion={settings.reducedMotion}
        data-high-contrast={settings.highContrast}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
