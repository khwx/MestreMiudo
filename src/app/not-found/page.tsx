"use client"

import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Book, AlertTriangle, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

function NotFoundContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || ''
  const grade = searchParams.get('grade') || ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-8">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="absolute -left-8 -top-8 w-16 h-16 bg-accent/20 rounded-full"></div>
          <div className="absolute left-8 top-8 w-16 h-16 bg-primary/20 rounded-full"></div>
          <AlertTriangle className="h-20 w-20 text-destructive mx-auto rotate-45" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-accent animate-pulse" />
          </div>
        </div>
        
        <h1 className="font-headline text-3xl font-bold text-foreground">
          Ops! Página não encontrada
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          A página que procuras parece ter desaparecido para uma aventura secreta. 
          Mas não te preocupes, o MestreMiúdo está aqui para te ajudar a continuar a brincar e aprender!
        </p>
        
        <div className="flex justify-center space-x-4 mt-6">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard?name=${encodeURIComponent(name)}&grade=${encodeURIComponent(grade)}`)}
            className="gap-2"
          >
            <Book className="mr-2 h-5 w-5" />
            Voltar ao Dashboard
          </Button>
          
          <Button 
            onClick={() => router.push(`/?name=${encodeURIComponent(name)}&grade=${encodeURIComponent(grade)}`)}
            className="gap-2"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Começar de Novo
          </Button>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="animate-pulse text-center">
        <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4"></div>
        <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
        <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
      </div>
    </div>
  )
}

export default function NotFoundPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NotFoundContent />
    </Suspense>
  )
}