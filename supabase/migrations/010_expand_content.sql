-- ============================================
-- Migration 010: Expand Content - Shop Items
-- ============================================

-- New Hats
INSERT INTO shop_items (name, description, price, item_type, icon, is_available) VALUES
('Chapéu de Capitão', 'Lidera a equipa com estilo! 🎖️', 150, 'hat', '🎖️', true),
('Tiará de Fada', 'Mágica e brilhante, como o teu saber! ✨', 200, 'hat', '🧚', true),
('Capacete de Astronauta', 'Explora o universo do conhecimento! 🧑‍🚀', 300, 'hat', '🧑‍🚀', true),
('Chapéu de Detective', 'Resolve mistérios e quizzes! 🕵️', 250, 'hat', '🕵️', true),
('Coroa de Estrela', 'A mais brilhante de todas! ⭐', 400, 'hat', '⭐', true);

-- New Pets
INSERT INTO shop_items (name, description, price, item_type, icon, is_available) VALUES
('Panda Estudioso', 'Adora estudar contigo! 🐼', 500, 'pet', '🐼', true),
('Coruja Sábia', 'A sabedoria em forma de pet! 🦉', 600, 'pet', '🦉', true),
('Tartaruga Calma', 'Aprende no teu ritmo! 🐢', 350, 'pet', '🐢', true),
('Leão Corajoso', 'Coragem em todas as provas! 🦁', 800, 'pet', '🦁', true),
('Golfinho Amigo', 'O teu companheiro aquatico! 🐬', 700, 'pet', '🐬', true);

-- New Backgrounds
INSERT INTO shop_items (name, description, price, item_type, icon, is_available) VALUES
('Oceano Profundo', 'Mergulha no oceano do conhecimento! 🌊', 300, 'background', '🌊', true),
('Montanha Mágica', 'Conquista os picos mais altos! 🏔️', 350, 'background', '🏔️', true),
('Jardim Encantado', 'Um jardim cheio de flores e cores! 🌸', 250, 'background', '🌸', true),
('Universo Estelar', 'Viaja pelas estrelas enquanto aprendes! 🌌', 400, 'background', '🌌', true),
('Vulcão Misterioso', 'Aventura e mistérios te esperam! 🌋', 350, 'background', '🌋', true);

-- New Animations
INSERT INTO shop_items (name, description, price, item_type, icon, is_available) VALUES
('Chuva de Estrelas', 'Estrelas caem do céu a cada acerto! 🌠', 150, 'animation', '🌠', true),
('Nuvem de Bolhas', 'Bolhas coloridas por toda a tela! 🫧', 120, 'animation', '🫧', true),
('Arco-íris Duplo', 'Dois arco-íris de celebração! 🌈', 180, 'animation', '🌈', true);
