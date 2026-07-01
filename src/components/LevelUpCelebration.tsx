"use client"
import { logger } from "@/lib/logger";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Sparkles, ArrowUp } from 'lucide-react';
import { getStudentRewards } from '@/app/actions';

export function LevelUpCelebration() {
  const searchParams = useSearchParams();
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const checkLevelUp = async () => {
      const name = searchParams.get('name') || '';
      if (!name) return;

      try {
        const rewards = await getStudentRewards(name);
        if (rewards && rewards.tier) {
          const tierName = rewards.tier.name as string;
          const storedTier = sessionStorage.getItem('lastTier');

          if (storedTier && storedTier !== tierName) {
            const level = (rewards as Record<string, unknown>).current_tier as number || 1;
            setCurrentLevel(level);
            setProgress(rewards.progressPercentage as number || 0);
            setShowCelebration(true);
            setCelebrating(true);

            setTimeout(() => {
              setCelebrating(false);
              setShowCelebration(false);
            }, 5000);
          }

          sessionStorage.setItem('lastTier', tierName);
        }
      } catch (error) {
        logger.error('Falha ao verificar subida de nível:', error);
      }
    };

    checkLevelUp();
  }, [searchParams]);

  const handleDismiss = () => {
    setCelebrating(false);
    setShowCelebration(false);
  };

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="bg-card/95 backdrop-blur-sm p-6 max-w-md">
            <CardHeader className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: 2 }}
                className="inline-block mb-4"
              >
                <Trophy className="h-16 w-16 text-accent" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-primary">
                Parabéns! 🎉
              </CardTitle>
              {celebrating && (
                <motion.p
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-xl text-muted-foreground mt-2"
                >
                  Subiste para o Nível {currentLevel}!
                </motion.p>
              )}
            </CardHeader>

            {celebrating && (
              <CardContent className="text-center space-y-6">
                <div className="relative">
                  <Progress value={progress} className="w-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: 3 }}
                      className="text-2xl font-bold text-primary"
                    >
                      {progress}%
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  className="grid grid-cols-3 gap-2"
                  animate={{ opacity: [0, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-primary/10 p-3 rounded-lg"
                  >
                    <Star className="h-8 w-8 text-yellow-400 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-1">⭐ Nova conquista</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-primary/10 p-3 rounded-lg"
                  >
                    <Sparkles className="h-8 w-8 text-accent mx-auto" />
                    <p className="text-xs text-muted-foreground mt-1">✨ Celebrar</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-primary/10 p-3 rounded-lg"
                  >
                    <ArrowUp className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-1">⬆️ Próximo nível</p>
                  </motion.div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                  className="flex justify-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="h-6 w-6 text-accent" />
                  </motion.div>
                </motion.div>
              </CardContent>
            )}

            <CardContent className="text-center space-y-4">
              <motion.div
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <p className="text-sm text-muted-foreground">
                  Continue a jogar e a aprender para alcançar novos patamares!
                </p>
              </motion.div>

              <motion.div
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <Button onClick={handleDismiss} className="w-full">
                  Continuar Aprendendo
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
