"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AccessibilitySettings {
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReaderOptimized: false,
    keyboardNavigation: true,
    reducedMotion: false,
    highContrast: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('a11y-settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  useEffect(() => {
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
  }, [settings]);

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

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
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
  };

  return {
    settings,
    setSettings,
    announceToScreenReader,
  };
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useAccessibility();
  
  return (
    <div 
      data-reduce-motion={settings.reducedMotion}
      data-high-contrast={settings.highContrast}
    >
      {children}
    </div>
  );
}