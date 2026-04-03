
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCw, X, Circle, User, BrainCircuit } from 'lucide-react';

type Player = 'X' | 'O';
type GameMode = 'human' | 'computer' | null;
type Difficulty = 'easy' | 'medium' | 'hard' | null;

const Square = ({ value, onSquareClick, isWinning }: { value: Player | null, onSquareClick: () => void, isWinning: boolean }) => (
    <button 
        className={cn(
            "flex items-center justify-center w-16 h-16 md:w-24 md:h-24 text-3xl md:text-4xl font-bold border-4 rounded-lg transition-all duration-300",
            isWinning ? 'bg-green-300 border-green-500 scale-110' : 'bg-card border-border hover:bg-muted',
        )}
        onClick={onSquareClick}
        disabled={!!value}
    >
        {value === 'X' && <X className="h-8 w-8 md:h-12 md:w-12 text-blue-500" />}
        {value === 'O' && <Circle className="h-8 w-8 md:h-12 md:w-12 text-red-500" />}
    </button>
);

const calculateWinner = (squares: (Player | null)[]): { winner: Player | null; line: number[] } => {
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

const findBestMove = (squares: (Player | null)[], difficulty: Difficulty): number => {
    const emptyIndexes = squares.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];

    const checkNextMove = (player: Player): number | null => {
        for (const index of emptyIndexes) {
            const tempSquares = [...squares];
            tempSquares[index] = player;
            const { winner } = calculateWinner(tempSquares);
            if (winner === player) {
                return index;
            }
        }
        return null;
    };

    if (difficulty === 'easy') {
        return emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    }

    if (difficulty === 'medium') {
        // 1. Can AI win?
        const winningMove = checkNextMove('O');
        if (winningMove !== null) return winningMove;
        
        // 2. Can Player win? Block them.
        const blockingMove = checkNextMove('X');
        if (blockingMove !== null) return blockingMove;
        
        // 3. Otherwise, random move
        return emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    }
    
    // Difficulty: 'hard' (Minimax)
    let bestMove = -1;
    let bestVal = -Infinity;

    for (const index of emptyIndexes) {
        squares[index] = 'O'; // Computer's move
        const moveVal = minimax(squares, 0, false);
        squares[index] = null; // Undo the move

        if (moveVal > bestVal) {
            bestMove = index;
            bestVal = moveVal;
        }
    }
    return bestMove;
};

const minimax = (board: (Player | null)[], depth: number, isMaximizing: boolean): number => {
    const { winner } = calculateWinner(board);
    if (winner === 'O') return 10 - depth; // Computer wins
    if (winner === 'X') return depth - 10; // Human wins
    if (board.every(s => s !== null)) return 0; // Draw

    const emptyIndexes = board.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];

    if (isMaximizing) {
        let bestVal = -Infinity;
        for (const index of emptyIndexes) {
            board[index] = 'O';
            bestVal = Math.max(bestVal, minimax(board, depth + 1, false));
            board[index] = null;
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (const index of emptyIndexes) {
            board[index] = 'X';
            bestVal = Math.min(bestVal, minimax(board, depth + 1, true));
            board[index] = null;
        }
        return bestVal;
    }
};

export function TicTacToe() {
  const [squares, setSquares] = useState<(Player | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(null);

  const { winner, line: winningLine } = calculateWinner(squares);
  const isDraw = squares.every(square => square !== null) && !winner;
  
  useEffect(() => {
    if (gameMode === 'computer' && !xIsNext && !winner && !isDraw && difficulty) {
      const computerMoveTimeout = setTimeout(() => {
        const move = findBestMove(squares.slice(), difficulty);
        if (move !== -1) {
            const nextSquares = squares.slice();
            nextSquares[move] = 'O';
            setSquares(nextSquares);
            setXIsNext(true);
        }
      }, 500);

      return () => clearTimeout(computerMoveTimeout);
    }
  }, [xIsNext, gameMode, winner, isDraw, squares, difficulty]);


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
    
    if (gameMode === 'computer' && !xIsNext) {
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
    setGameMode(null);
    setDifficulty(null);
  };
  
  const handleModeSelect = (mode: GameMode) => {
      setGameMode(mode);
      if (mode === 'human') {
          setDifficulty('hard'); // Not used, but set for consistency
      }
  }

  if (!gameMode) {
    return (
        <div className="flex flex-col items-center gap-4 animate-in fade-in-50">
            <h2 className="text-2xl font-bold">Como queres jogar?</h2>
            <Button onClick={() => handleModeSelect('human')} size="lg" className="w-64">
                <User className="mr-2"/> Jogar com um amigo
            </Button>
            <Button onClick={() => handleModeSelect('computer')} size="lg" className="w-64">
                <BrainCircuit className="mr-2"/> Jogar contra o MestreMiúdo
            </Button>
        </div>
    );
  }

  if (gameMode === 'computer' && !difficulty) {
    return (
        <div className="flex flex-col items-center gap-4 animate-in fade-in-50">
            <h2 className="text-2xl font-bold">Escolhe o nível de dificuldade</h2>
            <Button onClick={() => setDifficulty('easy')} size="lg" className="w-64 bg-[hsl(var(--chart-3))] hover:bg-[hsl(var(--chart-3))]/90 text-white">Fácil</Button>
            <Button onClick={() => setDifficulty('medium')} size="lg" className="w-64 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-white">Médio</Button>
            <Button onClick={() => setDifficulty('hard')} size="lg" className="w-64 bg-destructive hover:bg-destructive/90 text-white">Difícil</Button>
            <Button onClick={handleRestart} variant="link" className="mt-4">Voltar</Button>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 animate-in fade-in-50">
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
              isWinning={winningLine.includes(Number(i))}
            />
        ))}
      </div>
      {(winner || isDraw) && (
        <Button onClick={handleRestart} size="lg" className="animate-bounce">
          <RotateCw className="mr-2 h-5 w-5" />
          Jogar Novamente
        </Button>
      )}
       <Button onClick={handleRestart} variant="ghost" size="sm" className="mt-4">
          Recomeçar e Mudar de Modo
        </Button>
    </div>
  );
}
