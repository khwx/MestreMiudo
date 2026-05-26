-- ============================================
-- Migration 008: Expand all grades to 10 lessons per subject
-- + Fix G4 Português missing indices 5-6
-- + Fix "Dias da Semana" subject (Mat→EdM)
-- + Add challenges for all new lessons
-- ============================================

-- ============================================
-- FIX: Update G4 Port lesson_index 7→6 (Coordenação e Subordinação)
-- ============================================
UPDATE lessons SET lesson_index = 6
WHERE subject = 'Português' AND grade_level = 4 AND title = 'Coordenação e Subordinação' AND lesson_index = 7;

-- ============================================
-- FIX: Replace G4 Port #5 "Textos Informativos" with "Texto de Opinião"
-- ============================================
UPDATE lessons SET
  title = 'Texto de Opinião',
  description = 'Aprende a escrever o que pensas com argumentos!',
  learning_objective = 'Escrever textos de opinião com argumentos',
  story_context = 'A jornalista vai defender a sua opinião no jornal!'
WHERE subject = 'Português' AND grade_level = 4 AND title = 'Textos Informativos';

-- ============================================
-- FIX: Move "Dias da Semana" from Matemática to Estudo do Meio (G1)
-- ============================================
UPDATE lessons SET subject = 'Estudo do Meio'
WHERE subject = 'Matemática' AND grade_level = 1 AND title = 'Dias da Semana';

