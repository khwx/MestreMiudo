"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, Award, RotateCw, ArrowRight } from 'lucide-react';
import { getRandomQuestions } from '@/lib/question-bank';

interface DiagnosticQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
}

interface DiagnosticResult {
  score: number;
  percentage: number;
  learningLevel: 'advanced' | 'proficient' | 'developing' | 'beginning';
  recommendations: string[];
  subjectScores: Record<string, { correct: number; total: number }>;
  answers: Array<{ questionId: string; answer: string; correct: boolean }>;
  correctAnswers: string[];
}

interface DiagnosticTestProps {
  studentName: string;
  gradeLevel?: 1 | 2 | 3 | 4;
  onComplete: (result: DiagnosticResult) => void;
  onBack?: () => void;
}

function getRecommendations(level: string): string[] {
  const recommendations: Record<string, string[]> = {
    advanced: [
      'Parabéns! Está a ir muito bem!',
      'Pode avançar para perguntas mais desafiantes',
      'Tente jogos educativos adicionais para consolidar conhecimentos',
    ],
    proficient: [
      'Muito bom! Tem uma boa compreensão dos conceitos.',
      'Continue a praticar regularmente',
      'Continue com questões similares para consolidar conhecimentos',
    ],
    developing: [
      'Está no caminho certo! Continue a treinar.',
      'Algumas áreas precisam de mais prática',
      'Praticar com perguntas mais simples primeiro, depois aumentar dificuldade',
    ],
    beginning: [
      'Vamos começar devagar e com passos pequenos!',
      'Não desista, a aprendizagem é um processo',
      'Focar em conceitos básicos com muita repetição e exemplos práticos',
    ],
  };
  return recommendations[level] || recommendations.developing;
}

