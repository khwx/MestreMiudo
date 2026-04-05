# Arquitetura Detalhada - MestreMiudo

## 1. Stack Tecnológico

```
┌─────────────────────────────────────────────────────┐
│ Frontend                                            │
├─────────────────────────────────────────────────────┤
│ • Next.js 15 (App Router)                           │
│ • React 19 com TypeScript                           │
│ • Tailwind CSS + shadcn/ui                          │
│ • Zustand (state management)                        │
│ • Zod (schema validation)                           │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ Backend (Server Actions)                            │
├─────────────────────────────────────────────────────┤
│ • Next.js Server Actions                            │
│ • API Routes                                        │
│ • TypeScript                                        │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ AI/ML                                               │
├─────────────────────────────────────────────────────┤
│ • Google Genkit (story generation)                  │
│ • Groq API (fallback)                               │
│ • OpenRouter (multi-model)                          │
│ • Text-to-Speech                                    │
│ • Image Search (Pixabay)                            │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ Database                                            │
├─────────────────────────────────────────────────────┤
│ • Supabase (PostgreSQL)                             │
│ • 10 tables (RLS enabled)                           │
│ • Real-time updates                                 │
│ • Auth (future enhancement)                         │
└─────────────────────────────────────────────────────┘
```

## 2. Fluxo de Dados - Sistema Aprender a Brincar

```
┌──────────────────────┐
│  Dashboard Hub       │
│ (learn button)       │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│  Subject Selection   │
│  - Português         │
│  - Matemática        │
│  - Estudo do Meio    │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────┐
│  Lesson List                 │
│  [Progress Bar]              │
│  [Locked/Unlocked lessons]   │
└──────────┬────────────────────┘
           │
           ↓
┌────────────────────────────────────────┐
│  Lesson Detail                         │
│  [Story Context]                       │
│  [Learning Objective]                  │
│  ↓                                      │
│  Challenge 1 → Challenge 2 → ... → Fin │
└──────────┬─────────────────────────────┘
           │
           ↓
┌────────────────────────────────────────┐
│  Completion Screen                     │
│  [Score %]                             │
│  [Stars 0-3]                           │
│  [Coins Earned]                        │
│  ↓                                      │
│  Update: student_rewards.total_points  │
└────────────────────────────────────────┘
```

## 3. Database Schema Relationships

```
┌─────────────────────────────────┐
│  lessons                         │
├─────────────────────────────────┤
│ id (UUID) PRIMARY KEY           │
│ subject                         │
│ grade_level                     │
│ title, description              │
│ learning_objective              │
│ story_context                   │
│ lesson_index                    │
│ difficulty                      │
└─────────────────┬───────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ↓                    ↓
┌──────────────────────┐   ┌──────────────────────┐
│ lesson_challenges    │   │ lesson_completion    │
├──────────────────────┤   ├──────────────────────┤
│ id (UUID)            │   │ id (UUID)            │
│ lesson_id (FK)       │   │ student_id           │
│ challenge_index      │   │ lesson_id (FK)       │
│ challenge_type       │   │ completed            │
│ question             │   │ stars (0-3)          │
│ content (JSONB)      │   │ coins_earned         │
│ hint                 │   │ score                │
│                      │   │ answers (JSONB)      │
│                      │   │ completed_at         │
└──────────────────────┘   └──────────────────────┘

┌──────────────────────────┐
│ student_rewards          │
├──────────────────────────┤
│ student_id (PK)          │
│ total_points ← +coins    │
│ current_tier             │
│ badges                   │
│ day_streak               │
└──────────────────────────┘
```

## 4. Challenge System Flow

```
┌──────────────────────────┐
│  Challenge Renderer      │
└──────────┬───────────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    │             │          │          │
    ↓             ↓          ↓          ↓
┌─────────┐  ┌─────────┐ ┌────────┐ ┌─────────┐
│Multiple │  │Fill     │ │Word    │ │Matching │
│Choice   │  │Blank    │ │Order   │ │         │
├─────────┤  ├─────────┤ ├────────┤ ├─────────┤
│Options: │  │Input:   │ │Drag &  │ │Connect: │
│[A,B,C]  │  │text box │ │Drop    │ │pairs[]  │
│         │  │         │ │words[] │ │         │
└────┬────┘  └────┬────┘ └───┬────┘ └────┬────┘
     │            │          │           │
     └────────────┴──────────┴───────────┘
                  │
                  ↓
         ┌─────────────────┐
         │ Validation      │
         ├─────────────────┤
         │ Compare answer  │
         │ with content    │
         │ properties      │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │                 │
      Correct          Incorrect
         │                 │
    Continue ← ─ ─ ─ ─ Next Q ─ ─ ─ ─
```

