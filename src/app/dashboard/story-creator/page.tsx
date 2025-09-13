
"use client"

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Volume2, BookHeart } from 'lucide-react';
import { generateStoryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import type { SpeechMark, StoryGenerationInput } from '@/app/shared-schemas';
import { StoryGenerationInputSchema } from '@/app/shared-schemas';

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
    const [currentWord, setCurrentWord] = useState('');
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);

    const handlePlayAudio = () => {
        if (audioRef.current) {
            if (audioRef.current.paused) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setCurrentWordIndex(-1);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current || !result.speechMarks) return;

        const currentTime = audioRef.current.currentTime;
        const speechMarks = result.speechMarks.filter(mark => mark.type === 'word');
        
        let activeIndex = -1;
        for (let i = speechMarks.length - 1; i >= 0; i--) {
            const markTime = parseFloat(speechMarks[i].time.seconds) + speechMarks[i].time.nanos / 1e9;
            if (currentTime >= markTime) {
                activeIndex = i;
                break;
            }
        }
        setCurrentWordIndex(activeIndex);
    };

    const handleAudioEnded = () => {
        setCurrentWordIndex(-1);
    }
    
    // Split story into words, keeping punctuation attached
    const words = result.story.split(/(\s+)/).filter(w => w.trim().length > 0);

    return (
        <Card className="animate-in fade-in-50">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-3xl font-headline">{result.title}</CardTitle>
                    {result.audioDataUri && (
                        <>
                            <audio 
                                ref={audioRef}
                                src={result.audioDataUri}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleAudioEnded}
                                className="hidden"
                            />
                            <Button variant="outline" size="icon" onClick={handlePlayAudio} aria-label="Ouvir a história">
                                <Volume2 className="h-6 w-6 text-primary" />
                            </Button>
                        </>
                    )}
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
               
                <p className="text-lg/relaxed whitespace-pre-wrap">
                    {words.map((word, index) => (
                        <span key={index} className={index === currentWordIndex ? 'bg-yellow-200 rounded-md' : ''}>
                           {word}{' '}
                        </span>
                    ))}
                </p>
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

        try {
            const storyResult = await generateStoryAction({
                keywords,
                gradeLevel: parseInt(grade, 10),
            });
            setResult(storyResult);
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
