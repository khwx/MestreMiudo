# Estrutura do Projeto MestreMiudo

## 📊 Visão Geral

```
MestreMiudo/
├── src/
│   ├── ai/                          # IA e Genkit flows
│   │   ├── flows/                   # Fluxos de IA
│   │   ├── tools/                   # Ferramentas (image search)
│   │   ├── schemas.ts               # Schemas Zod para IA
│   │   └── genkit.ts                # Configuração Genkit
│   │
│   ├── app/                         # Next.js App Router
│   │   ├── api/                     # API Routes
│   │   ├── dashboard/               # Dashboard (principal)
│   │   ├── quiz/                    # Sistema de Quiz
│   │   ├── celorico/                # Projeto Celorico OCR (PAUSED)
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Página home
│   │   ├── actions.ts               # Server Actions (🔥 CORE)
│   │   └── shared-schemas.ts        # Schemas compartilhados
│   │
│   ├── components/                  # Componentes React
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── Quiz.tsx                 # Quiz component
│   │   ├── HangmanGameImproved.tsx  # Jogo Hangman
│   │   └── [outros componentes]
│   │
│   ├── lib/                         # Utilitários e lógica
│   │   ├── lessons.ts               # ✨ NEW - Lições
│   │   ├── quiz-generator.ts        # Gerador de perguntas
│   │   ├── rewards.ts               # Sistema de pontos
│   │   ├── achievements.ts          # Conquistas
│   │   ├── leaderboards.ts          # Rankings
│   │   ├── daily-challenges.ts      # Desafios diários
│   │   ├── supabase.ts              # Cliente Supabase
│   │   ├── groq.ts                  # Integração Groq
│   │   └── [outros utilitários]
│   │
│   └── hooks/                       # React hooks
│
├── docs/
│   ├── LEARNING_SYSTEM.md           # ✨ NEW - Doc sistema de aprendizado
│   └── [outras docs]
│
├── curriculum_pdfs/                 # PDFs dos currículos
├── supabase-setup.sql               # SQL database
├── package.json
└── tsconfig.json
```

## 🎯 Principais Sistemas

### 1. **Dashboard** (`/dashboard`)
```
dashboard/
├── page.tsx                         # Main hub (🏠)
├── client-page.tsx                  # Lógica do dashboard
├── layout.tsx                       # Layout shared
│
├── learn/                           # ✨ NOVO - Sistema Aprender a Brincar
│   ├── page.tsx                     # Seleção de disciplinas
│   ├── [subject]/
│   │   ├── page.tsx                 # Lista de lições
│   │   └── lesson/[lesson_id]/
│   │       ├── page.tsx             # Wrapper
│   │       └── client-page.tsx      # Lição interativa
│   │
│   ├── quiz/ 
│   │   ├── page.tsx
│   │   └── client-page.tsx          # Componente Quiz
│   │
│   ├── games/                       # Salão de Jogos
│   │   ├── page.tsx
│   │   └── client-page.tsx
│   │
│   ├── history/                     # Histórico de Quizzes
│   │   ├── page.tsx
│   │   └── client-page.tsx
│   │
│   ├── achievements/                # Conquistas
│   │   └── page.tsx
│   │
│   ├── leaderboard/                 # Rankings
│   │   └── page.tsx
│   │
│   └── story-creator/               # Oficina de Histórias (BROKEN)
│       ├── page.tsx
│       └── client-page.tsx
```

### 2. **Sistema de Quizzes** (`/quiz`)
```
quiz/
└── [subject]/
    ├── page.tsx
    └── client-page.tsx              # Lógica de quiz
```

### 3. **Gamificação**
- **Points**: Gerados ao completar quizzes e lições
- **Stars**: 1-3 baseado em performance (lições)
- **Coins**: 10/25/50 (lições) + 20 bonus diário
- **Achievements**: 10 tipos desbloqueáveis
- **Leaderboards**: Global + por grade
- **Tier System**: Níveis com progression

### 4. **Banco de Dados** (Supabase)
```sql
questions              -- Perguntas de quiz
quiz_history           -- Resultados dos quizzes
words                  -- Palavras Hangman
student_rewards        -- Pontos, badges, tier
diagnostic_tests       -- Testes de diagnóstico
daily_challenges       -- Desafios diários
leaderboards          -- Rankings
lessons                ✨ NEW
lesson_challenges     ✨ NEW
lesson_completion     ✨ NEW
```

## 🔧 Server Actions (`src/app/actions.ts`)

### Quiz & History
- `generateQuizDirect()` - Gera perguntas
- `saveQuiz()` - Salva resultado
- `getFullQuizHistory()` - Histórico do aluno

