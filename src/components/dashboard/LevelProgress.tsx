"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Medal } from "lucide-react"

interface LevelProgressProps {
  level: number;
  progressPercentage: number;
  pointsNeeded: number;
  nextLevel: number;
  loading: boolean;
}

export function LevelProgress({ level, progressPercentage, pointsNeeded, nextLevel, loading }: LevelProgressProps) {
  return (
    <div className="max-w-2xl mx-auto border-4 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-xl">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Medal className="h-8 w-8 text-yellow-500 animate-pulse" />
          <CardTitle className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nível {level}
          </CardTitle>
        </div>
        <CardDescription className="text-base">
          🚀 Continua a jogar para subir de nível!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Skeleton className="h-10 w-48 rounded-lg" />
          </div>
        ) : (
          <>
            <div className="progress-kid">
              <div 
                className="progress-kid-bar" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200">
              {pointsNeeded > 0 
                ? `🎯 Faltam ${pointsNeeded} pontos para o nível ${nextLevel}!` 
                : "🎉 Parabéns! Alcançaste o nível máximo!"}
            </p>
          </>
        )}
      </CardContent>
    </div>
  )
}
