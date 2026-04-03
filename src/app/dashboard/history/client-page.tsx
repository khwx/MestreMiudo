
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getFullQuizHistory } from '@/app/actions';
import type { QuizResultEntry } from '@/app/shared-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Book, Divide, Leaf, Loader2, Check, X, Shuffle } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const subjectIcons: Record<string, React.ReactNode> = {
    'Português': <Book className="h-5 w-5" />,
    'Matemática': <Divide className="h-5 w-5" />,
    'Estudo do Meio': <Leaf className="h-5 w-5" />,
    'Misto': <Shuffle className="h-5 w-5" />,
};

export default function HistoryClientPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const name = searchParams.get('name');
    const [history, setHistory] = useState<QuizResultEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (name) {
            getFullQuizHistory(name)
                .then(data => {
                    const sortedHistory = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    setHistory(sortedHistory);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [name]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!name) {
        return <p className="text-center text-destructive">Nome do aluno não especificado.</p>;
    }
    
    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="gap-2 self-start mb-4">
                ← Voltar ao Dashboard
            </Button>
            <h1 className="text-4xl font-headline font-bold text-center">Histórico de Quizzes de {name}</h1>
            {history.length === 0 ? (
                <p className="text-center text-muted-foreground text-lg">Ainda não há quizzes concluídos.</p>
            ) : (
                <Accordion type="single" collapsible className="w-full">
    {history.map((entry, index) => (
        <Card key={index} className="mb-4">
            <AccordionItem value={`item-${index}`} className="border-b-0">
                <AccordionTrigger className="p-6">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-4">
                            {subjectIcons[entry.subject] || <Book className="h-5 w-5" />}
                            <div>
                                <p className="font-bold text-xl">{entry.subject === 'Misto' ? 'Desafio Surpresa' : entry.subject}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(entry.timestamp), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold">Pontuação: {entry.score}/{entry.numberOfQuestions}</p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    <h4 className="font-bold mb-2">Respostas:</h4>
                    <ul className="space-y-4">
                        {entry.answers.map((answer, qIndex) => (
                            <li key={qIndex} className={cn("p-3 rounded-lg", answer.isCorrect ? 'bg-[hsl(var(--chart-2))]/20' : 'bg-destructive/20')}>
                                <p className="font-semibold">{qIndex + 1}. {answer.question}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {answer.isCorrect ? <Check className="h-4 w-4 text-[hsl(var(--chart-2))]" /> : <X className="h-4 w-4 text-destructive" />}
                                    <p className={cn("text-sm", answer.isCorrect ? 'text-[hsl(var(--chart-2))]':'text-destructive')}>
                                        A tua resposta: {answer.selectedAnswer}
                                    </p>
                                </div>
                                {!answer.isCorrect && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Resposta Correta: {answer.correctAnswer}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Tópico: {answer.topic}</p>
                            </li>
                        ))}
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Card>
    ))}
                </Accordion>
            )}
        </div>
    );
}