-- ============================================
-- G1 PORTUGUÊS (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Português', 1, 'Rimas e Aliterações', 'Descobre palavras que rimam e sons que se repetem!', 'Identificar rimas e aliterações simples', 'O poeta Caracol vai ensinar rimas divertidas!', 6, 'easy'),
('Português', 1, 'Ditongos Mágicos', 'Aprende os sons especiais: ai, ei, oi, ui!', 'Reconhecer ditongos em palavras', 'Os gémeos AI e EI vão fazer magia com sons!', 7, 'easy'),
('Português', 1, 'Nome Próprio e Comum', 'Aprende a diferença entre nomes de pessoas e de coisas!', 'Distinguir nomes próprios de comuns', 'O detetive Nome vai classificar todas as palavras!', 8, 'easy'),
('Português', 1, 'Masculino e Feminino', 'Descobre se as palavras são masculinas ou femininas!', 'Identificar género das palavras', 'O príncipe e a princesa vão organizar o reino!', 9, 'easy'),
('Português', 1, 'Os Artigos: O, A, Os, As', 'Aprende a usar os artigos certos com as palavras!', 'Usar artigos definidos corretamente', 'Os quatro amigos O, A, OS, AS vão apresentar palavras!', 10, 'easy');

-- ============================================
-- G1 MATEMÁTICA (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Matemática', 1, 'Números Ordinais', 'Aprende 1º, 2º, 3º e muito mais!', 'Usar números ordinais até 10º', 'Os corredores da corrida vão aprender a ordem!', 6, 'easy'),
('Matemática', 1, 'Pares e Ímpares', 'Descobre quais números são pares e quais são ímpares!', 'Identificar números pares e ímpares', 'Os números vão fazer duplas para dançar!', 7, 'easy'),
('Matemática', 1, 'Contar Dinheiro', 'Aprende a usar moedas para comprar coisas!', 'Reconhecer moedas e contar quantias simples', 'A Joana vai à loja comprar guloseimas!', 8, 'easy'),
('Matemática', 1, 'Adição até 20', 'Soma números até 20 com imagens!', 'Realizar adições até 20', 'A Joana vai juntar bolachas nos dois pratos!', 9, 'easy'),
('Matemática', 1, 'Gráficos Simples', 'Aprende a fazer gráficos com os teus amigos!', 'Interpretar gráficos de barras simples', 'O pintor vai criar um gráfico com as frutas favoritas!', 10, 'easy');

-- ============================================
-- G1 ESTUDO DO MEIO (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Estudo do Meio', 1, 'A Minha Escola', 'Conhece os espaços e as regras da escola!', 'Identificar espaços e regras da escola', 'O guia escolar vai mostrar todas as salas!', 6, 'easy'),
('Estudo do Meio', 1, 'Cuidados com o Corpo', 'Aprende a cuidar do teu corpo e a manter-te saudável!', 'Identificar hábitos de higiene e saúde', 'A enfermeira Fátima vai ensinar hábitos saudáveis!', 7, 'easy'),
('Estudo do Meio', 1, 'Alimentação Saudável', 'Descobre quais alimentos são bons para ti!', 'Distingir alimentos saudáveis de não saudáveis', 'O cozinheiro Sábio vai preparar pratos saudáveis!', 8, 'easy'),
('Estudo do Meio', 1, 'Rotinas do Dia', 'Aprende a organizar o teu dia: de manhã à noite!', 'Ordenar atividades do dia a dia', 'O relógio vai contar como é um dia completo!', 9, 'easy'),
('Estudo do Meio', 1, 'Identificação Pessoal', 'Sabe dizer o teu nome, morada e idade?', 'Saber dados pessoais de identificação', 'O agente Identidade vai ajudar cada um a apresentar-se!', 10, 'easy');

-- ============================================
-- G2 PORTUGUÊS (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Português', 2, 'Palavras com LH, NH, CH', 'Descobre os sons especiais com lh, nh e ch!', 'Escrever palavras com lh, nh, ch', 'O dragão NHO vai soprar palavras mágicas!', 6, 'easy'),
('Português', 2, 'Pontuação Básica', 'Aprende a usar o ponto, a vírgula e o ponto de interrogação!', 'Usar sinais de pontuação básicos', 'O Senhor Ponto Final vai organizar as frases!', 7, 'easy'),
('Português', 2, 'Palavras com R e RR', 'Aprende quando usar r forte e rr!', 'Diferenciar uso de r e rr', 'O pirata RR vai procurar o tesouro das palavras!', 8, 'normal'),
('Português', 2, 'Sinónimos e Antónimos', 'Descobre palavras com significados iguais ou opostos!', 'Identificar sinónimos e antónimos simples', 'Os gémeos Sino e Antino vão brincar com significados!', 9, 'normal'),
('Português', 2, 'Pronomes Pessoais', 'Aprende a usar eu, tu, ele, ela e outros!', 'Identificar e usar pronomes pessoais', 'A turma dos pronomes vai apresentar-se à escola!', 10, 'normal');

-- ============================================
-- G2 MATEMÁTICA (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Matemática', 2, 'Tabuadas do 5 e 10', 'As tabuadas mais fáceis e divertidas!', 'Memorizar tabuadas do 5 e 10', 'O Mágico das Tabuadas vai ensinar truques!', 6, 'easy'),
('Matemática', 2, 'Metade e Quarto', 'Aprende a dividir em metades e quartos!', 'Identificar metade e quarto', 'A coelhinha vai partilhar o bolo em fatias!', 7, 'easy'),
('Matemática', 2, 'O Relógio', 'Aprende a ler as horas no relógio!', 'Ler horas inteiras e meia hora', 'O relojoeiro vai ensinar a ler as horas!', 8, 'normal'),
('Matemática', 2, 'Moedas e Notas', 'Aprende a contar dinheiro e a fazer troco!', 'Fazer cálculos simples com dinheiro', 'O caixa da loja vai ensinar a contar moedas!', 9, 'normal'),
('Matemática', 2, 'Gráficos de Barras', 'Aprende a ler e criar gráficos de barras!', 'Interpretar gráficos de barras', 'O investigador vai criar gráficos sobre a turma!', 10, 'normal');

-- ============================================
-- G2 ESTUDO DO MEIO (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Estudo do Meio', 2, 'Ciclo de Vida dos Animais', 'Descobre como os animais nascem e crescem!', 'Identificar fases do ciclo de vida', 'A borboleta vai mostrar como se transforma!', 6, 'easy'),
('Estudo do Meio', 2, 'Lixo e Reciclagem', 'Aprende a separar o lixo e a reciclar!', 'Identificar regras de reciclagem', 'O ecologista vai ensinar a separar o lixo!', 7, 'easy'),
('Estudo do Meio', 2, 'Estados da Água', 'A água pode ser líquida, sólida ou gasosa!', 'Identificar os três estados da água', 'A gotinha de água vai mudar de forma!', 8, 'normal'),
('Estudo do Meio', 2, 'A Minha Localidade', 'Conhece a tua terra e os seus serviços!', 'Identificar características da localidade', 'O carteiro vai mostrar os cantos da aldeia!', 9, 'normal'),
('Estudo do Meio', 2, 'Materiais ao Redor', 'Descobre os materiais naturais e transformados!', 'Classificar materiais naturais e transformados', 'O construtor vai mostrar os materiais da casa!', 10, 'normal');

-- ============================================
-- G3 PORTUGUÊS (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Português', 3, 'Sujeito e Predicado', 'Descobre as duas partes da frase!', 'Identificar sujeito e predicado', 'O juiz Frase vai dividir as frases em duas partes!', 6, 'normal'),
('Português', 3, 'Advérbios', 'Aprende palavras que dizem como algo acontece!', 'Identificar e usar advérbios', 'O veloz Advérbio vai explicar tudo rapidamente!', 7, 'normal'),
('Português', 3, 'Determinantes', 'Descobre os artigos, possessivos e demonstrativos!', 'Identificar tipos de determinantes', 'O detetive Determinante vai investigar as palavras!', 8, 'normal'),
('Português', 3, 'Por Que, Porque e Porquê', 'Aprende quando usar cada um!', 'Diferenciar por que, porque e porquê', 'O curioso PORQUÊ vai fazer muitas perguntas!', 9, 'hard'),
('Português', 3, 'Tempos dos Verbos', 'Aprende presente, passado e futuro!', 'Conjugar verbos nos tempos básicos', 'A máquina do tempo vai viajar pelos tempos verbais!', 10, 'hard');

-- ============================================
-- G3 MATEMÁTICA (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Matemática', 3, 'Números Romanos', 'Descobre como os romanos escreviam números!', 'Ler números romanos até C (100)', 'O gladiador Romano vai ensinar os seus números!', 6, 'normal'),
('Matemática', 3, 'Ângulos e Simetria', 'Aprende sobre ângulos e figuras simétricas!', 'Identificar ângulos e simetrias', 'O artista vai pintar figuras simétricas!', 7, 'normal'),
('Matemática', 3, 'Medidas de Massa e Capacidade', 'Aprende a pesar e a medir líquidos!', 'Usar unidades de massa (g, kg) e capacidade (ml, l)', 'O chef vai medir ingredientes para a receita!', 8, 'normal'),
('Matemática', 3, 'Troco e Dinheiro', 'Aprende a calcular o troco nas compras!', 'Calcular troco em situações de compra', 'O vendedor da feira vai dar o troco certo!', 9, 'hard'),
('Matemática', 3, 'Moda e Média', 'Descobre a moda e a média de um grupo de números!', 'Calcular moda e média simples', 'O estatístico vai analisar as notas da turma!', 10, 'hard');

-- ============================================
-- G3 ESTUDO DO MEIO (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Estudo do Meio', 3, 'O Aparelho Digestivo', 'Descobre como o teu corpo transforma comida em energia!', 'Identificar órgãos do aparelho digestivo', 'O Dr. Miúdo vai viajar pelo tubo digestivo!', 6, 'normal'),
('Estudo do Meio', 3, 'Cadeias Alimentares', 'Aprende quem come quem na natureza!', 'Identificar cadeias alimentares simples', 'O lobo e a ovelha vão mostrar quem come quem!', 7, 'normal'),
('Estudo do Meio', 3, 'Estados Físicos da Matéria', 'Sólido, líquido ou gasoso? Descobre a diferença!', 'Identificar estados físicos dos materiais', 'O cientista vai transformar materiais no laboratório!', 8, 'normal'),
('Estudo do Meio', 3, 'Doenças e Vacinas', 'Aprende como proteger o teu corpo das doenças!', 'Compreender a importância das vacinas', 'O super-herói Vacina vai proteger as crianças!', 9, 'hard'),
('Estudo do Meio', 3, 'Rochas e Solos', 'Descobre os diferentes tipos de rochas e solos!', 'Identificar tipos de rochas e solos', 'O geólogo vai explorar as rochas da montanha!', 10, 'hard');

-- ============================================
-- G4 PORTUGUÊS (add missing #7-10, #6 already updated)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Português', 4, 'Palavras com -ssão, -ção e -são', 'Aprende a diferenciar estas terminações!', 'Aplicar regras de ortografia com -ssão, -ção, -são', 'O detetive Ortografia vai desvendar terminações!', 7, 'normal'),
('Português', 4, 'Frase Simples e Composta', 'Aprende a diferença entre frases simples e compostas!', 'Distinguir frases simples de frases compostas', 'O construtor de frases vai montar frases de um ou mais blocos!', 8, 'hard'),
('Português', 4, 'Voz Ativa e Passiva', 'Descobre quem faz a ação e quem a sofre!', 'Distinguir voz ativa de voz passiva', 'O detetive Ativa e a Passive vão resolver o caso!', 9, 'hard'),
('Português', 4, 'Polissemia e Expressões', 'Descobre palavras com vários significados!', 'Identificar polissemia e expressões idiomáticas', 'O mágico Polissemia vai transformar palavras!', 10, 'hard');

-- ============================================
-- G4 MATEMÁTICA (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Matemática', 4, 'Números até 10 000', 'Domina números enormes até dez mil!', 'Ler e escrever números até 10 000', 'O explorador vai contar as estrelas do céu!', 6, 'hard'),
('Matemática', 4, 'Frações Equivalentes', 'Descobre frações diferentes que valem o mesmo!', 'Identificar frações equivalentes', 'O alquimista vai transformar frações iguais!', 7, 'hard'),
('Matemática', 4, 'Percentagens', 'Aprende o que são 10%, 25%, 50% e 100%!', 'Calcular percentagens simples', 'O banqueiro vai dividir lucros com percentagens!', 8, 'hard'),
('Matemática', 4, 'Triângulos e Quadriláteros', 'Classifica figuras pelos lados e ângulos!', 'Classificar triângulos e quadriláteros', 'O arquiteto vai construir formas geométricas!', 9, 'hard'),
('Matemática', 4, 'Probabilidades', 'Descobre o que é provável e o que é impossível!', 'Calcular probabilidades simples', 'O mágico vai prever o futuro com probabilidades!', 10, 'hard');

-- ============================================
-- G4 ESTUDO DO MEIO (6-10)
-- ============================================
INSERT INTO lessons (subject, grade_level, title, description, learning_objective, story_context, lesson_index, difficulty)
VALUES
('Estudo do Meio', 4, 'Portugal na Europa', 'Descobre onde fica Portugal e os países vizinhos!', 'Localizar Portugal na Europa', 'O piloto vai voar pela Europa e mostrar Portugal!', 6, 'normal'),
('Estudo do Meio', 4, 'Continentes e Oceanos', 'Conhece os continentes e oceanos do planeta!', 'Identificar continentes e oceanos', 'O astronauta vai ver a Terra do espaço!', 7, 'normal'),
('Estudo do Meio', 4, 'Leitura de Mapas', 'Aprende a ler mapas e a orientar-te!', 'Interpretar mapas simples e pontos cardeais', 'O explorador vai usar a bússola para navegar!', 8, 'hard'),
('Estudo do Meio', 4, 'Segurança Online', 'Aprende a usar a internet com segurança!', 'Identificar regras de segurança na internet', 'O agente Ciberguarda vai proteger as crianças online!', 9, 'hard'),
('Estudo do Meio', 4, 'Democracia e Cidadania', 'Descubre como funciona a democracia e os teus direitos!', 'Compreender conceitos de democracia e cidadania', 'A presidenta vai explicar como votamos e decidimos juntos!', 10, 'hard');

-- ============================================
-- FIX: Update challenge references from "Textos Informativos" to "Texto de Opinião"
-- (migration 007 referenced title 'Textos Informativos' which is now renamed)
-- ============================================
UPDATE lesson_challenges SET question = 'Um texto de opinião serve para:'
WHERE question = 'Um texto informativo serve para:'
AND lesson_id = (SELECT id FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'Texto de Opinião');

UPDATE lesson_challenges SET question = 'Um texto de opinião apresenta ___ e argumentos.'
WHERE question = 'Um texto informativo apresenta ___ e dados.'
AND lesson_id = (SELECT id FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'Texto de Opinião');

UPDATE lesson_challenges SET content = '{"options": ["Contar uma história", "Expressar uma opinião com argumentos", "Fazer rima", "Informar factos"], "correct_answer": "Expressar uma opinião com argumentos"}'::jsonb
WHERE question = 'Qual é um exemplo de texto informativo?'
AND lesson_id = (SELECT id FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND title = 'Texto de Opinião');

-- ============================================
-- CHALLENGES for all new lessons (6-10)
-- ============================================

-- G1 Port #6: Rimas e Aliterações
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra rima com "gato"?', '{"options": ["Pato", "Cão", "Rato", "Peixe"], "correct_answer": "Pato"}'::jsonb, 'Rima = terminação igual!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"O rato roeu a roupa" - isto é uma:', '{"options": ["Rima", "Aliteração", "História", "Música"], "correct_answer": "Aliteração"}'::jsonb, 'Repetição do mesmo som no início!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A palavra que rima com "fada" é ___', '{"correct_answer": "espada", "correct_answers": ["espada", "Espada", "morada", "Morada", "basta", "Basta"]}'::jsonb, 'Termina em -ada!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 6;

-- G1 Port #7: Ditongos Mágicos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra tem o ditongo "ai"?', '{"options": ["Pai", "Pé", "Pó", "Tu"], "correct_answer": "Pai"}'::jsonb, 'Ouça o som ai junto!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Fei" é um ditongo porque:', '{"options": ["Tem duas consoantes", "Tem duas vogais juntas", "É uma palavra grande", "Tem acento"], "correct_answer": "Tem duas vogais juntas"}'::jsonb, 'Ditongo = duas vogais na mesma sílaba!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Na palavra "___", há o ditongo "oi".', '{"correct_answer": "coisa", "correct_answers": ["coisa", "Coisa", "noite", "Noite", "foice", "Foice"]}'::jsonb, 'Pensa em palavras com oi junto!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 7;

-- G1 Port #8: Nome Próprio e Comum
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Lisboa" é um nome:', '{"options": ["Comum", "Próprio", "Verbo", "Adjetivo"], "correct_answer": "Próprio"}'::jsonb, 'Nomes de cidades são próprios!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Cidade" é um nome:', '{"options": ["Próprio", "Comum", "Verbo", "Adjetivo"], "correct_answer": "Comum"}'::jsonb, 'É um tipo de coisa, não um nome específico!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Os nomes ___ escrevem-se com letra maiúscula.', '{"correct_answer": "próprios", "correct_answers": ["próprios", "Próprios", "proprios", "Proprios"]}'::jsonb, 'Começam sempre com letra grande!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 8;

-- G1 Port #9: Masculino e Feminino
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O feminino de "menino" é:', '{"options": ["Menina", "Menino", "Meninas", "Meninos"], "correct_answer": "Menina"}'::jsonb, 'Troca o -o por -a!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada palavra ao feminino:', '{"pairs": [{"left": "Galo", "options": ["Galinha", "Gata", "Leoa"]}, {"left": "Gato", "options": ["Galinha", "Gata", "Leoa"]}, {"left": "Leão", "options": ["Galinha", "Gata", "Leoa"]}], "correct_matches": {"Galo": "Galinha", "Gato": "Gata", "Leão": "Leoa"}}'::jsonb, 'Troca o final!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O feminino de "ator" é ___', '{"correct_answer": "atriz", "correct_answers": ["atriz", "Atriz", "ATRIZ"]}'::jsonb, 'Algumas palavras são especiais!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 9;

-- G1 Port #10: Os Artigos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"___ gato é bonito." - Que artigo usar?', '{"options": ["A", "O", "Os", "As"], "correct_answer": "O"}'::jsonb, 'Gato é masculino singular!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"___ meninas brincam." - Que artigo usar?', '{"options": ["O", "A", "Os", "As"], "correct_answer": "As"}'::jsonb, 'Meninas = feminino plural!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Os artigos definidos são: o, a, os e ___', '{"correct_answer": "as", "correct_answers": ["as", "As", "AS"]}'::jsonb, 'Feminino plural!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 1 AND lesson_index = 10;

-- G1 Mat #6: Números Ordinais
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O 1º lugar na corrida é:', '{"options": ["Primeiro", "Segundo", "Terceiro", "Último"], "correct_answer": "Primeiro"}'::jsonb, '1º = primeiro!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O 3º lugar é o ___ lugar.', '{"correct_answer": "terceiro", "correct_answers": ["terceiro", "Terceiro", "3º"]}'::jsonb, '1º primeiro, 2º segundo, 3º...', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Que número ordinal vem depois do quinto?', '{"options": ["Sétimo", "Sexto", "Oitavo", "Quarto"], "correct_answer": "Sexto"}'::jsonb, '5º quinto, 6º...', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 6;

-- G1 Mat #7: Pares e Ímpares
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é um número par?', '{"options": ["3", "5", "8", "7"], "correct_answer": "8"}'::jsonb, 'Pares acabam em 0, 2, 4, 6, 8!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O número 7 é:', '{"options": ["Par", "Ímpar", "Primo", "Grande"], "correct_answer": "Ímpar"}'::jsonb, 'Ímpares acabam em 1, 3, 5, 7, 9!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Os números pares acabam em 0, 2, 4, 6 e ___', '{"correct_answer": "8", "correct_answers": ["8", "oito", "Oito"]}'::jsonb, 'Qual é o último número par de 1 a 10?', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 7;

-- G1 Mat #8: Contar Dinheiro
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Que moeda vale mais?', '{"options": ["1 cêntimo", "5 cêntimos", "2 cêntimos", "10 cêntimos"], "correct_answer": "10 cêntimos"}'::jsonb, 'Qual tem o número maior?', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '2 moedas de 5 cêntimos = ___ cêntimos', '{"correct_answer": "10", "correct_answers": ["10", "dez", "Dez"]}'::jsonb, '5 + 5 = ?', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Com que moedas podes formar 10 cêntimos?', '{"options": ["Duas de 5 cêntimos", "Cinco de 1 cêntimo", "Uma de 2 cêntimos", "Três de 3 cêntimos"], "correct_answer": "Duas de 5 cêntimos"}'::jsonb, '5 + 5 = 10!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 8;

-- G1 Mat #9: Adição até 20
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '9 + 8 = ?', '{"options": ["15", "16", "17", "18"], "correct_answer": "17"}'::jsonb, '9 + 1 = 10, depois + 7!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '7 + 6 = ___', '{"correct_answer": "13", "correct_answers": ["13", "treze", "Treze"]}'::jsonb, '7 + 3 = 10, depois + 3!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '12 + 5 = ?', '{"options": ["15", "16", "17", "18"], "correct_answer": "17"}'::jsonb, 'Conta a partir do 12!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 9;

-- G1 Mat #10: Gráficos Simples
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um gráfico de barras serve para:', '{"options": ["Escrever histórias", "Mostrar informações com barras", "Fazer contas", "Desenhar pessoas"], "correct_answer": "Mostrar informações com barras"}'::jsonb, 'Cada barra mostra uma quantidade!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A barra mais ___ indica a quantidade maior.', '{"correct_answer": "alta", "correct_answers": ["alta", "Alta", "grande", "Grande"]}'::jsonb, 'Barra grande = quantidade grande!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Num gráfico de frutas favoritas, se a barra da maçã é a maior, então:', '{"options": ["A maçã é a menos favorita", "A maçã é a mais favorita", "Ninguém gosta de maçã", "Todas são iguais"], "correct_answer": "A maçã é a mais favorita"}'::jsonb, 'Maior barra = mais votos!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 1 AND lesson_index = 10;

-- G1 EdM #6: A Minha Escola
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Onde fazemos as aulas?', '{"options": ["Pátio", "Sala de aula", "Cantina", "Corredor"], "correct_answer": "Sala de aula"}'::jsonb, 'É onde estão as mesas e cadeiras!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Na ___ comemos o lanche.', '{"correct_answer": "cantina", "correct_answers": ["cantina", "Cantina", "refeitório", "Refeitório"]}'::jsonb, 'Onde se come na escola!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quando a campainhe toca, devemos:', '{"options": ["Correr", "Entrar na sala", "Gritar", "Sair da escola"], "correct_answer": "Entrar na sala"}'::jsonb, 'É hora da aula!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 6;

-- G1 EdM #7: Cuidados com o Corpo
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Para que servem os dentes?', '{"options": ["Para ver", "Para mastigar comida", "Para ouvir", "Para correr"], "correct_answer": "Para mastigar comida"}'::jsonb, 'Usamos os dentes ao comer!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Devemos lavar os ___ todos os dias.', '{"correct_answer": "dentes", "correct_answers": ["dentes", "Dentes", "mãos", "Mãos"]}'::jsonb, 'Pelo menos de manhã e à noite!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quantas vezes devemos tomar banho por dia?', '{"options": ["Nenhuma", "Uma", "Três", "Cinco"], "correct_answer": "Uma"}'::jsonb, 'Basta uma vez por dia!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 7;

-- G1 EdM #8: Alimentação Saudável
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual alimento é saudável?', '{"options": ["Refrigerante", "Chips", "Cenoura", "Doces"], "correct_answer": "Cenoura"}'::jsonb, 'É um legume!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada alimento ao tipo:', '{"pairs": [{"left": "Maçã", "options": ["Fruta", "Legume", "Doce"]}, {"left": "Brócolos", "options": ["Fruta", "Legume", "Doce"]}, {"left": "Bolo", "options": ["Fruta", "Legume", "Doce"]}], "correct_matches": {"Maçã": "Fruta", "Brócolos": "Legume", "Bolo": "Doce"}}'::jsonb, 'De onde vêm os alimentos?', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Devemos beber muita ___ todos os dias.', '{"correct_answer": "água", "correct_answers": ["água", "Agua", "Água", "água", "AGUA"]}'::jsonb, 'É essencial para o corpo!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 8;

-- G1 EdM #9: Rotinas do Dia
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O que fazemos logo de manhã?', '{"options": ["Jantar", "Acordar", "Dormir", "Ver TV"], "correct_answer": "Acordar"}'::jsonb, 'É a primeira coisa do dia!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'word_order', 'Ordena as atividades do dia:', '{"correct_order": ["Acordar", "Tomar pequeno-almoço", "Ir para a escola", "Almoçar", "Jantar", "Dormir"]}'::jsonb, 'O que fazes primeiro?', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'À ___ vamos dormir.', '{"correct_answer": "noite", "correct_answers": ["noite", "Noite", "NOITE"]}'::jsonb, 'É quando escurece!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 9;

-- G1 EdM #10: Identificação Pessoal
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é um dado pessoal?', '{"options": ["Cor favorita", "Nome completo", "Comida favorita", "Desporto"], "correct_answer": "Nome completo"}'::jsonb, 'Identifica quem somos!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O número de ___ identifica a nossa casa na rua.', '{"correct_answer": "porta", "correct_answers": ["porta", "Porta", "PORTA"]}'::jsonb, 'Cada casa tem um número!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Em caso de emergência, ligamos para o:', '{"options": ["112", "100", "999", "111"], "correct_answer": "112"}'::jsonb, 'É o número europeu de emergência!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 1 AND lesson_index = 10;

-- G2 Port #6: Palavras com LH, NH, CH
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra se escreve com "lh"?', '{"options": ["Palha", "Pacha", "Pana", "Pala"], "correct_answer": "Palha"}'::jsonb, 'O lh soa como "lho"!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O animal que salta é o ___ (escreve com nh)', '{"correct_answer": "coelho", "correct_answers": ["coelho", "Coelho"]}'::jsonb, 'Não é coelo!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Chave" começa com o som:', '{"options": ["lh", "nh", "ch", "rr"], "correct_answer": "ch"}'::jsonb, 'Ch-ave!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 6;

-- G2 Port #7: Pontuação Básica
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Que sinal termina uma pergunta?', '{"options": ["Ponto final", "Ponto de interrogação", "Vírgula", "Ponto de exclamação"], "correct_answer": "Ponto de interrogação"}'::jsonb, 'Usa-se em perguntas!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Uma frase afirmativa termina com ___', '{"correct_answer": "ponto final", "correct_answers": ["ponto final", "Ponto final", "ponto", "Ponto", "."]}'::jsonb, 'O ponto que fecha a frase!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Olá!" - Que sinal de pontuação é este?', '{"options": ["Ponto final", "Vírgula", "Ponto de exclamação", "Dois pontos"], "correct_answer": "Ponto de exclamação"}'::jsonb, 'Mostra emoção!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 7;

-- G2 Port #8: Palavras com R e RR
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra se escreve com "rr"?', '{"options": ["Cachorro", "Caro", "Rato", "Rosa"], "correct_answer": "Cachorro"}'::jsonb, 'Entre vogais, r forte = rr!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ___ (carro/trem) passa nos trilhos.', '{"correct_answer": "comboio", "correct_answers": ["comboio", "Comboio", "carro", "Carro"]}'::jsonb, 'Entre vogais o som forte escreve-se com rr!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Cara" e "Carro" - a diferença é:', '{"options": ["Nenhuma", "O r simples e o r forte (rr)", "O tamanho", "A primeira letra"], "correct_answer": "O r simples e o r forte (rr)"}'::jsonb, 'Um som é fraco e o outro é forte!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 8;

-- G2 Port #9: Sinónimos e Antónimos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o sinónimo de "bonito"?', '{"options": ["Feio", "Belo", "Grande", "Lento"], "correct_answer": "Belo"}'::jsonb, 'Sinónimo = mesma significado!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o antónimo de "quente"?', '{"options": ["Frio", "Morno", "Escaldante", "Tepido"], "correct_answer": "Frio"}'::jsonb, 'Antónimo = significado oposto!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O antónimo de "claro" é ___', '{"correct_answer": "escuro", "correct_answers": ["escuro", "Escuro", "obscuro", "Obscuro"]}'::jsonb, 'É o oposto de claro!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 9;

-- G2 Port #10: Pronomes Pessoais
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Eu" é um pronome pessoal que indica:', '{"options": ["A 2ª pessoa", "A 1ª pessoa", "A 3ª pessoa", "Nenhuma"], "correct_answer": "A 1ª pessoa"}'::jsonb, 'Quem fala é a 1ª pessoa!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '___ és tu? (pronome: eu, tu, ele...)', '{"correct_answer": "Tu", "correct_answers": ["Tu", "tu", "TU"]}'::jsonb, '2ª pessoa do singular!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Eles" refere-se a:', '{"options": ["Uma pessoa", "Duas ou mais pessoas", "Um objeto", "Eu mesmo"], "correct_answer": "Duas ou mais pessoas"}'::jsonb, 'Eles = plural masculino!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 2 AND lesson_index = 10;

-- G2 Mat #6: Tabuadas do 5 e 10
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '5 × 6 = ?', '{"options": ["25", "30", "35", "20"], "correct_answer": "30"}'::jsonb, 'Acaba sempre em 0 ou 5!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '10 × 7 = ___', '{"correct_answer": "70", "correct_answers": ["70", "setenta", "Setenta"]}'::jsonb, 'Tabuada do 10 = juntar um zero!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '5 × 9 = ?', '{"options": ["40", "45", "50", "55"], "correct_answer": "45"}'::jsonb, 'Metade de 90!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 6;

-- G2 Mat #7: Metade e Quarto
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Metade de 8 é:', '{"options": ["2", "3", "4", "6"], "correct_answer": "4"}'::jsonb, '8 ÷ 2 = ?', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Um quarto de 12 é ___', '{"correct_answer": "3", "correct_answers": ["3", "três", "Três", "tres", "Tres"]}'::jsonb, '12 ÷ 4 = ?', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Se cortares uma pizza em 4 fatias iguais, cada fatia é:', '{"options": ["Metade", "Um quarto", "Um terço", "Um oitavo"], "correct_answer": "Um quarto"}'::jsonb, '4 fatias = 4 partes!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 7;

-- G2 Mat #8: O Relógio
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quando o ponteiro grande está no 12 e o pequeno no 7, são:', '{"options": ["7:00", "12:07", "7:12", "12:00"], "correct_answer": "7:00"}'::jsonb, 'Ponteiro grande no 12 = horas exatas!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Meia hora = ___ minutos', '{"correct_answer": "30", "correct_answers": ["30", "trinta", "Trinta"]}'::jsonb, '1 hora = 60 minutos!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Se são 3 e meia, os ponteiros estão em:', '{"options": ["3 e 12", "3 e 6", "6 e 3", "12 e 3"], "correct_answer": "3 e 6"}'::jsonb, 'Meia hora = ponteiro grande no 6!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 8;

-- G2 Mat #9: Moedas e Notas
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Uma nota de 5€ vale o mesmo que:', '{"options": ["5 moedas de 1€", "1 moeda de 5 cêntimos", "5 notas de 10€", "50 cêntimos"], "correct_answer": "5 moedas de 1€"}'::jsonb, '1€ + 1€ + 1€ + 1€ + 1€ = ?', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '1 euro = ___ cêntimos', '{"correct_answer": "100", "correct_answers": ["100", "cem", "Cem"]}'::jsonb, '1€ tem 100 cêntimos!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Comprei um brinquedo de 3€ e paguei com 5€. O troco é:', '{"options": ["1€", "2€", "3€", "8€"], "correct_answer": "2€"}'::jsonb, '5 - 3 = ?', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 9;

-- G2 Mat #10: Gráficos de Barras
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Para que serve um gráfico de barras?', '{"options": ["Para fazer contas", "Para comparar quantidades", "Para escrever", "Para desenhar"], "correct_answer": "Para comparar quantidades"}'::jsonb, 'Cada barra mostra um valor!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ___ de um gráfico indica o que estamos a medir.', '{"correct_answer": "título", "correct_answers": ["título", "Titulo", "título", "Título"]}'::jsonb, 'Diz-nos do que fala o gráfico!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Se a barra azul tem 8 e a vermelha tem 5, a barra azul é:', '{"options": ["Menor", "Igual", "Maior", "Mais escura"], "correct_answer": "Maior"}'::jsonb, '8 > 5!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 2 AND lesson_index = 10;

-- G2 EdM #6: Ciclo de Vida dos Animais
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é a ordem do ciclo de vida?', '{"options": ["Adulto → Bebé → Crescimento", "Bebé → Crescimento → Adulto", "Crescimento → Adulto → Bebé", "Adulto → Crescimento → Bebé"], "correct_answer": "Bebé → Crescimento → Adulto"}'::jsonb, 'Nasce, cresce e reproduz!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A borboleta começa como ___', '{"correct_answer": "lagarta", "correct_answers": ["lagarta", "Lagarta", "LAGARTA", "crisálida", "ovo"]}'::jsonb, 'Antes de ter asas!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'As rãs põem:', '{"options": ["Ovos com casca", "Ovos sem casca na água", "Crias vivas", "Sementes"], "correct_answer": "Ovos sem casca na água"}'::jsonb, 'São anfíbios!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 6;

-- G2 EdM #7: Lixo e Reciclagem
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O contentor azul serve para:', '{"options": ["Vidro", "Papel e cartão", "Plástico", "Resíduos"], "correct_answer": "Papel e cartão"}'::jsonb, 'Azul = papel!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O contentor ___ é para vidro.', '{"correct_answer": "verde", "correct_answers": ["verde", "Verde", "VERDE"]}'::jsonb, 'Cor da garrafa!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Os 3 Rs da reciclagem são:', '{"options": ["Reduzir, Reutilizar, Reciclar", "Reparar, Repetir, Respeitar", "Rodar, Rir, Recuar", "Retirar, Rasgar, Rechear"], "correct_answer": "Reduzir, Reutilizar, Reciclar"}'::jsonb, 'São as 3 formas de ajudar o planeta!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 7;

-- G2 EdM #8: Estados da Água
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o estado da água no gelo?', '{"options": ["Líquido", "Sólido", "Gasoso", "Nenhum"], "correct_answer": "Sólido"}'::jsonb, 'O gelo é água congelada!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ___ é água no estado gasoso.', '{"correct_answer": "vapor", "correct_answers": ["vapor", "Vapor", "VAPOR"]}'::jsonb, 'É o que sai quando a água ferve!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'A água muda de estado quando:', '{"options": ["Muda de cor", "Muda de temperatura", "Muda de sabor", "Não muda"], "correct_answer": "Muda de temperatura"}'::jsonb, 'Calor ou frio!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 8;

-- G2 EdM #9: A Minha Localidade
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O que é uma localidade?', '{"options": ["Um país", "Um lugar onde pessoas vivem", "Um continente", "Um rio"], "correct_answer": "Um lugar onde pessoas vivem"}'::jsonb, 'Pode ser aldeia, vila ou cidade!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A ___ é o serviço que trata dos doentes.', '{"correct_answer": "farmácia", "correct_answers": ["farmácia", "Farmácia", "hospital", "Hospital", "centro de saúde", "Centro de saúde"]}'::jsonb, 'Onde compramos remédios!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Uma cidade é maior que:', '{"options": ["Um país", "Um continente", "Uma aldeia", "Um planeta"], "correct_answer": "Uma aldeia"}'::jsonb, 'Aldeia < Vila < Cidade!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 9;

-- G2 EdM #10: Materiais ao Redor
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'A madeira é um material:', '{"options": ["Transformado", "Natural", "Artificial", "Sintético"], "correct_answer": "Natural"}'::jsonb, 'Vem das árvores!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'matching', 'Liga cada objeto ao material:', '{"pairs": [{"left": "Cadeira de madeira", "options": ["Natural", "Transformado"]}, {"left": "Garrafa de plástico", "options": ["Natural", "Transformado"]}, {"left": "Pedra", "options": ["Natural", "Transformado"]}], "correct_matches": {"Cadeira de madeira": "Natural", "Garrafa de plástico": "Transformado", "Pedra": "Natural"}}'::jsonb, 'Natural = da natureza, Transformado = feito pelo homem!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ___ é um material transformado feito com areia.', '{"correct_answer": "vidro", "correct_answers": ["vidro", "Vidro", "VIDRO"]}'::jsonb, 'As janelas são feitas dele!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 2 AND lesson_index = 10;

-- G3 Port #6: Sujeito e Predicado
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Na frase "O gato dorme", o sujeito é:', '{"options": ["dorme", "O gato", "gato", "O"], "correct_answer": "O gato"}'::jsonb, 'Quem faz a ação!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Na frase "A menina canta", o predicado é ___', '{"correct_answer": "canta", "correct_answers": ["canta", "Canta", "a menina canta", "A menina canta"]}'::jsonb, 'O que se diz do sujeito!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Toda a frase tem:', '{"options": ["Só sujeito", "Só predicado", "Sujeito e predicado", "Nenhum dos dois"], "correct_answer": "Sujeito e predicado"}'::jsonb, 'São as duas partes essenciais!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 6;

-- G3 Port #7: Advérbios
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"O cão corre rapidamente" - "rapidamente" é:', '{"options": ["Adjetivo", "Advérbio", "Verbo", "Nome"], "correct_answer": "Advérbio"}'::jsonb, 'Diz como algo acontece!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O menino fala ___ (advérbio de modo).', '{"correct_answer": "baixinho", "correct_answers": ["baixinho", "Baixinho", "devagar", "Devagar", "alto", "Alto"]}'::jsonb, 'Como ele fala?', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é um advérbio de tempo?', '{"options": ["Amanhã", "Bem", "Aqui", "Muito"], "correct_answer": "Amanhã"}'::jsonb, 'Indica quando algo acontece!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 7;

-- G3 Port #8: Determinantes
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"O", "A", "Os", "As" são determinantes:', '{"options": ["Possessivos", "Demonstrativos", "Artigos definidos", "Indefinidos"], "correct_answer": "Artigos definidos"}'::jsonb, 'Indicam algo específico!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '"Minha" casa - "minha" é um determinante ___', '{"correct_answer": "possessivo", "correct_answers": ["possessivo", "Possessivo", "Possessivos"]}'::jsonb, 'Indica a quem pertence!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Este", "Essa", "Aquele" são determinantes:', '{"options": ["Artigos", "Possessivos", "Demonstrativos", "Interrogativos"], "correct_answer": "Demonstrativos"}'::jsonb, 'Mostram onde algo está!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 8;

-- G3 Port #9: Por Que, Porque e Porquê
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"___ fizeste isso?" - Usamos:', '{"options": ["Por que", "Porque", "Porquê", "Por quê"], "correct_answer": "Por que"}'::jsonb, 'Em perguntas separadas!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Fiquei doente ___ comi demasiado.', '{"correct_answer": "porque", "correct_answers": ["porque", "Porque", "PORQUE"]}'::jsonb, 'Resposta/explicação = uma só palavra!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Quero saber o ___" - Usamos:', '{"options": ["Por que", "Porque", "Porquê", "Por quê"], "correct_answer": "Porquê"}'::jsonb, 'No final da frase, com acento!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 9;

-- G3 Port #10: Tempos dos Verbos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Eu comi" está no tempo:', '{"options": ["Presente", "Passado", "Futuro", "Infinitivo"], "correct_answer": "Passado"}'::jsonb, 'Já aconteceu!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '"Eu vou comer" está no tempo ___', '{"correct_answer": "futuro", "correct_answers": ["futuro", "Futuro", "FUTURO"]}'::jsonb, 'Ainda vai acontecer!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Eu como" é:', '{"options": ["Presente", "Passado", "Futuro", "Pretérito"], "correct_answer": "Presente"}'::jsonb, 'Acontece agora!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 3 AND lesson_index = 10;

-- G3 Mat #6: Números Romanos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O número romano X vale:', '{"options": ["5", "10", "50", "100"], "correct_answer": "10"}'::jsonb, 'X = 10!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O número romano V vale ___', '{"correct_answer": "5", "correct_answers": ["5", "cinco", "Cinco"]}'::jsonb, 'V = 5!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'XX em números romanos é:', '{"options": ["10", "20", "30", "200"], "correct_answer": "20"}'::jsonb, 'X + X = 10 + 10!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 6;

-- G3 Mat #7: Ângulos e Simetria
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um ângulo reto mede:', '{"options": ["45°", "90°", "180°", "360°"], "correct_answer": "90°"}'::jsonb, 'É o ângulo de um canto!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Uma figura tem ___ se as duas metades forem iguais.', '{"correct_answer": "simetria", "correct_answers": ["simetria", "Simetria", "SIMETRIA"]}'::jsonb, 'Se puderes dobrar e ficar igual!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um triângulo equilátero tem eixo de simetria:', '{"options": ["0", "1", "2", "3"], "correct_answer": "3"}'::jsonb, 'Todos os lados são iguais!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 7;

-- G3 Mat #8: Medidas de Massa e Capacidade
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '1 quilograma equivale a:', '{"options": ["10 gramas", "100 gramas", "1000 gramas", "10000 gramas"], "correct_answer": "1000 gramas"}'::jsonb, 'Quilo = 1000!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '1 litro = ___ mililitros', '{"correct_answer": "1000", "correct_answers": ["1000", "mil", "Mil"]}'::jsonb, '1 l = 1000 ml!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Para medir a massa de uma maçã usamos:', '{"options": ["Réguas", "Balança", "Provativa", "Relógio"], "correct_answer": "Balança"}'::jsonb, 'Massa = peso!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 8;

-- G3 Mat #9: Troco e Dinheiro
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Comprei um livro de 6€ e paguei com 10€. O troco é:', '{"options": ["3€", "4€", "5€", "6€"], "correct_answer": "4€"}'::jsonb, '10 - 6 = ?', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Paguei 20€ por compras de 13€. Recebo ___€ de troco.', '{"correct_answer": "7", "correct_answers": ["7", "sete", "Sete"]}'::jsonb, '20 - 13 = ?', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Se não há troco, significa que:', '{"options": ["Paguei a menos", "Paguei a mais", "Paguei o valor exato", "Não paguei"], "correct_answer": "Paguei o valor exato"}'::jsonb, 'O dinheiro dado é igual ao preço!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 9;

-- G3 Mat #10: Moda e Média
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Na turma as notas são: 3, 5, 5, 5, 4. A moda é:', '{"options": ["3", "4", "5", "22"], "correct_answer": "5"}'::jsonb, 'Moda = o valor que aparece mais vezes!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A média de 4 e 6 é ___', '{"correct_answer": "5", "correct_answers": ["5", "cinco", "Cinco"]}'::jsonb, '(4 + 6) ÷ 2 = ?', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Para calcular a média, fazemos:', '{"options": ["Somar todos os valores", "Somar e dividir pelo número de valores", "Escolher o maior", "Multiplicar todos"], "correct_answer": "Somar e dividir pelo número de valores"}'::jsonb, 'Soma ÷ quantidade = média!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 3 AND lesson_index = 10;

-- G3 EdM #6: O Aparelho Digestivo
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Onde começa a digestão?', '{"options": ["No estômago", "Na boca", "No intestino", "No fígado"], "correct_answer": "Na boca"}'::jsonb, 'Mastigamos primeiro!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ___ transforma a comida numa papa.', '{"correct_answer": "estômago", "correct_answers": ["estômago", "Estômago", "estomago", "Estomago"]}'::jsonb, 'É como um liquidificador!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O intestino delgado serve para:', '{"options": ["Mastigar", "Absorver nutrientes", "Bombear sangue", "Respirar"], "correct_answer": "Absorver nutrientes"}'::jsonb, 'É onde o corpo aproveita a comida!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 6;

-- G3 EdM #7: Cadeias Alimentares
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Na cadeia "relva → coelho → raposa", a raposa é:', '{"options": ["Produtor", "Consumidor primário", "Consumidor secundário", "Decompositor"], "correct_answer": "Consumidor secundário"}'::jsonb, 'Come o coelho!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'As plantas são os ___ da cadeia alimentar.', '{"correct_answer": "produtores", "correct_answers": ["produtores", "Produtores", "PRODUTORES"]}'::jsonb, 'Produzem o próprio alimento!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O que acontece se os produtores desaparecerem?', '{"options": ["Nada", "Os consumidores sobrevivem", "Toda a cadeia colapsa", "Só os decompositores sofrem"], "correct_answer": "Toda a cadeia colapsa"}'::jsonb, 'Sem plantas não há comida para ninguém!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 7;

-- G3 EdM #8: Estados Físicos da Matéria
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O ferro é um material:', '{"options": ["Líquido", "Sólido", "Gasoso", "Plasma"], "correct_answer": "Sólido"}'::jsonb, 'É duro e rígido!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O ar que respiramos é um ___', '{"correct_answer": "gás", "correct_answers": ["gás", "Gás", "gas", "Gas", "gaseoso"]}'::jsonb, 'Não tem forma própria!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quando o gelo derrete, a água passa de:', '{"options": ["Sólido para líquido", "Líquido para gasoso", "Gasoso para sólido", "Líquido para sólido"], "correct_answer": "Sólido para líquido"}'::jsonb, 'Derreter = passar a líquido!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 8;

-- G3 EdM #9: Doenças e Vacinas
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'As vacinas servem para:', '{"options": ["Curar doenças", "Prevenir doenças", "Fazer dor", "Dar energia"], "correct_answer": "Prevenir doenças"}'::jsonb, 'Protegem antes de ficarmos doentes!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Lavar as ___ previne a propagação de germes.', '{"correct_answer": "mãos", "correct_answers": ["mãos", "Mãos", "maos", "Maos"]}'::jsonb, 'É a regra mais importante!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Os vírus e bactérias são:', '{"options": ["Inanimados", "Micro-organismos", "Plantas", "Minerais"], "correct_answer": "Micro-organismos"}'::jsonb, 'São muito pequenos!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 9;

-- G3 EdM #10: Rochas e Solos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O solo é a camada:', '{"options": ["De baixo da terra", "Superficial da terra", "Do fundo do mar", "Do ar"], "correct_answer": "Superficial da terra"}'::jsonb, 'É onde crescem as plantas!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'As ___ são materiais sólidos naturais da crosta terrestre.', '{"correct_answer": "rochas", "correct_answers": ["rochas", "Rochas", "ROCHAS", "pedras", "Pedras"]}'::jsonb, 'Granito, calcário, basalto...', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O granito é uma rocha:', '{"options": ["Sedimentar", "Magmática", "Metamórfica", "Artificial"], "correct_answer": "Magmática"}'::jsonb, 'Formou-se do magma!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 3 AND lesson_index = 10;

-- G4 Port #7: Palavras com -ssão, -ção e -são
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual palavra se escreve com -ção?', '{"options": ["Profissão", "Canção", "Nação", "Expressão"], "correct_answer": "Nação"}'::jsonb, 'Deriva de verbos em -ar!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Pá__ar (escreve com ss)', '{"correct_answer": "ss", "correct_answers": ["ss", "SS"]}'::jsonb, 'Entre vogais = ss!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Compreensão" escreve-se com:', '{"options": ["-ção", "-ssão", "-são", "-ção"], "correct_answer": "-são"}'::jsonb, 'Deriva de compreender!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 7;

-- G4 Port #8: Frase Simples e Composta
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"O gato dorme" é uma frase:', '{"options": ["Composta", "Simples", "Complexa", "Interrogativa"], "correct_answer": "Simples"}'::jsonb, 'Tem só um verbo!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Uma frase com mais de um verbo é uma frase ___', '{"correct_answer": "composta", "correct_answers": ["composta", "Composta", "COMPOSTA"]}'::jsonb, 'Vários verbos = frase composta!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"O gato dorme e o cão ladra" é:', '{"options": ["Frase simples", "Frase composta por coordenação", "Frase complexa", "Não é frase"], "correct_answer": "Frase composta por coordenação"}'::jsonb, 'Duas orações ligadas por "e"!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 8;

-- G4 Port #9: Voz Ativa e Passiva
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"O João comeu o bolo" está na voz:', '{"options": ["Passiva", "Ativa", "Reflexiva", "Impessoal"], "correct_answer": "Ativa"}'::jsonb, 'O sujeito faz a ação!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '"O bolo foi comido pelo João" está na voz ___', '{"correct_answer": "passiva", "correct_answers": ["passiva", "Passiva", "PASSIVA"]}'::jsonb, 'O sujeito sofre a ação!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Na voz passiva, o sujeito:', '{"options": ["Faz a ação", "Sofre a ação", "Não existe", "É verbo"], "correct_answer": "Sofre a ação"}'::jsonb, 'A ação acontece-lhe!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 9;

-- G4 Port #10: Polissemia e Expressões
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Manga" da camisa e "manga" da fruta - isto é:', '{"options": ["Sinónimos", "Polissemia", "Antónimos", "Homónimos"], "correct_answer": "Polissemia"}'::jsonb, 'Mesma palavra, significados diferentes!', 1
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '"Estar nas nuvens" é uma expressão ___', '{"correct_answer": "idiomática", "correct_answers": ["idiomática", "idiomatica", "Idiomática", "Idiomatica"]}'::jsonb, 'Não se deve interpretar à letra!', 2
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '"Bater a bota" significa:', '{"options": ["Chutar uma bota", "Morrer", "Dançar", "Bater à porta"], "correct_answer": "Morrer"}'::jsonb, 'É uma expressão popular!', 3
FROM lessons WHERE subject = 'Português' AND grade_level = 4 AND lesson_index = 10;

-- G4 Mat #6: Números até 10 000
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Mil e quinhentos escreve-se:', '{"options": ["150", "1050", "1500", "15000"], "correct_answer": "1500"}'::jsonb, 'Mil = 1000, quinhentos = 500!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O número 3756 tem ___ unidades.', '{"correct_answer": "6", "correct_answers": ["6", "seis", "Seis"]}'::jsonb, 'O último algarismo!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o maior número?', '{"options": ["8900", "9080", "9800", "8009"], "correct_answer": "9800"}'::jsonb, 'Compara da esquerda para a direita!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 6;

-- G4 Mat #7: Frações Equivalentes
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual fração é equivalente a 1/2?', '{"options": ["2/4", "1/3", "2/3", "3/5"], "correct_answer": "2/4"}'::jsonb, 'Dobrar cima e baixo!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '3/6 é equivalente a 1/___', '{"correct_answer": "2", "correct_answers": ["2", "dois", "Dois"]}'::jsonb, 'Simplifica dividindo por 3!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '2/5 e 4/10 são equivalentes porque:', '{"options": ["Têm o mesmo numerador", "Valem o mesmo", "Têm o mesmo denominador", "São iguais"], "correct_answer": "Valem o mesmo"}'::jsonb, '2/5 = 4/10!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 7;

-- G4 Mat #8: Percentagens
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '50% de 200 é:', '{"options": ["50", "100", "150", "200"], "correct_answer": "100"}'::jsonb, '50% = metade!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', '10% de 50 é ___', '{"correct_answer": "5", "correct_answers": ["5", "cinco", "Cinco"]}'::jsonb, '10% = dividir por 10!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', '25% é o mesmo que:', '{"options": ["1/2", "1/4", "1/3", "1/5"], "correct_answer": "1/4"}'::jsonb, '25 de cada 100 = 1 de cada 4!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 8;

-- G4 Mat #9: Triângulos e Quadriláteros
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um triângulo com 3 lados iguais chama-se:', '{"options": ["Isósceles", "Equilátero", "Escaleno", "Retângulo"], "correct_answer": "Equilátero"}'::jsonb, 'Equi = igual!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Um quadrilátero com 4 lados iguais e 4 ângulos retos é um ___', '{"correct_answer": "quadrado", "correct_answers": ["quadrado", "Quadrado", "QUADRADO"]}'::jsonb, 'Lados iguais e cantos retos!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um retângulo tem:', '{"options": ["4 lados iguais", "4 ângulos retos e lados opostos iguais", "3 lados", "5 lados"], "correct_answer": "4 ângulos retos e lados opostos iguais"}'::jsonb, 'Não precisa de ter todos os lados iguais!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 9;

-- G4 Mat #10: Probabilidades
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Ao lançar um dado, a probabilidade de sair 6 é:', '{"options": ["Impossível", "1 em 6", "50%", "Certa"], "correct_answer": "1 em 6"}'::jsonb, 'Há 6 faces possíveis!', 1
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'A probabilidade de sair cara ao lançar uma moeda é 1 em ___', '{"correct_answer": "2", "correct_answers": ["2", "dois", "Dois"]}'::jsonb, 'Cara ou coroa!', 2
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'É impossível que:', '{"options": ["Chova amanhã", "O sol nasça a oeste", "Eu coma sopa", "O cão ladre"], "correct_answer": "O sol nasça a oeste"}'::jsonb, 'Algo que nunca acontece!', 3
FROM lessons WHERE subject = 'Matemática' AND grade_level = 4 AND lesson_index = 10;

-- G4 EdM #6: Portugal na Europa
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Portugal fica no continente:', '{"options": ["África", "América", "Europa", "Ásia"], "correct_answer": "Europa"}'::jsonb, 'É um país europeu!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O país a leste de Portugal é a ___', '{"correct_answer": "Espanha", "correct_answers": ["Espanha", "espanha", "ESPAÑA", "Espana"]}'::jsonb, 'É o nosso único vizinho terrestre!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 6;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Portugal é banhado a oeste e sul pelo:', '{"options": ["Mar Mediterrâneo", "Oceano Atlântico", "Oceano Pacífico", "Mar Negro"], "correct_answer": "Oceano Atlântico"}'::jsonb, 'Portugal tem costa atlântica!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 6;

-- G4 EdM #7: Continentes e Oceanos
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Quantos continentes existem?', '{"options": ["5", "6", "7", "8"], "correct_answer": "7"}'::jsonb, 'África, América, Antártida, Ásia, Europa, Oceania...', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O maior oceano do mundo é o oceano ___', '{"correct_answer": "Pacífico", "correct_answers": ["Pacífico", "Pacifico", "pacífico", "pacifico"]}'::jsonb, 'É enorme!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 7;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é o maior continente?', '{"options": ["Europa", "África", "Ásia", "América"], "correct_answer": "Ásia"}'::jsonb, 'Tem a maior população!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 7;

-- G4 EdM #8: Leitura de Mapas
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'O norte fica no topo do mapa. E o sul?', '{"options": ["No fundo", "À direita", "À esquerda", "No centro"], "correct_answer": "No fundo"}'::jsonb, 'Norte = cima, Sul = baixo!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'O instrumento que indica o norte é a ___', '{"correct_answer": "bússola", "correct_answers": ["bússola", "Bússola", "bussola", "Bussola", "BUSSOLA"]}'::jsonb, 'Aponta sempre para norte!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 8;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'A rosa-dos-ventos indica:', '{"options": ["As cores do mapa", "Os pontos cardeais", "Os rios", "As cidades"], "correct_answer": "Os pontos cardeais"}'::jsonb, 'N, S, E, O!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 8;

-- G4 EdM #9: Segurança Online
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Deves partilhar a tua senha com:', '{"options": ["Amigos", "Ninguém", "Professores", "Irmãos"], "correct_answer": "Ninguém"}'::jsonb, 'A senha é só tua!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Se alguém desconhecido tenta falar contigo online, deves ___', '{"correct_answer": "ignorar", "correct_answers": ["ignorar", "Ignorar", "IGNORAR", "bloquear", "Bloquear", "contar aos pais", "Contar aos pais"]}'::jsonb, 'Nunca fales com estranhos!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 9;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Qual é uma boa prática online?', '{"options": ["Usar senhas difíceis de adivinhar", "Partilhar a morada", "Acreditar em tudo", "Fazer amigos desconhecidos"], "correct_answer": "Usar senhas difíceis de adivinhar"}'::jsonb, 'Senhas fortes = segurança!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 9;

-- G4 EdM #10: Democracia e Cidadania
INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Democracia significa:', '{"options": ["Governo de um só", "Governo do povo", "Sem governo", "Governo dos ricos"], "correct_answer": "Governo do povo"}'::jsonb, 'Demo = povo, cracia = governo!', 1
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'fill_blank', 'Em Portugal, os cidadãos votam em ___', '{"correct_answer": "eleições", "correct_answers": ["eleições", "Eleições", "eleicoes", "Eleicoes"]}'::jsonb, 'É assim que escolhemos quem nos governa!', 2
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 10;

INSERT INTO lesson_challenges (lesson_id, challenge_type, question, content, hint, challenge_index)
SELECT id, 'multiple_choice', 'Um bom cidadão deve:', '{"options": ["Desrespeitar as leis", "Respeitar os direitos dos outros", "Só pensar em si", "Não participar"], "correct_answer": "Respeitar os direitos dos outros"}'::jsonb, 'Cidadania = responsabilidade!', 3
FROM lessons WHERE subject = 'Estudo do Meio' AND grade_level = 4 AND lesson_index = 10;
