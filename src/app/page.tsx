"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OnboardingTutorial } from '@/components/OnboardingTutorial'

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('1')
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeen) {
      setShowOnboarding(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && grade) {
      localStorage.setItem('userName', name)
      router.push(`/dashboard?name=${encodeURIComponent(name)}&grade=${grade}`)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem('hasSeenOnboarding', 'true')
  }

  const handleIconLogin = () => {
    router.push('/login')
  }

  return (
    <>
      {showOnboarding && <OnboardingTutorial />}
      
      <div className="flex items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
        <div className="absolute top-10 left-10 text-primary opacity-20">
          <Star className="h-24 w-24 animate-pulse" />
        </div>
        <div className="absolute bottom-10 right-10 text-accent opacity-50">
          <BookOpen className="h-32 w-32 animate-pulse" />
        </div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary/10 rounded-full" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent/10 rounded-full" />
        
        <Card className="w-full max-w-md z-10 shadow-2xl bg-card">
          <CardHeader className="text-center">
            <h1 className="font-headline text-5xl font-bold text-primary">MestreMiúdo</h1>
            <CardDescription className="text-lg pt-2">Vamos aprender a brincar!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Button 
                onClick={handleIconLogin} 
                className="w-full text-lg h-14 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500"
              >
                🌻 Escolhe o teu Icon!
              </Button>
              
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <span className="relative z-10 bg-card px-4 text-sm text-muted-foreground">ou</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-md">O teu nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Escreve o teu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="text-lg h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-md">Ano escolar</Label>
                  <select
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                    className="bg-white dark:bg-gray-800 border border-gray-300 rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-primary w-full h-12"
                  >
                    <option value="1">1º ano</option>
                    <option value="2">2º ano</option>
                    <option value="3">3º ano</option>
                    <option value="4">4º ano</option>
                  </select>
                </div>
                <Button type="submit" className="w-full text-xl h-14" disabled={!name}>
                  Começar a Aprender!
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
