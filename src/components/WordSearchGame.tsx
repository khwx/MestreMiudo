"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { RotateCw, Timer, Trophy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getVocabularyForSubject, type Subject } from '@/lib/vocabulary';
import { shuffleArray, formatTime } from '@/lib/game-utils';

interface WordPlacement {
  word: string;
  row: number;
  col: number;
  direction: [number, number];
}

interface WordSearchState {
  grid: string[][];
  words: WordPlacement[];
  size: number;
}

const DIRECTIONS: [number, number][] = [
  [0, 1],   // right
  [1, 0],   // down
  [1, 1],   // diagonal down-right
  [-1, 1],  // diagonal up-right
  [0, -1],  // left
  [-1, 0],  // up
  [-1, -1], // diagonal up-left
  [1, -1],  // diagonal down-left
];

function generateWordSearch(subject: Subject): WordSearchState {
  const vocab = getVocabularyForSubject(subject);
  const words = shuffleArray(vocab)
    .filter(w => w.word.length >= 3 && w.word.length <= 8)
    .slice(0, 8);

  const size = 12;
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placements: WordPlacement[] = [];

  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);

  for (const wordObj of sortedWords) {
    const word = wordObj.word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let placed = false;

    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const maxRow = dir[0] === 0 ? size : dir[0] > 0 ? size - word.length : word.length - 1;
      const maxCol = dir[1] === 0 ? size : dir[1] > 0 ? size - word.length : word.length - 1;
      const minRow = dir[0] === 0 ? 0 : dir[0] > 0 ? 0 : word.length - 1;
      const minCol = dir[1] === 0 ? 0 : dir[1] > 0 ? 0 : word.length - 1;

      const row = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
      const col = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));

      let valid = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dir[0] * i;
        const c = col + dir[1] * i;
        if (r < 0 || r >= size || c < 0 || c >= size) { valid = false; break; }
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) { valid = false; break; }
      }

      if (valid) {
        for (let i = 0; i < word.length; i++) {
          grid[row + dir[0] * i][col + dir[1] * i] = word[i];
        }
        placements.push({ word: wordObj.word, row, col, direction: dir });
        placed = true;
      }
    }
  }

  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, words: placements, size };
}

interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

function isCellInSelection(row: number, col: number, sel: Selection): boolean {
  const dr = Math.sign(sel.endRow - sel.startRow);
  const dc = Math.sign(sel.endCol - sel.startCol);
  const len = Math.max(Math.abs(sel.endRow - sel.startRow), Math.abs(sel.endCol - sel.startCol));
  for (let i = 0; i <= len; i++) {
    const r = sel.startRow + dr * i;
    const c = sel.startCol + dc * i;
    if (r === row && c === col) return true;
  }
  return false;
}

function getSelectionCells(sel: Selection): [number, number][] {
  const cells: [number, number][] = [];
  const dr = Math.sign(sel.endRow - sel.startRow);
  const dc = Math.sign(sel.endCol - sel.startCol);
  const len = Math.max(Math.abs(sel.endRow - sel.startRow), Math.abs(sel.endCol - sel.startCol));
  for (let i = 0; i <= len; i++) {
    cells.push([sel.startRow + dr * i, sel.startCol + dc * i]);
  }
  return cells;
}

const COLORS = [
  'bg-blue-200 dark:bg-blue-800',
  'bg-green-200 dark:bg-green-800',
  'bg-yellow-200 dark:bg-yellow-800',
  'bg-purple-200 dark:bg-purple-800',
  'bg-pink-200 dark:bg-pink-800',
  'bg-orange-200 dark:bg-orange-800',
  'bg-teal-200 dark:bg-teal-800',
  'bg-red-200 dark:bg-red-800',
];