### Lições ✨ NEW
- `getLessonDataAction()` - Fetch lição
- `getLessonsForSubjectAction()` - Lista lições
- `saveLessonCompletionAction()` - Salva progresso
- `updateStudentRewardsWithCoinsAction()` - Atualiza moedas

### Rewards
- `getStudentRewards()` - Pontos e tier
- `generateCelebrationMessage()` - Mensagem de celebração

### Other
- `getPerformanceData()` - Analytics
- `generateDiagnosticTest()` - Teste diagnóstico

## 📚 Lib Utilities (`src/lib/`)

| Arquivo | Função |
|---------|--------|
| `lessons.ts` ✨ | Manage lessons, stars, coins |
| `quiz-generator.ts` | Generate quiz questions |
| `rewards.ts` | Points, tiers, badges |
| `achievements.ts` | Achievement system |
| `leaderboards.ts` | Ranking calculations |
| `daily-challenges.ts` | Daily quest system |
| `diagnostic-test.ts` | Adaptive learning |
| `supabase.ts` | Supabase client |
| `groq.ts` | Groq API integration |
| `pixabay.ts` | Image search |
| `sounds.ts` | Audio effects |
| `utils.ts` | Helpers |

## 🎨 Componentes (`src/components/`)

### UI Components (shadcn/ui)
- Card, Button, Progress, Input, Dialog, Select, etc.

### Game Components
- `HangmanGameImproved.tsx` - Jogo Hangman (✅ Working)
- `MemoryGame.tsx` - Jogo da Memória
- `TicTacToe.tsx` - Jogo do Galo

### Feature Components
- `Quiz.tsx` - Sistema de quiz
- `StudentDashboard.tsx` - Dashboard
- `AnalyticsDashboard.tsx` - Analytics
- `LevelUpCelebration.tsx` - Celebração
- `OnboardingTutorial.tsx` - Tutorial

## 📊 Data Flow

```
┌─ Home (page.tsx)
└─ Dashboard (main hub)
   ├─ Aprender a Brincar (NEW)
   │  ├─ Subject Selection
   │  ├─ Lesson Browser
   │  └─ Lesson Detail → Challenge → Completion
   │
   ├─ Quiz (traditional)
   │  └─ Quiz Flow → Results
   │
   ├─ Games
   │  ├─ Hangman ✅
   │  ├─ Memory
   │  └─ TicTacToe
   │
   ├─ History (quiz results)
   ├─ Achievements
   ├─ Leaderboard
   └─ Story Creator (BROKEN)
```

## 📈 Tamanho do Projeto

```
Total TypeScript/TSX files: ~95
├── Pages/Layouts: 20+
├── Components: 30+
├── Lib utilities: 15+
├── UI components: 30+ (shadcn)
└── AI flows: 6

Database Tables: 10
├── Core: questions, quiz_history, words
├── Gamification: student_rewards, achievements, leaderboards
├── Learning: lessons, lesson_challenges, lesson_completion ✨
└── Features: diagnostic_tests, daily_challenges
```

## 🚀 Build Status

```
✅ Zero TypeScript errors
✅ Production ready
✅ All pages static or dynamic render correctly
✅ Hydration issues resolved
```

## 🔴 Known Issues

| Issue | Status | Priority |
|-------|--------|----------|
| Story Creator (Genkit) | Broken | Low |
| OCR Celorico | Paused | N/A |

## ✨ Recentes Adições

1. **Aprender a Brincar System** (THIS SESSION)
   - Lições estruturadas
   - 4 tipos de desafios
   - Sistema de stars e coins
   - Progression com lock sequencial

2. **Database Tables**
   - `lessons`
   - `lesson_challenges`
   - `lesson_completion`

3. **Pages**
   - `/dashboard/learn`
   - `/dashboard/learn/[subject]`
   - `/dashboard/learn/[subject]/lesson/[lesson_id]`

4. **Utilities**
   - `src/lib/lessons.ts`
   - Lesson server actions

## 🎓 Próximos Passos

1. **Populate Lessons** - Adicionar conteúdo das escolas
2. **Teacher Dashboard** - Gerenciar lições
3. **Adaptive Difficulty** - Ajustar baseado em performance
4. **TTS/Audio** - Desafios auditivos
5. **Fix Story Creator** - Ou remover se não usar

## 💾 Commits Recentes

```
c37bc41 - docs: add comprehensive Learning System documentation
bbdd16f - feat: implement 'Aprender a Brincar' learning system
```

---

**Estado Geral**: ✅ Bem estruturado e pronto para produção
**Foco Atual**: Sistema de Aprender a Brincar
**Próximo Foco**: Adicionar conteúdo pedagógico
