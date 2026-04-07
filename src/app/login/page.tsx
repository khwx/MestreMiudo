"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ICONS = [
  { emoji: '🌻', name: 'Sara', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { emoji: '🐠', name: 'João', color: 'bg-blue-100 hover:bg-blue-200' },
  { emoji: '💘', name: 'Maria', color: 'bg-pink-100 hover:bg-pink-200' },
  { emoji: '🚀', name: 'Pedro', color: 'bg-purple-100 hover:bg-purple-200' },
  { emoji: '🌈', name: 'Ana', color: 'bg-green-100 hover:bg-green-200' },
];

const GRADES = [
  { level: 1, label: '1º Ano' },
  { level: 2, label: '2º Ano' },
  { level: 3, label: '3º Ano' },
  { level: 4, label: '4º Ano' },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [step, setStep] = useState(1);

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    setStep(2);
  };

  const handleGradeSelect = (grade: number) => {
    setSelectedGrade(grade);
  };

  const handleLogin = () => {
    if (selectedIcon) {
      // Generate a unique identifier with timestamp to avoid conflicts
      const uniqueId = `${selectedIcon}_${Date.now().toString(36).slice(-4)}`;
      router.push(`/dashboard?name=${uniqueId}&grade=${selectedGrade}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary">MestreMiúdo</h1>
          <p className="text-xl text-muted-foreground">Aprender a Brincar!</p>
        </div>

        {step === 1 ? (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Quem és tu?</CardTitle>
              <CardDescription>Escolhe o teu icon!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {ICONS.map((icon) => (
                  <button
                    key={icon.name}
                    onClick={() => handleIconSelect(icon.name)}
                    className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-110 ${icon.color} flex flex-col items-center gap-2`}
                  >
                    <span className="text-5xl">{icon.emoji}</span>
                    <span className="text-sm font-semibold text-gray-700">{icon.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Olá, {selectedIcon}! 🎉</CardTitle>
              <CardDescription>Em que ano estás?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {GRADES.map((grade) => (
                  <button
                    key={grade.level}
                    onClick={() => handleGradeSelect(grade.level)}
                    className={`p-6 rounded-2xl transition-all duration-300 ${
                      selectedGrade === grade.level
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-xl font-bold">{grade.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  ← Voltar
                </Button>
                <Button
                  onClick={handleLogin}
                  className="flex-1"
                >
                  Entrar! 🚀
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>Icons super fáceis para crianças! 🌻🐠💘🚀🌈</p>
        </div>
      </div>
    </div>
  );
}
