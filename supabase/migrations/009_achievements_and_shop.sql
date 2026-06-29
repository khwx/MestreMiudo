-- ============================================
-- Migration 009: Achievements and Shop Items
-- ============================================

-- Student Achievements Table
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for student_achievements" ON student_achievements FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON student_achievements(student_id);

-- Shop Items Table
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  item_type TEXT NOT NULL CHECK (item_type IN ('hat', 'pet', 'background', 'animation')),
  image_url TEXT,
  icon TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for shop_items" ON shop_items FOR ALL USING (true) WITH CHECK (true);

-- User Inventory Table
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE,
  equipped BOOLEAN DEFAULT false,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, item_id)
);

ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for user_inventory" ON user_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_user_inventory_student_id ON user_inventory(student_id);

-- ============================================
-- Seed Shop Items
-- ============================================
INSERT INTO shop_items (name, description, price, item_type, icon, is_available) VALUES
-- Hats
('Chapéu de Mago', 'Um chapéu mágico cheio de estrelas ✨', 100, 'hat', '🧙', true),
('Coroa de Rei', 'Para os verdadeiros mestres do conhecimento 👑', 500, 'hat', '👑', true),
('Boné Escolar', 'O clássico boné de estudante 🧢', 50, 'hat', '🧢', true),
('Chapéu de Explorador', 'Pronto para aventuras no Estudo do Meio 🌲', 150, 'hat', '🏕️', true),
('Tiara de Princesa', 'Brilhante como as tuas notas! 💎', 200, 'hat', '👸', true),

-- Pets
('Gato Sábio', 'Acompanha-te nas lições de Português 🐱', 200, 'pet', '🐱', true),
('Cão Matemático', 'Ajuda a contar e somar 🐕', 200, 'pet', '🐕', true),
('Coelho da Natureza', 'Explora o Estudo do Meio contigo 🐰', 200, 'pet', '🐰', true),
('Dragãozinho', 'Um pequeno dragão de estimação 🐉', 1000, 'pet', '🐉', true),
('Robô Amigo', 'O teu companheiro de tecnologia 🤖', 500, 'pet', '🤖', true),

-- Backgrounds
('Fundo Espacial', 'Viaja pelas estrelas enquanto aprendes 🌌', 300, 'background', '🌌', true),
('Floresta Mágica', 'Uma floresta cheia de segredos 🌳', 250, 'background', '🌳', true),
('Praia do Saber', 'Aprender com som de ondas 🏖️', 250, 'background', '🏖️', true),
('Castelo Medieval', 'O teu reino do conhecimento 🏰', 400, 'background', '🏰', true),
('Cidade Futurista', 'Bem-vindo ao futuro! 🌃', 400, 'background', '🌃', true),

-- Animations
('Confetes Dourados', 'Celebra cada vitória! 🎊', 100, 'animation', '🎊', true),
('Estrelas Cadentes', 'Mágica a cada resposta certa ✨', 150, 'animation', '✨', true),
('Foguete', 'Descola para o sucesso! 🚀', 200, 'animation', '🚀', true),
('Arco-íris', 'Todas as cores do saber 🌈', 150, 'animation', '🌈', true);

-- ============================================
-- Achievements Catalog (for reference - not a table)
-- Achievements are checked dynamically via checkAchievementUnlock function
-- ============================================
