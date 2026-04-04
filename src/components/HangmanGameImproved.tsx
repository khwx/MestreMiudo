"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCw, Skull, Lightbulb, Loader2, Settings } from 'lucide-react';
import { generateWord } from '@/ai/flows/word-generation';
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Animais",
  "Frutas",
  "Cidades",
  "Profissões",
  "Cores",
  "Números",
  "Partes do Corpo",
  "Transportes",
];

const DIFFICULTIES = ["Fácil", "Normal", "Difícil"];

const HangmanDrawing = ({ numberOfGuesses }: { numberOfGuesses: number }) => {
    const bodyParts = [
        { key: "head", part: <div key="head" className="w-16 h-16 rounded-full border-4 border-foreground absolute top-[40px] right-[-24px]" /> },
        { key: "body", part: <div key="body" className="w-1 h-24 bg-foreground absolute top-[104px] right-0" /> },
        { key: "rightArm", part: <div key="rightArm" className="w-20 h-1 bg-foreground absolute top-[120px] right-[-80px] rotate-[-30deg] origin-bottom-left" /> },
        { key: "leftArm", part: <div key="leftArm" className="w-20 h-1 bg-foreground absolute top-[120px] right-[4px] rotate-[30deg] origin-bottom-right" /> },
        { key: "rightLeg", part: <div key="rightLeg" className="w-24 h-1 bg-foreground absolute top-[180px] right-[-92px] rotate-[60deg] origin-bottom-left" /> },
        { key: "leftLeg", part: <div key="leftLeg" className="w-24 h-1 bg-foreground absolute top-[180px] right-[4px] rotate-[-60deg] origin-bottom-right" /> },
    ];

    return (
        <div className="relative h-64">
            {bodyParts.slice(0, numberOfGuesses).map(p => p.part)}
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
                            isActive && 'bg-[hsl(var(--chart-3))] text-white',
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

const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

export function HangmanGame() {
    const [wordToGuess, setWordToGuess] = useState("");
    const [hint, setHint] = useState("");
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("Animais");
    const [difficulty, setDifficulty] = useState("Fácil");
    const [showSettings, setShowSettings] = useState(false);
    const [wins, setWins] = useState(0);
    const [losses, setLosses] = useState(0);
    const { toast } = useToast();

    const incorrectGuesses = guessedLetters.filter(letter => !normalize(wordToGuess).includes(letter));
    const correctGuesses = guessedLetters.filter(letter => normalize(wordToGuess).includes(letter));

    const wordDisplay = normalize(wordToGuess)
        .split('')
        .map(letter => correctGuesses.includes(letter) ? letter : '_')
        .join(' ');

    const gameState = {
        isWon: normalize(wordToGuess) === wordDisplay.replace(/ /g, ''),
        isLost: incorrectGuesses.length >= 6,
    };

    const startNewGame = useCallback(async () => {
        setLoading(true);
        setGuessedLetters([]);
        setShowHint(false);
        try {
            const newWordData = await generateWord({ category, difficulty });
            const newWord = newWordData.word.toUpperCase();
            setWordToGuess(newWord);
            setHint(newWordData.hint);
        } catch (error) {
            console.error("Failed to generate word:", error);
            toast({
                title: "Erro ao gerar palavra",
                description: "Não foi possível obter uma nova palavra. Tente novamente.",
                variant: "destructive"
            });
            setWordToGuess("MESTRE");
            setHint("Quem te ensina");
            setGuessedLetters([]);
        } finally {
            setLoading(false);
        }
    }, [category, difficulty, toast]);
    
    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleGuess = (letter: string) => {
        if (!guessedLetters.includes(letter)) {
            setGuessedLetters(letters => [...letters, letter]);
        }
    };

    useEffect(() => {
        if (gameState.isWon) {
            setWins(w => w + 1);
            toast({
                title: "🎉 Parabéns!",
                description: `Acertou a palavra: ${wordToGuess}`,
            });
        }
        if (gameState.isLost) {
            setLosses(l => l + 1);
            toast({
                title: "😔 Fim do Jogo",
                description: `A palavra era: ${wordToGuess}`,
                variant: "destructive"
            });
        }
    }, [gameState.isWon, gameState.isLost, wordToGuess, toast]);

    return (
        <div className="flex flex-col gap-6 p-6 max-w-2xl">
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Vitórias</p>
                        <p className="text-2xl font-bold text-green-600">{wins}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Derrotas</p>
                        <p className="text-2xl font-bold text-red-600">{losses}</p>
                    </div>
                </div>
                
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                    title="Configurações"
                >
                    <Settings className="w-5 h-5" />
                </Button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="border-2 border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Categoria</label>
                        <div className="grid grid-cols-4 gap-2">
                            {CATEGORIES.map(cat => (
                                <Button
                                    key={cat}
                                    variant={category === cat ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setCategory(cat);
                                        setShowSettings(false);
                                    }}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Dificuldade</label>
                        <div className="flex gap-2">
                            {DIFFICULTIES.map(diff => (
                                <Button
                                    key={diff}
                                    variant={difficulty === diff ? "default" : "outline"}
                                    onClick={() => {
                                        setDifficulty(diff);
                                        setShowSettings(false);
                                    }}
                                >
                                    {diff}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Game Status */}
            <div className="text-center">
                <p className="text-sm text-gray-600">Categoria: <span className="font-semibold">{category}</span> | Dificuldade: <span className="font-semibold">{difficulty}</span></p>
            </div>

            {/* Hangman Drawing */}
            <div className="flex justify-center">
                <HangmanDrawing numberOfGuesses={incorrectGuesses.length} />
            </div>

            {/* Word Display */}
            <div className="text-center space-y-2">
                <p className="text-5xl font-bold tracking-widest font-mono">{wordDisplay}</p>
                <p className="text-sm text-gray-600">
                    Erros: {incorrectGuesses.length}/6
                </p>
            </div>

            {/* Hint Button */}
            {!showHint && !gameState.isWon && !gameState.isLost && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHint(true)}
                        className="gap-2"
                    >
                        <Lightbulb className="w-4 h-4" />
                        Dica
                    </Button>
                </div>
            )}

            {showHint && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Dica:</p>
                    <p className="text-lg font-semibold text-yellow-800">{hint}</p>
                </div>
            )}

            {/* Keyboard */}
            {!gameState.isWon && !gameState.isLost && (
                <Keyboard
                    activeLetters={correctGuesses}
                    inactiveLetters={incorrectGuesses}
                    onSelect={handleGuess}
                    disabled={loading}
                />
            )}

            {/* Game Over Messages */}
            {gameState.isWon && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center space-y-4">
                    <div className="text-5xl">🎉</div>
                    <p className="text-xl font-bold text-green-600">Parabéns! Acertou!</p>
                    <p className="text-gray-600">Palavra: {wordToGuess}</p>
                </div>
            )}

            {gameState.isLost && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center space-y-4">
                    <div className="text-5xl">😢</div>
                    <p className="text-xl font-bold text-red-600">Fim do Jogo!</p>
                    <p className="text-gray-600">A palavra era: {wordToGuess}</p>
                </div>
            )}

            {/* Action Buttons */}
            <Button
                onClick={startNewGame}
                disabled={loading}
                size="lg"
                className="w-full gap-2"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                {gameState.isWon || gameState.isLost ? 'Nova Palavra' : 'Recomeçar'}
            </Button>
        </div>
    );
}
