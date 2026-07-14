'use client';
import { logger } from "@/lib/logger";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, RotateCcw, CheckCircle2, XCircle, Brain, AlertTriangle } from 'lucide-react';
import {
  getItemsForReview,
  recordReview,
  getStudentStats,
  type SpacedRepetitionItem,
} from '@/lib/spaced-repetition';

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Jogador';
  const grade = searchParams.get('grade') || '1';

  const [items, setItems] = useState<SpacedRepetitionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState<{ total: number; mastered: number; learning: number; due: number } | null>(null);
  const [sessionStats, setSessionStats] = useState({ known: 0, unknown: 0 });
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewItems, studentStats] = await Promise.all([
        getItemsForReview(name, 10),
        getStudentStats(name),
      ]);
      setItems(reviewItems);
      setStats(studentStats);
      setCurrentIndex(0);
      setShowAnswer(false);
      setCompleted(false);
      setSessionStats({ known: 0, unknown: 0 });
} catch (error) {
        logger.error('Erro ao carregar itens para revisão:', error);
        setError('Não foi possível carregar os itens para revisão.');
      } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleReview = async (quality: number) => {
    const item = items[currentIndex];
    if (!item) return;

    setReviewing(true);
    try {
      await recordReview(name, item.id, quality);
      setSessionStats(prev => ({
        known: quality >= 3 ? prev.known + 1 : prev.known,
        unknown: quality < 3 ? prev.unknown + 1 : prev.unknown,
      }));

      if (currentIndex + 1 >= items.length) {
        setCompleted(true);
      } else {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      }
    } catch (error) {
      logger.error('Erro ao registar revisão:', error);
    } finally {
      setReviewing(false);
    }
  };

  const currentItem = items[currentIndex];
  const totalReviewed = sessionStats.known + sessionStats.unknown;
  const progressPercent = items.length > 0 ? Math.round((totalReviewed / items.length) * 100) : 0;

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Erro ao carregar</h2>
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <Link href={`/dashboard?name=${encodeURIComponent(name)}&grade=${grade}`}>
            <button className="btn-outline px-6 py-2">
              ← Voltar ao Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <div className="text-6xl animate-bounce">📝</div>
        <p className="text-xl text-gray-600 dark:text-gray-300 font-bold">A carregar itens para revisão...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard?name=${encodeURIComponent(name)}&grade=${grade}`}>
          <button aria-label="Voltar" className="p-2 hover:bg-secondary rounded-lg transition">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Revisão Espaçada
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Reforça o que aprendeste</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border-2 border-purple-200 dark:border-purple-700">
            <p className="text-2xl font-black text-purple-600">{stats.total}</p>
            <p className="text-xs font-semibold text-purple-500">Total</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border-2 border-green-200 dark:border-green-700">
            <p className="text-2xl font-black text-green-600">{stats.mastered}</p>
            <p className="text-xs font-semibold text-green-500">Dominados</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center border-2 border-yellow-200 dark:border-yellow-700">
            <p className="text-2xl font-black text-yellow-600">{stats.learning}</p>
            <p className="text-xs font-semibold text-yellow-500">A aprender</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border-2 border-blue-200 dark:border-blue-700">
            <p className="text-2xl font-black text-blue-600">{stats.due}</p>
            <p className="text-xs font-semibold text-blue-500">Para revisar</p>
          </div>
        </div>
      )}

      {items.length === 0 && !completed ? (
        <div className="card-kid border-4 border-green-300 dark:border-green-700 shadow-2xl p-8 text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-black text-green-600">Tudo revisado!</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Não há itens pendentes para revisar agora. Volta mais tarde!
          </p>
          <Button onClick={loadItems} variant="outline" className="btn-kid border-2">
            <RotateCcw className="mr-2 h-4 w-4" />
            Verificar novamente
          </Button>
        </div>
      ) : completed ? (
        <div className="card-kid border-4 border-purple-300 dark:border-purple-700 shadow-2xl p-8 text-center space-y-6">
          <div className="text-6xl">✨</div>
          <h2 className="text-3xl font-black text-purple-600">Sessão Concluída!</h2>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
                <span className="text-4xl font-black">{sessionStats.known}</span>
              </div>
              <p className="text-sm font-semibold text-gray-500">Sabia</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-500">
                <XCircle className="h-8 w-8" />
                <span className="text-4xl font-black">{sessionStats.unknown}</span>
              </div>
              <p className="text-sm font-semibold text-gray-500">Não sabia</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-gray-500">{progressPercent}% concluído</p>
          </div>
          <Button onClick={loadItems} className="btn-kid bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
            <RotateCcw className="mr-2 h-4 w-4" />
            Nova Sessão
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              {currentIndex + 1} de {items.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600 font-bold">✓ {sessionStats.known}</span>
              <span className="text-sm text-red-500 font-bold">✗ {sessionStats.unknown}</span>
            </div>
          </div>

          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="card-kid border-4 border-purple-300 dark:border-purple-700 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
              <div className="flex items-center gap-2 text-white/80 text-sm font-semibold">
                <Brain className="h-4 w-4" />
                {currentItem.topic}
              </div>
            </div>

            <div className="p-8 text-center space-y-6">
              <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                {currentItem.question}
              </p>

              {showAnswer ? (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-6">
                    <p className="text-sm font-semibold text-green-600 mb-2">Resposta:</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">
                      {currentItem.correctAnswer}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-500">Conseguiste responder?</p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => handleReview(5)}
                        disabled={reviewing}
                        className="btn-kid bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg h-14 px-8"
                      >
                        {reviewing ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                        )}
                        Sim, sabia!
                      </Button>
                      <Button
                        onClick={() => handleReview(1)}
                        disabled={reviewing}
                        variant="outline"
                        className="btn-kid border-2 border-red-300 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-lg h-14 px-8"
                      >
                        <XCircle className="mr-2 h-5 w-5" />
                        Não sabia
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="btn-kid bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-lg h-14 px-12"
                >
                  Mostrar Resposta
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
