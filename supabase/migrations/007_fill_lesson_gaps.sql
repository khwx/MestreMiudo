-- ============================================
-- Migration 007: Fill lesson gaps
-- G1 Estudo do Meio (0 -> 3 lessons)
-- Missing G3 Português #1 + G4 Matemática #1
-- Challenges for 8 lessons without them
-- Expand all grades to 5 lessons per subject
-- ============================================

-- ============================================
-- G1 ESTUDO DO MEIO (was completely empty!)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Estudo do Meio', 1, 'O Meu Corpo', 'Descobre as partes do corpo e como funcionam!', 'Identificar partes do corpo humano', 'O Doutor Osso vai ensinar-nos sobre o nosso corpo!', 1, 'easy'),
('Estudo do Meio', 1, 'Os Cinco Sentidos', 'Aprende a ver, ouvir, cheirar, saborear e tocar!', 'Identificar os cinco sentidos', 'A Maria descobriu que tem superpoderes: os sentidos!', 2, 'easy'),
('Estudo do Meio', 1, 'A Minha Família', 'Conhece os membros da família e as suas funções!', 'Reconhecer membros da família', 'Vamos conhecer a família do Tomás!', 3, 'easy'),
('Estudo do Meio', 1, 'As Estações do Ano', 'Descobre as quatro estações e o que muda!', 'Identificar as estações do ano', 'A Joana vê a natureza a mudar ao longo do ano!', 4, 'easy'),
('Estudo do Meio', 1, 'Os Animais', 'Aprende sobre animais domésticos e selvagens!', 'Distinguir animais domésticos e selvagens', 'O Pedro foi ao zoo e descobriu animais incríveis!', 5, 'easy');

-- ============================================
-- MISSING: G3 Português #1 + G4 Matemática #1
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Português', 3, 'Texto Narrativo', 'Aprende a estrutura de uma história: início, meio e fim!', 'Identificar partes da narrativa', 'Vamos descobrir como se constrói uma história!', 1, 'normal'),
('Matemática', 4, 'Multiplicação Mágica', 'Domina as tabuadas com truques divertidos!', 'Aplicar tabuadas na multiplicação', 'O Mágico dos Números vai ensinar truques!', 1, 'normal');

-- ============================================
-- EXPAND G1 to 5 lessons per subject
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Português', 1, 'Sílaba e Palavra', 'Aprende a separar palavras em sílabas!', 'Contar sílabas e separar palavras', 'O caracol ensina-nos a ir devagar, sílaba a sílaba!', 4, 'easy'),
('Português', 1, 'Frases Curtas', 'Constrói frases simples com palavras que conheces!', 'Construir frases simples', 'Vamos construir frases como um quebra-cabeças!', 5, 'easy'),
('Matemática', 1, 'Subtração com Imagens', 'Aprende a tirar e a contar o que sobra!', 'Compreender a subtração básica', 'O Tomás tinha balões e alguns voaram!', 4, 'easy'),
('Matemática', 1, 'Números até 20', 'Conta mais alto! Vamos até ao 20!', 'Reconhecer e contar até 20', 'A formiga vai contar as suas amigas!', 5, 'easy');

-- ============================================
-- EXPAND G2 to 5 lessons per subject
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Português', 2, 'Plural dos Nomes', 'Aprende a transformar nomes do singular para o plural!', 'Formar plural de palavras simples', 'Vamos multiplicar os nossos amigos!', 3, 'normal'),
('Português', 2, 'O Verbo: Ação!', 'Descobre os verbos - palavras de ação!', 'Identificar verbos em frases', 'O super-herói Verbão está em ação!', 4, 'normal'),
('Português', 2, 'Adjetivos Descritivos', 'Aprende palavras que descrevem coisas!', 'Usar adjetivos para descrever', 'A pintora vai colorir o mundo com palavras!', 5, 'normal'),
('Matemática', 2, 'Tabuada do 2 e 3', 'Descobre os segredos das tabuadas!', 'Memorizar tabuadas simples', 'O Mágico das Matemáticas vai ensinar truques!', 3, 'normal'),
('Matemática', 2, 'Números até 100', 'Aprende os números grandes até 100!', 'Ler e escrever números até 100', 'A avó tem 100 anos! Vamos contar até lá!', 4, 'normal'),
('Matemática', 2, 'Medir Comprimentos', 'Aprende a medir com réguas e palmos!', 'Introdução à medição', 'O carpinteiro precisa de medir a mesa!', 5, 'normal'),
('Estudo do Meio', 2, 'Partes da Planta', 'Descobre as partes das plantas!', 'Identificar raiz, caule, folhas e flor', 'O girassol vai mostrar-nos as suas partes!', 3, 'normal'),
('Estudo do Meio', 2, 'Os Alimentos', 'Aprende sobre alimentos saudáveis!', 'Distinguir alimentos saudáveis', 'A nutricionista ensina-nos a comer bem!', 4, 'normal'),
('Estudo do Meio', 2, 'A Água', 'Descobre de onde vem a água!', 'Compreender o ciclo básico da água', 'A gotinha de água vai fazer uma viagem!', 5, 'normal');

