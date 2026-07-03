"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { RotateCw, Timer, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getVocabularyForSubject, type Subject } from '@/lib/vocabulary';

type Direction = 'across' | 'down';

interface ClueEntry {
  number: number;
  word: string;
  clue: string;
  direction: Direction;
  row: number;
  col: number;
}

interface CrosswordState {
  grid: (string | null)[][];
  clues: ClueEntry[];
  answers: string[][];
  size: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCrossword(subject: Subject): CrosswordState {
  const vocab = getVocabularyForSubject(subject);
  const words = shuffleArray(vocab)
    .filter(w => w.word.length <= 7)
    .slice(0, 10);

  const size = 11;
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const answers: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const clues: ClueEntry[] = [];

  let clueNumber = 1;

  // Place first word horizontally in the middle
  const first = words[0];
  if (first) {
    const startCol = Math.floor((size - first.word.length) / 2);
    const startRow = Math.floor(size / 2);
    for (let i = 0; i < first.word.length; i++) {
      grid[startRow][startCol + i] = first.word[i].toUpperCase();
    }
    clues.push({
      number: clueNumber++,
      word: first.word,
      clue: `${first.category}`,
      direction: 'across',
      row: startRow,
      col: startCol,
    });
  }

  // Try to place remaining words
  for (let wi = 1; wi < words.length && clues.length < 10; wi++) {
    const word = words[wi];
    const upper = word.word.toUpperCase();
    let placed = false;

    for (let attempt = 0; attempt < 20 && !placed; attempt++) {
      const direction: Direction = Math.random() > 0.5 ? 'across' : 'down';
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      if (direction === 'across' && col + upper.length > size) continue;
      if (direction === 'down' && row + upper.length > size) continue;

      let overlaps = 0;
      let valid = true;
      for (let i = 0; i < upper.length; i++) {
        const r = direction === 'down' ? row + i : row;
        const c = direction === 'across' ? col + i : col;
        if (grid[r][c] !== null) {
          if (grid[r][c] === upper[i]) {
            overlaps++;
          } else {
            valid = false;
            break;
          }
        } else {
          // Check adjacent cells are not occupied by the same word
          if (direction === 'across') {
            if (r > 0 && grid[r - 1][c] !== null) { valid = false; break; }
            if (r < size - 1 && grid[r + 1][c] !== null) { valid = false; break; }
          } else {
            if (c > 0 && grid[r][c - 1] !== null) { valid = false; break; }
            if (c < size - 1 && grid[r][c + 1] !== null) { valid = false; break; }
          }
        }
      }

      if (!valid || overlaps > 1) continue;

      // Place the word
      for (let i = 0; i < upper.length; i++) {
        const r = direction === 'down' ? row + i : row;
        const c = direction === 'across' ? col + i : col;
        grid[r][c] = upper[i];
      }

      clues.push({
        number: clueNumber++,
        word: word.word,
        clue: `${word.category}`,
        direction,
        row,
        col,
      });
      placed = true;
    }
  }

  return { grid, clues, answers, size };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function CrosswordGame() {
  const [subject, setSubject] = useState<Subject>('português');
  const [game, setGame] = useState<CrosswordState | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedClue, setSelectedClue] = useState<ClueEntry | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = useCallback(() => {
    const g = generateCrossword(subject);
    setGame(g);
    setUserGrid(Array.from({ length: g.size }, () => Array(g.size).fill('')));
    setSelectedClue(null);
    setSelectedCell(null);
    setTime(0);
    setRunning(false);
    setCompleted(false);
    setRevealed(new Set());
    if (timerRef.current) clearInterval(timerRef.current);
  }, [subject]);

  useEffect(() => {
    startGame();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startGame]);

  useEffect(() => {
    if (running && !completed) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [running, completed]);

  const isWin = useCallback(() => {
    if (!game) return false;
    for (const clue of game.clues) {
      for (let i = 0; i < clue.word.length; i++) {
        const r = clue.direction === 'down' ? clue.row + i : clue.row;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        if (userGrid[r]?.[c]?.toUpperCase() !== game.grid[r][c]) return false;
      }
    }
    return true;
  }, [game, userGrid]);

  const checkWin = useCallback(() => {
    if (isWin() && !completed) {
      setCompleted(true);
      setRunning(false);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  }, [isWin, completed]);

  useEffect(() => { checkWin(); }, [checkWin]);

  const handleCellClick = (row: number, col: number) => {
    if (game?.grid[row][col] === null) return;
    setSelectedCell({ row, col });

    // Find the first clue that includes this cell
    const clue = game?.clues.find(c => {
      for (let i = 0; i < c.word.length; i++) {
        const r = c.direction === 'down' ? c.row + i : c.row;
        const cc = c.direction === 'across' ? c.col + i : c.col;
        if (r === row && cc === col) return true;
      }
      return false;
    });
    if (clue) setSelectedClue(clue);

    // Focus the input
    const key = `${row}-${col}`;
    setTimeout(() => inputRefs.current.get(key)?.focus(), 0);
  };

  const handleLetterChange = (row: number, col: number, value: string) => {
    if (!game) return;
    const letter = value.toUpperCase().slice(-1);
    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = letter;
      return next;
    });

    // Auto-advance to next cell in the clue direction
    if (selectedClue && letter) {
      const idx = selectedClue.direction === 'across'
        ? col - selectedClue.col
        : row - selectedClue.row;
      const nextIdx = idx + 1;
      if (nextIdx < selectedClue.word.length) {
        const nr = selectedClue.direction === 'down' ? selectedClue.row + nextIdx : selectedClue.row;
        const nc = selectedClue.direction === 'across' ? selectedClue.col + nextIdx : selectedClue.col;
        if (game.grid[nr][nc] !== null) {
          setSelectedCell({ row: nr, col: nc });
          setTimeout(() => inputRefs.current.get(`${nr}-${nc}`)?.focus(), 0);
        }
      }
    }

    if (!running) setRunning(true);
  };

  const handleKeyDown = (row: number, col: number, e: React.KeyboardEvent) => {
    if (!game || !selectedClue) return;
    if (e.key === 'Backspace' && !userGrid[row][col]) {
      // Move back
      const idx = selectedClue.direction === 'across'
        ? col - selectedClue.col
        : row - selectedClue.row;
      const prevIdx = idx - 1;
      if (prevIdx >= 0) {
        const pr = selectedClue.direction === 'down' ? selectedClue.row + prevIdx : selectedClue.row;
        const pc = selectedClue.direction === 'across' ? selectedClue.col + prevIdx : selectedClue.col;
        setSelectedCell({ row: pr, col: pc });
        setTimeout(() => inputRefs.current.get(`${pr}-${pc}`)?.focus(), 0);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Move to next clue
      const clueIdx = game.clues.findIndex(c => c === selectedClue);
      const nextClue = game.clues[(clueIdx + (e.shiftKey ? -1 : 1) + game.clues.length) % game.clues.length];
      setSelectedClue(nextClue);
      setSelectedCell({ row: nextClue.row, col: nextClue.col });
      setTimeout(() => inputRefs.current.get(`${nextClue.row}-${nextClue.col}`)?.focus(), 0);
    }
  };

  const getCellStatus = (row: number, col: number): 'empty' | 'correct' | 'incorrect' | 'revealed' => {
    if (!game || game.grid[row][col] === null) return 'empty';
    const key = `${row}-${col}`;
    if (revealed.has(key)) return 'revealed';
    const userLetter = userGrid[row]?.[col]?.toUpperCase();
    if (!userLetter) return 'empty';
    return userLetter === game.grid[row][col] ? 'correct' : 'incorrect';
  };

  const revealWord = (clue: ClueEntry) => {
    const newRevealed = new Set(revealed);
    for (let i = 0; i < clue.word.length; i++) {
      const r = clue.direction === 'down' ? clue.row + i : clue.row;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      newRevealed.add(`${r}-${c}`);
      setUserGrid(prev => {
        const next = prev.map(row => [...row]);
        next[r][c] = game!.grid[r][c]!;
        return next;
      });
    }
    setRevealed(newRevealed);
    if (!running) setRunning(true);
  };

  if (!game) return null;

  const acrossClues = game.clues.filter(c => c.direction === 'across');
  const downClues = game.clues.filter(c => c.direction === 'down');

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Subject selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(['português', 'matemática', 'estudo do meio'] as Subject[]).map(s => (
          <Button
            key={s}
            variant={subject === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSubject(s); }}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Timer className="h-4 w-4" />
          <span className="font-mono font-bold">{formatTime(time)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span>{revealed.size} reveladas</span>
        </div>
      </div>

      {/* Win message */}
      {completed && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-6 text-center space-y-2">
          <div className="text-5xl">🎉</div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">Parabéns! Cruzograma completo!</p>
          <p className="text-gray-600 dark:text-gray-400">Tempo: {formatTime(time)}</p>
        </div>
      )}

      {/* Grid + Clues layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Grid */}
        <div className="inline-grid gap-0 border-2 border-gray-300 dark:border-gray-600 mx-auto" style={{ gridTemplateColumns: `repeat(${game.size}, 2.25rem)` }}>
          {game.grid.map((row, ri) =>
            row.map((cell, ci) => {
              const isEmpty = cell === null;
              const status = getCellStatus(ri, ci);
              const isSelected = selectedCell?.row === ri && selectedCell?.col === ci;
              const isHighlighted = selectedClue
                ? (() => {
                    for (let i = 0; i < selectedClue.word.length; i++) {
                      const r = selectedClue.direction === 'down' ? selectedClue.row + i : selectedClue.row;
                      const c = selectedClue.direction === 'across' ? selectedClue.col + i : selectedClue.col;
                      if (r === ri && c === ci) return true;
                    }
                    return false;
                  })()
                : false;

              // Find clue number
              const clueNum = game.clues.find(c => c.row === ri && c.col === ci)?.number;

              if (isEmpty) {
                return <div key={`${ri}-${ci}`} className="w-9 h-9 bg-gray-800 dark:bg-gray-900" />;
              }

              return (
                <div key={`${ri}-${ci}`} className="relative">
                  {clueNum && (
                    <span className="absolute top-0 left-0.5 text-[9px] font-bold text-gray-500 dark:text-gray-400 z-10 leading-none">
                      {clueNum}
                    </span>
                  )}
                  <input
                    ref={el => { if (el) inputRefs.current.set(`${ri}-${ci}`, el); }}
                    type="text"
                    maxLength={1}
                    value={userGrid[ri]?.[ci] || ''}
                    onChange={e => handleLetterChange(ri, ci, e.target.value)}
                    onKeyDown={e => handleKeyDown(ri, ci, e)}
                    onClick={() => handleCellClick(ri, ci)}
                    className={cn(
                      "w-9 h-9 text-center font-bold text-sm uppercase border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary",
                      isSelected && "ring-2 ring-primary",
                      isHighlighted && !isSelected && "bg-blue-50 dark:bg-blue-900/30",
                      status === 'correct' && "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
                      status === 'incorrect' && "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
                      status === 'revealed' && "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
                    )}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Clues panel */}
        <div className="flex flex-col gap-4 w-full lg:w-80">
          {acrossClues.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2 text-gray-700 dark:text-gray-300">Horizontal</h3>
              <div className="space-y-1">
                {acrossClues.map(c => (
                  <button
                    key={c.number}
                    onClick={() => {
                      setSelectedClue(c);
                      setSelectedCell({ row: c.row, col: c.col });
                      setTimeout(() => inputRefs.current.get(`${c.row}-${c.col}`)?.focus(), 0);
                    }}
                    className={cn(
                      "block w-full text-left text-xs px-2 py-1 rounded transition-colors",
                      selectedClue === c ? "bg-primary text-primary-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <span className="font-bold">{c.number}.</span> {c.clue}
                  </button>
                ))}
              </div>
            </div>
          )}
          {downClues.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2 text-gray-700 dark:text-gray-300">Vertical</h3>
              <div className="space-y-1">
                {downClues.map(c => (
                  <button
                    key={c.number}
                    onClick={() => {
                      setSelectedClue(c);
                      setSelectedCell({ row: c.row, col: c.col });
                      setTimeout(() => inputRefs.current.get(`${c.row}-${c.col}`)?.focus(), 0);
                    }}
                    className={cn(
                      "block w-full text-left text-xs px-2 py-1 rounded transition-colors",
                      selectedClue === c ? "bg-primary text-primary-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <span className="font-bold">{c.number}.</span> {c.clue}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <Button onClick={startGame} className="gap-2">
          <RotateCw className="w-4 h-4" />
          Novo Cruzograma
        </Button>
        {selectedClue && !completed && (
          <Button variant="outline" onClick={() => revealWord(selectedClue)}>
            Revelar {selectedClue.number}
          </Button>
        )}
      </div>
    </div>
  );
}
