-- ============================================
-- Migration 011: Teacher/Class System
-- ============================================
-- Creates classes, students, and teacher access tables

-- ============================================
-- Classes Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code TEXT UNIQUE NOT NULL,
  class_name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 1 AND 6),
  school_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Students Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 1 AND 6),
  access_code TEXT UNIQUE NOT NULL,
  parent_access_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Teacher Dashboard Access
-- ============================================
CREATE TABLE IF NOT EXISTS public.teacher_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  access_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_access_code ON public.students(access_code);
CREATE INDEX IF NOT EXISTS idx_students_parent_access_code ON public.students(parent_access_code);
CREATE INDEX IF NOT EXISTS idx_classes_class_code ON public.classes(class_code);
CREATE INDEX IF NOT EXISTS idx_teacher_access_code ON public.teacher_access(access_code);
CREATE INDEX IF NOT EXISTS idx_teacher_class_id ON public.teacher_access(class_id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_access ENABLE ROW LEVEL SECURITY;

-- Classes: Allow read for authenticated access
CREATE POLICY "Allow read classes for teacher access" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_access
      WHERE teacher_access.class_id = classes.id
      AND teacher_access.access_code = current_setting('request.jwt.claims.access_code', true)
    )
  );

-- Students: Allow read for teacher access
CREATE POLICY "Allow read students for teacher access" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_access
      WHERE teacher_access.class_id = students.class_id
      AND teacher_access.access_code = current_setting('request.jwt.claims.access_code', true)
    )
  );

-- Teacher access: Allow read for own access code
CREATE POLICY "Allow read own teacher access" ON public.teacher_access
  FOR SELECT USING (
    access_code = current_setting('request.jwt.claims.access_code', true)
  );

-- ============================================
-- Updated_at Trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Sample Data (optional - for testing)
-- ============================================
-- INSERT INTO public.classes (class_code, class_name, teacher_name, grade_level, school_year)
-- VALUES ('TURMA-3A-2025', '3º Ano A', 'Prof. Maria Silva', 3, '2024-2025');
--
-- INSERT INTO public.students (name, class_id, grade_level, access_code, parent_access_code)
-- SELECT 'João Silva', id, 3, 'ALUNO-JOAO-3A', 'PAI-JOAO-3A' FROM public.classes WHERE class_code = 'TURMA-3A-2025';
--
-- INSERT INTO public.teacher_access (teacher_name, class_id, access_code)
-- SELECT 'Prof. Maria Silva', id, 'PROF-MARIA-3A' FROM public.classes WHERE class_code = 'TURMA-3A-2025';