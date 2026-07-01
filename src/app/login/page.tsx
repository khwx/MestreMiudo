"use client";
import { logger } from "@/lib/logger";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateStudentStreak, initializeStudent } from '@/app/actions';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [grade, setGrade] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [welcomeBonus, setWelcomeBonus] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && code.trim()) {
      setIsSubmitting(true);
      try {
        const uniqueId = `${name.trim()}_${code.trim()}`;
        
        const [_streakResult, initResult] = await Promise.all([
          updateStudentStreak(uniqueId),
          initializeStudent(uniqueId)
        ]);
        
        if (initResult.welcomeBonus) {
          setWelcomeBonus(initResult.welcomeBonus);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        router.push(`/dashboard?name=${encodeURIComponent(uniqueId)}&grade=${grade}`);
      } catch (error) {
        logger.error('Erro de login:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {welcomeBonus !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-card rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-100 duration-500">
            <div className="text-8xl mb-4 animate-bounce">🎁</div>
            <h2 className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">Bem-vindo ao MestreMiúdo!</h2>
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4">Aqui está o teu presente de boas-vindas!</p>
            <div className="flex items-center justify-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full px-6 py-4 mb-4">
              <span className="text-5xl">🪙</span>
              <span className="text-5xl font-black text-yellow-600 dark:text-yellow-400">+{welcomeBonus}</span>
            </div>
            <p className="text-lg text-gray-500 dark:text-gray-400">Usa as moedas para comprar itens na Loja Mágica!</p>
          </div>
        </div>
      )}
      <div className="w-full max-w-lg space-y-8">
        {/* Logo e Header */}
        <div className="text-center space-y-4">
          <div className="text-8xl animate-bounce">🎮</div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            MestreMiúdo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-semibold">
            🚀 Aprende a Brincar!
          </p>
        </div>

        {/* Card de Login */}
        <div className="card-kid card-kid-primary border-4 border-blue-300 dark:border-blue-700 shadow-2xl">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">👋</div>
              <h2 className="text-3xl font-black text-blue-700 dark:text-blue-300">
                Entrar na Aventura
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Digita o teu nome e código de acesso!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  📝 O Teu Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Como te chamas?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-xl h-14 rounded-xl border-3 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                />
              </div>

              {/* Código de Acesso */}
              <div className="space-y-3">
                <Label htmlFor="code" className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  🔐 Código de Acesso
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Digita o teu código"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="text-xl h-14 rounded-xl border-3 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200"
                />
              </div>

              {/* Ano Escolar */}
              <div className="space-y-3">
                <Label htmlFor="grade" className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  🎒 Ano Escolar
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {['1', '2', '3', '4'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`
                        h-14 rounded-xl border-3 font-bold text-lg transition-all duration-200
                        ${grade === g 
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105' 
                          : 'bg-card text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                        }
                      `}
                    >
                      {g}º
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão Submit */}
              <Button 
                type="submit" 
                className="w-full text-xl h-16 btn-kid btn-kid-primary rounded-xl font-black"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> A Carregar...</>
                ) : (
                  'Começar a Jogar! 🚀'
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-md text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border-2 border-blue-100 dark:border-gray-700">
          <p>💡 O teu código de acesso foi fornecido pelo teu professor ou responsável.</p>
        </div>
      </div>
    </div>
  );
}
