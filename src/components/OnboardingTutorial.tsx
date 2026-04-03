"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, X, BookOpen, Gamepad2, Star, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: <Brain className="h-12 w-12 text-primary" />,
    title: 'Bem-vindo ao MestreMiúdo!',
    description: 'Aqui vais aprender de uma forma divertida e interativa. Vamos explorar juntos!',
  },
  {
    id: 'quiz',
    icon: <BookOpen className="h-12 w-12 text-primary" />,
    title: 'Quizzes de Conhecimento',
    description: 'Responde a perguntas de Português, Matemática e Estudo do Meio. Cada resposta correta dá-te pontos!',
  },
  {
    id: 'games',
    icon: <Gamepad2 className="h-12 w-12 text-primary" />,
    title: 'Salão de Jogos',
    description: 'Faz uma pausa e diverte-te com jogos como o Jogo da Memória, Jogo do Galo e Jogo da Forca!',
  },
  {
    id: 'stories',
    icon: <Star className="h-12 w-12 text-primary" />,
    title: 'Cria Histórias',
    description: 'Usa a tua imaginação para criar histórias mágicas com a ajuda da inteligência artificial!',
  },
];

export function OnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-lg">
          <CardHeader className="relative">
            <button
              onClick={handleSkip}
              className="absolute top-0 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar tutorial"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {steps[currentStep].icon}
              </motion.div>
              
              <CardTitle className="text-2xl font-bold">
                <motion.span
                  key={currentStep}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {steps[currentStep].title}
                </motion.span>
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.p
              key={`desc-${currentStep}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-center text-muted-foreground text-lg"
            >
              {steps[currentStep].description}
            </motion.p>

            <div className="flex justify-center gap-2">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button onClick={handleNext} className="flex-1">
                  Começar!
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1">
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
              >
                Saltar tutorial
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenOnboarding');
    setHasSeenOnboarding(!!seen);
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem('hasSeenOnboarding');
    setHasSeenOnboarding(false);
  };

  return { hasSeenOnboarding, resetOnboarding };
}