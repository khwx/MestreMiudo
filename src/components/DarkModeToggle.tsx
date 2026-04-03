"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useSound } from '@/lib/sounds';

export function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const { playClick } = useSound();

  useEffect(() => {
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode) {
      setDarkMode(storedMode === 'true');
      document.documentElement.classList.toggle('dark', storedMode === 'true');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    playClick();
    setDarkMode(!darkMode);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="gap-1 p-2"
    >
      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}