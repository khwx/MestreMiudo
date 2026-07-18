'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, BookHeart, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStudentStories } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface Story {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  grade_level: number;
  image_urls: string[];
  has_audio: boolean;
  created_at: string;
}

export default function StoryGalleryClientPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Amigo';
  const grade = searchParams.get('grade') || '1';
  const { toast } = useToast();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setError(null);
        const data = await getStudentStories(name, 20);
        setStories(data as Story[]);
      } catch (err) {
        logger.error('Erro ao carregar histórias:', err);
        setError('Não foi possível carregar as tuas histórias. Tenta novamente.');
        toast({
          title: 'Erro ao carregar histórias',
          description: 'Não foi possível carregar as tuas histórias.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [name, toast]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (selectedStory) {
    return (
      <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedStory(null)}
            className="p-3 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-black text-purple-700 dark:text-purple-300">
            {selectedStory.title}
          </h1>
        </div>

        <div className="card-kid border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(selectedStory.created_at)}
              </div>
              <div className="flex gap-2">
                {selectedStory.keywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {selectedStory.content}
            </p>
          </div>
        </div>

        {selectedStory.image_urls && selectedStory.image_urls.length > 0 && (
          <div className="card-kid border-4 border-purple-300 bg-white dark:bg-gray-800 shadow-xl">
            <div className="p-6">
              <h4 className="text-2xl font-bold text-purple-700 mb-4">Imagens da História</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedStory.image_urls.map((url, i) => (
                  <div key={i} className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-purple-200">
                    <Image
                      src={url}
                      alt={`Ilustração ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard?name=${name}&grade=${grade}`}>
          <button className="p-3 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            As Minhas Histórias
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Todas as histórias que criaste! 📚
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-kid border-4 border-purple-200 dark:border-purple-800 shadow-xl animate-pulse">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 dark:border-gray-700">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="flex gap-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card-kid border-4 border-red-300 dark:border-red-700 shadow-xl max-w-2xl mx-auto">
          <div className="p-8 text-center space-y-4">
            <div className="text-6xl">😕</div>
            <h3 className="text-2xl font-black text-red-700 dark:text-red-300">Erro ao carregar</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setStories([]);
              }}
              className="btn-kid border-2 border-red-300 px-6 py-2 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      ) : stories.length === 0 ? (
        <div className="card-kid border-4 border-gray-300 dark:border-gray-700 shadow-xl max-w-2xl mx-auto">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Ainda não criaste nenhuma história!
            </p>
            <Link href={`/dashboard/story-creator?name=${name}&grade=${grade}`}>
              <Button className="btn-kid bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg">
                <BookHeart className="mr-2 h-5 w-5" /> Criar Primeira História
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setSelectedStory(story)}
              className="card-kid border-4 border-purple-200 dark:border-purple-800 shadow-xl hover:shadow-2xl hover:border-purple-400 transition-all duration-300 cursor-pointer group text-left w-full"
              aria-label={`Ver história: ${story.title}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-black text-purple-700 dark:text-purple-300 group-hover:text-purple-900 dark:group-hover:text-purple-100 line-clamp-2">
                    {story.title}
                  </h3>
                  <Eye className="h-5 w-5 text-purple-400 group-hover:text-purple-600 flex-shrink-0 ml-2" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                  {story.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(story.created_at)}
                  </div>
                  <div className="flex gap-1">
                    {story.keywords.slice(0, 2).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                        {kw}
                      </span>
                    ))}
                    {story.keywords.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                        +{story.keywords.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
