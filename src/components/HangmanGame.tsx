
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCw, Skull, Lightbulb } from 'lucide-react';

const wordList = [
    { word: "CASA", hint: "Onde moramos" },
    { word: "BOLA", hint: "Objeto redondo para brincar" },
    { word: "GATO", hint: "Animal que mia" },
    { word: "MACACO", hint: "Gosta de bananas" },
    { word: "ELEFANTE", hint: "Tem uma tromba grande" },
    { word: "LIVRO", hint: "Tem páginas e histórias" },
    { word: "ESCOLA", hint: "Onde aprendemos a ler" },
    { word: "FLOR", hint: "Planta bonita e cheirosa" },
    { word: "SOL", hint: "A estrela que nos aquece" },
    { word: "LUA", hint: "Vemos no céu à noite" },
    { word: "ESTRELA", hint: "Brilha no céu noturno" },
    { word: "ARVORE", hint: "Dá-nos sombra e frutos" },
    { word: "RIO", hint: "Água corrente que vai para o mar" },
    { word: "MAR", hint: "Grande e com água salgada" },
    { word: "PEIXE", hint: "Animal que vive na água" },
    { word: "LEAO", hint: "O rei da selva" },
];

const getRandomWord = () => wordList[Math.floor(Math.random() * wordList.length)];

const HangmanDrawing = ({ numberOfGuesses }: { numberOfGuesses: number }) => {
    const bodyParts = [
        <div key="head" className="w-16 h-16 rounded-full border-4 border-foreground absolute top-[40px] right-[-24px]" />,
        <div key="body" className="w-1 h-24 bg-foreground absolute top-[104px] right-0" />,
        <div key="rightArm" className="w-20 h-1 bg-foreground absolute top-[120px] right-[-80px] rotate-[-30deg] origin-bottom-left" />,
        <div key="leftArm" className="w-20 h-1 bg-foreground absolute top-[120px] right-[4px] rotate-[30deg] origin-bottom-right" />,
        <div key="rightLeg" className="w-24 h-1 bg-foreground absolute top-[180px] right-[-92px] rotate-[60deg] origin-bottom-left" />,
        <div key="leftLeg" className="w-24 h-1 bg-foreground absolute top-[180px] right-[4px] rotate-[-60deg] origin-bottom-right" />
    ];

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
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
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
    const [wordData, setWordData] = useState(getRandomWord);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [showHint, setShowHint] = useState(false);
    
    const wordToGuess = wordData.word;
    const hint = wordData.hint;

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
        setWordData(getRandomWord());
        setShowHint(false);
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
                    
                    {showHint && (
                        <div className="text-center bg-yellow-100 border border-yellow-300 text-yellow-800 p-2 rounded-lg">
                            <p><span className="font-bold">Dica:</span> {hint}</p>
                        </div>
                    )}
                    
                    <div className="self-stretch">
                        <Keyboard 
                            disabled={isWinner || isLoser}
                            activeLetters={correctLetters}
                            inactiveLetters={incorrectLetters}
                            onSelect={addGuessedLetter}
                        />
                    </div>
                    
                    <div className="flex gap-4 mt-4">
                        {!showHint && (
                             <Button onClick={() => setShowHint(true)} variant="outline" className="mt-4">
                                <Lightbulb className="mr-2 h-5 w-5" />
                                Dá-me uma Dica!
                            </Button>
                        )}
                        <Button onClick={handleRestart} variant="outline" className="mt-4">
                            <RotateCw className="mr-2 h-5 w-5" />
                            Nova Palavra
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