## 5. Gamification Engine

```
┌─────────────────────────────────────┐
│  Calculate Score                    │
│  (correct_answers / total) * 100    │
└──────────────┬──────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
   Score              Score
   100%               60-99%
    │                  │
    ↓                  ↓
  3 Stars ← ─ ─ ─ ─  2 Stars ← ─ ─ ─ ─ 1 Star (60-79%)
    │                  │
    ↓                  ↓
  50 coins           25 coins         10 coins
    │                  │
    └─────────┬────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ↓                    ↓
Daily Bonus      Update student_rewards
(+20 coins)      total_points += coins
    │                    │
    └────────┬───────────┘
             │
             ↓
      Unlock achievements
      Recalculate tier
```

## 6. File Organization by Feature

### Quiz System
```
src/app/quiz/[subject]/           → Pages
src/components/Quiz.tsx           → Logic
src/lib/quiz-generator.ts         → Generation
src/lib/diagnostic-test.ts        → Adaptive
```

### Learning System (NEW)
```
src/app/dashboard/learn/          → Pages
src/lib/lessons.ts                → Logic
src/app/actions.ts                → Server actions
src/app/shared-schemas.ts         → Types
```

### Gamification
```
src/lib/rewards.ts                → Points/Coins
src/lib/achievements.ts           → Badges
src/lib/leaderboards.ts           → Rankings
src/lib/daily-challenges.ts       → Quests
```

### Games
```
src/components/HangmanGameImproved.tsx
src/components/MemoryGame.tsx
src/components/TicTacToe.tsx
src/app/dashboard/games/
```

### AI Integration
```
src/ai/genkit.ts                  → Config
src/ai/flows/                     → Flows
src/ai/tools/                     → Tools
```

## 7. Key Files by Responsibility

| Responsabilidade | Arquivo Principal | Tamanho |
|---|---|---|
| Server Actions | `src/app/actions.ts` | 800+ linhas |
| Quiz Logic | `src/components/Quiz.tsx` | 400+ linhas |
| Lesson Utils | `src/lib/lessons.ts` | 300+ linhas |
| Quiz Generator | `src/lib/quiz-generator.ts` | 200+ linhas |
| Rewards System | `src/lib/rewards.ts` | 150+ linhas |
| Database Setup | `supabase-setup.sql` | 220+ linhas |

## 8. Performance Characteristics

```
Request Flow:
User Action → Client Component → Server Action → Supabase → Response

Cold Start: ~200ms
Typical Request: ~50-100ms
Database Query: ~20-50ms
AI Generation: ~1-3s (Genkit/Groq)

Cache Strategy:
- Server Components: Revalidate on demand
- Supabase: RLS + Real-time subscriptions
- Static Pages: Pre-built at build time
```

## 9. Security Considerations

```
✅ RLS Policies:    Enabled on all tables (currently allow-all for public app)
✅ Env Vars:        All secrets in .env.local (not versioned)
✅ Input Validation: Zod schemas on all inputs
✅ Type Safety:     Full TypeScript
⚠️  Auth:           Not implemented (future enhancement)
⚠️  API Limits:     Basic rate limiting via Supabase
```

## 10. Deployment Architecture

```
┌──────────────────────────────────────┐
│  GitHub (source)                     │
└────────────────┬─────────────────────┘
                 │
                 ↓
         ┌───────────────┐
         │ Vercel        │ (Deployment)
         ├───────────────┤
         │ Next.js Build │
         │ Static Export │
         │ Serverless    │
         └────────┬──────┘
                  │
                  ↓
         ┌────────────────────┐
         │ Supabase           │ (Backend)
         ├────────────────────┤
         │ PostgreSQL DB      │
         │ Auth               │
         │ Real-time          │
         │ Storage (future)    │
         └────────────────────┘
```

---

**Notas:**
- Arquitetura é monolítica mas bem estruturada em domains
- Fácil expandir e adicionar novos sistemas
- Type-safe end-to-end
- Performance primeira é good (zero hydration issues)
