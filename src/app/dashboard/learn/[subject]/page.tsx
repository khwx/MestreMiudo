'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Lock, CheckCircle, Star, Book, Divide, Leaf } from 'lucide-react';
import { getLessons, getCompletedLessons } from '@/lib/lessons';
import type { Lesson, LessonCompletion } from '@/app/shared-schemas';

const subjectConfig = {
  portugues: {
    name: 'Português',
    description: 'Aprende português é uma aventura de palavras e histórias!',
    icon: Book,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    gradientFrom: 'from-green-100',
    gradientTo: 'to-emerald-200',
  },
  matematica: {
    name: 'Matemática',
    description: 'Desvenda os mistérios dos números e do cálculo!',
    icon: Divide,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    gradientFrom: 'from-blue-100',
    gradientTo: 'to-sky-200',
  },
  'estudo-do-meio': {
    name: 'Estudo do Meio',
    description: 'Explora o mundo ao teu redor!',
    icon: Leaf,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    gradientFrom: 'from-orange-100',
    gradientTo: 'to-amber-200',
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
      if (!mappedSubject) return;
      
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

  if (!config) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Disciplina não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/learn?name=${name}&grade=${gradeParam}`}>
          <button className="p-3 hover:bg-white/50 rounded-xl transition-all duration-300">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </Link>
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <config.icon className={`h-10 w-10 ${config.color}`} />
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {config.name}
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {config.description}
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <div className={`card-kid border-4 ${config.borderColor} bg-white shadow-2xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-200">📚 O Teu Progresso</h2>
            <div className="bg-white px-4 py-2 rounded-full border-2 border-gray-200">
              <span className="font-black text-lg">{completedCount}</span>
              <span className="text-gray-500 dark:text-gray-400"> / {lessons.length}</span>
            </div>
          </div>
          <div className="progress-kid">
            <div 
              className="progress-kid-bar bg-gradient-to-r from-green-400 to-emerald-500" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 mt-4">
            {progressPercentage === 100 
              ? '🎉 Parabéns! Completaste todas as lições!' 
              : `🎯 Faltam ${lessons.length - completedCount} lições para completar!`}
          </p>
        </div>
      </div>

      {/* Lessons Grid */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-xl text-gray-500 dark:text-gray-400">A carregar lições...</p>
          </div>
        </div>
      ) : lessons.length === 0 ? (
        <div className="card-kid border-4 border-gray-300 bg-white shadow-xl max-w-2xl mx-auto">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Nenhuma lição disponível ainda. Volta em breve! 🚀
            </p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => {
            const lessonCompleted = completed[lesson.id!];
            const isLocked = index > 0 && !completed[lessons[index - 1].id!];
            
            return (
              <div key={lesson.id}>
                {isLocked ? (
                  <div className={`card-kid border-4 bg-gray-100 opacity-60 cursor-not-allowed ${config.borderColor}`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-grow">
                           <h3 className="text-xl font-black text-gray-400 dark:text-gray-500">{lesson.title}</h3>
                           <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{lesson.difficulty}</p>
                        </div>
                         <Lock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                       <p className="text-gray-400 dark:text-gray-500">{lesson.description}</p>
                       <div className="mt-4 flex items-center gap-2 text-gray-400 dark:text-gray-500">
                         <span className="text-sm">🔒 Completa a lição anterior</span>
                       </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/dashboard/learn/${subject}/lesson/${lesson.id}?name=${name}&grade=${gradeParam}`}
                  >
                    <div className={`card-kid border-4 bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${config.borderColor}`}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-grow">
                             <h3 className="text-xl font-black text-gray-800 dark:text-gray-200">{lesson.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-sm font-semibold ${config.color}`}>{lesson.difficulty}</span>
                              {lessonCompleted && (
                                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-xs font-bold text-green-700">Concluído</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {lessonCompleted ? (
                            <div className="bg-green-100 p-2 rounded-full">
                              <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                          ) : (
                            <div className={`${config.bgColor} p-2 rounded-full`}>
                              <config.icon className={`h-8 w-8 ${config.color}`} />
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{lesson.description}</p>
                        
                        {lesson.story_context && (
                          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 mb-4">
                            <p className="text-sm italic text-purple-700">
                              📖 {lesson.story_context}
                            </p>
                          </div>
                        )}
                        
                        {lessonCompleted && (
                          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                            <div className="flex items-center gap-2">
                              {[...Array(lessonCompleted.stars)].map((_, i) => (
                                <Star key={i} className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                              ))}
                              {[...Array(3 - lessonCompleted.stars)].map((_, i) => (
                                <Star key={i} className="h-6 w-6 text-gray-300" />
                              ))}
                            </div>
                            <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
                              <span className="text-sm font-bold text-yellow-700">
                                +{lessonCompleted.coins_earned} 💰
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {!lessonCompleted && (
                          <div className="flex items-center gap-2 pt-4 border-t-2 border-gray-100">
                            <div className={`${config.bgColor} px-3 py-2 rounded-full`}>
                              <span className={`text-sm font-bold ${config.color}`}>
                                Clica para começar →
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
