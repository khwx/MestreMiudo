"use client"

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

interface DailyQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const gradeQuestions: Record<number, Record<string, DailyQuestion[]>> = {
  1: {
    'Português': [
      { question: 'Qual destas palavras tem mais sílabas?', options: ['Sol', 'Ca-sa', 'Bo-la', 'A-ve'], correctAnswer: 1, explanation: '"Casa" tem 2 sílabas: ca-sa!' },
      { question: 'Qual é a vogal que falta em "c_sa"?', options: ['b', 'o', 'r', 't'], correctAnswer: 1, explanation: 'A palavra é "cosa" ou "casa" - a vogal é "o" ou "a"!' },
    ],
    'Matemática': [
      { question: 'Se tens 3 maçãs e comes 1, quantas ficam?', options: ['1', '2', '3', '4'], correctAnswer: 1, explanation: '3 - 1 = 2 maçãs!' },
      { question: 'Quantos dedos tens nas duas mãos?', options: ['5', '8', '10', '12'], correctAnswer: 2, explanation: '5 + 5 = 10 dedos!' },
    ],
    'Estudo do Meio': [
      { question: 'Em que estação do ano faz mais calor?', options: ['Inverno', 'Verão', 'Outono', 'Primavera'], correctAnswer: 1, explanation: 'No Verão faz mais calor!' },
      { question: 'Qual animal faz "miau"?', options: ['Cão', 'Gato', 'Pássaro', 'Peixe'], correctAnswer: 1, explanation: 'O gato faz "miau"!' },
    ],
  },
  2: {
    'Português': [
      { question: 'Qual palavra se escreve com "ss"?', options: ['paço', 'pássaro', 'começar', 'caça'], correctAnswer: 1, explanation: '"Pássaro" escreve-se com ss entre vogais!' },
      { question: 'O feminino de "ator" é:', options: ['atora', 'atriz', 'atoria', 'atorinha'], correctAnswer: 1, explanation: '"Atriz" é o feminino de "ator"!' },
    ],
    'Matemática': [
      { question: '8 + 7 = ?', options: ['13', '14', '15', '16'], correctAnswer: 2, explanation: '8 + 7 = 15!' },
      { question: '15 - 9 = ?', options: ['5', '6', '7', '8'], correctAnswer: 1, explanation: '15 - 9 = 6!' },
    ],
    'Estudo do Meio': [
      { question: 'Qual é o maior órgão do corpo humano?', options: ['Coração', 'Pele', 'Fígado', 'Pulmão'], correctAnswer: 1, explanation: 'A pele é o maior órgão do corpo!' },
      { question: 'Qual animal é herbívoro?', options: ['Leão', 'Coelho', 'Águia', 'Tubarão'], correctAnswer: 1, explanation: 'O coelho come plantas - é herbívoro!' },
    ],
  },
  3: {
    'Português': [
      { question: 'Qual é o sinónimo de "feliz"?', options: ['Triste', 'Contente', 'Zangado', 'Cansado'], correctAnswer: 1, explanation: '"Contente" é sinónimo de "feliz"!' },
      { question: 'Numa narrativa, o clímax é:', options: ['O início', 'O ponto mais tenso', 'O final', 'A descrição'], correctAnswer: 1, explanation: 'O clímax é o momento de maior tensão!' },
    ],
    'Matemática': [
      { question: '4 × 6 = ?', options: ['20', '22', '24', '28'], correctAnswer: 2, explanation: '4 × 6 = 24!' },
      { question: 'Qual fração representa metade?', options: ['1/3', '1/2', '1/4', '2/3'], correctAnswer: 1, explanation: '1/2 é metade!' },
    ],
    'Estudo do Meio': [
      { question: 'Qual é o planeta mais próximo do Sol?', options: ['Vénus', 'Terra', 'Mercúrio', 'Marte'], correctAnswer: 2, explanation: 'Mercúrio é o mais próximo do Sol!' },
      { question: 'Qual é o maior oceano da Terra?', options: ['Atlântico', 'Pacífico', 'Índico', 'Ártico'], correctAnswer: 1, explanation: 'O Pacífico é o maior oceano!' },
    ],
  },
  4: {
    'Português': [
      { question: '"Fecha a janela!" é uma frase:', options: ['Declarativa', 'Interrogativa', 'Imperativa', 'Exclamativa'], correctAnswer: 2, explanation: 'Dá uma ordem - é imperativa!' },
      { question: 'Qual é o plural de "papél"?', options: ['papelis', 'papéis', 'papeles', 'papéis'], correctAnswer: 1, explanation: 'O plural de "papél" é "papéis"!' },
    ],
    'Matemática': [
      { question: '17 ÷ 5 tem que resultado?', options: ['3 resto 2', '2 resto 7', '4 resto 1', '3 resto 1'], correctAnswer: 0, explanation: '5 × 3 = 15, e 17 - 15 = 2!' },
      { question: 'Qual é a área de um retângulo 4×6?', options: ['10', '20', '24', '48'], correctAnswer: 2, explanation: 'Área = 4 × 6 = 24!' },
    ],
    'Estudo do Meio': [
      { question: 'Qual órgão bombeia o sangue?', options: ['Pulmão', 'Fígado', 'Coração', 'Rins'], correctAnswer: 2, explanation: 'O coração bombeia o sangue!' },
      { question: 'A Convenção dos Direitos da Criança foi adotada em:', options: ['1959', '1989', '1999', '2009'], correctAnswer: 1, explanation: 'Foi em 1989 pela ONU!' },
    ],
  },
};

export default function DailyChallengePage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Amigo';
  const grade = searchParams.get('grade') || '1';

  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeData | null>(null);
  const [question, setQuestion] = useState<DailyQuestion | null>(null);
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
          const subjectQuestions = gradeQuestions[gradeLevel]?.[challenge.subject];
          if (subjectQuestions && subjectQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * subjectQuestions.length);
            setQuestion(subjectQuestions[randomIndex]);
          }
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
    if (selectedAnswer === null || !question) return;
    const correct = selectedAnswer === question.correctAnswer;
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
        <div className="card-kid border-4 border-gray-300 bg-white shadow-2xl max-w-lg">
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
        <div className="card-kid border-4 border-orange-300 bg-white shadow-2xl">
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
        <div className="card-kid border-4 border-orange-300 bg-white shadow-2xl">
          <div className="p-8 space-y-6">
            <h3 className="text-xl font-black text-gray-800 dark:text-gray-200">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-xl border-3 transition-all duration-200 text-lg font-semibold ${
                    selectedAnswer === index && !showResult
                      ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 scale-105'
                      : showResult && index === question.correctAnswer
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                      : showResult && selectedAnswer === index && !isCorrect
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-3 flex items-center justify-center ${
                      selectedAnswer === index && !showResult
                        ? 'border-orange-500 bg-orange-500'
                        : showResult && index === question.correctAnswer
                        ? 'border-green-500 bg-green-500'
                        : showResult && selectedAnswer === index && !isCorrect
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300'
                    }`}>
                      {(selectedAnswer === index || (showResult && index === question.correctAnswer)) && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span>{option}</span>
                    {showResult && index === question.correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                    )}
                    {showResult && selectedAnswer === index && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>

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
                <p className="text-gray-700 dark:text-gray-300">{question.explanation}</p>
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
        <div className="card-kid border-4 border-orange-300 bg-white shadow-xl">
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