-- ============================================
-- EXPAND G3 to 5 lessons per subject
-- (Already has Port #1-3, Mat #1-3, EdM #1-2)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Português', 3, 'Acentuação e Ortografia', 'Aprende as regras de acentuação!', 'Aplicar regras básicas de acentuação', 'O detetive Ortografia vai resolver mistérios!', 3, 'normal'),
('Português', 3, 'O Dicionário', 'Aprende a procurar palavras no dicionário!', 'Usar o dicionário para encontrar significados', 'O explorador de Palavras vai ao dicionário!', 4, 'normal'),
('Português', 3, 'Frases Complexas', 'Aprende a juntar frases com conectivos!', 'Usar conectivos para unir frases', 'O construtor de frases vai montar pontes!', 5, 'normal'),
('Matemática', 3, 'Frações Simples', 'Aprende a dividir em partes iguais!', 'Identificar frações simples', 'A pizza vai ensinar-nos sobre frações!', 3, 'normal'),
('Matemática', 3, 'O Relógio e as Horas', 'Aprende a ler as horas no relógio!', 'Ler horas em relógio analógico', 'O relojoeiro precisa da nossa ajuda!', 4, 'normal'),
('Matemática', 3, 'Problemas com Palavras', 'Resolve problemas usando matemática!', 'Resolver problemas do dia a dia', 'O detetive Matemático vai resolver casos!', 5, 'normal'),
('Estudo do Meio', 3, 'Os Oceanos e Rios', 'Descobre os oceanos e rios de Portugal!', 'Identificar oceanos e rios principais', 'O marinheiro vai navegar por Portugal!', 2, 'normal'),
('Estudo do Meio', 3, 'Os Seres Vivos', 'Aprende as características dos seres vivos!', 'Identificar características dos seres vivos', 'O biólogo vai estudar os seres vivos!', 3, 'normal'),
('Estudo do Meio', 3, 'A Latitude e o Clima', 'Descobre porque há climas diferentes!', 'Compreender factores do clima', 'O meteorologista vai explicar o tempo!', 4, 'normal'),
('Estudo do Meio', 3, 'Recursos Naturais', 'Aprende sobre os recursos da Terra!', 'Identificar recursos naturais', 'A Terra tem tesouros escondidos!', 5, 'normal');

-- ============================================
-- EXPAND G4 to 5 lessons per subject
-- (Already has Port #1-2, Mat #1-2, EdM #1-2)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Português', 4, 'Classes de Palavras', 'Descobre nomes, verbos, adjetivos e mais!', 'Identificar classes de palavras', 'O professor Gramática vai classificar tudo!', 2, 'normal'),
('Português', 4, 'A Sílaba Tónica', 'Aprende qual é a sílaba mais forte!', 'Identificar a sílaba tónica', 'O detetive Sílaba Tónica vai investigar!', 3, 'normal'),
('Português', 4, 'Concordância Verbal', 'Aprende a fazer as palavras combinarem!', 'Aplicar concordância sujeito-verbo', 'O casamento das palavras vai ser perfeito!', 4, 'normal'),
('Português', 4, 'Textos Informativos', 'Aprende a ler e escrever textos informativos!', 'Identificar características de textos informativos', 'O jornalista vai escrever uma notícia!', 5, 'normal'),
('Matemática', 4, 'Frações e Decimais', 'Descobre a relação entre frações e decimais!', 'Converter frações em decimais simples', 'O alquimista vai transformar frações!', 3, 'normal'),
('Matemática', 4, 'Perímetro e Área', 'Aprende a medir o contorno e o espaço!', 'Calcular perímetros e áreas simples', 'O arquiteto vai desenhar uma casa!', 4, 'normal'),
('Matemática', 4, 'Gráficos e Tabelas', 'Aprende a ler e criar gráficos!', 'Interpretar gráficos e tabelas simples', 'O cientista vai analisar dados!', 5, 'normal'),
('Estudo do Meio', 4, 'Os Direitos das Crianças', 'Conhece os teus direitos!', 'Identificar direitos das crianças', 'A advogada vai defender os nossos direitos!', 2, 'normal'),
('Estudo do Meio', 4, 'Os Ecossistemas', 'Descobre como os seres vivos se relacionam!', 'Compreender relações nos ecossistemas', 'O explorador vai visitar diferentes ecossistemas!', 3, 'normal'),
('Estudo do Meio', 4, 'O Ciclo da Água', 'Aprende como a água viaja pelo planeta!', 'Descrever o ciclo da água', 'A gotinha de água vai fazer uma grande viagem!', 4, 'normal'),
('Estudo do Meio', 4, 'Energia e Sustentabilidade', 'Aprende sobre energia e proteger o planeta!', 'Identificar fontes de energia e sustentabilidade', 'O engenheiro vai construir um futuro verde!', 5, 'normal');

-- ============================================
-- CHALLENGES for G1 Estudo do Meio (new lessons)
-- ============================================

-- G1 EdM #1: O Meu Corpo
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Com que parte do corpo vemos?', '{"options": ["Olhos", "Ouvidos", "Mãos", "Nariz"], "correct_answer": "Olhos"}'::jsonb, 'Servem para ver!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada parte do corpo à sua função:', '{"pairs": [{"left": "Olhos", "options": ["Ver", "Ouvir", "Cheirar"]}, {"left": "Ouvidos", "options": ["Ver", "Ouvir", "Cheirar"]}, {"left": "Nariz", "options": ["Ver", "Ouvir", "Cheirar"]}], "correct_matches": {"Olhos": "Ver", "Ouvidos": "Ouvir", "Nariz": "Cheirar"}}'::jsonb, 'Cada parte tem uma função!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 1;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Com os ___ podemos pegar nas coisas.', '{"correct_answer": "mãos", "correct_answers": ["mãos", "Mãos", "maos", "Maos"]}'::jsonb, 'Temos cinco dedos em cada!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 1;

-- G1 EdM #2: Os Cinco Sentidos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quantos sentidos temos?', '{"options": ["3", "4", "5", "6"], "correct_answer": "5"}'::jsonb, 'Vista, ouvido, olfato, paladar e...', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O sentido do olfato serve para:', '{"options": ["Ver", "Ouvir", "Cheirar", "Saborear"], "correct_answer": "Cheirar"}'::jsonb, 'Usamos o nariz!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 2;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O sentido do ___ permite-nos saborear a comida.', '{"correct_answer": "paladar", "correct_answers": ["paladar", "Paladar", "gosto", "Gosto"]}'::jsonb, 'Usamos a língua!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 2;

-- G1 EdM #3: A Minha Família
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'A mãe da minha mãe é a minha:', '{"options": ["Tia", "Avó", "Prima", "Irmã"], "correct_answer": "Avó"}'::jsonb, 'É a mãe dos meus pais!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 3;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O irmão do meu pai é o meu:', '{"options": ["Primo", "Tio", "Avô", "Sobrinho"], "correct_answer": "Tio"}'::jsonb, 'É irmão de um dos meus pais!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 3;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O meu ___ é o filho dos meus pais.', '{"correct_answer": "irmão", "correct_answers": ["irmão", "Irmão", "irmao", "Irmao"]}'::jsonb, 'Partilhamos os mesmos pais!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 3;

-- G1 EdM #4: As Estações do Ano
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Em que estação as flores crescem?', '{"options": ["Verão", "Inverno", "Primavera", "Outono"], "correct_answer": "Primavera"}'::jsonb, 'É quando a natureza acorda!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 4;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada estação ao que acontece:', '{"pairs": [{"left": "Primavera", "options": ["Flores", "Praia", "Folhas caem", "Frio"]}, {"left": "Verão", "options": ["Flores", "Praia", "Folhas caem", "Frio"]}, {"left": "Outono", "options": ["Flores", "Praia", "Folhas caem", "Frio"]}], "correct_matches": {"Primavera": "Flores", "Verão": "Praia", "Outono": "Folhas caem"}}'::jsonb, 'Pensa no que vês em cada estação!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 4;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Na estação do ___ faz muito calor.', '{"correct_answer": "verão", "correct_answers": ["verão", "Verão", "verao", "Verao"]}'::jsonb, 'É quando vamos à praia!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 4;

-- G1 EdM #5: Os Animais
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é um animal doméstico?', '{"options": ["Leão", "Gato", "Tubarão", "Urso"], "correct_answer": "Gato"}'::jsonb, 'Vive connosco em casa!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 5;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada animal ao tipo:', '{"pairs": [{"left": "Cão", "options": ["Doméstico", "Selvagem"]}, {"left": "Lobo", "options": ["Doméstico", "Selvagem"]}, {"left": "Galinha", "options": ["Doméstico", "Selvagem"]}], "correct_matches": {"Cão": "Doméstico", "Lobo": "Selvagem", "Galinha": "Doméstico"}}'::jsonb, 'Doméstico vive connosco, selvagem vive na natureza!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 5;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ___ é um animal selvagem que vive na savana.', '{"correct_answer": "leão", "correct_answers": ["leão", "Leão", "leao", "Leao"]}'::jsonb, 'É o rei da selva!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 5;

-- ============================================
-- CHALLENGES for 8 lessons that had none
-- ============================================

-- G2 Port #3: Plural dos Nomes
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O plural de "gato" é:', '{"options": ["gatos", "gata", "gatas", "gato"], "correct_answer": "gatos"}'::jsonb, 'Adiciona -s ao masculino!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND title = 'Plural dos Nomes';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O plural de "mulher" é:', '{"options": ["mulhers", "mulheres", "mulher", "mulheras"], "correct_answer": "mulheres"}'::jsonb, 'Palavras terminadas em -r adicionam -es!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND title = 'Plural dos Nomes';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O plural de "flor" é ___', '{"correct_answer": "flores", "correct_answers": ["flores", "Flores"]}'::jsonb, 'Terminadas em -r: troca por -res!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND title = 'Plural dos Nomes';

-- G2 Mat #3: Tabuada do 2 e 3
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '2 × 7 = ?', '{"options": ["12", "14", "16", "9"], "correct_answer": "14"}'::jsonb, 'Dobro de 7!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND title = 'Tabuada do 2 e 3';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '3 × 5 = ___', '{"correct_answer": "15", "correct_answers": ["15", "quinze"]}'::jsonb, '3 grupos de 5!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND title = 'Tabuada do 2 e 3';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '2 × 9 = ?', '{"options": ["16", "18", "20", "11"], "correct_answer": "18"}'::jsonb, 'Dobro de 9!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND title = 'Tabuada do 2 e 3';

-- G2 EdM #3: Partes da Planta
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual parte da planta fica debaixo da terra?', '{"options": ["Flor", "Raiz", "Folha", "Caule"], "correct_answer": "Raiz"}'::jsonb, 'É como os pés da planta!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND title = 'Partes da Planta';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada parte da planta à função:', '{"pairs": [{"left": "Raiz", "options": ["Absorver água", "Fazer fotossíntese", "Atrair insetos"]}, {"left": "Folha", "options": ["Absorver água", "Fazer fotossíntese", "Atrair insetos"]}, {"left": "Flor", "options": ["Absorver água", "Fazer fotossíntese", "Atrair insetos"]}], "correct_matches": {"Raiz": "Absorver água", "Folha": "Fazer fotossíntese", "Flor": "Atrair insetos"}}'::jsonb, 'Cada parte tem uma missão!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND title = 'Partes da Planta';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ___ sustenta a planta e transporta a água.', '{"correct_answer": "caule", "correct_answers": ["caule", "Caule", "tronco", "Tronco"]}'::jsonb, 'É como o tronco de uma árvore!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND title = 'Partes da Planta';

-- G3 Port #3: Acentuação e Ortografia
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra é aguda (oxítona)?', '{"options": ["Cadeira", "Café", "Lápis", "Mesa"], "correct_answer": "Café"}'::jsonb, 'A sílaba mais forte é a última!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND title LIKE '%centua%';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra é grave (paroxítona)?', '{"options": ["Avó", "Sofá", "Cadeira", "Jacaré"], "correct_answer": "Cadeira"}'::jsonb, 'A sílaba mais forte é a penúltima!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND title LIKE '%centua%';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'As palavras agudas terminadas em -a, -e, -o não levam ___', '{"correct_answer": "acento", "correct_answers": ["acento", "Acento", "acento gráfico"]}'::jsonb, 'Só as outras é que levam!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND title LIKE '%centua%';

-- G3 Mat #3: Frações Simples
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '1/2 de uma pizza é o mesmo que:', '{"options": ["Um terço", "Metade", "Um quarto", "Toda a pizza"], "correct_answer": "Metade"}'::jsonb, '1/2 = metade!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND title = 'Frações Simples';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '1/4 de uma pizza cortada em 4 fatias = ___ fatia(s)', '{"correct_answer": "1", "correct_answers": ["1", "uma", "Uma"]}'::jsonb, '1 de cada 4!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND title = 'Frações Simples';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual fração é maior?', '{"options": ["1/4", "1/2", "1/8", "1/3"], "correct_answer": "1/2"}'::jsonb, 'Pensa numa pizza!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND title = 'Frações Simples';

-- G3 EdM #2: Os Oceanos e Rios
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual oceano fica a oeste de Portugal?', '{"options": ["Pacífico", "Índico", "Atlântico", "Ártico"], "correct_answer": "Atlântico"}'::jsonb, 'Portugal tem costa atlântica!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title LIKE '%Ocean%';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O rio que passa em Lisboa é o rio ___', '{"correct_answer": "Tejo", "correct_answers": ["Tejo", "tejo", "TEJO"]}'::jsonb, 'É o rio mais importante de Portugal!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title LIKE '%Ocean%';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'A água dos oceanos é:', '{"options": ["Doce", "Salgada", "Sem sabor", "Gasosa"], "correct_answer": "Salgada"}'::jsonb, 'Porque é que flutua melhor no mar?', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title LIKE '%Ocean%';

-- G4 Port #2: Classes de Palavras
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Correr" é que classe de palavra?', '{"options": ["Nome", "Verbo", "Adjetivo", "Preposição"], "correct_answer": "Verbo"}'::jsonb, 'Indica uma ação!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title LIKE '%Classe%';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada palavra à sua classe:', '{"pairs": [{"left": "Bonito", "options": ["Adjetivo", "Verbo", "Nome"]}, {"left": "Comer", "options": ["Adjetivo", "Verbo", "Nome"]}, {"left": "Casa", "options": ["Adjetivo", "Verbo", "Nome"]}], "correct_matches": {"Bonito": "Adjetivo", "Comer": "Verbo", "Casa": "Nome"}}'::jsonb, 'Nome = coisa, Verbo = ação, Adjetivo = qualidade', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title LIKE '%Classe%';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '"A menina ___ rápido." - precisamos de um verbo.', '{"correct_answer": "corre", "correct_answers": ["corre", "Corre", "anda", "Anda", "caminha", "Caminha"]}'::jsonb, 'Que ação faz a menina?', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title LIKE '%Classe%';

-- G4 EdM #2: Os Direitos das Crianças
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é um direito das crianças?', '{"options": ["Trabalhar", "Brincar", "Pagar impostos", "Conduzir carros"], "correct_answer": "Brincar"}'::jsonb, 'Todas as crianças devem ter tempo para...', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title LIKE '%Direito%';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'A Convenção dos Direitos da Criança foi assinada em:', '{"options": ["1989", "2000", "1975", "2010"], "correct_answer": "1989"}'::jsonb, 'Foi há mais de 30 anos!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title LIKE '%Direito%';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Toda a criança tem direito à ___ (onde aprendemos).', '{"correct_answer": "educação", "correct_answers": ["educação", "Educação", "educacao", "Educacao", "escola", "Escola"]}'::jsonb, 'É onde vamos todos os dias!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title LIKE '%Direito%';

-- ============================================
-- CHALLENGES for EXPANDED lessons (new #4-5 per subject/grade)
-- ============================================

-- G1 Port #4: Sílaba e Palavra
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quantas sílabas tem "casa"?', '{"options": ["1", "2", "3", "4"], "correct_answer": "2"}'::jsonb, 'Ca-sa!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND title = 'Sílaba e Palavra';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quantas sílabas tem "borboleta"?', '{"options": ["2", "3", "4", "5"], "correct_answer": "4"}'::jsonb, 'Conta devagar: bor-bo-le-ta!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND title = 'Sílaba e Palavra';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A palavra "gato" tem ___ sílabas.', '{"correct_answer": "2", "correct_answers": ["2", "dois", "Dois"]}'::jsonb, 'Ga-to!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND title = 'Sílaba e Palavra';

-- G1 Port #5: Frases Curtas
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é uma frase completa?', '{"options": ["O gato", "O gato dorme.", "dorme", "gato"], "correct_answer": "O gato dorme."}'::jsonb, 'Uma frase tem sujeito e ação!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND title = 'Frases Curtas';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ___ come ração. (animal que mia)', '{"correct_answer": "gato", "correct_answers": ["gato", "Gato"]}'::jsonb, 'Mia!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND title = 'Frases Curtas';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Toda a frase começa com letra:', '{"options": ["minúscula", "maiúscula", "número", "ponto"], "correct_answer": "maiúscula"}'::jsonb, 'A primeira letra é sempre grande!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND title = 'Frases Curtas';

-- G1 Mat #4: Subtração com Imagens
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '5 - 2 = ?', '{"options": ["2", "3", "4", "7"], "correct_answer": "3"}'::jsonb, 'Tira 2 de 5!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND title = 'Subtração com Imagens';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '4 - 1 = ___', '{"correct_answer": "3", "correct_answers": ["3", "três", "Três", "tres", "Tres"]}'::jsonb, 'Tira 1 de 4!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND title = 'Subtração com Imagens';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Se tens 3 balões e 1 voa, com quantos ficas?', '{"options": ["1", "2", "3", "4"], "correct_answer": "2"}'::jsonb, '3 - 1 = ?', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND title = 'Subtração com Imagens';

-- G1 Mat #5: Números até 20
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Que número vem depois do 15?', '{"options": ["14", "16", "17", "19"], "correct_answer": "16"}'::jsonb, 'Conta +1!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND title = 'Números até 20';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O número 20 escreve-se: ___', '{"correct_answer": "vinte", "correct_answers": ["vinte", "Vinte", "VINTE"]}'::jsonb, '2 dezenas = vinte!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND title = 'Números até 20';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o maior número?', '{"options": ["12", "18", "15", "9"], "correct_answer": "18"}'::jsonb, 'Compara os números!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND title = 'Números até 20';

-- G2 Port #4: O Verbo: Ação!
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra é um verbo?', '{"options": ["gato", "comer", "bonito", "o"], "correct_answer": "comer"}'::jsonb, 'Indica uma ação!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND title = 'O Verbo: Ação!';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada verbo à sua ação:', '{"pairs": [{"left": "Correr", "options": ["Movimento", "Sentimento", "Pensamento"]}, {"left": "Amar", "options": ["Movimento", "Sentimento", "Pensamento"]}, {"left": "Pensar", "options": ["Movimento", "Sentimento", "Pensamento"]}], "correct_matches": {"Correr": "Movimento", "Amar": "Sentimento", "Pensar": "Pensamento"}}'::jsonb, 'Cada verbo é um tipo de ação!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND title = 'O Verbo: Ação!';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A menina ___ um bolo. (verbo de ação)', '{"correct_answer": "come", "correct_answers": ["come", "Come", "faz", "Faz", "prepara", "Prepara"]}'::jsonb, 'O que ela faz ao bolo?', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND title = 'O Verbo: Ação!';

-- G2 Port #5: Adjetivos Descritivos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é um adjetivo?', '{"options": ["casa", "grande", "correr", "e"], "correct_answer": "grande"}'::jsonb, 'Descreve algo!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND title = 'Adjetivos Descritivos';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O sol é ___ (adjetivo para quente).', '{"correct_answer": "quente", "correct_answers": ["quente", "Quente"]}'::jsonb, 'O sol aquece-nos!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND title = 'Adjetivos Descritivos';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"O cão ___ ladra alto." Qual é o adjetivo?', '{"options": ["cão", "ladra", "alto", "o"], "correct_answer": "alto"}'::jsonb, 'Descreve como ele ladra!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND title = 'Adjetivos Descritivos';

-- G2 Mat #4: Números até 100
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Que número vem depois do 39?', '{"options": ["38", "40", "41", "50"], "correct_answer": "40"}'::jsonb, '3 dezenas + 1 = 4 dezenas!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND title = 'Números até 100';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '7 dezenas e 5 unidades = ___', '{"correct_answer": "75", "correct_answers": ["75", "setenta e cinco", "Setenta e cinco"]}'::jsonb, '70 + 5 = ?', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND title = 'Números até 100';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o menor número?', '{"options": ["89", "91", "76", "100"], "correct_answer": "76"}'::jsonb, 'Compara todos!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND title = 'Números até 100';

-- G2 Mat #5: Medir Comprimentos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O que usamos para medir o comprimento?', '{"options": ["Balança", "Régua", "Relógio", "Termómetro"], "correct_answer": "Régua"}'::jsonb, 'Serve para medir coisas compridas!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND title = 'Medir Comprimentos';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A unidade de comprimento é o ___', '{"correct_answer": "centímetro", "correct_answers": ["centímetro", "Centímetro", "centimetro", "Centimetro", "cm"]}'::jsonb, 'Abrevia-se cm!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND title = 'Medir Comprimentos';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um lápis mede cerca de:', '{"options": ["15 cm", "15 m", "15 km", "15 mm"], "correct_answer": "15 cm"}'::jsonb, 'Pensa no tamanho de um lápis!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND title = 'Medir Comprimentos';

-- G2 EdM #4: Os Alimentos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é um alimento saudável?', '{"options": ["Refrigerante", "Maçã", "Batatas fritas", "Doces"], "correct_answer": "Maçã"}'::jsonb, 'É uma fruta!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND title = 'Os Alimentos';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada alimento ao tipo:', '{"pairs": [{"left": "Cenoura", "options": ["Legume", "Fruta", "Laticínio"]}, {"left": "Banana", "options": ["Legume", "Fruta", "Laticínio"]}, {"left": "Leite", "options": ["Legume", "Fruta", "Laticínio"]}], "correct_matches": {"Cenoura": "Legume", "Banana": "Fruta", "Leite": "Laticínio"}}'::jsonb, 'Pensa de onde vem cada um!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND title = 'Os Alimentos';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Devemos comer 5 porções de ___ e ___ por dia.', '{"correct_answer": "frutas e legumes", "correct_answers": ["frutas e legumes", "Frutas e legumes", "fruta e legumes", "Fruta e legumes", "legumes e frutas"]}'::jsonb, 'São muito saudáveis!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND title = 'Os Alimentos';

-- G2 EdM #5: A Água
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'De onde vem a água da torneira?', '{"options": ["Do supermercado", "Dos rios e barragens", "Do sol", "Do fogo"], "correct_answer": "Dos rios e barragens"}'::jsonb, 'A água é tratada antes de chegar a casa!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND title = 'A Água';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A água que bebemos é água ___ (não salgada).', '{"correct_answer": "doce", "correct_answers": ["doce", "Doce", "DOCE", "potável", "potavel"]}'::jsonb, 'O oposto de salgada!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND title = 'A Água';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quando a água ferve, transforma-se em:', '{"options": ["Gelo", "Vapor", "Óleo", "Areia"], "correct_answer": "Vapor"}'::jsonb, 'A água quente evapora!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND title = 'A Água';

-- G3 Port #4: O Dicionário
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'As palavras no dicionário estão por ordem:', '{"options": ["Tamanho", "Alfabética", "Aleatória", "Importância"], "correct_answer": "Alfabética"}'::jsonb, 'A, B, C, D...', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND title = 'O Dicionário';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'No dicionário, encontramos o ___ das palavras.', '{"correct_answer": "significado", "correct_answers": ["significado", "Significado", "definição", "Definição"]}'::jsonb, 'O que a palavra quer dizer!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND title = 'O Dicionário';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra aparece primeiro no dicionário?', '{"options": ["Zebra", "Animal", "Gato", "Casa"], "correct_answer": "Animal"}'::jsonb, 'Qual começa com a letra mais próxima do A?', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND title = 'O Dicionário';

-- G3 Port #5: Frases Complexas
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual conectivo junta duas frases?', '{"options": ["e", "gato", "grande", "o"], "correct_answer": "e"}'::jsonb, 'É uma conjunção!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND title = 'Frases Complexas';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Estudei muito ___ passei." Que palavra falta?', '{"options": ["mas", "porque", "e", "não"], "correct_answer": "e"}'::jsonb, 'As duas coisas aconteceram!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND title = 'Frases Complexas';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Eu queria ir ___ estava a chover. (conectivo de oposição)', '{"correct_answer": "mas", "correct_answers": ["mas", "Mas", "porém", "Porém"]}'::jsonb, 'Indica oposição!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND title = 'Frases Complexas';

-- G3 Mat #4: O Relógio e as Horas
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quando o ponteiro grande está no 12 e o pequeno no 3, são:', '{"options": ["3:00", "12:15", "12:00", "3:30"], "correct_answer": "3:00"}'::jsonb, 'Ponteiros: grande = minutos, pequeno = horas!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND title = 'O Relógio e as Horas';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Quando o ponteiro grande está no 6, são ___ minutos.', '{"correct_answer": "30", "correct_answers": ["30", "trinta", "Trinta"]}'::jsonb, 'Meia volta = metade da hora!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND title = 'O Relógio e as Horas';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um dia tem quantas horas?', '{"options": ["12", "24", "60", "100"], "correct_answer": "24"}'::jsonb, 'Um dia inteiro!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND title = 'O Relógio e as Horas';

-- G3 Mat #5: Problemas com Palavras
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'A Maria tem 8 lápis. O João dá-lhe mais 5. Quantos tem agora?', '{"options": ["11", "12", "13", "15"], "correct_answer": "13"}'::jsonb, '8 + 5 = ?', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND title = 'Problemas com Palavras';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O Pedro tinha 15 euros e gastou 7. Ficou com ___ euros.', '{"correct_answer": "8", "correct_answers": ["8", "oito", "Oito"]}'::jsonb, '15 - 7 = ?', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND title = 'Problemas com Palavras';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Há 3 caixas com 4 brinquedos cada. Quantos brinquedos ao todo?', '{"options": ["7", "10", "12", "14"], "correct_answer": "12"}'::jsonb, '3 × 4 = ?', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND title = 'Problemas com Palavras';

-- G3 EdM #3: Os Seres Vivos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é uma característica dos seres vivos?', '{"options": ["São feitos de pedra", "Nascem, crescem e morrem", "Não se mexem", "São todos iguais"], "correct_answer": "Nascem, crescem e morrem"}'::jsonb, 'Todos os seres vivos têm ciclo de vida!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title = 'Os Seres Vivos';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada ser à sua classe:', '{"pairs": [{"left": "Cão", "options": ["Animal", "Planta", "Não vivo"]}, {"left": "Carvalho", "options": ["Animal", "Planta", "Não vivo"]}, {"left": "Pedra", "options": ["Animal", "Planta", "Não vivo"]}], "correct_matches": {"Cão": "Animal", "Carvalho": "Planta", "Pedra": "Não vivo"}}'::jsonb, 'Animal, planta ou mineral?', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title = 'Os Seres Vivos';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Os seres vivos precisam de ___ para respirar.', '{"correct_answer": "ar", "correct_answers": ["ar", "Ar", "AR", "oxigénio", "oxigênio"]}'::jsonb, 'Sem ele não podemos viver!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title = 'Os Seres Vivos';

-- G3 EdM #4: A Latitude e o Clima
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Os países perto do equador têm clima:', '{"options": ["Frio", "Temperado", "Quente", "Polar"], "correct_answer": "Quente"}'::jsonb, 'O equador recebe mais sol!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title = 'A Latitude e o Clima';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A ___ é a distância ao equador.', '{"correct_answer": "latitude", "correct_answers": ["latitude", "Latitude", "LATITUDE"]}'::jsonb, 'Mede a distância norte-sul!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title = 'A Latitude e o Clima';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Portugal tem clima:', '{"options": ["Polar", "Tropical", "Temperado", "Desértico"], "correct_answer": "Temperado"}'::jsonb, 'Nem muito quente, nem muito frio!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title = 'A Latitude e o Clima';

-- G3 EdM #5: Recursos Naturais
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é um recurso natural?', '{"options": ["Plástico", "Vidro", "Água", "Cimento"], "correct_answer": "Água"}'::jsonb, 'Vem da natureza!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title = 'Recursos Naturais';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ___ é um recurso natural que nos dá energia.', '{"correct_answer": "sol", "correct_answers": ["sol", "Sol", "SOL", "petróleo", "Petróleo", "vento", "Vento"]}'::jsonb, 'Há recursos renováveis e não renováveis!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title = 'Recursos Naturais';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Os recursos naturais são:', '{"options": ["Infinitos", "Finitos (acabam)", "Feitos pelo homem", "Todos iguais"], "correct_answer": "Finitos (acabam)"}'::jsonb, 'Temos de cuidar deles!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND title = 'Recursos Naturais';

-- G4 Port #3: A Sílaba Tónica
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Na palavra "caDEIRA", a sílaba tónica é:', '{"options": ["ca", "DEI", "ra"], "correct_answer": "DEI"}'::jsonb, 'É a sílaba mais forte!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'A Sílaba Tónica';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A sílaba mais forte de uma palavra chama-se sílaba ___', '{"correct_answer": "tónica", "correct_answers": ["tónica", "tônica", "Tónica", "Tônica", "tonica"]}'::jsonb, 'É a que se ouve mais!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'A Sílaba Tónica';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"CAfé" é uma palavra:', '{"options": ["Grave", "Aguda", "Esdrúxula"], "correct_answer": "Aguda"}'::jsonb, 'A sílaba forte é a última!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'A Sílaba Tónica';

-- G4 Port #4: Concordância Verbal
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Os meninos ___ felizes." Qual forma correta?', '{"options": ["é", "são", "ser", "era"], "correct_answer": "são"}'::jsonb, 'Os meninos = plural!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'Concordância Verbal';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A menina ___ a ler. (verbo estar, singular)', '{"correct_answer": "está", "correct_answers": ["está", "Está"]}'::jsonb, 'Sujeito singular = verbo singular!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'Concordância Verbal';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"As flores ___ bonitas." Complete:', '{"options": ["é", "são", "ser", "foi"], "correct_answer": "são"}'::jsonb, 'Flores = feminino plural!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'Concordância Verbal';

-- G4 Port #5: Textos Informativos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um texto informativo serve para:', '{"options": ["Contar uma história", "Informar sobre um tema", "Fazer rima", "Expressar sentimentos"], "correct_answer": "Informar sobre um tema"}'::jsonb, 'Dá-nos informações!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'Textos Informativos';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Um texto informativo apresenta ___ e dados.', '{"correct_answer": "factos", "correct_answers": ["factos", "fatos", "Factos", "Fatos", "informações", "Informações"]}'::jsonb, 'São verdades verificáveis!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'Textos Informativos';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é um exemplo de texto informativo?', '{"options": ["Poema", "Notícia de jornal", "Conto de fadas", "Canção"], "correct_answer": "Notícia de jornal"}'::jsonb, 'Onde lemos informações reais?', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'Textos Informativos';

-- G4 Mat #3: Frações e Decimais
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '1/2 em decimal é:', '{"options": ["0,1", "0,5", "1,2", "0,25"], "correct_answer": "0,5"}'::jsonb, 'Metade = 0,5!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND title = 'Frações e Decimais';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '1/4 em decimal é 0,___', '{"correct_answer": "25", "correct_answers": ["25"]}'::jsonb, 'Um quarto de 1!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND title = 'Frações e Decimais';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '0,75 é o mesmo que:', '{"options": ["1/4", "2/4", "3/4", "4/4"], "correct_answer": "3/4"}'::jsonb, '75 cêntimos = 3 moedas de 25!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND title = 'Frações e Decimais';

-- G4 Mat #4: Perímetro e Área
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O perímetro é:', '{"options": ["O espaço dentro", "O contorno", "O volume", "A altura"], "correct_answer": "O contorno"}'::jsonb, 'É a medida à volta!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND title = 'Perímetro e Área';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O perímetro de um quadrado de 3 cm de lado é ___ cm.', '{"correct_answer": "12", "correct_answers": ["12", "doze", "Doze"]}'::jsonb, '4 lados × 3 cm!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND title = 'Perímetro e Área';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'A área de um retângulo calcula-se:', '{"options": ["Somando os lados", "Base × altura", "2 × base + 2 × altura", "Dividindo os lados"], "correct_answer": "Base × altura"}'::jsonb, 'É o espaço dentro!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND title = 'Perímetro e Área';

-- G4 Mat #5: Gráficos e Tabelas
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um gráfico de barras usa:', '{"options": ["Círculos", "Barras", "Linhas curvas", "Fotografias"], "correct_answer": "Barras"}'::jsonb, 'O nome já diz!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND title = 'Gráficos e Tabelas';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Os dados organizados em filas e colunas formam uma ___', '{"correct_answer": "tabela", "correct_answers": ["tabela", "Tabela", "TABELA"]}'::jsonb, 'Organiza informações!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND title = 'Gráficos e Tabelas';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Para que servem os gráficos?', '{"options": ["Para decorar", "Para mostrar dados de forma visual", "Para escrever textos", "Para fazer contas"], "correct_answer": "Para mostrar dados de forma visual"}'::jsonb, 'Tornam os dados mais fáceis de ler!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND title = 'Gráficos e Tabelas';

-- G4 EdM #3: Os Ecossistemas
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O que é um ecossistema?', '{"options": ["Uma cidade", "Um conjunto de seres vivos e o ambiente", "Um tipo de animal", "Uma planta"], "correct_answer": "Um conjunto de seres vivos e o ambiente"}'::jsonb, 'Tudo está ligado!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title = 'Os Ecossistemas';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada elemento ao ecossistema:', '{"pairs": [{"left": "Cacto", "options": ["Deserto", "Floresta", "Oceano"]}, {"left": "Carvalho", "options": ["Deserto", "Floresta", "Oceano"]}, {"left": "Coral", "options": ["Deserto", "Floresta", "Oceano"]}], "correct_matches": {"Cacto": "Deserto", "Carvalho": "Floresta", "Coral": "Oceano"}}'::jsonb, 'Cada ser vive no seu habitat!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title = 'Os Ecossistemas';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ___ é o local onde um ser vivo habita.', '{"correct_answer": "habitat", "correct_answers": ["habitat", "Habitat", "HABITAT"]}'::jsonb, 'É a casa natural!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title = 'Os Ecossistemas';

-- G4 EdM #4: O Ciclo da Água
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quando a água esquenta, ela:', '{"options": ["Congela", "Evapora", "Fica escura", "Desaparece"], "correct_answer": "Evapora"}'::jsonb, 'Transforma-se em vapor!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title = 'O Ciclo da Água';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A água que cai do céu chama-se ___', '{"correct_answer": "chuva", "correct_answers": ["chuva", "Chuva", "CHUVA", "precipitação", "precipitacao"]}'::jsonb, 'É a precipitação!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title = 'O Ciclo da Água';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é a ordem correta do ciclo da água?', '{"options": ["Evaporação → Condensação → Precipitação", "Precipitação → Evaporação → Condensação", "Condensação → Precipitação → Evaporação", "Evaporação → Precipitação → Condensação"], "correct_answer": "Evaporação → Condensação → Precipitação"}'::jsonb, 'Primeiro sobe, depois forma nuvens, depois chove!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title = 'O Ciclo da Água';

-- G4 EdM #5: Energia e Sustentabilidade
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é uma fonte de energia renovável?', '{"options": ["Carvão", "Petróleo", "Sol", "Gás natural"], "correct_answer": "Sol"}'::jsonb, 'Nunca se esgota!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title = 'Energia e Sustentabilidade';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '___ significa usar os recursos sem os destruir.', '{"correct_answer": "Sustentabilidade", "correct_answers": ["Sustentabilidade", "sustentabilidade", "Sustentável", "sustentável"]}'::jsonb, 'Pensar no futuro!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title = 'Energia e Sustentabilidade';

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Para ser sustentável devemos:', '{"options": ["Gastar mais água", "Reciclar e reduzir", "Usar mais plástico", "Deixar as luzes acesas"], "correct_answer": "Reciclar e reduzir"}'::jsonb, 'Os 3 R: Reduzir, Reutilizar, Reciclar!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND title = 'Energia e Sustentabilidade';
