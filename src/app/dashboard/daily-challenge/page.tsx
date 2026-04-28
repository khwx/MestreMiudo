"use client"

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Flame, Coins, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDailyChallenge, completeDailyChallenge } from '@/lib/daily-challenges';

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

interface QuizQuestion {
  id: string;
  subject: string;
  question: string;
  type: 'multiple-choice';
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function DailyChallengePage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Amigo';
  const grade = searchParams.get('grade') || '1';
  
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeData | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
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
        
        if (challenge && !challenge.completed) {
          // Generate a sample question for the daily challenge
          const questionsBySubject = {
            'Português': [
              'Qual destas palavras tem mais sílabas?',
              'Qual a correta: "casa" ou "cassa"?',
              'Complete: "O ___ é amarelo."'
            ],
            'Matemática': [
              '2 + 2 = ?',
              'Quantos meses tem um ano?',
              'Se tens 3 maçãs e comes 1, quantas ficam?'
            ],
            'Estudo do Meio': [
              'Em que estação faz frio?',
              'Qual animal faz "miau"?',
              'Que planeta vivemos?'
            ]
          };
          
          const questionTexts = questionsBySubject[challenge.subject as keyof typeof questionsBySubject] || 
                               ['Qual é a cor do céu?', '2 + 2 = ?', 'Qual animal voa?'];
          
          const question: QuizQuestion = {
            id: challenge.id,
            subject: challenge.subject,
            question: questionTexts[0],
            type: 'multiple-choice',
            options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
            correctAnswer: 0, // In real implementation, this would be stored
            explanation: `Esta é uma pergunta de ${challenge.subject} no nível ${challenge.difficulty}.`
          };
          setQuizQuestions([question]);
        }
      } catch (error) {
        console.error('Error loading daily challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDailyChallenge();
  }, [name, gradeLevel]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    // For demo purposes, assume first option is correct
    const correct = selectedAnswer === 0;
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

  const handleRestart = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setQuizCompleted(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium">A carregar o teu desafio diário...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dailyChallenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Desafio Diário</CardTitle>
            <CardDescription>Infelizmente, não foi possível carregar o desafio de hoje.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard?name=${name}&grade=${grade}`}>
              <Button variant="outline">Voltar ao Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (dailyChallenge.completed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {dailyChallenge.correct ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {dailyChallenge.correct ? '🎉 Desafio Completado!' : 'Desafio Completado!'}
            </CardTitle>
            <CardDescription>
              {dailyChallenge.correct 
                ? 'Parabéns! Completaste o desafio diário com sucesso.' 
                : 'Completaste o desafio diário! Continua a praticar para melhorares.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="font-semibold text-orange-700 dark:text-orange-300">+{dailyChallenge.bonusPoints}</p>
                <p className="text-sm text-muted-foreground">Pontos de Bónus</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Coins className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-semibold text-yellow-700 dark:text-yellow-300">+50</p>
                <p className="text-sm text-muted-foreground">Pontos Normais</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Desafio: {dailyChallenge.subject} ({dailyChallenge.difficulty})
              </p>
              <p className="text-sm text-muted-foreground">
                Data: {new Date(dailyChallenge.challengeDate).toLocaleDateString('pt-PT')}
              </p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Link href={`/dashboard?name=${name}&grade=${grade}`}>
                <Button variant="outline">Voltar ao Dashboard</Button>
              </Link>
              <Link href={`/quiz/${dailyChallenge.subject.toLowerCase().replace(' ', '-')}?name=${name}&grade=${grade}`}>
                <Button>Continuar a Praticar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/dashboard?name=${name}&grade=${grade}`}>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              <CardTitle>Desafio Diário</CardTitle>
            </div>
            <CardDescription>
              Completa este desafio para ganhar pontos de bónus e continuar a tua sequência!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-semibold">{dailyChallenge.subject}</p>
                <p className="text-sm text-muted-foreground">{dailyChallenge.difficulty}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-orange-600">+{dailyChallenge.bonusPoints} pts</p>
                <p className="text-sm text-muted-foreground">Pontos de bónus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {quizQuestions.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Pergunta do Desafio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{quizQuestions[0].question}</h3>
                <div className="space-y-3">
                  {quizQuestions[0].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult || quizCompleted}
                      className={`w-full p-4 text-left rounded-lg border transition-colors ${
                        selectedAnswer === index
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        showResult && index === quizQuestions[0].correctAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : showResult && selectedAnswer === index && !isCorrect
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedAnswer === index
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300'
                        }`}>
                          {showResult && index === quizQuestions[0].correctAnswer && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                          {showResult && selectedAnswer === index && !isCorrect && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {showResult && (
                <div className={`p-4 rounded-lg ${
                  isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' : 'bg-red-50 dark:bg-red-900/20 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-semibold">
                      {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
                    </span>
                  </div>
                  <p className="text-sm">{quizQuestions[0].explanation}</p>
                </div>
              )}

              <div className="flex gap-3">
                {!showResult ? (
                  <Button 
                    onClick={handleSubmitAnswer} 
                    disabled={selectedAnswer === null}
                    className="flex-1"
                  >
                    Submeter Resposta
                  </Button>
                ) : (
                  <Button 
                    onClick={handleComplete} 
                    disabled={completing}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        A processar...
                      </>
                    ) : 'Completar Desafio'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {quizCompleted && (
        <div className="max-w-2xl mx-auto mt-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-6xl mb-4">
                {dailyChallenge.correct ? '🎉' : '👍'}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {dailyChallenge.correct ? 'Desafio Completado com Sucesso!' : 'Desafio Completado!'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {dailyChallenge.correct 
                  ? 'Parabéns! Ganhas pontos de bónus.' 
                  : 'Continua a praticar para melhorares.'}
              </p>
              <Button onClick={handleRestart} variant="outline">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}