export function WordSearchGame() {
  const [subject, setSubject] = useState<Subject>('português');
  const [game, setGame] = useState<WordSearchState | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Map<string, number>>(new Map());
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);

  const startGame = useCallback(() => {
    const g = generateWordSearch(subject);
    setGame(g);
    setFoundWords(new Set());
    setFoundCells(new Map());
    setSelection(null);
    setIsSelecting(false);
    setTime(0);
    setRunning(false);
    setCompleted(false);
    setMessage(null);
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

  useEffect(() => {
    if (foundWords.size === game?.words.length && game.words.length > 0 && !completed) {
      setCompleted(true);
      setRunning(false);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    }
  }, [foundWords, game, completed]);

  const getCellFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gridRef.current || !game) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const cellSize = rect.width / game.size;
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const col = Math.floor((clientX - rect.left) / cellSize);
    const row = Math.floor((clientY - rect.top) / cellSize);
    if (row < 0 || row >= game.size || col < 0 || col >= game.size) return null;
    return { row, col };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (completed) return;
    const cell = getCellFromEvent(e);
    if (!cell) return;
    setIsSelecting(true);
    setSelection({ startRow: cell.row, startCol: cell.col, endRow: cell.row, endCol: cell.col });
    if (!running) setRunning(true);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSelecting || completed) return;
    const cell = getCellFromEvent(e);
    if (!cell) return;
    setSelection(prev => prev ? { ...prev, endRow: cell.row, endCol: cell.col } : null);
  };

  const handlePointerUp = () => {
    if (!isSelecting || !selection || !game) {
      setIsSelecting(false);
      return;
    }
    setIsSelecting(false);

    // Check if selection matches any word
    const cells = getSelectionCells(selection);
    const selectedText = cells
      .map(([r, c]) => game.grid[r]?.[c] || '')
      .join('');

    const normalizedSelected = selectedText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let matched = false;
    for (const placement of game.words) {
      if (foundWords.has(placement.word)) continue;
      const normalizedWord = placement.word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // Check forward and reverse
      if (normalizedSelected === normalizedWord || normalizedSelected === normalizedWord.split('').reverse().join('')) {
        setFoundWords(prev => new Set([...prev, placement.word]));
        const colorIdx = foundWords.size % COLORS.length;
        const newCells = new Map(foundCells);
        cells.forEach(([r, c]) => newCells.set(`${r}-${c}`, colorIdx));
        setFoundCells(newCells);
        matched = true;
        setMessage({ text: `Encontraste: ${placement.word}!`, type: 'success' });
        setTimeout(() => setMessage(null), 2000);
        break;
      }
    }

    if (!matched) {
      setMessage({ text: 'Não é uma palavra válida', type: 'error' });
      setTimeout(() => setMessage(null), 1500);
    }

    setSelection(null);
  };

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (!game) return;
    const size = game.size;
    const current = focusedCell || { row: 0, col: 0 };

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedCell({ row: Math.max(0, current.row - 1), col: current.col });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedCell({ row: Math.min(size - 1, current.row + 1), col: current.col });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedCell({ row: current.row, col: Math.max(0, current.col - 1) });
        break;
      case 'ArrowRight':
        e.preventDefault();
        setFocusedCell({ row: current.row, col: Math.min(size - 1, current.col + 1) });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isSelecting && !completed) {
          setIsSelecting(true);
          setSelection({ startRow: current.row, startCol: current.col, endRow: current.row, endCol: current.col });
          if (!running) setRunning(true);
        }
        break;
      case 'Escape':
        if (isSelecting) {
          setIsSelecting(false);
          setSelection(null);
        }
        break;
    }
  };

  if (!game) return null;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Subject selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(['português', 'matemática', 'estudo do meio'] as Subject[]).map(s => (
          <Button
            key={s}
            variant={subject === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSubject(s)}
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
          <span>{foundWords.size}/{game.words.length} palavras</span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          "text-center text-sm font-semibold py-2 rounded-lg",
          message.type === 'success' ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
        )}>
          {message.text}
        </div>
      )}

      {/* Win message */}
      {completed && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-6 text-center space-y-2">
          <div className="text-5xl">🎉</div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">Parabéns! Encontraste todas as palavras!</p>
          <p className="text-gray-600 dark:text-gray-400">Tempo: {formatTime(time)}</p>
        </div>
      )}

      {/* Grid + Word list */}
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Grid */}
        <div
          ref={gridRef}
          role="grid"
          aria-label="Sopa de letras"
          className="inline-grid gap-0 border-2 border-gray-300 dark:border-gray-600 mx-auto select-none touch-none"
          style={{ gridTemplateColumns: `repeat(${game.size}, 2.25rem)` }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onKeyDown={handleGridKeyDown}
          tabIndex={0}
        >
          {game.grid.map((row, ri) =>
            row.map((cell, ci) => {
              const key = `${ri}-${ci}`;
              const foundColor = foundCells.get(key);
              const inSelection = selection ? isCellInSelection(ri, ci, selection) : false;
              const isFocused = focusedCell?.row === ri && focusedCell?.col === ci;

              return (
                <div
                  key={key}
                  role="gridcell"
                  aria-label={`Linha ${ri + 1}, coluna ${ci + 1}: ${cell}`}
                  tabIndex={isFocused ? 0 : -1}
                  onFocus={() => setFocusedCell({ row: ri, col: ci })}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center text-xs font-bold uppercase border border-gray-200 dark:border-gray-700 transition-colors outline-none",
                    foundColor !== undefined ? COLORS[foundColor] : "bg-white dark:bg-gray-800",
                    inSelection && foundColor === undefined && "bg-blue-100 dark:bg-blue-900/50",
                    isFocused && "ring-2 ring-primary ring-offset-1",
                    "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  {cell}
                </div>
              );
            })
          )}
        </div>

        {/* Word list */}
        <div className="w-full lg:w-64">
          <h3 className="font-bold text-sm mb-3 text-gray-700 dark:text-gray-300">Palavras a encontrar:</h3>
          <div className="space-y-2">
            {game.words.map(w => {
              const found = foundWords.has(w.word);
              return (
                <div
                  key={w.word}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                    found
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 line-through"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  )}
                >
                  {found && <Check className="h-4 w-4 shrink-0" />}
                  <span>{w.word}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="flex justify-center">
        <Button onClick={startGame} className="gap-2">
          <RotateCw className="w-4 h-4" />
          Nova Sopa de Letras
        </Button>
      </div>
    </div>
  );
}
