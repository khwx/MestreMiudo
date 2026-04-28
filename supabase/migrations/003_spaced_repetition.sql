-- ============================================
-- Table: spaced_repetition (Spaced repetition learning)
-- ============================================
CREATE TABLE IF NOT EXISTS spaced_repetition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  topic TEXT NOT NULL,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval_days INT DEFAULT 0,
  repetitions INT DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  last_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, question)
);

CREATE INDEX IF NOT EXISTS idx_spaced_repetition_student 
  ON spaced_repetition(student_id);

CREATE INDEX IF NOT EXISTS idx_spaced_repetition_next_review 
  ON spaced_repetition(next_review);

-- ============================================
-- Table: story_characters (Character progression in stories)
-- ============================================
CREATE TABLE IF NOT EXISTS story_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  character_type TEXT NOT NULL,
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  story_count INT DEFAULT 0,
  unlocked_abilities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_characters_student 
  ON story_characters(student_id);

-- ============================================
-- Table: parent_dashboard_access (Parent/Teacher access)
-- ============================================
CREATE TABLE IF NOT EXISTS parent_dashboard_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_email TEXT NOT NULL UNIQUE,
  access_code TEXT NOT NULL,
  allowed_students JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);