'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Lock, CheckCircle, Star } from 'lucide-react';
import { getLessons, getCompletedLessons } from '@/lib/lessons';
import type { Lesson, LessonCompletion } from '@/app/shared-schemas';

const subjectConfig = {
  portugues: {
    name: 'Português',
    description: 'Aprender português é uma aventura de palavras e histórias!',
  },
  matematica: {
    name: 'Matemática',
    description: 'Desvenda os mistérios dos números e do cálculo!',
  },
  'estudo-do-meio': {
    name: 'Estudo do Meio',
    description: 'Explora o mundo ao teu redor!',
  },
};

const subjectMap: Record<string, 'Português' | 'Matemática' | 'Estudo do Meio'> = {
  portugues: 'Português',
  matematica: 'Matemática',
  'estudo-do-meio': 'Estudo do Meio',
};

export default function SubjectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subject = params.subject as string;
  const name = searchParams.get('name') || 'Amigo';
  const gradeParam = searchParams.get('grade') || '1';
  const grade = parseInt(gradeParam, 10);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState<Record<string, LessonCompletion>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const mappedSubject = subjectMap[subject];
      const lessonsData = await getLessons(mappedSubject, grade);
      setLessons(lessonsData);

      const completedLessons = await getCompletedLessons(name, mappedSubject);
      const completedMap = Object.fromEntries(
        completedLessons.map((lesson) => [lesson.lesson_id, lesson])
      );
      setCompleted(completedMap);
      setLoading(false);
    };

    fetchData();
  }, [subject, grade, name]);

  const config = subjectConfig[subject as keyof typeof subjectConfig];
  const completedCount = Object.keys(completed).length;
  const progressPercentage = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/learn?name=${name}&grade=${gradeParam}`}>
          <button className="p-2 hover:bg-secondary rounded-lg transition">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </Link>
        <div className="flex-grow">
          <h1 className="text-4xl font-headline font-bold">{config?.name}</h1>
          <p className="text-muted-foreground">{config?.description}</p>
        </div>
      </div>

      {/* Progress section */}
      <Card>
        <CardHeader>
          <CardTitle>O Teu Progresso</CardTitle>
          <CardDescription>
            {completedCount} de {lessons.length} lições concluídas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={progressPercentage} />
          <p className="text-sm text-muted-foreground text-center">
            {progressPercentage.toFixed(0)}% completo
          </p>
        </CardContent>
      </Card>

      {/* Lessons grid */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <p className="text-muted-foreground">A carregar lições...</p>
        </div>
      ) : lessons.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhuma lição disponível ainda. Volta em breve! 🚀
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => {
            const lessonCompleted = completed[lesson.id!];
            const isLocked = index > 0 && !completed[lessons[index - 1].id!];

            return (
              <div key={lesson.id}>
                {isLocked ? (
                  <Card className="h-full opacity-60 cursor-not-allowed">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardDescription>Completa a lição anterior</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Link
                    href={`/dashboard/learn/${subject}/lesson/${lesson.id}?name=${name}&grade=${gradeParam}`}
                  >
                    <Card className="h-full hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <CardTitle className="text-lg">{lesson.title}</CardTitle>
                            <CardDescription>{lesson.difficulty}</CardDescription>
                          </div>
                          {lessonCompleted ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground mb-3">{lesson.description}</p>
                        {lesson.story_context && (
                          <p className="text-sm italic text-primary mb-4">{lesson.story_context}</p>
                        )}
                        {lessonCompleted && (
                          <div className="flex items-center gap-2">
                            {[...Array(lessonCompleted.stars)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                            <span className="text-sm font-semibold">
                              +{lessonCompleted.coins_earned} moedas
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
