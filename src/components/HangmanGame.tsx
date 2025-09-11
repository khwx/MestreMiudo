
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCw, Skull, Lightbulb, Loader2 } from 'lucide-react';
import { generateWord } from '@/ai/flows/word-generation';
import { useToast } from "@/hooks/use-toast";

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

const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function HangmanGame() {
    const [wordData, setWordData] = useState<{ word: string; hint: string } | null>(null);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchWord = useCallback(async () => {
        setLoading(true);
        setGuessedLetters([]);
        setShowHint(false);
        try {
            const newWordData = await generateWord({ category: "Animais", difficulty: "Fácil" });
            setWordData({
                word: newWordData.word.toUpperCase(),
                hint: newWordData.hint
            });
        } catch (error) {
            console.error("Failed to generate word:", error);
            toast({
                title: "Erro ao gerar palavra",
                description: "Não foi possível obter uma nova palavra. Tente novamente.",
                variant: "destructive"
            });
            // Fallback to a default word in case of API failure
            setWordData({ word: "MESTRE", hint: "Quem te ensina a jogar" });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchWord();
    }, [fetchWord]);
    
    const wordToGuess = wordData?.word || "";
    const hint = wordData?.hint || "";
    
    const normalizedWordToGuess = normalize(wordToGuess);

    const incorrectLetters = guessedLetters.filter(letter => !normalizedWordToGuess.includes(letter));
    const correctLetters = guessedLetters.filter(letter => normalizedWordToGuess.includes(letter));

    const isLoser = incorrectLetters.length >= 6;
    const isWinner = wordToGuess.split("").every(letter => guessedLetters.includes(normalize(letter)));
    
    const addGuessedLetter = useCallback((letter: string) => {
        if (guessedLetters.includes(letter) || isWinner || isLoser) return;
        setGuessedLetters(currentLetters => [...currentLetters, letter]);
    }, [guessedLetters, isWinner, isLoser]);
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-muted-foreground">A pensar numa palavra nova...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-8 max-w-lg mx-auto p-4 animate-in fade-in-50">
            {isWinner && (
                 <div className="text-center space-y-4">
                    <Award className="h-20 w-20 text-accent mx-auto" />
                    <h2 className="text-3xl font-bold">Parabéns, ganhaste!</h2>
                    <p className="text-xl text-muted-foreground">A palavra era: <span className="font-bold text-primary">{wordToGuess}</span></p>
                    <Button onClick={fetchWord} size="lg" className="animate-bounce">
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
                    <Button onClick={fetchWord} size="lg">
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
                                    (guessedLetters.includes(normalize(letter)) || letter === ' ') && 'visible'
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
                        <Button onClick={fetchWord} variant="outline" className="mt-4">
                            <RotateCw className="mr-2 h-5 w-5" />
                            Nova Palavra
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
