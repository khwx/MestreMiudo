"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Gamepad2, Trophy, Star, Users, Heart, Lightbulb, ArrowLeft } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Lições Interativas',
    description: 'Aprende Português, Matemática e Estudo do Meio através de histórias envolventes e atividades divertidas.',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    icon: Gamepad2,
    title: 'Jogos Educativos',
    description: 'Joga jogos como o Forca e outros desafios para reforçar o que aprendeste de forma divertida.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Trophy,
    title: 'Sistema de Recompensas',
    description: 'Ganha moedas, estrelas, emblemas e sobe de nível! Quanto mais estudas, mais recompensas desbloqueias.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  {
    icon: Star,
    title: 'Desafios Diários',
    description: 'Participa em desafios diários e mantém a tua sequência de dias consecutivos para ganhar pontos extra.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    icon: Users,
    title: 'Rankings',
    description: 'Compara o teu desempenho com outros alunos e vê quem é o verdadeiro MestreMiúdo!',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    icon: Heart,
    title: 'Acessibilidade',
    description: 'Interface pensada para crianças, com suporte para daltonismo, texto para ler e tema escuro.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
];

const stats = [
  { value: '3', label: 'Disciplinas' },
  { value: '6+', label: 'Jogos e Ferramentas' },
  { value: '1º-4º', label: 'Anos Escolares' },
  { value: '100%', label: 'Diversão' },
];

export default function AboutContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Amigo';
  const grade = searchParams.get('grade') || '1';

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard?name=${name}&grade=${grade}`}>
          <button aria-label="Voltar" className="p-2 hover:bg-secondary rounded-lg transition">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-4xl font-headline font-bold">Sobre o MestreMiúdo</h1>
          <p className="text-muted-foreground">Aprende a brincar com a plataforma educativa mais divertida!</p>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-2 border-blue-200 dark:border-blue-700">
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-7xl animate-bounce">🎮</div>
          <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            O que é o MestreMiúdo?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            O <strong>MestreMiúdo</strong> é uma plataforma educativa gamificada, criada para transformar a aprendizagem 
            dos 1º ao 4º ano numa aventura emocionante! Através de lições interativas, jogos, desafios e recompensas, 
            as crianças aprendem <strong>Português</strong>, <strong>Matemática</strong> e <strong>Estudo do Meio</strong> 
            enquanto se divertem a subir de nível e a colecionar conquistas.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="text-4xl font-black text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-semibold mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission */}
      <Card className="border-2 border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            A Nossa Missão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
          <p>
            Acreditamos que a <strong>educação deve ser divertida</strong>. O MestreMiúdo nasceu da ideia de que 
            as crianças aprendem melhor quando estão motivadas e entretidas.
          </p>
          <p>
            Combinamos <strong>tecnologia moderna</strong> com <strong>pedagogia sólida</strong> para criar uma experiência 
            de aprendizagem única, onde cada lição é uma nova descoberta e cada desafio é uma oportunidade de crescer.
          </p>
          <p>
            O nosso objetivo é ajudar os alunos do 1º ao 4º ano a <strong>desenvolver hábitos de estudo</strong>, 
            <strong>reforçar conhecimentos</strong> e <strong>ganhar confiança</strong> nas matérias escolares, 
            tudo isto num ambiente seguro e motivador.
          </p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h3 className="text-2xl font-black text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ✨ O que podes fazer no MestreMiúdo
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-xl transition-all duration-300 border-2 h-full">
              <CardHeader>
                <div className={`w-14 h-14 rounded-full ${feature.bgColor} flex items-center justify-center mb-3`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900 dark:text-blue-200">🚀 Como começar?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="text-5xl font-black text-blue-600 dark:text-blue-400">1</div>
              <h4 className="text-xl font-bold text-blue-900 dark:text-blue-200">Entra com o teu nome</h4>
              <p className="text-blue-700 dark:text-blue-300">Usa o nome e código que o teu professor te deu.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-5xl font-black text-blue-600 dark:text-blue-400">2</div>
              <h4 className="text-xl font-bold text-blue-900 dark:text-blue-200">Escolhe uma missão</h4>
              <p className="text-blue-700 dark:text-blue-300">Lições, quizzes, jogos ou desafios diários!</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-5xl font-black text-blue-600 dark:text-blue-400">3</div>
              <h4 className="text-xl font-bold text-blue-900 dark:text-blue-200">Ganha recompensas</h4>
              <p className="text-blue-700 dark:text-blue-300">Coletas moedas, sobes de nível e desbloqueias conquistas!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>Feito com ❤️ para tornar a aprendizagem mais divertida</p>
        <p className="mt-1">MestreMiúdo &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
