-- Create lesson_challenges table (was missing!)
CREATE TABLE IF NOT EXISTS lesson_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('multiple_choice', 'fill_blank', 'word_order', 'matching')),
  question TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  hint TEXT,
  challenge_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for lesson_challenges" ON lesson_challenges FOR ALL USING (true) WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lesson_challenges_lesson_id ON lesson_challenges(lesson_id);

-- ============================================
-- Seed lesson_challenges for existing lessons
-- ============================================

-- Helper: We reference lessons by their subject+grade+lesson_index to find IDs dynamically.
-- Since we can't use variables in plain SQL, we use subqueries.

-- G1 - Português - Conhecer as Vogais (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual destas é uma vogal?',
  '{"options": ["a", "b", "c", "d"], "correct_answer": "a"}'::jsonb,
  'As vogais são a, e, i, o, u', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quantas vogais existem no alfabeto português?',
  '{"options": ["3", "5", "7", "10"], "correct_answer": "5"}'::jsonb,
  'Pensa nas letras que se dizem com a boca aberta', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'As cinco vogais são: _, e, i, o, u',
  '{"correct_answer": "a", "correct_answers": ["a", "A"]}'::jsonb,
  'É a primeira vogal do alfabeto', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 1;

-- G1 - Português - As Consoantes Mágicas (lesson_index 2)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual destas NÃO é uma consoante?',
  '{"options": ["b", "e", "d", "f"], "correct_answer": "e"}'::jsonb,
  'Lembra-te: a, e, i, o, u são vogais!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o som da consoante "m"?',
  '{"options": ["fá fá", "mém mém", "lél lél", "sés sés"], "correct_answer": "mém mém"}'::jsonb,
  'Pensa na palavra "mamã"', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A palavra "gato" começa com a consoante ___',
  '{"correct_answer": "g", "correct_answers": ["g", "G"]}'::jsonb,
  'Que som faz o gato?', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 2;

-- G1 - Português - Formar Palavras (lesson_index 3)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Juntando "ca" + "sa" formamos:',
  '{"options": ["casa", "caca", "saca", "sasa"], "correct_answer": "casa"}'::jsonb,
  'Onde moramos!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 3;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra está formada corretamente?',
  '{"options": ["bo la", "bola", "lo ba", "obal"], "correct_answer": "bola"}'::jsonb,
  'É redonda e rebola!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 3;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'BO_ _A - Completa a palavra!',
  '{"correct_answer": "LA", "correct_answers": ["LA", "la", "La"]}'::jsonb,
  'Uma bola é para jogar!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 3;

-- G1 - Matemática - Números de 1 a 10 (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quantos dedos tens numa mão?',
  '{"options": ["3", "5", "7", "10"], "correct_answer": "5"}'::jsonb,
  'Conta os teus dedos!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O número depois do 7 é o ___',
  '{"correct_answer": "8", "correct_answers": ["8", "oito"]}'::jsonb,
  'Conta: 5, 6, 7, ...?', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o maior número?',
  '{"options": ["3", "8", "5", "2"], "correct_answer": "8"}'::jsonb,
  'Pensa nos números na linha!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 1;

-- G1 - Matemática - Adição Divertida (lesson_index 2)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '2 + 3 = ?',
  '{"options": ["4", "5", "6", "3"], "correct_answer": "5"}'::jsonb,
  'Conta 2 maçãs + 3 maçãs', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '1 + 1 = ___',
  '{"correct_answer": "2", "correct_answers": ["2", "dois"]}'::jsonb,
  'Junta um com outro!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '4 + 0 = ?',
  '{"options": ["0", "4", "40", "1"], "correct_answer": "4"}'::jsonb,
  'Adicionar zero não muda o número!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 2;

-- G1 - Matemática - Formas Geométricas (lesson_index 3)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Que forma tem uma roda de carro?',
  '{"options": ["Quadrado", "Triângulo", "Círculo", "Retângulo"], "correct_answer": "Círculo"}'::jsonb,
  'É redonda!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 3;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um quadrado tem quantos lados?',
  '{"options": ["3", "4", "5", "6"], "correct_answer": "4"}'::jsonb,
  'Conta os cantos!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 3;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada forma ao número de lados:',
  '{"pairs": [{"left": "Triângulo", "options": ["3 lados", "4 lados", "0 lados"]}, {"left": "Quadrado", "options": ["3 lados", "4 lados", "0 lados"]}, {"left": "Círculo", "options": ["3 lados", "4 lados", "0 lados"]}], "correct_matches": {"Triângulo": "3 lados", "Quadrado": "4 lados", "Círculo": "0 lados"}}'::jsonb,
  'Pensa nos cantos de cada forma', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 3;

-- G2 - Português - Palavras com Ç e SS (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra se escreve com "ç"?',
  '{"options": ["paçoca", "pássaro", "essência", "pássada"], "correct_answer": "paçoca"}'::jsonb,
  'O ç soa como "ss" mas aparece antes de a, o, u', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra se escreve com "ss"?',
  '{"options": ["caça", "passeio", "começar", "alaçar"], "correct_answer": "passeio"}'::jsonb,
  'O ss aparece entre vogais!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O pá__aro voa pelo céu.',
  '{"correct_answer": "ss", "correct_answers": ["ss", "SS"]}'::jsonb,
  'Entre vogais usa-se ss!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 1;

-- G2 - Português - Género do Nome (lesson_index 2)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"O gato" - O nome "gato" é:',
  '{"options": ["Masculino", "Feminino", "Neutro", "Plural"], "correct_answer": "Masculino"}'::jsonb,
  'Repara no artigo "o"', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O feminino de "menino" é:',
  '{"options": ["menina", "menino", "meninas", "meninos"], "correct_answer": "menina"}'::jsonb,
  'Muda o final para -a', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A ____ comeu o queijo. (feminino de gato)',
  '{"correct_answer": "gata", "correct_answers": ["gata", "Gata"]}'::jsonb,
  'Troca o final por -a', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 2;

-- G2 - Matemática - Adição até 20 (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '8 + 7 = ?',
  '{"options": ["14", "15", "16", "13"], "correct_answer": "15"}'::jsonb,
  '8 + 2 = 10, depois soma 5', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '9 + 6 = ___',
  '{"correct_answer": "15", "correct_answers": ["15", "quinze"]}'::jsonb,
  '9 + 1 = 10, depois soma 5', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '12 + 5 = ?',
  '{"options": ["15", "16", "17", "18"], "correct_answer": "17"}'::jsonb,
  'Soma as unidades primeiro!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 1;

-- G2 - Matemática - Subtração Básica (lesson_index 2)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '10 - 4 = ?',
  '{"options": ["5", "6", "7", "4"], "correct_answer": "6"}'::jsonb,
  'Se tens 10 e tiras 4...', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '15 - 8 = ___',
  '{"correct_answer": "7", "correct_answers": ["7", "sete"]}'::jsonb,
  'Pensa: 15 - 5 = 10, depois -3', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '20 - 12 = ?',
  '{"options": ["6", "7", "8", "9"], "correct_answer": "8"}'::jsonb,
  'Subtrai as dezenas primeiro!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 2;

-- G2 - Estudo do Meio - Os Animais da Floresta (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual animal vive na floresta?',
  '{"options": ["Tubarão", "Raposa", "Camelo", "Pinguim"], "correct_answer": "Raposa"}'::jsonb,
  'Pensa nos animais de Portugal!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada animal ao seu habitat:',
  '{"pairs": [{"left": "Raposa", "options": ["Floresta", "Oceano", "Deserto"]}, {"left": "Tubarão", "options": ["Floresta", "Oceano", "Deserto"]}, {"left": "Camelo", "options": ["Floresta", "Oceano", "Deserto"]}], "correct_matches": {"Raposa": "Floresta", "Tubarão": "Oceano", "Camelo": "Deserto"}}'::jsonb,
  'Onde mora cada animal?', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O veado é um animal:',
  '{"options": ["Herbívoro", "Carnívoro", "Onívoro", "Insectívoro"], "correct_answer": "Herbívoro"}'::jsonb,
  'O que come o veado?', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 1;

-- G2 - Estudo do Meio - As Estações do Ano (lesson_index 2)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Em que estação faz mais calor?',
  '{"options": ["Inverno", "Primavera", "Verão", "Outono"], "correct_answer": "Verão"}'::jsonb,
  'Pensa nas férias!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada estação à sua característica:',
  '{"pairs": [{"left": "Primavera", "options": ["Flores", "Neve", "Praia", "Folhas caem"]}, {"left": "Verão", "options": ["Flores", "Neve", "Praia", "Folhas caem"]}, {"left": "Outono", "options": ["Flores", "Neve", "Praia", "Folhas caem"]}, {"left": "Inverno", "options": ["Flores", "Neve", "Praia", "Folhas caem"]}], "correct_matches": {"Primavera": "Flores", "Verão": "Praia", "Outono": "Folhas caem", "Inverno": "Neve"}}'::jsonb,
  'O que acontece em cada estação?', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quantas estações do ano existem?',
  '{"options": ["2", "3", "4", "6"], "correct_answer": "4"}'::jsonb,
  'Primavera, Verão, Outono e...', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 2;

-- G3 - Português - Texto Narrativo (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Numa história, o "meio" serve para:',
  '{"options": ["Apresentar personagens", "Desenvolver o conflito", "Concluir a história", "Nada"], "correct_answer": "Desenvolver o conflito"}'::jsonb,
  'É a parte mais longa da história', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'word_order', 'Ordena as partes de uma narrativa:',
  '{"correct_order": ["Introdução", "Desenvolvimento", "Conclusão"]}'::jsonb,
  'Começo, meio e fim!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O que é o clímax de uma história?',
  '{"options": ["O início", "O momento de maior tensão", "O final feliz", "A descrição"], "correct_answer": "O momento de maior tensão"}'::jsonb,
  'É o ponto mais emocionante!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 1;

-- G4 - Matemática - Multiplicação Mágica (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '3 × 4 = ?',
  '{"options": ["7", "10", "12", "14"], "correct_answer": "12"}'::jsonb,
  '3 grupos de 4!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '6 × 7 = ___',
  '{"correct_answer": "42", "correct_answers": ["42", "quarenta e dois"]}'::jsonb,
  'É a tabuada mais famosa!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Se 5 × 8 = 40, então 8 × 5 = ?',
  '{"options": ["30", "40", "50", "58"], "correct_answer": "40"}'::jsonb,
  'A ordem não importa na multiplicação!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 1;

-- G3 - Português - Sinónimos e Antónimos (lesson_index 2)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o sinónimo de "grande"?',
  '{"options": ["Pequeno", "Enorme", "Rápido", "Feio"], "correct_answer": "Enorme"}'::jsonb,
  'Sinónimo = palavra com o mesmo significado', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o antónimo de "alegre"?',
  '{"options": ["Contente", "Triste", "Feliz", "Animado"], "correct_answer": "Triste"}'::jsonb,
  'Antónimo = palavra com significado oposto', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada palavra ao seu antónimo:',
  '{"pairs": [{"left": "Quente", "options": ["Frio", "Alto", "Rápido"]}, {"left": "Alto", "options": ["Frio", "Baixo", "Rápido"]}, {"left": "Rápido", "options": ["Frio", "Baixo", "Lento"]}], "correct_matches": {"Quente": "Frio", "Alto": "Baixo", "Rápido": "Lento"}}'::jsonb,
  'Antónimos são opostos!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 2;

-- G3 - Matemática - Números até 1000 (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quinhentos e vinte e três escreve-se:',
  '{"options": ["532", "523", "325", "235"], "correct_answer": "523"}'::jsonb,
  'Quinhentos = 500, vinte = 20, três = 3', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O número 748 lê-se: setecentos e ___ e oito',
  '{"correct_answer": "quarenta", "correct_answers": ["quarenta", "Quarenta", "40"]}'::jsonb,
  '748 = 700 + 40 + 8', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o maior número?',
  '{"options": ["890", "908", "980", "809"], "correct_answer": "980"}'::jsonb,
  'Compara os algarismos da esquerda para a direita', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 1;

-- G3 - Matemática - Multiplicação e Divisão (lesson_index 2)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '4 × 6 = ?',
  '{"options": ["20", "22", "24", "28"], "correct_answer": "24"}'::jsonb,
  '4 grupos de 6!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '20 ÷ 4 = ___',
  '{"correct_answer": "5", "correct_answers": ["5", "cinco"]}'::jsonb,
  'Quantos grupos de 4 cabem em 20?', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Se 3 × 7 = 21, então 21 ÷ 3 = ?',
  '{"options": ["3", "7", "10", "21"], "correct_answer": "7"}'::jsonb,
  'A divisão é a operação inversa da multiplicação!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 2;

-- G3 - Estudo do Meio - O Sistema Solar (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o planeta mais próximo do Sol?',
  '{"options": ["Vénus", "Terra", "Mercúrio", "Marte"], "correct_answer": "Mercúrio"}'::jsonb,
  'É o mais pequeno e o mais rápido!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quantos planetas tem o Sistema Solar?',
  '{"options": ["7", "8", "9", "10"], "correct_answer": "8"}'::jsonb,
  'Plutão já não é considerado planeta!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O nosso planeta chama-se ___',
  '{"correct_answer": "Terra", "correct_answers": ["Terra", "terra"]}'::jsonb,
  'É o 3º planeta a contar do Sol!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 1;

-- G4 - Português - Tipos de Frase (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"O gato dorme no sofá." - Que tipo de frase é?',
  '{"options": ["Interrogativa", "Declarativa", "Exclamativa", "Imperativa"], "correct_answer": "Declarativa"}'::jsonb,
  'Afirmar algo é declarar!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Fecha a janela!" - Que tipo de frase é?',
  '{"options": ["Declarativa", "Interrogativa", "Exclamativa", "Imperativa"], "correct_answer": "Imperativa"}'::jsonb,
  'Dá uma ordem!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Uma frase que faz uma pergunta é chamada ___',
  '{"correct_answer": "interrogativa", "correct_answers": ["interrogativa", "Interrogativa"]}'::jsonb,
  'Interrogar = perguntar', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 1;

-- G4 - Matemática - Divisão com Resto (lesson_index 2)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '17 ÷ 5 = ? (com resto)',
  '{"options": ["3 resto 2", "2 resto 7", "4 resto 3", "3 resto 1"], "correct_answer": "3 resto 2"}'::jsonb,
  '5 × 3 = 15, e 17 - 15 = ?', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '23 ÷ 4 = ___ resto 3',
  '{"correct_answer": "5", "correct_answers": ["5", "cinco"]}'::jsonb,
  '4 × 5 = 20, e 23 - 20 = 3', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '10 ÷ 3 tem resto?',
  '{"options": ["Não tem resto", "Resto 1", "Resto 2", "Resto 3"], "correct_answer": "Resto 1"}'::jsonb,
  '3 × 3 = 9, e 10 - 9 = ?', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 2;

-- G4 - Estudo do Meio - O Corpo Humano (lesson_index 1)
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual órgão bombeia o sangue?',
  '{"options": ["Pulmão", "Coração", "Fígado", "Cérebro"], "correct_answer": "Coração"}'::jsonb,
  'Tum-tum, tum-tum!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada órgão à sua função:',
  '{"pairs": [{"left": "Pulmão", "options": ["Respirar", "Pensar", "Bombear sangue"]}, {"left": "Cérebro", "options": ["Respirar", "Pensar", "Bombear sangue"]}, {"left": "Coração", "options": ["Respirar", "Pensar", "Bombear sangue"]}], "correct_matches": {"Pulmão": "Respirar", "Cérebro": "Pensar", "Coração": "Bombear sangue"}}'::jsonb,
  'Cada órgão tem uma função!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O órgão responsável por pensar é o ___',
  '{"correct_answer": "cérebro", "correct_answers": ["cérebro", "Cérebro", "cerebro", "Cerebro"]}'::jsonb,
  'Fica dentro da cabeça!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 1;