export function DiagnosticTest({ studentName, gradeLevel, onComplete, onBack }: DiagnosticTestProps) {
  const [questions] = useState<DiagnosticQuestion[]>(() => {
    const grade = gradeLevel || 1;
    const allQuestions = getRandomQuestions(10, { gradeLevel: grade as 1 | 2 | 3 | 4 });
    return allQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options || [],
      correctAnswer: typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer[0],
      subject: q.subject,
    }));
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Array<{ questionId: string; answer: string; correct: boolean }>>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isComplete]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const handleSelectAnswer = useCallback((answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  }, [showResult]);

  const handleSubmitAnswer = useCallback(() => {
    if (!selectedAnswer || showResult) return;
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setAnswers(prev => [...prev, { questionId: currentQuestion.id, answer: selectedAnswer, correct }]);
    setShowResult(true);
  }, [selectedAnswer, showResult, currentQuestion]);

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const allAnswers = [...answers];
      let correct = 0;
      const subjectScores: Record<string, { correct: number; total: number }> = {};

      allAnswers.forEach(a => {
        const q = questions.find(q => q.id === a.questionId);
        if (q) {
          if (!subjectScores[q.subject]) subjectScores[q.subject] = { correct: 0, total: 0 };
          subjectScores[q.subject].total++;
          if (a.correct) {
            correct++;
            subjectScores[q.subject].correct++;
          }
        }
      });

      const percentage = (correct / questions.length) * 100;
      let learningLevel: DiagnosticResult['learningLevel'];
      if (percentage >= 85) learningLevel = 'advanced';
      else if (percentage >= 70) learningLevel = 'proficient';
      else if (percentage >= 50) learningLevel = 'developing';
      else learningLevel = 'beginning';

      const finalResult: DiagnosticResult = {
        score: correct,
        percentage: Math.round(percentage),
        learningLevel,
        recommendations: getRecommendations(learningLevel),
        subjectScores,
        answers: allAnswers,
        correctAnswers: questions.map(q => q.correctAnswer),
      };

      setResult(finalResult);
      setIsComplete(true);
      onComplete(finalResult);
    }
  }, [currentIndex, questions, answers, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isComplete && result) {
    const levelLabels: Record<string, string> = {
      advanced: 'Avancado',
      proficient: 'Competente',
      developing: 'Em Desenvolvimento',
      beginning: 'Iniciante',
    };
    const levelColors: Record<string, string> = {
      advanced: 'text-green-600 dark:text-green-400',
      proficient: 'text-blue-600 dark:text-blue-400',
      developing: 'text-yellow-600 dark:text-yellow-400',
      beginning: 'text-red-600 dark:text-red-400',
    };

    return (
      <div className="space-y-8 animate-in fade-in-50">
        <div className="text-center space-y-4">
          <Award className="h-20 w-20 text-accent mx-auto" />
          <h2 className="text-3xl font-black text-gray-800 dark:text-gray-200">Diagnostico Completo!</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Obrigado, {studentName}! Aqui estao os teus resultados.
          </p>
        </div>

        <div className="card-kid border-4 border-primary/30 shadow-xl p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nivel de Aprendizagem</p>
            <p className={cn("text-3xl font-black", levelColors[result.learningLevel])}>
              {levelLabels[result.learningLevel]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 text-center border-2 border-green-200 dark:border-green-800">
              <p className="text-3xl font-black text-green-700 dark:text-green-400">{result.score}/{questions.length}</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-500">Respostas Corretas</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 text-center border-2 border-blue-200 dark:border-blue-800">
              <p className="text-3xl font-black text-blue-700 dark:text-blue-400">{result.percentage}%</p>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-500">Aproveitamento</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Tempo Total: {formatTime(timeSpent)}</p>
          </div>
        </div>

        <div className="card-kid border-4 border-primary/30 shadow-xl p-6 space-y-4">
          <h3 className="text-xl font-black text-gray-800 dark:text-gray-200">Recomendacoes</h3>
          <ul className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-kid border-4 border-primary/30 shadow-xl p-6 space-y-4">
          <h3 className="text-xl font-black text-gray-800 dark:text-gray-200">Desempenho por Materia</h3>
          <div className="space-y-3">
            {Object.entries(result.subjectScores).map(([subject, scores]) => (
              <div key={subject} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{subject}</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{scores.correct}/{scores.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {onBack && (
            <Button onClick={onBack} variant="outline" className="flex-1 h-12 text-lg font-bold">
              <RotateCw className="mr-2 h-5 w-5" />
              Voltar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-200">Diagnostico</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pergunta {currentIndex + 1} de {questions.length}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span className="font-mono text-sm">{formatTime(timeSpent)}</span>
        </div>
      </div>

      <Progress value={progress} className="h-3" />

      <div className="card-kid border-4 border-primary/30 shadow-xl p-6 space-y-6">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">{currentQuestion.subject}</span>
          <h3 className="text-xl font-black text-gray-800 dark:text-gray-200">{currentQuestion.question}</h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(option)}
              disabled={showResult}
              className={cn(
                "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 text-lg font-semibold",
                selectedAnswer === option && !showResult
                  ? "border-primary bg-primary/10 scale-[1.02]"
                  : showResult && option === currentQuestion.correctAnswer
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : showResult && selectedAnswer === option
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-sm",
                  selectedAnswer === option && !showResult
                    ? "border-primary bg-primary text-white"
                    : showResult && option === currentQuestion.correctAnswer
                    ? "border-green-500 bg-green-500 text-white"
                    : showResult && selectedAnswer === option
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-gray-300 dark:border-gray-600"
                )}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-gray-800 dark:text-gray-200">{option}</span>
                {showResult && option === currentQuestion.correctAnswer && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                )}
                {showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>

        {showResult && (
          <div className={cn(
            "p-4 rounded-xl border-2",
            selectedAnswer === currentQuestion.correctAnswer
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          )}>
            <div className="flex items-center gap-2">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {selectedAnswer === currentQuestion.correctAnswer ? "Correto!" : "Errado!"}
              </span>
              {selectedAnswer !== currentQuestion.correctAnswer && (
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  Resposta: {currentQuestion.correctAnswer}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {!showResult ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="flex-1 h-12 text-lg font-bold"
          >
            Responder
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            className="flex-1 h-12 text-lg font-bold"
          >
            {currentIndex < questions.length - 1 ? (
              <>Proxima <ArrowRight className="ml-2 h-5 w-5" /></>
            ) : (
              "Ver Resultados"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
