/**
 * @fileOverview Supabase SQL setup script.
 * 
 * Run this SQL in your Supabase SQL Editor to create the required tables.
 * Go to: Supabase Dashboard → SQL Editor → New query → Paste & Run
 */

-- ============================================
-- Table: questions (cached quiz questions)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level INT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by grade + subject
CREATE INDEX IF NOT EXISTS idx_questions_grade_subject 
  ON questions(grade_level, subject);

-- ============================================
-- Table: quiz_history (replaces quiz-history.json)
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  grade_level INT NOT NULL,
  subject TEXT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  answers JSONB NOT NULL,
  quiz_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast student lookups
CREATE INDEX IF NOT EXISTS idx_quiz_history_student 
  ON quiz_history(student_id);

-- ============================================
-- Table: words (cached hangman words)
-- ============================================
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  word TEXT NOT NULL,
  hint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by category + difficulty
CREATE INDEX IF NOT EXISTS idx_words_category_difficulty 
  ON words(category, difficulty);

-- ============================================
-- Enable Row Level Security (RLS)
-- For now, allow all operations (public app for kids)
-- ============================================
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for all tables
CREATE POLICY "Allow all for questions" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for quiz_history" ON quiz_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for words" ON words FOR ALL USING (true) WITH CHECK (true);
