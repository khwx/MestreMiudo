"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCw, Star, Heart, Cloud, Anchor, Bug, Cake, Sun, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '@/lib/sounds';
import { type Subject, getRandomVocabularyPairs } from '@/lib/vocabulary';

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

type IconCard = { type: 'icon'; icon: typeof icons[0]['icon']; color: string; isFlipped: boolean; isMatched: boolean };
type WordCard = { type: 'word'; word: string; category: string; matchLabel: string; isFlipped: boolean; isMatched: boolean };
type CardType = IconCard | WordCard;

const createIconBoard = (): CardType[] => {
    const duplicatedIcons = [...icons, ...icons];
    return duplicatedIcons
        .map((value) => ({ card: value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ card }): IconCard => ({ type: 'icon', icon: card.icon, color: card.color, isFlipped: false, isMatched: false }));
};

const createVocabularyBoard = (subject: Subject, mode: 'icon' | 'word' | 'definition' = 'icon'): CardType[] => {
    const pairs = getRandomVocabularyPairs(subject, 8);
    const cards: WordCard[] = [];
    pairs.forEach(word => {
        if (mode === 'definition') {
            cards.push({ type: 'word', word: word.word, category: word.category, matchLabel: word.word, isFlipped: false, isMatched: false });
            cards.push({ type: 'word', word: word.word, category: word.category, matchLabel: word.category, isFlipped: false, isMatched: false });
        } else {
            cards.push({ type: 'word', word: word.word, category: word.category, matchLabel: word.word, isFlipped: false, isMatched: false });
            cards.push({ type: 'word', word: word.word, category: word.category, matchLabel: word.word, isFlipped: false, isMatched: false });
        }
    });
    return cards
        .map((card) => ({ card, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ card }) => card);
};

const Card = ({ card, onCardClick, index }: { card: CardType, onCardClick: (index: number) => void, index: number }) => {
    return (
        <button
            type="button"
            aria-label={card.type === 'icon' ? 'Carta de ícone' : `Carta: ${card.matchLabel}`}
            aria-pressed={card.isFlipped}
            className={cn(
                "w-16 h-16 md:w-24 md:h-24 rounded-lg flex items-center justify-center cursor-pointer transition-transform duration-500 transform-style-preserve-3d focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                card.isFlipped ? 'transform-rotate-y-180' : ''
            )}
            onClick={() => onCardClick(index)}
        >
            <div className="absolute w-full h-full bg-primary rounded-lg flex items-center justify-center backface-visibility-hidden">
                 <Star className="h-12 w-12 text-primary-foreground opacity-50" />
            </div>
            <div className={cn(
                "absolute w-full h-full bg-card border-2 rounded-lg flex items-center justify-center transform-rotate-y-180 backface-visibility-hidden",
                card.isMatched ? 'border-green-500' : 'border-primary'
            )}>
                {card.type === 'icon' ? (
                    <card.icon className={cn("h-16 w-16", card.color)} />
                ) : (
                    <span className={cn(
                        "font-bold text-center px-1 leading-tight text-gray-800 dark:text-gray-200",
                        card.matchLabel.length > 8 ? "text-[10px] md:text-xs" : "text-sm md:text-base"
                    )}>
                        {card.matchLabel}
                    </span>
                )}
            </div>
        </button>
    )
};

interface MemoryGameProps {
    subject?: Subject;
    mode?: 'icon' | 'word' | 'definition';
}

export function MemoryGame({ subject, mode = 'icon' }: MemoryGameProps) {
    const [board, setBoard] = useState<CardType[]>(() =>
        subject ? createVocabularyBoard(subject, mode) : createIconBoard()
    );
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const { playSuccess, playError, playGameWin } = useSound();

    const allMatched = board.every(card => card.isMatched);

    useEffect(() => {
        if (allMatched && moves > 0) {
            playGameWin();
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00d4ff', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3']
            });
        }
    }, [allMatched, moves, playGameWin]);

    useEffect(() => {
        if (flippedCards.length === 2) {
            setIsChecking(true);
            setMoves(m => m + 1);
            const [firstIndex, secondIndex] = flippedCards;
            const firstCard = board[firstIndex];
            const secondCard = board[secondIndex];

            const isMatch = firstCard.type === 'word' && secondCard.type === 'word'
                ? firstCard.word === secondCard.word
                : firstCard.type === 'icon' && secondCard.type === 'icon'
                    ? firstCard.icon === secondCard.icon
                    : false;

            if (isMatch) {
                playSuccess();
                setBoard(prevBoard => {
                    const newBoard = [...prevBoard];
                    newBoard[firstIndex].isMatched = true;
                    newBoard[secondIndex].isMatched = true;
                    return newBoard;
                });
                setFlippedCards([]);
                setIsChecking(false);
            } else {
                playError();
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
    }, [flippedCards, board, playSuccess, playError]);

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
        setBoard(subject ? createVocabularyBoard(subject, mode) : createIconBoard());
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
                    <div className="grid grid-cols-4 gap-2 md:gap-4 perspective-[1000px]">
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
