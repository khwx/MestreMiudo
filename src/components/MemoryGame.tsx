
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCw, Star, Heart, Cloud, Anchor, Bug, Cake, Sun, Moon } from 'lucide-react';

const icons = [
    { icon: Star, color: 'text-yellow-400' },
    { icon: Heart, color: 'text-red-500' },
    { icon: Cloud, color: 'text-blue-400' },
    { icon: Anchor, color: 'text-gray-600' },
    { icon: Bug, color: 'text-green-500' },
    { icon: Cake, color: 'text-pink-500' },
    { icon: Sun, color: 'text-orange-500' },
    { icon: Moon, color: 'text-indigo-500' },
];

const createShuffledBoard = () => {
    const duplicatedIcons = [...icons, ...icons];
    return duplicatedIcons
        .map((value) => ({ card: value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ card }) => ({ icon: card.icon, color: card.color, isFlipped: false, isMatched: false }));
};

type CardType = ReturnType<typeof createShuffledBoard>[0];

const Card = ({ card, onCardClick, index }: { card: CardType, onCardClick: (index: number) => void, index: number }) => {
    const Icon = card.icon;
    return (
        <div
            className={cn(
                "w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer transition-transform duration-500 transform-style-preserve-3d",
                card.isFlipped ? 'transform-rotate-y-180' : ''
            )}
            onClick={() => onCardClick(index)}
        >
            {/* Front of the card */}
            <div className="absolute w-full h-full bg-primary rounded-lg flex items-center justify-center backface-visibility-hidden">
                 <Star className="h-12 w-12 text-primary-foreground opacity-50" />
            </div>
            {/* Back of the card */}
            <div className={cn(
                "absolute w-full h-full bg-card border-2 rounded-lg flex items-center justify-center transform-rotate-y-180 backface-visibility-hidden",
                card.isMatched ? 'border-green-500' : 'border-primary'
            )}>
                 <Icon className={cn("h-16 w-16", card.color)} />
            </div>
        </div>
    )
};

export function MemoryGame() {
    const [board, setBoard] = useState(createShuffledBoard);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    const allMatched = board.every(card => card.isMatched);

    useEffect(() => {
        if (flippedCards.length === 2) {
            setIsChecking(true);
            setMoves(m => m + 1);
            const [firstIndex, secondIndex] = flippedCards;
            const firstCard = board[firstIndex];
            const secondCard = board[secondIndex];

            if (firstCard.icon === secondCard.icon) {
                // It's a match
                setBoard(prevBoard => {
                    const newBoard = [...prevBoard];
                    newBoard[firstIndex].isMatched = true;
                    newBoard[secondIndex].isMatched = true;
                    return newBoard;
                });
                setFlippedCards([]);
                setIsChecking(false);
            } else {
                // Not a match, flip back after a delay
                setTimeout(() => {
                    setBoard(prevBoard => {
                        const newBoard = [...prevBoard];
                        newBoard[firstIndex].isFlipped = false;
                        newBoard[secondIndex].isFlipped = false;
                        return newBoard;
                    });
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    }, [flippedCards, board]);

    const handleCardClick = (index: number) => {
        if (isChecking || board[index].isFlipped || flippedCards.length === 2) {
            return;
        }

        setFlippedCards([...flippedCards, index]);
        setBoard(prevBoard => {
            const newBoard = [...prevBoard];
            newBoard[index].isFlipped = true;
            return newBoard;
        });
    };
    
    const handleRestart = () => {
        setBoard(createShuffledBoard());
        setFlippedCards([]);
        setMoves(0);
        setIsChecking(false);
    };

    return (
        <div className="flex flex-col items-center gap-6 animate-in fade-in-50">
            {allMatched ? (
                <div className="text-center space-y-4">
                    <Award className="h-20 w-20 text-accent mx-auto" />
                    <h2 className="text-3xl font-bold">Parabéns!</h2>
                    <p className="text-xl text-muted-foreground">Completaste o jogo em {moves} jogadas!</p>
                    <Button onClick={handleRestart} size="lg" className="animate-bounce">
                        <RotateCw className="mr-2 h-5 w-5" />
                        Jogar Novamente
                    </Button>
                </div>
            ) : (
                <>
                    <p className="text-2xl font-bold">Jogadas: {moves}</p>
                    <div className="grid grid-cols-4 gap-4 perspective-[1000px]">
                        {board.map((card, i) => (
                            <Card
                                key={i}
                                card={card}
                                onCardClick={handleCardClick}
                                index={i}
                            />
                        ))}
                    </div>
                     <Button onClick={handleRestart} variant="outline" className="mt-4">
                        <RotateCw className="mr-2 h-5 w-5" />
                        Recomeçar Jogo
                    </Button>
                </>
            )}
        </div>
    );
}
