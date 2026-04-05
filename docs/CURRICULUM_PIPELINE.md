# 📚 Curriculum to Lessons Pipeline

This directory contains tools to extract content from Portuguese school curriculum PDFs and convert them into interactive lessons for MestreMiudo.

## 📁 Files

- **`extract-curriculum.mjs`** - Analyzes curriculum PDFs and generates lesson ideas
- **`create-lessons.mjs`** - Creates lessons in Supabase database
- **`sample-lessons.json`** - Example lessons ready to import

## 🚀 Quick Start

### 1. Extract Curriculum Analysis

Analyze the curriculum to generate lesson ideas:

```bash
node extract-curriculum.mjs português 1
node extract-curriculum.mjs matemática 1
node extract-curriculum.mjs "estudo do meio" 1
```

This generates:
- `docs/curriculum-analysis/[subject]_[grade]_analysis.json` - Structured data
- `docs/curriculum-analysis/[subject]_[grade]_lessons.md` - Lesson plan

### 2. Create Lessons in Database

Once you have a service role key, create lessons automatically:

```bash
# Set environment variable first
export SUPABASE_SERVICE_ROLE_KEY="your-key-here"

node create-lessons.mjs português 1
node create-lessons.mjs matemática 1
node create-lessons.mjs "estudo do meio" 1
```

### 3. Manual Import (No API Key Required)

Use the sample lessons to manually create content:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run:

```sql
-- Insert sample lessons for Portuguese Grade 1
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES 
  ('Português', 1, 'As Vogais - A, E, I, O, U', 'Aprenda a identificar as cinco vogais', 'Identificar e pronunciar todas as vogais', 'A Maria está a explorar o mundo das letras!', 1, 'easy'),
  ('Português', 1, 'Consoantes B, C, D', 'Conheça as primeiras consoantes', 'Aprender os sons das consoantes B, C, D', 'O João está descobrindo novos sons!', 2, 'easy'),
  ('Português', 1, 'Palavras Simples', 'Ler e escrever palavras simples', 'Construir palavras com vogais e consoantes', 'Construindo o nosso primeiro vocabulário!', 3, 'normal');

-- Insert sample challenges for first lesson
-- Get the lesson ID first, then insert challenges
WITH lesson_id AS (
  SELECT id FROM lessons 
  WHERE title = 'As Vogais - A, E, I, O, U' 
  LIMIT 1
)
INSERT INTO lesson_challenges (lesson_id, challenge_index, challenge_type, question, content, hint)
SELECT 
  l.id,
  1,
  'multiple_choice',
  'Qual é a primeira vogal do alfabeto?',
  '{"options": ["A", "B", "C"], "correct_answer": "A"}'::jsonb,
  'É a primeira letra que aprendemos'
FROM lesson_id l;
```

## 📊 Data Structure

### Sample Lesson Format

```json
{
  "subject": "Português",
  "grade_level": 1,
  "title": "As Vogais - A, E, I, O, U",
  "description": "Aprenda a identificar as cinco vogais",
  "learning_objective": "Identificar e pronunciar todas as vogais",
  "story_context": "A Maria está a explorar o mundo das letras!",
  "lesson_index": 1,
  "difficulty": "easy"
}
```

### Challenge Types

#### Multiple Choice
```json
{
  "challenge_type": "multiple_choice",
  "question": "Qual é a primeira vogal?",
  "content": {
    "options": ["A", "B", "C"],
    "correct_answer": "A"
  },
  "hint": "É a primeira letra"
}
```

#### Fill Blank
```json
{
  "challenge_type": "fill_blank",
  "question": "2 + 1 = ?",
  "content": {
    "correct_answers": ["3", "três"]
  },
  "hint": "Pensa em 2 e adiciona 1"
}
```

#### Matching
```json
{
  "challenge_type": "matching",
  "question": "Liga cada número ao seu nome:",
  "content": {
    "pairs": [
      {
        "left": "1",
        "options": ["Um", "Dois", "Três"],
        "correct": "Um"
      }
    ]
  }
}
```

#### Word Order
```json
{
  "challenge_type": "word_order",
  "question": "Ordena as palavras:",
  "content": {
    "words": ["gato", "o", "preto", "é"],
    "correct_order": ["o", "gato", "é", "preto"]
  }
}
```

## 🎓 Curriculum Coverage

### Português (1º Ciclo)
- **Grade 1**: Vowels, basic consonants, simple words, syllables
- **Grade 2**: Complex sounds, digraphs, short stories, comprehension
- **Grade 3**: Reading fluency, text interpretation, grammar basics
- **Grade 4**: Literary education, writing skills, language awareness

### Matemática (1º Ciclo)
- **Grade 1**: Numbers 1-10, basic addition/subtraction, counting
- **Grade 2**: Tens and units, larger numbers, multiplication intro
- **Grade 3**: Multiplication, division basics, problem solving
- **Grade 4**: Multi-digit operations, fractions intro, geometric shapes

### Estudo do Meio (1º Ciclo)
- **Grade 1**: Domestic animals, plants, seasons, daily life
- **Grade 2**: Human body, basic health, community, environment
- **Grade 3**: Geography basics, historical concepts, natural resources
- **Grade 4**: Regional Portugal, biodiversity, sustainability

## 📋 Checklist for Adding Content

- [ ] Extract curriculum for all grades
- [ ] Create lesson plans in Markdown
- [ ] Design challenge questions
- [ ] Test on demo students
- [ ] Gather teacher feedback
- [ ] Refine based on learning outcomes
- [ ] Add more challenge types
- [ ] Create variant questions
- [ ] Add images/illustrations
- [ ] Test gamification mechanics

## 🔗 Related Files

- `src/lib/lessons.ts` - Lesson utility functions
- `src/app/actions.ts` - Server actions for lessons
- `docs/LEARNING_SYSTEM.md` - Full system documentation
- `supabase-setup.sql` - Database schema

## 🆘 Troubleshooting

### "Ficheiro não encontrado"
Make sure the curriculum PDF text files exist in `curriculum_pdfs/` directory

### "Variáveis de ambiente não encontradas"
You need `SUPABASE_SERVICE_ROLE_KEY` for automatic creation. Use manual SQL import instead.

### Lessons not appearing in app
1. Check Supabase RLS policies allow reads
2. Verify lesson grade matches student's grade
3. Clear browser cache

## 📝 Next Steps

1. Review generated lesson plans
2. Create custom exercises based on curriculum
3. Add illustrations/images to lessons
4. Implement teacher review workflow
5. Gather student feedback on difficulty
6. Adjust based on learning analytics

---

**Created:** April 5, 2026
**Last Updated:** April 5, 2026
**Status:** ✅ Ready for curriculum population
