"use client"

import Link from "next/link"
import { Book, Divide, Leaf, Shuffle, Gamepad2, BookHeart, BookOpen, Lightbulb, Flame, ShoppingBag, Brain, RefreshCw, TrendingUp, Trophy, Calendar, BarChart3 } from "lucide-react"

interface SpacedStats {
  total: number;
  mastered: number;
  learning: number;
  due: number;
}

interface DailyChallengeStats {
  completed: number;
  correctAnswers: number;
  streak: number;
}

interface FeatureGridProps {
  name: string;
  grade: string;
  spacedStats: SpacedStats | null;
  dailyChallengeStats: DailyChallengeStats | null;
}

const subjects = [
  { name: "Português", icon: Book, color: "text-green-600", slug: "portugues" },
  { name: "Matemática", icon: Divide, color: "text-blue-600", slug: "matematica" },
  { name: "Estudo do Meio", icon: Leaf, color: "text-orange-600", slug: "estudo-do-meio" },
]

export function FeatureGrid({ name, grade, spacedStats, dailyChallengeStats }: FeatureGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        🎮 Escolhe a tua próxima missão!
      </h3>
      
      {/* Linha 1: Lições + Quizzes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Aprender a Brincar */}
        <Link href={`/dashboard/learn?name=${name}&grade=${grade}`}>
          <div className="card-kid card-kid-success hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col border-green-300 dark:border-green-700">
            <div className="p-6 flex flex-row items-center justify-between pb-2">
              <h4 className="text-2xl font-black text-green-700 dark:text-green-200">📚 Aprender a Brincar</h4>
              <div className="p-4 rounded-full bg-green-200 dark:bg-green-800/40 animate-float">
                <Lightbulb className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <div className="p-6 pt-0 flex-grow">
              <p className="text-green-700 dark:text-green-300 text-lg">Segue lições estruturadas com histórias!</p>
            </div>
            <div className="p-4 pt-0">
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-2xl">⭐</span>
                <span className="font-bold">Lições Interativas</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Quizzes por Disciplina */}
        {subjects.map((subject) => (
          <Link key={subject.name} href={`/quiz/${subject.slug}?name=${name}&grade=${grade}`}>
            <div className={`card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col border-4 ${
              subject.name === 'Português' ? 'border-green-300 dark:border-green-700' :
              subject.name === 'Matemática' ? 'border-blue-300 dark:border-blue-700' :
              'border-orange-300 dark:border-orange-700'
            }`}>
              <div className="p-6 flex flex-row items-center justify-between pb-2">
                <h4 className="text-2xl font-black">{subject.name}</h4>
                <div className={`p-4 rounded-full ${
                  subject.name === 'Português' ? 'bg-green-100 dark:bg-green-900/40' :
                  subject.name === 'Matemática' ? 'bg-blue-100 dark:bg-blue-900/40' :
                  'bg-orange-100 dark:bg-orange-900/40'
                }`}>
                  <subject.icon className={`h-10 w-10 ${
                    subject.name === 'Português' ? 'text-green-600 dark:text-green-400' :
                    subject.name === 'Matemática' ? 'text-blue-600 dark:text-blue-400' :
                    'text-orange-600 dark:text-orange-400'
                  }`} />
                </div>
              </div>
              <div className="p-6 pt-0 flex-grow">
                <p className="text-gray-600 dark:text-gray-300">Desafios de {subject.name} esperam por ti!</p>
              </div>
              <div className="p-4 pt-0">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <span className="text-xl">🎯</span>
                  <span className="font-semibold">Quiz Challenge</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Desafio Surpresa */}
        <Link href={`/quiz/misto?name=${name}&grade=${grade}`}>
          <div className="card-kid card-kid-accent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col border-4 border-yellow-300 dark:border-yellow-700">
            <div className="p-6 flex flex-row items-center justify-between pb-2">
              <h4 className="text-2xl font-black text-yellow-700 dark:text-yellow-300">🎲 Desafio Surpresa</h4>
              <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/40">
                <Shuffle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="p-6 pt-0 flex-grow">
              <p className="text-gray-600 dark:text-gray-300">Testa os teus conhecimentos em todas as áreas!</p>
            </div>
            <div className="p-4 pt-0">
              <div className="flex items-center gap-2 text-yellow-600">
                <span className="text-xl">🎁</span>
                <span className="font-semibold">Misto</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Linha 2: Funcionalidades */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Loja */}
        <Link href={`/dashboard/shop?name=${name}&grade=${grade}`}>
          <div className="card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col border-4 border-yellow-300 dark:border-yellow-700">
            <div className="p-6 text-center flex-grow">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-yellow-600 dark:text-yellow-400" />
              <h4 className="text-xl font-black text-yellow-700 dark:text-yellow-300">🛍️ Loja</h4>
              <p className="text-yellow-600 dark:text-yellow-400 mt-2">Gasta as tuas moedas!</p>
            </div>
          </div>
        </Link>

        {/* Oficina de Histórias */}
        <Link href={`/dashboard/story-creator?name=${name}&grade=${grade}`}>
          <div className="card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col border-4 border-purple-300 dark:border-purple-700">
            <div className="p-6 text-center flex-grow">
              <BookHeart className="h-12 w-12 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
              <h4 className="text-xl font-black text-purple-700 dark:text-purple-300">📖 Criar História</h4>
              <p className="text-purple-600 dark:text-purple-400 mt-2">Cria histórias únicas!</p>
            </div>
          </div>
        </Link>

        {/* Galeria de Histórias */}
        <Link href={`/dashboard/story-gallery?name=${name}&grade=${grade}`}>
          <div className="card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col border-4 border-pink-300 dark:border-pink-700">
            <div className="p-6 text-center flex-grow">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-pink-600 dark:text-pink-400" />
              <h4 className="text-xl font-black text-pink-700 dark:text-pink-300">📚 Galeria</h4>
              <p className="text-pink-600 dark:text-pink-400 mt-2">Vê as tuas histórias!</p>
            </div>
          </div>
        </Link>

        {/* Salão de Jogos */}
        <Link href={`/dashboard/games?name=${name}&grade=${grade}`}>
          <div className="card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col border-4 border-blue-300 dark:border-blue-700">
            <div className="p-6 text-center flex-grow">
              <Gamepad2 className="h-12 w-12 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xl font-black text-blue-700 dark:text-blue-300">🎮 Jogos</h4>
              <p className="text-blue-600 dark:text-blue-400 mt-2">Diverte-te a jogar!</p>
            </div>
          </div>
        </Link>

        {/* Conquistas */}
        <Link href={`/dashboard/achievements?name=${name}&grade=${grade}`}>
          <div className="card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col border-4 border-amber-300 dark:border-amber-700">
            <div className="p-6 text-center flex-grow">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-amber-600 dark:text-amber-400" />
              <h4 className="text-xl font-black text-amber-700 dark:text-amber-300">🏆 Conquistas</h4>
              <p className="text-amber-600 dark:text-amber-400 mt-2">Desbloqueia prémios!</p>
            </div>
          </div>
        </Link>

        {/* Progresso */}
        <Link href={`/dashboard/progress?name=${name}&grade=${grade}`}>
          <div className="card-kid hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col border-4 border-cyan-300 dark:border-cyan-700">
            <div className="p-6 text-center flex-grow">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-cyan-600 dark:text-cyan-400" />
              <h4 className="text-xl font-black text-cyan-700 dark:text-cyan-300">📊 Progresso</h4>
              <p className="text-cyan-600 dark:text-cyan-400 mt-2">Vê o teu desempenho!</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Linha 3: Revisão + Desafio Diário + Rankings + Histórico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Revisão Espaçada */}
        <div className="card-kid hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-indigo-300 bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-indigo-500" />
              <h4 className="text-xl font-black text-indigo-700 dark:text-indigo-300">🧠 Revisão</h4>
            </div>
            {spacedStats && spacedStats.due > 0 ? (
              <>
                <p className="text-indigo-700 dark:text-indigo-300 mb-2 font-bold">
                  {spacedStats.due} itens para rever!
                </p>
                <div className="bg-indigo-200 dark:bg-indigo-800/40 rounded-full px-4 py-2 inline-block">
                  <p className="text-indigo-700 dark:text-indigo-300 font-bold">
                    <RefreshCw className="h-4 w-4 inline mr-1" />
                    Rever agora
                  </p>
                </div>
              </>
            ) : spacedStats && spacedStats.total > 0 ? (
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                ✅ Tudo em dia! {spacedStats.mastered} dominados
              </p>
            ) : (
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                Faz lições para criar revisões!
              </p>
            )}
          </div>
        </div>

        {/* Desafio Diário */}
        <Link href={`/dashboard/daily-challenge?name=${name}&grade=${grade}`} className="md:col-span-1">
        <div className="card-kid hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-orange-300 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 h-full">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
              <h4 className="text-xl font-black text-orange-700 dark:text-orange-300">🔥 Desafio Diário</h4>
            </div>
            <p className="text-orange-700 dark:text-orange-300 mb-3">Ganha pontos todos os dias!</p>
            {dailyChallengeStats?.streak ? (
              <div className="bg-orange-200 dark:bg-orange-800/40 rounded-full px-4 py-2 inline-block">
                <p className="text-orange-700 dark:text-orange-300 font-bold">
                  🎯 {dailyChallengeStats.streak} dias
                </p>
              </div>
            ) : (
              <p className="text-orange-600 dark:text-orange-400 font-semibold">
                Começa hoje!
              </p>
            )}
          </div>
        </div>
        </Link>

        {/* Rankings */}
        <Link href={`/dashboard/leaderboard?name=${name}&grade=${grade}`} className="md:col-span-1">
        <div className="card-kid hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 h-full">
          <div className="p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-purple-600" />
            <h4 className="text-xl font-black text-purple-700 dark:text-purple-300">📊 Rankings</h4>
            <p className="text-purple-600 dark:text-purple-400 mt-2">Compara-te com outros!</p>
          </div>
        </div>
        </Link>

        {/* Histórico */}
        <Link href={`/dashboard/history?name=${name}&grade=${grade}`} className="md:col-span-1">
        <div className="card-kid hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-blue-300 bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/30 dark:to-sky-800/30 h-full">
          <div className="p-6 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-blue-600" />
            <h4 className="text-xl font-black text-blue-700 dark:text-blue-300">📋 Histórico</h4>
            <p className="text-blue-600 dark:text-blue-400 mt-2">Vê o que já fizeste!</p>
          </div>
        </div>
        </Link>
      </div>
    </div>
  )
}
