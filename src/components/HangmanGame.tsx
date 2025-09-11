
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCw, Skull } from 'lucide-react';

const words = [
    "CASA", "BOLA", "GATO", "MACACO", "ELEFANTE", "LIVRO", "ESCOLA", "FLOR",
    "SOL", "LUA", "ESTRELA", "ARVORE", "RIO", "MAR", "PEIXE", "LEAO",
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

const HangmanDrawing = ({ numberOfGuesses }: { numberOfGuesses: number }) => {
    const head = (
        <div className="w-16 h-16 rounded-full border-4 border-foreground absolute top-[40px] right-[-24px]" />
    );
    const body = (
        <div className="w-1 h-24 bg-foreground absolute top-[104px] right-0" />
    );
    const rightArm = (
        <div className="w-20 h-1 bg-foreground absolute top-[120px] right-[-80px] rotate-[-30deg] origin-bottom-left" />
    );
    const leftArm = (
        <div className="w-20 h-1 bg-foreground absolute top-[120px] right-[4px] rotate-[30deg] origin-bottom-right" />
    );
    const rightLeg = (
        <div className="w-24 h-1 bg-foreground absolute top-[180px] right-[-92px] rotate-[60deg] origin-bottom-left" />
    );
    const leftLeg = (
         <div className="w-24 h-1 bg-foreground absolute top-[180px] right-[4px] rotate-[-60deg] origin-bottom-right" />
    );
    
    const bodyParts = [head, body, rightArm, leftArm, rightLeg, leftLeg];

    return (
        <div className="relative h-64">
            {bodyParts.slice(0, numberOfGuesses)}
            <div className="h-10 w-1 bg-foreground absolute top-0 right-0" />
            <div className="h-1 w-48 bg-foreground ml-24" />
            <div className="h-64 w-1 bg-foreground ml-24" />
            <div className="h-1 w-64 bg-foreground" />
        </div>
    );
};

const Keyboard = ({ activeLetters, inactiveLetters, onSelect, disabled }: {
    activeLetters: string[];
    inactiveLetters: string[];
    onSelect: (letter: string) => void;
    disabled?: boolean;
}) => {
    return (
        <div className="grid grid-cols-7 gap-2 self-stretch">
            {alphabet.map(key => {
                const isActive = activeLetters.includes(key);
                const isInactive = inactiveLetters.includes(key);
                return (
                    <Button
                        key={key}
                        variant="outline"
                        size="lg"
                        className={cn(
                            'text-xl uppercase font-bold',
                            isActive && 'bg-green-500 text-white',
                            isInactive && 'bg-destructive text-white opacity-50',
                        )}
                        onClick={() => onSelect(key)}
                        disabled={isInactive || isActive || disabled}
                    >
                        {key}
                    </Button>
                )
            })}
        </div>
    )
}

export function HangmanGame() {
    const [wordToGuess, setWordToGuess] = useState(() => words[Math.floor(Math.random() * words.length)]);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    
    const incorrectLetters = guessedLetters.filter(letter => !wordToGuess.includes(letter));
    const correctLetters = guessedLetters.filter(letter => wordToGuess.includes(letter));

    const isLoser = incorrectLetters.length >= 6;
    const isWinner = wordToGuess.split("").every(letter => guessedLetters.includes(letter));
    
    const addGuessedLetter = useCallback((letter: string) => {
        if (guessedLetters.includes(letter) || isWinner || isLoser) return;
        setGuessedLetters(currentLetters => [...currentLetters, letter]);
    }, [guessedLetters, isWinner, isLoser]);
    
    const handleRestart = () => {
        setGuessedLetters([]);
        setWordToGuess(words[Math.floor(Math.random() * words.length)]);
    };

    return (
        <div className="flex flex-col items-center gap-8 max-w-lg mx-auto p-4 animate-in fade-in-50">
            {isWinner && (
                 <div className="text-center space-y-4">
                    <Award className="h-20 w-20 text-accent mx-auto" />
                    <h2 className="text-3xl font-bold">Parabéns, ganhaste!</h2>
                    <p className="text-xl text-muted-foreground">A palavra era: <span className="font-bold text-primary">{wordToGuess}</span></p>
                    <Button onClick={handleRestart} size="lg" className="animate-bounce">
                        <RotateCw className="mr-2 h-5 w-5" />
                        Jogar Novamente
                    </Button>
                </div>
            )}
            {isLoser && (
                <div className="text-center space-y-4">
                    <Skull className="h-20 w-20 text-destructive mx-auto" />
                    <h2 className="text-3xl font-bold">Oh não, perdeste!</h2>
                    <p className="text-xl text-muted-foreground">A palavra correta era: <span className="font-bold text-primary">{wordToGuess}</span></p>
                    <Button onClick={handleRestart} size="lg">
                        <RotateCw className="mr-2 h-5 w-5" />
                        Tentar Novamente
                    </Button>
                </div>
            )}
            
            {!isWinner && !isLoser && (
                <>
                    <HangmanDrawing numberOfGuesses={incorrectLetters.length} />

                    <div className="flex gap-4 text-4xl md:text-6xl font-bold tracking-widest font-mono">
                        {wordToGuess.split("").map((letter, index) => (
                            <span key={index} className="border-b-4 w-12 text-center">
                                <span className={cn(
                                    'invisible',
                                    guessedLetters.includes(letter) && 'visible'
                                )}>
                                    {letter}
                                </span>
                            </span>
                        ))}
                    </div>
                    
                    <Keyboard 
                        disabled={isWinner || isLoser}
                        activeLetters={correctLetters}
                        inactiveLetters={incorrectLetters}
                        onSelect={addGuessedLetter}
                    />

                    <Button onClick={handleRestart} variant="outline" className="mt-4">
                        <RotateCw className="mr-2 h-5 w-5" />
                        Nova Palavra
                    </Button>
                </>
            )}
        </div>
    );
}

