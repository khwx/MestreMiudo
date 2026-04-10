"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [grade, setGrade] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && code.trim()) {
      // Create a unique identifier combining name and code
      const uniqueId = `${name.trim()}_${code.trim()}`;
      router.push(`/dashboard?name=${encodeURIComponent(uniqueId)}&grade=${grade}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary">MestreMiúdo</h1>
          <p className="text-xl text-muted-foreground">Aprender a Brincar!</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar na Aventura</CardTitle>
            <CardDescription>Digite seu nome e código de acesso!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-md">Seu Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-lg h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-md">Código de Acesso</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Digite seu código"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="text-lg h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade" className="text-md">Ano Escolar</Label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-primary w-full h-12"
                >
                  <option value="1">1º ano</option>
                  <option value="2">2º ano</option>
                  <option value="3">3º ano</option>
                  <option value="4">4º ano</option>
                </select>
              </div>
              <Button type="submit" className="w-full text-xl h-14">
                Entrar! 🚀
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Seu código de acesso foi fornecido pelo seu professor ou responsável.</p>
        </div>
      </div>
    </div>
  );
}
