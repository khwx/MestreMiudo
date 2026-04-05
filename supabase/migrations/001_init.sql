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
-- Table: diagnostic_tests (learning level detection)
-- ============================================
CREATE TABLE IF NOT EXISTS diagnostic_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  grade_level INT NOT NULL,
  score INT NOT NULL,
  percentage INT NOT NULL,
  learning_level TEXT NOT NULL,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast student lookups
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_student 
  ON diagnostic_tests(student_id);

-- ============================================
-- Table: student_rewards (points, badges, tiers)
-- ============================================
CREATE TABLE IF NOT EXISTS student_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL UNIQUE,
  total_points INT DEFAULT 0,
  current_tier INT DEFAULT 1,
  badges JSONB DEFAULT '[]',
  day_streak INT DEFAULT 0,
  last_quiz_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast student lookups
CREATE INDEX IF NOT EXISTS idx_student_rewards_student 
  ON student_rewards(student_id);

-- ============================================
-- Table: daily_challenges (daily challenge tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  challenge_date DATE NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_id UUID REFERENCES questions(id),
  completed BOOLEAN DEFAULT FALSE,
  correct BOOLEAN,
  bonus_points INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, challenge_date)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_challenges_student 
  ON daily_challenges(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date
  ON daily_challenges(challenge_date);

-- ============================================
-- Table: leaderboards (global and friend rankings)
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  grade_level INT,
  total_points INT DEFAULT 0,
  total_quizzes INT DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  rank INT,
  rank_period TEXT DEFAULT 'global', -- 'global', 'weekly', 'monthly'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, rank_period)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank
  ON leaderboards(rank, rank_period);

-- ============================================
-- Enable Row Level Security (RLS)
-- For now, allow all operations (public app for kids)
-- ============================================
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completion ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Table: lessons (learning content by subject)
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  grade_level INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  learning_objective TEXT,
  story_context TEXT,
  lesson_index INT NOT NULL,
  difficulty TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by subject + grade
CREATE INDEX IF NOT EXISTS idx_lessons_subject_grade 
  ON lessons(subject, grade_level);

-- ============================================
-- Table: lesson_challenges (challenges within lessons)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  challenge_index INT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'multiple_choice', 'fill_blank', 'word_order', 'matching'
  question TEXT NOT NULL,
  content JSONB NOT NULL, -- Varies by challenge type
  hint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by lesson
CREATE INDEX IF NOT EXISTS idx_lesson_challenges_lesson 
  ON lesson_challenges(lesson_id);

-- ============================================
-- Table: lesson_completion (student progress)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_completion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  stars INT DEFAULT 0, -- 0-3 stars (0=incomplete, 1-3=star rating)
  coins_earned INT DEFAULT 0,
  answers JSONB, -- Student's answers
  score INT, -- Percentage score
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_lesson_completion_student 
  ON lesson_completion(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completion_lesson 
  ON lesson_completion(lesson_id);

-- Allow anonymous read/write for all tables
CREATE POLICY "Allow all for questions" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for quiz_history" ON quiz_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for words" ON words FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for diagnostic_tests" ON diagnostic_tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for student_rewards" ON student_rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for daily_challenges" ON daily_challenges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for leaderboards" ON leaderboards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for lessons" ON lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for lesson_challenges" ON lesson_challenges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for lesson_completion" ON lesson_completion FOR ALL USING (true) WITH CHECK (true);
