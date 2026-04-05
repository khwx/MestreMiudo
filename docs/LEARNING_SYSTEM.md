# Aprender a Brincar (Learn by Playing) - System Documentation

## Overview
The "Aprender a Brincar" system is a gamified learning platform integrated into MestreMiudo that allows children to follow structured lessons with interactive challenges, earning rewards through gamification.

## Architecture

### Database Tables

#### `lessons`
Stores lesson metadata and learning objectives.
```sql
- id (UUID) - Unique identifier
- subject (TEXT) - 'Português', 'Matemática', 'Estudo do Meio'
- grade_level (INT) - 1-4
- title (TEXT) - Lesson name
- description (TEXT) - Short description
- learning_objective (TEXT) - What students will learn
- story_context (TEXT) - Story framing for the lesson
- lesson_index (INT) - Order within subject/grade
- difficulty (TEXT) - 'easy', 'normal', 'hard'
```

#### `lesson_challenges`
Stores individual challenges within lessons.
```sql
- id (UUID) - Unique identifier
- lesson_id (UUID) - References lessons.id
- challenge_index (INT) - Order within lesson
- challenge_type (TEXT) - 'multiple_choice', 'fill_blank', 'word_order', 'matching'
- question (TEXT) - The challenge question/prompt
- content (JSONB) - Challenge-specific data (options, answers, etc.)
- hint (TEXT) - Optional hint for students
```

#### `lesson_completion`
Tracks student progress and performance.
```sql
- id (UUID) - Unique identifier
- student_id (TEXT) - Student name/identifier
- lesson_id (UUID) - References lessons.id
- completed (BOOLEAN) - Is lesson complete?
- stars (INT) - 0-3 stars earned
- coins_earned (INT) - Coins awarded
- score (INT) - Percentage score
- answers (JSONB) - Student's answers to challenges
- completed_at (TIMESTAMP) - When completed
```

## Gamification System

### Star Rating
Stars are awarded based on overall lesson score:
- **0 stars**: Score < 60% (incomplete/failed)
- **1 star**: Score 60-79% (acceptable)
- **2 stars**: Score 80-99% (good)
- **3 stars**: Score 100% (perfect)

### Coin Rewards
Coins are awarded based on stars earned:
- **1 star**: 10 coins
- **2 stars**: 25 coins
- **3 stars**: 50 coins
- **Daily bonus**: +20 coins for completing a lesson each day

### Progression
- Lessons are **locked sequentially** - students must complete lesson N before accessing lesson N+1
- Progress is displayed as a percentage per subject
- Completed lessons show earned stars and coins

## Page Structure

### `/dashboard/learn`
Main hub for the learning system. Shows all three subjects:
- Português
- Matemática  
- Estudo do Meio

### `/dashboard/learn/[subject]`
Subject-specific page showing:
- All lessons available for the student's grade level
- Progress bar (X lessons completed out of Y)
- Lock status for incomplete prerequisites
- Star rating and coins for completed lessons

### `/dashboard/learn/[subject]/lesson/[lesson_id]`
Lesson detail page with:
- Story context and learning objective
- Sequential challenges (one at a time)
- Progress bar through challenges
- Challenge types:
  - **Multiple Choice**: Select from options
  - **Fill Blank**: Type the answer
  - **Word Order**: Arrange words in correct sequence
  - **Matching**: Connect related items
- Completion screen showing:
  - Final score (%)
  - Stars earned (0-3)
  - Coins earned
  - Performance message

## Challenge Types

### Multiple Choice
```json
{
  "challenge_type": "multiple_choice",
  "question": "Qual é a capital de Portugal?",
  "content": {
    "options": ["Porto", "Lisboa", "Covilhã"],
    "correct_answer": "Lisboa"
  }
}
```

### Fill Blank
```json
{
  "challenge_type": "fill_blank",
  "question": "2 + 3 = ?",
  "content": {
    "correct_answer": "5",
    "correct_answers": ["5", "cinco"] // Case-insensitive alternatives
  }
}
```

### Word Order
```json
{
  "challenge_type": "word_order",
  "question": "Ordena as palavras: ", 
  "content": {
    "words": ["gato", "o", "preto", "é"],
    "correct_order": ["o", "gato", "é", "preto"]
  }
}
```

### Matching
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

## Key Functions

### `src/lib/lessons.ts`
- `getLessons(subject, gradeLevel)` - Get all lessons
- `getLesson(lessonId)` - Get lesson with challenges
- `getLessonProgress(studentId, lessonId)` - Get completion status
- `calculateStars(score)` - Convert score to stars
- `calculateCoins(stars, isDailyBonus)` - Calculate coins
- `saveLessonCompletion()` - Save student progress

### `src/app/actions.ts`
- `getLessonDataAction()` - Server action to fetch lesson
- `saveLessonCompletionAction()` - Save completion and update rewards
- `updateStudentRewardsWithCoinsAction()` - Update student coins

## Adding New Lessons

### Step 1: Create SQL Insert
```sql
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES ('Português', 1, 'Conhecer as Vogais', '...', '...', '...', 1, 'easy');
```

### Step 2: Add Challenges
```sql
INSERT INTO lesson_challenges (lesson_id, challenge_index, challenge_type, question, content, hint)
VALUES ('[lesson_id]', 1, 'multiple_choice', '...', '{...}'::jsonb, 'Dica...');
```

Or use the `initializeSampleLessons()` function in `lessons.ts` to seed development data.

## Future Enhancements

- [ ] Difficulty levels adaptive to student performance
- [ ] Listening/speaking challenges with TTS
- [ ] Open-ended writing challenges
- [ ] Leaderboards for lessons by subject
- [ ] Achievement badges tied to lesson completion
- [ ] Daily challenge system integrated with lessons
- [ ] Teacher dashboard for progress monitoring
- [ ] Content from textbook extraction automation
- [ ] Personalized learning paths based on diagnostic tests

## Integration Points

The learning system integrates with:
- **Student Rewards**: Coins earned are added to total_points
- **Dashboard**: "Aprender a Brincar" button in main hub
- **Progress Tracking**: Student rewards updated with lesson completion
- **Grade Levels**: Lessons filtered by student's grade (1-4)

## Testing Checklist

- [ ] Navigate from dashboard to learn page
- [ ] Select a subject
- [ ] See locked/unlocked lessons
- [ ] Complete a lesson with all challenge types
- [ ] Verify stars and coins awarded correctly
- [ ] Check coins added to student rewards
- [ ] Verify progress bar updates
- [ ] Test different score ranges (0%, 60%, 80%, 100%)
