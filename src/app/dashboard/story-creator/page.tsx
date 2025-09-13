
"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Play, Pause, BookHeart, AlertTriangle } from 'lucide-react';
import { generateStoryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import type { SpeechMark, StoryGenerationInput } from '@/app/shared-schemas';

const keywordSuggestions = [
    {
        category: "Heróis e Heroínas",
        words: ["Princesa", "Cavaleiro", "Fada", "Robô", "Super-herói", "Sereia"]
    },
    {
        category: "Lugares Mágicos",
        words: ["Castelo", "Floresta", "Espaço", "Oceano", "Vulcão", "Arco-íris"]
    },
    {
        category: "Aventuras e Objetos",
        words: ["Tesouro", "Dragão", "Estrela", "Magia", "Chocolate", "Música"]
    }
];

type StoryResult = {
    title: string;
    story: string;
    audioDataUri?: string;
    speechMarks?: SpeechMark[];
    images?: string[];
};

const StoryDisplay = ({ result }: { result: StoryResult }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const storyRef = useRef<HTMLParagraphElement | null>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(true);
    const [audioError, setAudioError] = useState(false);
    const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !result.audioDataUri) {
            setIsLoadingAudio(false);
            setAudioError(!result.audioDataUri); // Set error if URI is missing
            return;
        }

        const handleCanPlay = () => setIsLoadingAudio(false);
        const handleError = () => {
            setIsLoadingAudio(false);
            setAudioError(true);
        };
        
        // Reset states for new story
        setIsLoadingAudio(true);
        setAudioError(false);
        setIsPlaying(false);

        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.src = result.audioDataUri;
        audio.load();

        return () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);
        };
    }, [result.audioDataUri]);

    const calculateSpeechMarksOffsets = useCallback(() => {
        if (!result.story || !result.speechMarks || !storyRef.current) return;

        let charIndex = 0;
        const textContent = storyRef.current.textContent || '';
        
        result.speechMarks.forEach(mark => {
            if (mark.type === 'word') {
                const wordIndex = textContent.indexOf(mark.value, charIndex);
                if (wordIndex !== -1) {
                    (mark as any).start = wordIndex;
                    (mark as any).end = wordIndex + mark.value.length;
                    charIndex = (mark as any).end;
                }
            }
        });
    }, [result.story, result.speechMarks]);
    
    useEffect(() => {
        calculateSpeechMarksOffsets();
        window.addEventListener('resize', calculateSpeechMarksOffsets);
        return () => window.removeEventListener('resize', calculateSpeechMarksOffsets);
    }, [calculateSpeechMarksOffsets]);

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio || isLoadingAudio || audioError) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(error => {
                console.error("Playback failed:", error);
                setIsPlaying(false);
                setAudioError(true);
            });
        }
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (!audio || !result.speechMarks || !storyRef.current) return;

        const currentTime = audio.currentTime;
        const wordMarks = result.speechMarks.filter(mark => mark.type === 'word');
        
        const currentMark = wordMarks.find((mark, i) => {
            const markTime = parseFloat(mark.time.seconds) + mark.time.nanos / 1e9;
            const nextMark = wordMarks[i + 1];
            const nextMarkTime = nextMark ? (parseFloat(nextMark.time.seconds) + nextMark.time.nanos / 1e9) : audio.duration;
            return currentTime >= markTime && currentTime < nextMarkTime;
        });

        if (currentMark && 'start' in currentMark && 'end' in currentMark) {
            const range = document.createRange();
            const textNode = storyRef.current.firstChild;
            if (textNode) {
                try {
                    range.setStart(textNode, (currentMark as any).start);
                    range.setEnd(textNode, (currentMark as any).end);
                    const rect = range.getBoundingClientRect();
                    const containerRect = storyRef.current.getBoundingClientRect();
                    
                    setHighlightStyle({
                        position: 'absolute',
                        top: `${rect.top - containerRect.top}px`,
                        left: `${rect.left - containerRect.left}px`,
                        width: `${rect.width}px`,
                        height: `${rect.height}px`,
                    });
                } catch (e) {
                    console.error("Error setting range for highlight:", e);
                    setHighlightStyle({ display: 'none' });
                }
            }
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setHighlightStyle({});
    };

    const renderAudioButton = () => {
        let icon;
        let disabled = false;
        let title = "";

        if (isLoadingAudio) {
            icon = <Loader2 className="h-6 w-6 text-primary animate-spin" />;
            disabled = true;
            title = "A preparar o áudio...";
        } else if (audioError) {
            icon = <AlertTriangle className="h-6 w-6 text-destructive" />;
            disabled = true;
            title = "Narração indisponível";
        } else if (isPlaying) {
            icon = <Pause className="h-6 w-6 text-primary" />;
            title = "Pausar a história";
        } else {
            icon = <Play className="h-6 w-6 text-primary" />;
            title = "Ouvir a história";
        }

        return (
            <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePlayPause} 
                aria-label={title}
                title={title}
                disabled={disabled}
                >
                {icon}
            </Button>
        );
    };

    return (
        <Card className="animate-in fade-in-50">
             <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleAudioEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
            />
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-3xl font-headline">{result.title}</CardTitle>
                    {renderAudioButton()}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {result.images && result.images.length > 0 && (
                     <div className="grid grid-cols-3 gap-4 my-4">
                        {result.images.map((src, index) => (
                             <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
                                <Image src={src} alt={`Ilustração da história ${index + 1}`} fill style={{objectFit: 'cover'}} sizes="(max-width: 768px) 30vw, 10vw" />
                             </div>
                        ))}
                    </div>
                )}
               
                <div className="relative">
                    <p ref={storyRef} className="text-lg/relaxed whitespace-pre-wrap">
                        {result.story}
                    </p>
                    {isPlaying && (
                         <div style={highlightStyle} className="bg-primary/30 rounded-md transition-all duration-75 pointer-events-none" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


export default function StoryCreatorPage() {
    const searchParams = useSearchParams();
    const grade = searchParams.get('grade') || '1';

    const [keywords, setKeywords] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<StoryResult | null>(null);
    const { toast } = useToast();
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (result && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    const handleAddKeyword = (word: string) => {
        setKeywords(prev => prev ? `${prev}, ${word}` : word);
    };

    const handleGenerateStory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keywords.trim()) {
            toast({
                title: "Palavras em falta",
                description: "Por favor, escreve ou escolhe pelo menos uma palavra-chave para a tua história.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        setResult(null);
        
        const storyInput: StoryGenerationInput = {
            keywords,
            gradeLevel: parseInt(grade, 10),
        };

        try {
            const storyResult = await generateStoryAction(storyInput);
            setResult(storyResult);
             if (!storyResult.audioDataUri) {
                toast({
                    title: "Aviso sobre o áudio",
                    description: "Não foi possível gerar a narração para esta história. Pode ser um problema temporário.",
                    variant: "default"
                });
            }
        } catch (error) {
            console.error("Failed to generate story:", error);
            toast({
                title: "Erro ao criar a história",
                description: "Não foi possível gerar a tua história. Por favor, tenta novamente.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in-50">
            <div className="text-center">
                <BookHeart className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-headline font-bold">Oficina de Histórias</h1>
                <p className="text-xl text-muted-foreground mt-2">Dá-me algumas palavras e eu crio uma história mágica para ti!</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Cria a tua Aventura</CardTitle>
                    <CardDescription>Escreve algumas palavras ou clica nas sugestões abaixo. Depois, clica em "Criar História!"</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleGenerateStory} className="flex flex-col gap-4">
                        <div className="flex-grow space-y-2">
                            <Label htmlFor="keywords" className="sr-only">Palavras-chave</Label>
                            <Input
                                id="keywords"
                                placeholder="dragão, castelo, princesa..."
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                disabled={loading}
                                className="h-12 text-lg"
                                suppressHydrationWarning
                            />
                        </div>

                        <div className="space-y-4">
                            {keywordSuggestions.map((category) => (
                                <div key={category.category}>
                                    <h3 className="text-md font-semibold text-muted-foreground mb-2">{category.category}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {category.words.map((word) => (
                                            <Badge 
                                                key={word} 
                                                variant="outline" 
                                                className="cursor-pointer hover:bg-accent text-base"
                                                onClick={() => !loading && handleAddKeyword(word)}
                                            >
                                                {word}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <Button type="submit" disabled={loading} className="h-12 text-lg px-8 mt-4 self-center">
                            {loading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> A criar...</>
                            ) : (
                                <><Wand2 className="mr-2 h-5 w-5" /> Criar História!</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {loading && (
                <div className="text-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">A tecer a tua história com fios de imaginação...</p>
                </div>
            )}

            <div ref={resultRef}>
                {result && <StoryDisplay result={result} />}
            </div>
        </div>
    );
}
