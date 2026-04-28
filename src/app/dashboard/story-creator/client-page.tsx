"use client";

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, BookHeart, Loader2, AlertTriangle } from 'lucide-react';
import { generateStoryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export default function StoryCreatorClientPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Amigo";
  const grade = searchParams.get("grade") || "1";
  const router = useRouter();
  const { toast } = useToast();

  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<{ title: string; story: string; audioDataUri?: string; images?: string[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;

    setLoading(true);
    setError(null);
    setStory(null);

    try {
      const data = await generateStoryAction({
        studentId: name,
        gradeLevel: parseInt(grade, 10) as 1 | 2 | 3 | 4,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
      });

      if (!data || !data.story) {
        setError('Não foi possível gerar a história. Tenta novamente!');
      } else {
        setStory({
          title: data.title || 'História Mágica',
          story: data.story,
          audioDataUri: data.audioDataUri,
          images: data.images,
        });
        toast({
          title: "🎉 História Criada!",
          description: "A tua história mágica está pronta!",
        });
      }
    } catch (err) {
      console.error('Story generation error:', err);
      setError('Ocorreu um erro ao gerar a história. Tenta novamente!');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStory(null);
    setKeywords('');
    setError(null);
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <div className="text-6xl animate-bounce">📖</div>
        <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Oficina de Histórias
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Cria histórias mágicas com IA! ✨
        </p>
      </div>

      {/* Creation Card */}
      <div className="card-kid border-4 border-purple-300 bg-white shadow-2xl">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="keywords" className="text-lg font-bold text-purple-700 flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                🎨 Palavras Mágicas
              </Label>
              <Input
                id="keywords"
                type="text"
                placeholder="Ex: dragão, castelo, magia (separa por vírgulas)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="text-xl h-14 rounded-xl border-3 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200"
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                💡 Escreve palavras e a IA criará uma história única!
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full text-xl h-16 btn-kid bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
              disabled={loading || !keywords.trim()}
            >
              {loading ? (
                <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> A Criar Magia...</>
              ) : (
                'Criar História! 🚀'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-4 border-red-300 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="h-8 w-8" />
            <p className="text-lg font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="text-center space-y-6 py-12">
          <div className="relative flex justify-center items-center h-32 w-32 mx-auto">
            <Loader2 className="h-32 w-32 animate-spin text-purple-500 opacity-50" />
            <div className="absolute flex justify-center items-center">
              <BookHeart className="h-16 w-16 text-purple-600 animate-float" />
            </div>
          </div>
          <p className="text-xl text-gray-600 animate-pulse">
            🧠 A tecer a história mágica...
          </p>
        </div>
      )}

      {/* Story Result */}
      {story && !loading && (
        <div className="space-y-6">
          {/* Story Title */}
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-3xl md:text-4xl font-black text-purple-700 dark:text-purple-300">
              {story.title}
            </h3>
          </div>

          {/* Story Card */}
          <div className="card-kid card-kid-primary border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="p-8">
              <p className="text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {story.story}
              </p>
            </div>
          </div>

          {/* Images */}
          {story.images && story.images.length > 0 && (
            <div className="card-kid border-4 border-purple-300 bg-white shadow-xl">
              <div className="p-6">
                <h4 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  🖼️ Imagens da História
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {story.images.map((url, i) => (
                    <div key={i} className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-purple-200">
                      <img 
                        src={url} 
                        alt={`Imagem ${i + 1} da história`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleRestart}
              variant="outline"
              size="lg"
              className="flex-1 btn-kid border-2 border-purple-300 text-lg"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Nova História
            </Button>
            <Button 
              onClick={() => router.push(`/dashboard?name=${name}&grade=${grade}`)}
              size="lg"
              className="flex-1 btn-kid bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg"
            >
              Voltar ao Dashboard →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
