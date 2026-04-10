
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getFullQuizHistory, getStudentLessonHistoryAction } from '@/app/actions';
import type { QuizResultEntry } from '@/app/shared-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Book, Divide, Leaf, Loader2, Check, X, Shuffle, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const subjectIcons: Record<string, React.ReactNode> = {
    'Português': <Book className="h-5 w-5" />,
    'Matemática': <Divide className="h-5 w-5" />,
    'Estudo do Meio': <Leaf className="h-5 w-5" />,
    'Misto': <Shuffle className="h-5 w-5" />,
};

interface LessonEntry {
    id?: string;
    lesson_id: string;
    student_id: string;
    completed: boolean;
    stars: number;
    coins_earned: number;
    score: number;
    completed_at: string;
    lessons?: {
        title: string;
        subject: string;
    };
}

export default function HistoryClientPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const name = searchParams.get('name');
    const [quizHistory, setQuizHistory] = useState<QuizResultEntry[]>([]);
    const [lessonHistory, setLessonHistory] = useState<LessonEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (name) {
            Promise.all([
                getFullQuizHistory(name),
                getStudentLessonHistoryAction(name)
            ])
                .then(([quizData, lessonData]) => {
                    const sortedQuizzes = (quizData || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    setQuizHistory(sortedQuizzes);
                    setLessonHistory(lessonData || []);
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
    
    const allHistory = [
        ...lessonHistory.map(lesson => ({
            type: 'lesson' as const,
            subject: lesson.lessons?.subject || 'Português',
            title: lesson.lessons?.title || 'Lição',
            timestamp: lesson.completed_at,
            score: lesson.score,
            stars: lesson.stars,
            coins: lesson.coins_earned,
            id: lesson.id
        })),
        ...quizHistory.map(quiz => ({
            type: 'quiz' as const,
            subject: quiz.subject,
            title: quiz.subject === 'Misto' ? 'Desafio Surpresa' : quiz.subject,
            timestamp: quiz.timestamp,
            score: quiz.score,
            totalQuestions: quiz.numberOfQuestions,
            id: quiz.timestamp
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="gap-2 self-start mb-4">
                ← Voltar ao Dashboard
            </Button>
            <h1 className="text-4xl font-headline font-bold text-center">Histórico de {name}</h1>
            {allHistory.length === 0 ? (
                <p className="text-center text-muted-foreground text-lg">Ainda não há atividades concluídas.</p>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center mb-6">
                        <Card className="p-4">
                            <div className="text-2xl font-bold">{quizHistory.length}</div>
                            <div className="text-sm text-muted-foreground">Quizzes</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-2xl font-bold">{lessonHistory.length}</div>
                            <div className="text-sm text-muted-foreground">Lições</div>
                        </Card>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
    {allHistory.map((entry, index) => (
        <Card key={index} className="mb-4">
            <AccordionItem value={`item-${index}`} className="border-b-0">
                <AccordionTrigger className="p-6">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-4">
                            {entry.type === 'lesson' ? 
                                <GraduationCap className="h-5 w-5 text-green-600" /> : 
                                (subjectIcons[entry.subject] || <Book className="h-5 w-5" />)
                            }
                            <div>
                                <p className="font-bold text-xl">{entry.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(entry.timestamp), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            {entry.type === 'lesson' ? (
                                <p className="text-lg font-bold text-green-600">
                                    {'⭐'.repeat(entry.stars)} +{entry.coins}💰
                                </p>
                            ) : (
                                <p className="text-lg font-bold">Pontuação: {entry.score}{entry.totalQuestions ? `/${entry.totalQuestions}` : ''}</p>
                            )}
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    {entry.type === 'lesson' ? (
                        <div className="text-center py-4">
                            <p className="text-lg font-semibold mb-2">🎉 Lição Concluída!</p>
                            <div className="flex justify-center gap-6">
                                <div>
                                    <div className="text-2xl font-bold">⭐{entry.stars}</div>
                                    <div className="text-sm text-muted-foreground">Estrelas</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">💰{entry.coins}</div>
                                    <div className="text-sm text-muted-foreground">Moedas</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{entry.score}%</div>
                                    <div className="text-sm text-muted-foreground">Pontuação</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h4 className="font-bold mb-2">Respostas:</h4>
                            <ul className="space-y-4">
                                {(() => {
                                    const quiz = quizHistory.find(q => q.timestamp === entry.id);
                                    return quiz?.answers.map((answer, qIndex) => (
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
                                    ));
                                })()}
                            </ul>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Card>
    ))}
                    </Accordion>
                </div>
            )}
        </div>
    );
}
