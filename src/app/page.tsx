"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('1') // Default to 1, but it's not shown anymore

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && grade) {
      router.push(`/dashboard?name=${encodeURIComponent(name)}&grade=${grade}`)
    }
  }

  return (
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
            <Button type="submit" className="w-full text-xl h-14" disabled={!name}>
              Começar a Aprender!
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
