
"use client"

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Volume2, BookHeart } from 'lucide-react';
import { generateStoryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export default function StoryCreatorPage() {
    const searchParams = useSearchParams();
    const name = searchParams.get('name') || 'Amigo';
    const grade = searchParams.get('grade') || '1';

    const [keywords, setKeywords] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ title: string; story: string; audioDataUri?: string } | null>(null);
    const { toast } = useToast();
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const handleGenerateStory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keywords.trim()) {
            toast({
                title: "Palavras em falta",
                description: "Por favor, escreve pelo menos uma palavra-chave para a tua história.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        setResult(null);
        if (audio) {
            audio.pause();
            setAudio(null);
        }

        try {
            const storyResult = await generateStoryAction({
                keywords,
                gradeLevel: parseInt(grade, 10),
            });
            setResult(storyResult);
            if (storyResult.audioDataUri) {
                const newAudio = new Audio(storyResult.audioDataUri);
                setAudio(newAudio);
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
    
    const handlePlayAudio = () => {
        if (audio) {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in-50">
            <div className="text-center">
                <BookHeart className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-headline font-bold">Oficina de Histórias</h1>
                <p className="text-xl text-muted-foreground mt-2">Dá-me 3 palavras e eu crio uma história mágica para ti!</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Cria a tua Aventura</CardTitle>
                    <CardDescription>Escreve algumas palavras separadas por vírgulas (por exemplo: "dragão, castelo, princesa") e clica em "Criar História!"</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleGenerateStory} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow space-y-2">
                            <Label htmlFor="keywords" className="sr-only">Palavras-chave</Label>
                            <Input
                                id="keywords"
                                placeholder="dragão, castelo, princesa"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                disabled={loading}
                                className="h-12 text-lg"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="h-12 text-lg px-8">
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

            {result && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-3xl font-headline">{result.title}</CardTitle>
                            {result.audioDataUri && (
                                <Button variant="outline" size="icon" onClick={handlePlayAudio} aria-label="Ouvir a história">
                                    <Volume2 className="h-6 w-6 text-primary" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg/relaxed whitespace-pre-wrap">{result.story}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
