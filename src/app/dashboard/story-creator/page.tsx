
"use client"

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Volume2, BookHeart, PlayCircle } from 'lucide-react';
import { generateStoryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import type { SpeechMark } from '@/app/shared-schemas';

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

const StoryDisplay = ({ result, isGeneratingAudio }: { result: StoryResult, isGeneratingAudio: boolean }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const storyTextRef = useRef<HTMLParagraphElement | null>(null);
    const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (audio && result.audioDataUri) {
            audio.src = result.audioDataUri;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                }).catch(error => {
                    console.error("Autoplay failed:", error);
                    setNeedsUserInteraction(true);
                    setIsPlaying(false);
                });
            }
        }
    }, [result.audioDataUri]);


    const handlePlayAudio = () => {
        if (audioRef.current) {
            if (audioRef.current.paused) {
                audioRef.current.play();
                setIsPlaying(true);
                setNeedsUserInteraction(false);
            } else {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        }
    };
    
    const handleTimeUpdate = () => {
        if (!audioRef.current || !result.speechMarks || !storyTextRef.current) return;

        const currentTime = audioRef.current.currentTime;
        const wordMarks = result.speechMarks.filter(mark => mark.type === 'word');
        
        const currentMark = wordMarks.find((mark, i) => {
            const markTime = parseFloat(mark.time.seconds) + mark.time.nanos / 1e9;
            const nextMark = wordMarks[i + 1];
            const nextMarkTime = nextMark ? (parseFloat(nextMark.time.seconds) + nextMark.time.nanos / 1e9) : currentTime + 1;
            return currentTime >= markTime && currentTime < nextMarkTime;
        });

        if (currentMark) {
            const range = document.createRange();
            const textNode = storyTextRef.current.firstChild;
            if (textNode) {
                try {
                    const fullText = textNode.textContent || '';
                    const startOffset = (currentMark as any).startOffset;
                    const endOffset = (currentMark as any).endOffset;

                    if (startOffset !== undefined && endOffset !== undefined && startOffset >= 0 && endOffset <= fullText.length) {
                        range.setStart(textNode, startOffset);
                        range.setEnd(textNode, endOffset);
                        const rect = range.getBoundingClientRect();
                        const containerRect = storyTextRef.current.getBoundingClientRect();

                        setHighlightStyle({
                            position: 'absolute',
                            top: `${rect.top - containerRect.top}px`,
                            left: `${rect.left - containerRect.left}px`,
                            width: `${rect.width}px`,
                            height: `${rect.height}px`,
                            backgroundColor: 'hsl(var(--primary) / 0.3)',
                            borderRadius: '4px',
                            transition: 'top 0.1s, left 0.1s, width 0.1s, height 0.1s',
                            pointerEvents: 'none',
                        });
                    } else {
                         setHighlightStyle({ display: 'none' });
                    }
                } catch(e) {
                     console.error("Range error:", e);
                     setHighlightStyle({ display: 'none' });
                }
            }
        }
    };
    
    useEffect(() => {
        if (result.story && result.speechMarks) {
            let currentIndex = 0;
            result.speechMarks.forEach(mark => {
                if (mark.type === 'word') {
                    const wordIndex = result.story.indexOf(mark.value, currentIndex);
                    if (wordIndex !== -1) {
                        (mark as any).startOffset = wordIndex;
                        (mark as any).endOffset = wordIndex + mark.value.length;
                        currentIndex = wordIndex + mark.value.length;
                    }
                }
            });
        }
    }, [result.story, result.speechMarks]);

    const handleAudioEnded = () => {
        setHighlightStyle({});
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
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
                    
                     <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handlePlayAudio} 
                        aria-label={isPlaying ? "Pausar a história" : "Ouvir a história"}
                        disabled={!result.audioDataUri}
                        >
                         {isGeneratingAudio && !result.audioDataUri ? (
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                         ) : (
                            <Volume2 className={`h-6 w-6 text-primary ${isPlaying ? 'animate-pulse' : ''}`} />
                         )}
                    </Button>
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
                    {needsUserInteraction && (
                        <div className="absolute inset-0 bg-background/80 flex justify-center items-center z-10 backdrop-blur-sm">
                            <Button size="lg" onClick={handlePlayAudio}>
                                <PlayCircle className="mr-2 h-6 w-6" />
                                Ouvir a História
                            </Button>
                        </div>
                    )}
                    <p ref={storyTextRef} className="text-lg/relaxed whitespace-pre-wrap relative">
                        {isPlaying && <span style={highlightStyle} />}
                        {result.story}
                    </p>
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
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
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
        setIsGeneratingAudio(true);

        try {
            const storyResult = await generateStoryAction({
                keywords,
                gradeLevel: parseInt(grade, 10),
            });
            setResult(storyResult);
             if (!storyResult.audioDataUri) {
                toast({
                    title: "Erro no áudio",
                    description: "Não foi possível gerar a narração. Tente novamente.",
                    variant: "destructive"
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
            setIsGeneratingAudio(false);
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
                {result && <StoryDisplay result={result} isGeneratingAudio={isGeneratingAudio} />}
            </div>
        </div>
    );
}
