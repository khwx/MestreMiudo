-- ============================================
-- Table: stories (Persist generated stories)
-- ============================================
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  grade_level INT NOT NULL CHECK (grade_level BETWEEN 1 AND 4),
  image_urls TEXT[] DEFAULT '{}',
  has_audio BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_student ON stories(student_id);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(student_id, created_at DESC);

-- ============================================
-- RLS policies for stories
-- ============================================
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert stories" ON stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read stories" ON stories FOR SELECT USING (true);
