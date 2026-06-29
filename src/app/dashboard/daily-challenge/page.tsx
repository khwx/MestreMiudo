"use client"

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Flame, Coins, Loader2, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDailyChallenge, completeDailyChallenge, getDailyChallengeQuestion } from '@/lib/daily-challenges';
import { Input } from '@/components/ui/input';

interface DailyChallengeData {
  id: string;
  studentId: string;
  challengeDate: string;
  subject: string;
  difficulty: string;
  questionId?: string;
  completed: boolean;
  correct?: boolean;
  bonusPoints: number;
}

interface ChallengeQuestion {
  id: string;
  question: string;
  challenge_type: 'multiple_choice' | 'fill_blank' | 'word_order' | 'matching';
  content: Record<string, unknown>;
  hint: string | null;
}

export default function DailyChallengePage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Amigo';
  const grade = searchParams.get('grade') || '1';

  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeData | null>(null);
  const [question, setQuestion] = useState<ChallengeQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const gradeLevel = parseInt(grade, 10) as 1 | 2 | 3 | 4;

  useEffect(() => {
    const loadDailyChallenge = async () => {
      try {
        const challenge = await getDailyChallenge(name, gradeLevel);
        setDailyChallenge(challenge);

        if (challenge && !challenge.completed && challenge.questionId) {
          const questionData = await getDailyChallengeQuestion(challenge.id);
          setQuestion(questionData);
        }
      } catch (error) {
        console.error('Error loading daily challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDailyChallenge();
  }, [name, gradeLevel]);

  const handleAnswerSelect = (answer: string | number) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !question) return;
    
    let correct = false;
    const content = question.content as Record<string, unknown>;
    
    if (question.challenge_type === 'multiple_choice') {
      correct = selectedAnswer === content.correct_answer;
    } else if (question.challenge_type === 'fill_blank') {
      const correctAnswers = content.correct_answers as string[] || [content.correct_answer as string];
      correct = correctAnswers.map(a => a.toLowerCase().trim()).includes(
        String(selectedAnswer).toLowerCase().trim()
      );
    } else if (question.challenge_type === 'matching') {
      const correctMatches = content.correct_matches as Record<string, string>;
      const selected = selectedAnswer as Record<string, string>;
      correct = Object.keys(correctMatches).every(
        key => selected[key] === correctMatches[key]
      );
    } else if (question.challenge_type === 'word_order') {
      const correctOrder = content.correct_order as string[];
      const selectedOrder = selectedAnswer as string[];
      correct = JSON.stringify(correctOrder) === JSON.stringify(selectedOrder);
    }
    
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleComplete = async () => {
    if (!dailyChallenge || quizCompleted) return;
    setCompleting(true);
    try {
      await completeDailyChallenge(name, isCorrect, dailyChallenge.bonusPoints);
      setQuizCompleted(true);
      setDailyChallenge(prev => prev ? { ...prev, completed: true, correct: isCorrect } : null);
    } catch (error) {
      console.error('Error completing daily challenge:', error);
    } finally {
      setCompleting(false);
    }
  };

  const renderChallenge = () => {
    if (!question) return null;

    const content = question.content as Record<string, unknown>;

    if (question.challenge_type === 'multiple_choice') {
      const options = content.options as string[];
      return (
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-xl border-3 transition-all duration-200 text-lg font-semibold ${
                selectedAnswer === option && !showResult
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 scale-105'
                  : showResult && option === content.correct_answer
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : showResult && selectedAnswer === option && !isCorrect
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-3 flex items-center justify-center ${
                  selectedAnswer === option && !showResult
                    ? 'border-orange-500 bg-orange-500'
                    : showResult && option === content.correct_answer
                    ? 'border-green-500 bg-green-500'
                    : showResult && selectedAnswer === option && !isCorrect
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-300'
                }`}>
                  {(selectedAnswer === option || (showResult && option === content.correct_answer)) && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span>{option}</span>
                {showResult && option === content.correct_answer && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                )}
                {showResult && selectedAnswer === option && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (question.challenge_type === 'fill_blank') {
      return (
        <div className="space-y-4">
          <Input
            value={selectedAnswer as string || ''}
            onChange={(e) => handleAnswerSelect(e.target.value)}
            disabled={showResult}
            placeholder="Escreve a resposta..."
            className="text-lg text-center font-semibold border-3 border-gray-200 dark:border-gray-700 rounded-xl p-4"
          />
          {showResult && (
            <p className={`text-center text-lg font-bold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              Resposta correta: {Array.isArray(content.correct_answers) 
                ? content.correct_answers.join(' ou ') 
                : content.correct_answer}
            </p>
          )}
        </div>
      );
    }

    if (question.challenge_type === 'matching') {
      const pairs = content.pairs as Array<{ left: string; options: string[] }>;
      const correctMatches = content.correct_matches as Record<string, string>;
      const [matches, setMatches] = useState<Record<string, string>>({});

      const handleMatchChange = (left: string, value: string) => {
        if (showResult) return;
        setMatches(prev => ({ ...prev, [left]: value }));
        handleAnswerSelect({ ...matches, [left]: value });
      };

      return (
        <div className="space-y-4">
          {pairs.map((pair, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700">
              <p className="font-semibold mb-2">{pair.left}</p>
              <select
                value={matches[pair.left] || ''}
                onChange={(e) => handleMatchChange(pair.left, e.target.value)}
                disabled={showResult}
                className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-lg"
              >
                <option value="">Seleciona...</option>
                {pair.options.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              {showResult && (
                <p className={`mt-2 text-sm ${
                  matches[pair.left] === correctMatches[pair.left] 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {matches[pair.left] === correctMatches[pair.left] ? '✅' : '❌'} 
                  Correto: {correctMatches[pair.left]}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (question.challenge_type === 'word_order') {
      const correctOrder = content.correct_order as string[];
      const [order, setOrder] = useState<string[]>(() => {
        // Shuffle initially
        return [...correctOrder].sort(() => Math.random() - 0.5);
      });

      const moveUp = (index: number) => {
        if (showResult || index === 0) return;
        const newOrder = [...order];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setOrder(newOrder);
        handleAnswerSelect(newOrder);
      };

      const moveDown = (index: number) => {
        if (showResult || index === order.length - 1) return;
        const newOrder = [...order];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setOrder(newOrder);
        handleAnswerSelect(newOrder);
      };

      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Ordena as palavras arrastando (usa as setas ↑↓)
          </p>
          <div className="space-y-2">
            {order.map((word, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                <span className="text-2xl font-bold flex-1 text-center">{word}</span>
                <div className="flex flex-col">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={showResult || index === 0}
                    className="text-orange-500 hover:text-orange-700 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={showResult || index === order.length - 1}
                    className="text-orange-500 hover:text-orange-700 disabled:opacity-50"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
          {showResult && (
            <p className={`text-center text-lg font-bold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              Ordem correta: {correctOrder.join(' → ')}
            </p>
          )}
        </div>
      );
    }

    return <p>Tipo de desafio não suportado</p>;
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="text-xl font-bold text-gray-600 dark:text-gray-300">A carregar o teu desafio diário...</p>
        </div>
      </div>
    );
  }

  if (!dailyChallenge) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="card-kid border-4 border-gray-300 dark:border-gray-700 shadow-2xl max-w-lg">
          <div className="p-8 text-center space-y-4">
            <div className="text-6xl">😕</div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-200">Sem Desafio Hoje</h2>
            <p className="text-gray-600 dark:text-gray-300">Não foi possível carregar o desafio de hoje.</p>
            <Link href={`/dashboard?name=${name}&grade=${grade}`}>
              <Button variant="outline" className="btn-kid border-2 border-gray-300">← Voltar</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (dailyChallenge.completed) {
    return (
      <div className="space-y-8 p-4 md:p-8 max-w-2xl mx-auto">
      <div className="card-kid border-4 border-orange-300 dark:border-orange-700 shadow-2xl">
        <div className="p-8 text-center space-y-6">
          <div className="text-6xl">{dailyChallenge.correct ? '🎉' : '💪'}</div>
            <h2 className="text-3xl font-black text-gray-800 dark:text-gray-200">
              {dailyChallenge.correct ? 'Desafio Completado!' : 'Já Tentaste!'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {dailyChallenge.correct
                ? 'Parabéns! Completaste o desafio diário com sucesso!'
                : 'Continua a praticar para melhorares!'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 text-center border-2 border-orange-200">
                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-black text-orange-700">+{dailyChallenge.bonusPoints}</p>
                <p className="text-sm font-semibold text-orange-600">Bónus</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 text-center border-2 border-yellow-200">
                <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-black text-yellow-700">+50</p>
                <p className="text-sm font-semibold text-yellow-600">Pontos</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {dailyChallenge.subject} ({dailyChallenge.difficulty}) • {new Date(dailyChallenge.challengeDate).toLocaleDateString('pt-PT')}
            </p>
            <Link href={`/dashboard?name=${name}&grade=${grade}`}>
              <Button className="btn-kid bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg">
                ← Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 py-4">
        <div className="text-6xl animate-bounce">🔥</div>
        <h2 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Desafio Diário
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Completa para ganhar pontos de bónus!
        </p>
      </div>

      {/* Challenge Info Card */}
      <div className="card-kid border-4 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 shadow-xl">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-orange-700">{dailyChallenge.subject}</h3>
            <p className="text-orange-600">{dailyChallenge.difficulty}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-orange-600">+{dailyChallenge.bonusPoints}</p>
            <p className="text-sm text-orange-500">bónus</p>
          </div>
        </div>
      </div>

      {/* Question Card */}
      {question && !quizCompleted && (
        <div className="card-kid border-4 border-orange-300 dark:border-orange-700 shadow-2xl">
          <div className="p-8 space-y-6">
            <h3 className="text-xl font-black text-gray-800 dark:text-gray-200">{question.question}</h3>
            
            {question.hint && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800 dark:text-yellow-200 font-semibold">Dica:</span>
                  <span className="text-yellow-700 dark:text-yellow-300">{question.hint}</span>
                </div>
              </div>
            )}

            {renderChallenge()}

            {showResult && (
              <div className={`p-4 rounded-xl border-2 ${
                isCorrect
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <span className="text-lg font-black">
                    {isCorrect ? 'Correto! 🎉' : 'Errado! 😅'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!showResult ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full btn-kid bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xl h-14"
                >
                  Submeter Resposta 🚀
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full btn-kid bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xl h-14"
                >
                  {completing ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> A processar...</>
                  ) : 'Completar Desafio ✅'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {!question && !dailyChallenge.completed && (
        <div className="card-kid border-4 border-orange-300 dark:border-orange-700 shadow-xl">
          <div className="p-8 text-center space-y-4">
            <div className="text-6xl">🚧</div>
            <p className="text-xl text-gray-600 dark:text-gray-300">Sem pergunta disponível para este nível. Tenta o quiz!</p>
            <Link href={`/quiz/misto?name=${name}&grade=${grade}`}>
              <Button className="btn-kid bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                Ir ao Quiz 🎯
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Back */}
      <div className="text-center pt-4">
        <Link href={`/dashboard?name=${name}&grade=${grade}`}>
          <Button variant="outline" className="btn-kid border-2 border-gray-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}