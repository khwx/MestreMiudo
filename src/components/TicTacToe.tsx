
"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCw, X, Circle } from 'lucide-react';

type Player = 'X' | 'O';

const Square = ({ value, onSquareClick, isWinning }: { value: Player | null, onSquareClick: () => void, isWinning: boolean }) => (
    <button 
        className={cn(
            "flex items-center justify-center w-24 h-24 text-4xl font-bold border-4 rounded-lg transition-all duration-300",
            isWinning ? 'bg-green-300 border-green-500 scale-110' : 'bg-card border-border hover:bg-muted',
        )}
        onClick={onSquareClick}
    >
        {value === 'X' && <X className="h-12 w-12 text-blue-500" />}
        {value === 'O' && <Circle className="h-12 w-12 text-red-500" />}
    </button>
);

const calculateWinner = (squares: (Player | null)[]) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: [] };
};

export function TicTacToe() {
  const [squares, setSquares] = useState<(Player | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const { winner, line: winningLine } = calculateWinner(squares);
  const isDraw = squares.every(square => square !== null) && !winner;

  let status;
  if (winner) {
    status = `O Vencedor é:`;
  } else if (isDraw) {
    status = "Empate!";
  } else {
    status = "É a vez de:";
  }
  
  const handleClick = (i: number) => {
    if (squares[i] || winner) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-2xl font-bold text-center h-16 flex flex-col items-center">
        <span>{status}</span>
        {winner && (winner === 'X' ? <X className="h-10 w-10 text-blue-500" /> : <Circle className="h-10 w-10 text-red-500" />)}
        {!winner && !isDraw && (xIsNext ? <X className="h-10 w-10 text-blue-500" /> : <Circle className="h-10 w-10 text-red-500" />)}
      </div>
      <div className="grid grid-cols-3 gap-2 p-2 bg-background rounded-lg">
        {squares.map((square, i) => (
          <Square 
            key={i} 
            value={square} 
            onSquareClick={() => handleClick(i)}
            isWinning={winningLine.includes(i)}
          />
        ))}
      </div>
      {(winner || isDraw) && (
        <Button onClick={handleRestart} size="lg" className="animate-bounce">
          <RotateCw className="mr-2 h-5 w-5" />
          Jogar Novamente
        </Button>
      )}
    </div>
  );
}
