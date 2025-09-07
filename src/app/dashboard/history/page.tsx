
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getFullQuizHistory, type QuizEntry } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Book, Divide, Leaf, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const subjectIcons = {
    'Português': <Book className="h-5 w-5" />,
    'Matemática': <Divide className="h-5 w-5" />,
    'Estudo do Meio': <Leaf className="h-5 w-5" />,
};

export default function HistoryPage() {
    const searchParams = useSearchParams();
    const name = searchParams.get('name');
    const [history, setHistory] = useState<QuizEntry[]>([]);
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
                                            {subjectIcons[entry.subject]}
                                            <div>
                                                <p className="font-bold text-xl">{entry.subject}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(entry.timestamp), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg">{entry.quiz.quizQuestions.length} Perguntas</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                    <ul className="space-y-4">
                                        {entry.quiz.quizQuestions.map((q, qIndex) => (
                                            <li key={qIndex} className="p-3 bg-muted/50 rounded-lg">
                                                <p className="font-semibold">{qIndex + 1}. {q.question}</p>
                                                <p className="text-sm"><strong>Tópico:</strong> {q.topic}</p>
                                                <p className="text-sm text-green-600"><strong>Resposta Correta:</strong> {q.correctAnswer}</p>
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
