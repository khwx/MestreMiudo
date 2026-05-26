import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Lesson, LessonCompletion, LessonChallenge } from '@/app/shared-schemas';

// ============================================
// Lesson Management Functions
// ============================================

/**
 * Get all lessons for a subject and grade
 */
export async function getLessons(
  subject: 'Português' | 'Matemática' | 'Estudo do Meio',
  gradeLevel: number
): Promise<Lesson[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('subject', subject)
      .eq('grade_level', gradeLevel)
      .order('lesson_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
}

/**
 * Get a single lesson with its challenges
 */
export async function getLesson(lessonId: string): Promise<Lesson | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Fetch challenges for this lesson
    const { data: challenges, error: challengesError } = await supabase
      .from('lesson_challenges')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('challenge_index', { ascending: true });

    if (challengesError) throw challengesError;

    return {
      ...data,
      challenges: challenges || [],
    };
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
}

/**
 * Get student's progress on a lesson
 */
export async function getLessonProgress(
  studentId: string,
  lessonId: string
): Promise<LessonCompletion | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('lesson_completion')
      .select('*')
      .eq('student_id', studentId)
      .eq('lesson_id', lessonId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return null;
  }
}

/**
 * Get all completed lessons for a student in a subject
 */
export async function getCompletedLessons(
  studentId: string,
  subject: string
): Promise<LessonCompletion[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('lesson_completion')
      .select(`
        *,
        lessons!inner(subject)
      `)
      .eq('student_id', studentId)
      .eq('lessons.subject', subject)
      .eq('completed', true)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching completed lessons:', error);
    return [];
  }
}

// ============================================
// Gamification Functions
// ============================================

/**
 * Calculate stars based on score
 * 1 star = 60-79%
 * 2 stars = 80-99%
 * 3 stars = 100%
 */
export function calculateStars(score: number): number {
  if (score === 100) return 3;
  if (score >= 80) return 2;
  if (score >= 60) return 1;
  return 0;
}

/**
 * Calculate coins earned based on stars
 * 1 star = 10 coins
 * 2 stars = 25 coins
 * 3 stars = 50 coins
 * Plus 20 bonus coins for daily consistency
 */
export function calculateCoins(stars: number, isDailyBonus: boolean = false): number {
  const baseCoins = {
    0: 0,
    1: 10,
    2: 25,
    3: 50,
  };

  const coins = baseCoins[stars as keyof typeof baseCoins] || 0;
  return isDailyBonus ? coins + 20 : coins;
}

/**
 * Save lesson completion
 */
export async function saveLessonCompletion(
  studentId: string,
  lessonId: string,
  answers: Record<string, unknown>,
  score: number
): Promise<LessonCompletion | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const stars = calculateStars(score);
  const coins = calculateCoins(stars);

  try {
    const { data, error } = await supabase
      .from('lesson_completion')
      .upsert({
        student_id: studentId,
        lesson_id: lessonId,
        completed: true,
        stars,
        coins_earned: coins,
        score,
        answers,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving lesson completion:', error);
    return null;
  }
}

/**
 * Get lesson statistics for a student
 */
export async function getLessonStats(studentId: string) {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('lesson_completion')
      .select('subject, completed, stars, coins_earned', {
        count: 'exact',
      })
      .eq('student_id', studentId)
      .eq('completed', true);

    if (error) throw error;

    // Calculate statistics
    const stats = {
      totalCompleted: data?.length || 0,
      totalCoins: data?.reduce((sum, lesson) => sum + (lesson.coins_earned || 0), 0) || 0,
      averageStars: data?.length
        ? (data.reduce((sum, lesson) => sum + (lesson.stars || 0), 0) / data.length).toFixed(2)
        : 0,
      bySubject: {
        'Português': 0,
        'Matemática': 0,
        'Estudo do Meio': 0,
      },
    };

    // Group by subject - this would need proper implementation with the join
    return stats;
  } catch (error) {
    console.error('Error fetching lesson stats:', error);
    return null;
  }
}

/**
 * Initialize sample lessons for development/testing
 */
export async function initializeSampleLessons() {
  if (!isSupabaseConfigured() || !supabase) return;

  // This would be called once to seed initial lessons
  // Can be expanded with actual lesson data from textbooks
  const sampleLessons: Lesson[] = [
    // ===== GRADE 1 - PORTUGUÊS =====
    {
      subject: 'Português',
      grade_level: 1,
      title: 'Conhecer as Vogais',
      description: 'Aprende as cinco vogais e como pronunciá-las.',
      learning_objective: 'Identificar e pronunciar todas as vogais',
      story_context: 'A Maria está a explorar o mundo das letras!',
      lesson_index: 1,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 1,
      title: 'As Consoantes Mágicas',
      description: 'Descobre as consoantes b, c, d, f!',
      learning_objective: 'Reconhecer consoantes básicas',
      story_context: 'O Pedro encontrou letras mágicas na floresta!',
      lesson_index: 2,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 1,
      title: 'Formar Palavras',
      description: 'Aprende a juntar letras para formar palavras!',
      learning_objective: 'Construir palavras simples',
      story_context: 'Vamos construir um castelo de palavras!',
      lesson_index: 3,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 1,
      title: 'Sílaba e Palavra',
      description: 'Aprende a separar palavras em sílabas!',
      learning_objective: 'Contar sílabas e separar palavras',
      story_context: 'O caracol ensina-nos a ir devagar, sílaba a sílaba!',
      lesson_index: 4,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 1,
      title: 'Frases Curtas',
      description: 'Constrói frases simples com palavras que conheces!',
      learning_objective: 'Construir frases simples',
      story_context: 'Vamos construir frases como um quebra-cabeças!',
      lesson_index: 5,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 1,
      title: 'Rimas e Aliterações',
      description: 'Descobre palavras que rimam e sons que se repetem!',
      learning_objective: 'Identificar rimas e aliterações simples',
      story_context: 'O poeta Caracol vai ensinar rimas divertidas!',
      lesson_index: 6,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 1,
      title: 'Ditongos Mágicos',
      description: 'Aprende os sons especiais: ai, ei, oi, ui!',
      learning_objective: 'Reconhecer ditongos em palavras',
      story_context: 'Os gémeos AI e EI vão fazer magia com sons!',
      lesson_index: 7,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 1,
      title: 'Nome Próprio e Comum',
      description: 'Aprende a diferença entre nomes de pessoas e de coisas!',
      learning_objective: 'Distinguir nomes próprios de comuns',
      story_context: 'O detetive Nome vai classificar todas as palavras!',
      lesson_index: 8,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 1,
      title: 'Masculino e Feminino',
      description: 'Descobre se as palavras são masculinas ou femininas!',
      learning_objective: 'Identificar género das palavras',
      story_context: 'O príncipe e a princesa vão organizar o reino!',
      lesson_index: 9,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 1,
      title: 'Os Artigos: O, A, Os, As',
      description: 'Aprende a usar os artigos certos com as palavras!',
      learning_objective: 'Usar artigos definidos corretamente',
      story_context: 'Os quatro amigos O, A, OS, AS vão apresentar palavras!',
      lesson_index: 10,
      difficulty: 'easy',
    },

    // ===== GRADE 1 - MATEMÁTICA =====
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Números de 1 a 10',
      description: 'Aprender a contar e reconhecer números até 10.',
      learning_objective: 'Contar e reconhecer números 1-10',
      story_context: 'O João está a contar os seus brinquedos!',
      lesson_index: 1,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Adição Divertida',
      description: 'Soma pequenas quantidades com desenhos!',
      learning_objective: 'Compreender a adição básica',
      story_context: 'Vamos somar frutas no cesto mágico!',
      lesson_index: 2,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Formas Geométricas',
      description: 'Descobre o círculo, quadrado e triângulo!',
      learning_objective: 'Identificar formas básicas',
      story_context: 'A Sofia encontrou formas escondidas no jardim!',
      lesson_index: 3,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Subtração com Imagens',
      description: 'Aprende a tirar e a contar o que sobra!',
      learning_objective: 'Compreender a subtração básica',
      story_context: 'O Tomás tinha balões e alguns voaram!',
      lesson_index: 4,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Números até 20',
      description: 'Conta mais alto! Vamos até ao 20!',
      learning_objective: 'Reconhecer e contar até 20',
      story_context: 'A formiga vai contar as suas amigas!',
      lesson_index: 5,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Números Ordinais',
      description: 'Aprende 1º, 2º, 3º e muito mais!',
      learning_objective: 'Usar números ordinais até 10º',
      story_context: 'Os corredores da corrida vão aprender a ordem!',
      lesson_index: 6,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Pares e Ímpares',
      description: 'Descobre quais números são pares e quais são ímpares!',
      learning_objective: 'Identificar números pares e ímpares',
      story_context: 'Os números vão fazer duplas para dançar!',
      lesson_index: 7,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Contar Dinheiro',
      description: 'Aprende a usar moedas para comprar coisas!',
      learning_objective: 'Reconhecer moedas e contar quantias simples',
      story_context: 'A Joana vai à loja comprar guloseimas!',
      lesson_index: 8,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Adição até 20',
      description: 'Soma números até 20 com imagens!',
      learning_objective: 'Realizar adições até 20',
      story_context: 'A Joana vai juntar bolachas nos dois pratos!',
      lesson_index: 9,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 1,
      title: 'Gráficos Simples',
      description: 'Aprende a fazer gráficos com os teus amigos!',
      learning_objective: 'Interpretar gráficos de barras simples',
      story_context: 'O pintor vai criar um gráfico com as frutas favoritas!',
      lesson_index: 10,
      difficulty: 'easy',
    },

    // ===== GRADE 1 - ESTUDO DO MEIO =====
    {
      subject: 'Estudo do Meio',
      grade_level: 1,
      title: 'O Meu Corpo',
      description: 'Descobre as partes do corpo e como funcionam!',
      learning_objective: 'Identificar partes do corpo humano',
      story_context: 'O Doutor Osso vai ensinar-nos sobre o nosso corpo!',
      lesson_index: 1,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 1,
      title: 'Os Cinco Sentidos',
      description: 'Aprende a ver, ouvir, cheirar, saborear e tocar!',
      learning_objective: 'Identificar os cinco sentidos',
      story_context: 'A Maria descobriu que tem superpoderes: os sentidos!',
      lesson_index: 2,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 1,
      title: 'A Minha Família',
      description: 'Conhece os membros da família e as suas funções!',
      learning_objective: 'Reconhecer membros da família',
      story_context: 'Vamos conhecer a família do Tomás!',
      lesson_index: 3,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 1,
      title: 'As Estações do Ano',
      description: 'Descobre as quatro estações e o que muda!',
      learning_objective: 'Identificar as estações do ano',
      story_context: 'A Joana vê a natureza a mudar ao longo do ano!',
      lesson_index: 4,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 1,
      title: 'Os Animais',
      description: 'Aprende sobre animais domésticos e selvagens!',
      learning_objective: 'Distinguir animais domésticos e selvagens',
      story_context: 'O Pedro foi ao zoo e descobriu animais incríveis!',
      lesson_index: 5,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 1,
      title: 'A Minha Escola',
      description: 'Conhece os espaços e as regras da escola!',
      learning_objective: 'Identificar espaços e regras da escola',
      story_context: 'O guia escolar vai mostrar todas as salas!',
      lesson_index: 6,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 1,
      title: 'Cuidados com o Corpo',
      description: 'Aprende a cuidar do teu corpo e a manter-te saudável!',
      learning_objective: 'Identificar hábitos de higiene e saúde',
      story_context: 'A enfermeira Fátima vai ensinar hábitos saudáveis!',
      lesson_index: 7,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 1,
      title: 'Alimentação Saudável',
      description: 'Descobre quais alimentos são bons para ti!',
      learning_objective: 'Distingir alimentos saudáveis de não saudáveis',
      story_context: 'O cozinheiro Sábio vai preparar pratos saudáveis!',
      lesson_index: 8,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 1,
      title: 'Rotinas do Dia',
      description: 'Aprende a organizar o teu dia: de manhã à noite!',
      learning_objective: 'Ordenar atividades do dia a dia',
      story_context: 'O relógio vai contar como é um dia completo!',
      lesson_index: 9,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 1,
      title: 'Identificação Pessoal',
      description: 'Sabe dizer o teu nome, morada e idade?',
      learning_objective: 'Saber dados pessoais de identificação',
      story_context: 'O agente Identidade vai ajudar cada um a apresentar-se!',
      lesson_index: 10,
      difficulty: 'easy',
    },

    // ===== GRADE 2 - PORTUGUÊS =====
    {
      subject: 'Português',
      grade_level: 2,
      title: 'Palavras com Ç e SS',
      description: 'Aprende quando usar ç ou ss no fim das palavras!',
      learning_objective: 'Diferenciar uso de ç e ss',
      story_context: 'O coelhinho precisa de ajuda com a ortografia!',
      lesson_index: 1,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 2,
      title: 'Género do Nome',
      description: 'Descobre se os nomes são masculinos ou femininos!',
      learning_objective: 'Identificar género dos nomes',
      story_context: 'Vamos organizar o baú de brinquedos!',
      lesson_index: 2,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 2,
      title: 'Plural dos Nomes',
      description: 'Aprende a transformar nomes do singular para o plural!',
      learning_objective: 'Formar plural de palavras simples',
      story_context: 'Vamos multiplicar os nossos amigos!',
      lesson_index: 3,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 2,
      title: 'O Verbo: Ação!',
      description: 'Descobre os verbos - palavras de ação!',
      learning_objective: 'Identificar verbos em frases',
      story_context: 'O super-herói Verbão está em ação!',
      lesson_index: 4,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 2,
      title: 'Adjetivos Descritivos',
      description: 'Aprende palavras que descrevem coisas!',
      learning_objective: 'Usar adjetivos para descrever',
      story_context: 'A pintora vai colorir o mundo com palavras!',
      lesson_index: 5,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 2,
      title: 'Palavras com LH, NH, CH',
      description: 'Descobre os sons especiais com lh, nh e ch!',
      learning_objective: 'Escrever palavras com lh, nh, ch',
      story_context: 'O dragão NHO vai soprar palavras mágicas!',
      lesson_index: 6,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 2,
      title: 'Pontuação Básica',
      description: 'Aprende a usar o ponto, a vírgula e o ponto de interrogação!',
      learning_objective: 'Usar sinais de pontuação básicos',
      story_context: 'O Senhor Ponto Final vai organizar as frases!',
      lesson_index: 7,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 2,
      title: 'Palavras com R e RR',
      description: 'Aprende quando usar r forte e rr!',
      learning_objective: 'Diferenciar uso de r e rr',
      story_context: 'O pirata RR vai procurar o tesouro das palavras!',
      lesson_index: 8,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 2,
      title: 'Sinónimos e Antónimos',
      description: 'Descobre palavras com significados iguais ou opostos!',
      learning_objective: 'Identificar sinónimos e antónimos simples',
      story_context: 'Os gémeos Sino e Antino vão brincar com significados!',
      lesson_index: 9,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 2,
      title: 'Pronomes Pessoais',
      description: 'Aprende a usar eu, tu, ele, ela e outros!',
      learning_objective: 'Identificar e usar pronomes pessoais',
      story_context: 'A turma dos pronomes vai apresentar-se à escola!',
      lesson_index: 10,
      difficulty: 'normal',
    },

    // ===== GRADE 2 - MATEMÁTICA =====
    {
      subject: 'Matemática',
      grade_level: 2,
      title: 'Adição até 20',
      description: 'Soma números até 20 com truques divertidos!',
      learning_objective: 'Dominar a adição até 20',
      story_context: 'O Pipas precisa de moedas para comprar brinquedos!',
      lesson_index: 1,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 2,
      title: 'Subtração Básica',
      description: 'Aprende a tirar quantidades de um grupo!',
      learning_objective: 'Compreender subtração simples',
      story_context: 'A Joana partilhou os seus doces com amigos!',
      lesson_index: 2,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 2,
      title: 'Tabuada do 2 e 3',
      description: 'Descobre os segredos das tabuadas!',
      learning_objective: 'Memorizar tabuadas simples',
      story_context: 'O Mágico das Matemáticas vai ensinar truques!',
      lesson_index: 3,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 2,
      title: 'Números até 100',
      description: 'Aprende os números grandes até 100!',
      learning_objective: 'Ler e escrever números até 100',
      story_context: 'A avó tem 100 anos! Vamos contar até lá!',
      lesson_index: 4,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 2,
      title: 'Medir Comprimentos',
      description: 'Aprende a medir com réguas e palmos!',
      learning_objective: 'Introdução à medição',
      story_context: 'O carpinteiro precisa de medir a mesa!',
      lesson_index: 5,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 2,
      title: 'Tabuadas do 5 e 10',
      description: 'As tabuadas mais fáceis e divertidas!',
      learning_objective: 'Memorizar tabuadas do 5 e 10',
      story_context: 'O Mágico das Tabuadas vai ensinar truques!',
      lesson_index: 6,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 2,
      title: 'Metade e Quarto',
      description: 'Aprende a dividir em metades e quartos!',
      learning_objective: 'Identificar metade e quarto',
      story_context: 'A coelhinha vai partilhar o bolo em fatias!',
      lesson_index: 7,
      difficulty: 'easy',
    },
    {
      subject: 'Matemática',
      grade_level: 2,
      title: 'O Relógio',
      description: 'Aprende a ler as horas no relógio!',
      learning_objective: 'Ler horas inteiras e meia hora',
      story_context: 'O relojoeiro vai ensinar a ler as horas!',
      lesson_index: 8,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 2,
      title: 'Moedas e Notas',
      description: 'Aprende a contar dinheiro e a fazer troco!',
      learning_objective: 'Fazer cálculos simples com dinheiro',
      story_context: 'O caixa da loja vai ensinar a contar moedas!',
      lesson_index: 9,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 2,
      title: 'Gráficos de Barras',
      description: 'Aprende a ler e criar gráficos de barras!',
      learning_objective: 'Interpretar gráficos de barras',
      story_context: 'O investigador vai criar gráficos sobre a turma!',
      lesson_index: 10,
      difficulty: 'normal',
    },

    // ===== GRADE 2 - ESTUDO DO MEIO =====
    {
      subject: 'Estudo do Meio',
      grade_level: 2,
      title: 'Os Animais da Floresta',
      description: 'Descobre os animais que vivem na floresta!',
      learning_objective: 'Identificar animais e habitats',
      story_context: 'O Ranger vai fazer um safari na floresta!',
      lesson_index: 1,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 2,
      title: 'As Estações do Ano',
      description: 'Aprende sobre a Primavera, Verão, Outono e Inverno!',
      learning_objective: 'Identificar as 4 estações',
      story_context: 'A Sofia vai vestir-se para cada estação!',
      lesson_index: 2,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 2,
      title: 'Partes da Planta',
      description: 'Descobre as partes das plantas!',
      learning_objective: 'Identificar raiz, caule, folhas e flor',
      story_context: 'O girassol vai mostrar-nos as suas partes!',
      lesson_index: 3,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 2,
      title: 'Os Alimentos',
      description: 'Aprende sobre alimentos saudáveis!',
      learning_objective: 'Distinguir alimentos saudáveis',
      story_context: 'A nutricionista ensina-nos a comer bem!',
      lesson_index: 4,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 2,
      title: 'A Água',
      description: 'Descobre de onde vem a água!',
      learning_objective: 'Compreender o ciclo básico da água',
      story_context: 'A gotinha de água vai fazer uma viagem!',
      lesson_index: 5,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 2,
      title: 'Ciclo de Vida dos Animais',
      description: 'Descobre como os animais nascem e crescem!',
      learning_objective: 'Identificar fases do ciclo de vida',
      story_context: 'A borboleta vai mostrar como se transforma!',
      lesson_index: 6,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 2,
      title: 'Lixo e Reciclagem',
      description: 'Aprende a separar o lixo e a reciclar!',
      learning_objective: 'Identificar regras de reciclagem',
      story_context: 'O ecologista vai ensinar a separar o lixo!',
      lesson_index: 7,
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 2,
      title: 'Estados da Água',
      description: 'A água pode ser líquida, sólida ou gasosa!',
      learning_objective: 'Identificar os três estados da água',
      story_context: 'A gotinha de água vai mudar de forma!',
      lesson_index: 8,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 2,
      title: 'A Minha Localidade',
      description: 'Conhece a tua terra e os seus serviços!',
      learning_objective: 'Identificar características da localidade',
      story_context: 'O carteiro vai mostrar os cantos da aldeia!',
      lesson_index: 9,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 2,
      title: 'Materiais ao Redor',
      description: 'Descobre os materiais naturais e transformados!',
      learning_objective: 'Classificar materiais naturais e transformados',
      story_context: 'O construtor vai mostrar os materiais da casa!',
      lesson_index: 10,
      difficulty: 'normal',
    },

    // ===== GRADE 3 - PORTUGUÊS =====
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Texto Narrativo',
      description: 'Aprende a estrutura de uma história: início, meio e fim!',
      learning_objective: 'Identificar partes da narrativa',
      story_context: 'Vamos descobrir como se constrói uma história!',
      lesson_index: 1,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Sinónimos e Antónimos',
      description: 'Descobre palavras com significados iguais ou opostos!',
      learning_objective: 'Distinguir sinónimos de antónimos',
      story_context: 'O detetive das palavras vai investigar!',
      lesson_index: 2,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Acentuação e Ortografia',
      description: 'Aprende as regras de acentuação!',
      learning_objective: 'Aplicar regras básicas de acentuação',
      story_context: 'O detetive Ortografia vai resolver mistérios!',
      lesson_index: 3,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'O Dicionário',
      description: 'Aprende a procurar palavras no dicionário!',
      learning_objective: 'Usar o dicionário para encontrar significados',
      story_context: 'O explorador de Palavras vai ao dicionário!',
      lesson_index: 4,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Frases Complexas',
      description: 'Aprende a juntar frases com conectivos!',
      learning_objective: 'Usar conectivos para unir frases',
      story_context: 'O construtor de frases vai montar pontes!',
      lesson_index: 5,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Sujeito e Predicado',
      description: 'Descobre as duas partes da frase!',
      learning_objective: 'Identificar sujeito e predicado',
      story_context: 'O juiz Frase vai dividir as frases em duas partes!',
      lesson_index: 6,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Advérbios',
      description: 'Aprende palavras que dizem como algo acontece!',
      learning_objective: 'Identificar e usar advérbios',
      story_context: 'O veloz Advérbio vai explicar tudo rapidamente!',
      lesson_index: 7,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Determinantes',
      description: 'Descobre os artigos, possessivos e demonstrativos!',
      learning_objective: 'Identificar tipos de determinantes',
      story_context: 'O detetive Determinante vai investigar as palavras!',
      lesson_index: 8,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Por Que, Porque e Porquê',
      description: 'Aprende quando usar cada um!',
      learning_objective: 'Diferenciar por que, porque e porquê',
      story_context: 'O curioso PORQUÊ vai fazer muitas perguntas!',
      lesson_index: 9,
      difficulty: 'hard',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Tempos dos Verbos',
      description: 'Aprende presente, passado e futuro!',
      learning_objective: 'Conjugar verbos nos tempos básicos',
      story_context: 'A máquina do tempo vai viajar pelos tempos verbais!',
      lesson_index: 10,
      difficulty: 'hard',
    },

    // ===== GRADE 3 - MATEMÁTICA =====
    {
      subject: 'Matemática',
      grade_level: 3,
      title: 'Números até 1000',
      description: 'Domina números grandes até 1000!',
      learning_objective: 'Ler e escrever números até 1000',
      story_context: 'O Explorador dos Números Grandes!',
      lesson_index: 1,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 3,
      title: 'Multiplicação e Divisão',
      description: 'Aprende a multiplicar e dividir números!',
      learning_objective: 'Realizar operações de multiplicação e divisão',
      story_context: 'O Mágico das Tabuadas!',
      lesson_index: 2,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 3,
      title: 'Frações Simples',
      description: 'Aprende a dividir em partes iguais!',
      learning_objective: 'Identificar frações simples',
      story_context: 'A pizza vai ensinar-nos sobre frações!',
      lesson_index: 3,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 3,
      title: 'O Relógio e as Horas',
      description: 'Aprende a ler as horas no relógio!',
      learning_objective: 'Ler horas em relógio analógico',
      story_context: 'O relojoeiro precisa da nossa ajuda!',
      lesson_index: 4,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 3,
      title: 'Problemas com Palavras',
      description: 'Resolve problemas usando matemática!',
      learning_objective: 'Resolver problemas do dia a dia',
      story_context: 'O detetive Matemático vai resolver casos!',
      lesson_index: 5,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 3,
      title: 'Números Romanos',
      description: 'Descobre como os romanos escreviam números!',
      learning_objective: 'Ler números romanos até C (100)',
      story_context: 'O gladiador Romano vai ensinar os seus números!',
      lesson_index: 6,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 3,
      title: 'Ângulos e Simetria',
      description: 'Aprende sobre ângulos e figuras simétricas!',
      learning_objective: 'Identificar ângulos e simetrias',
      story_context: 'O artista vai pintar figuras simétricas!',
      lesson_index: 7,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 3,
      title: 'Medidas de Massa e Capacidade',
      description: 'Aprende a pesar e a medir líquidos!',
      learning_objective: 'Usar unidades de massa (g, kg) e capacidade (ml, l)',
      story_context: 'O chef vai medir ingredientes para a receita!',
      lesson_index: 8,
      difficulty: 'normal',
    },
    {
      subject: 'Matemática',
      grade_level: 3,
      title: 'Troco e Dinheiro',
      description: 'Aprende a calcular o troco nas compras!',
      learning_objective: 'Calcular troco em situações de compra',
      story_context: 'O vendedor da feira vai dar o troco certo!',
      lesson_index: 9,
      difficulty: 'hard',
    },
    {
      subject: 'Matemática',
      grade_level: 3,
      title: 'Moda e Média',
      description: 'Descobre a moda e a média de um grupo de números!',
      learning_objective: 'Calcular moda e média simples',
      story_context: 'O estatístico vai analisar as notas da turma!',
      lesson_index: 10,
      difficulty: 'hard',
    },

    // ===== GRADE 3 - ESTUDO DO MEIO =====
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'O Sistema Solar',
      description: 'Explora os planetas do nosso sistema solar!',
      learning_objective: 'Identificar os planetas do sistema solar',
      story_context: 'O Astronauta vai viajar pelo espaço!',
      lesson_index: 1,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'Os Oceanos e Rios',
      description: 'Descobre os oceanos e rios de Portugal!',
      learning_objective: 'Identificar oceanos e rios principais',
      story_context: 'O marinheiro vai navegar por Portugal!',
      lesson_index: 2,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'Os Seres Vivos',
      description: 'Aprende as características dos seres vivos!',
      learning_objective: 'Identificar características dos seres vivos',
      story_context: 'O biólogo vai estudar os seres vivos!',
      lesson_index: 3,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'A Latitude e o Clima',
      description: 'Descobre porque há climas diferentes!',
      learning_objective: 'Compreender factores do clima',
      story_context: 'O meteorologista vai explicar o tempo!',
      lesson_index: 4,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'Recursos Naturais',
      description: 'Aprende sobre os recursos da Terra!',
      learning_objective: 'Identificar recursos naturais',
      story_context: 'A Terra tem tesouros escondidos!',
      lesson_index: 5,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'O Aparelho Digestivo',
      description: 'Descobre como o teu corpo transforma comida em energia!',
      learning_objective: 'Identificar órgãos do aparelho digestivo',
      story_context: 'O Dr. Miúdo vai viajar pelo tubo digestivo!',
      lesson_index: 6,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'Cadeias Alimentares',
      description: 'Aprende quem come quem na natureza!',
      learning_objective: 'Identificar cadeias alimentares simples',
      story_context: 'O lobo e a ovelha vão mostrar quem come quem!',
      lesson_index: 7,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'Estados Físicos da Matéria',
      description: 'Sólido, líquido ou gasoso? Descobre a diferença!',
      learning_objective: 'Identificar estados físicos dos materiais',
      story_context: 'O cientista vai transformar materiais no laboratório!',
      lesson_index: 8,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'Doenças e Vacinas',
      description: 'Aprende como proteger o teu corpo das doenças!',
      learning_objective: 'Compreender a importância das vacinas',
      story_context: 'O super-herói Vacina vai proteger as crianças!',
      lesson_index: 9,
      difficulty: 'hard',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'Rochas e Solos',
      description: 'Descobre os diferentes tipos de rochas e solos!',
      learning_objective: 'Identificar tipos de rochas e solos',
      story_context: 'O geólogo vai explorar as rochas da montanha!',
      lesson_index: 10,
      difficulty: 'hard',
    },

    // ===== GRADE 4 - PORTUGUÊS =====
    {
      subject: 'Português',
      grade_level: 4,
      title: 'Tipos de Frase',
      description: 'Aprende declarativas, interrogativas, exclamativas e imperativas!',
      learning_objective: 'Identificar tipos de frase',
      story_context: 'O Detetive das Frases!',
      lesson_index: 1,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 4,
      title: 'Classes de Palavras',
      description: 'Descobre nomes, verbos, adjetivos e mais!',
      learning_objective: 'Identificar classes de palavras',
      story_context: 'O professor Gramática vai classificar tudo!',
      lesson_index: 2,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 4,
      title: 'A Sílaba Tónica',
      description: 'Aprende qual é a sílaba mais forte!',
      learning_objective: 'Identificar a sílaba tónica',
      story_context: 'O detetive Sílaba Tónica vai investigar!',
      lesson_index: 3,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 4,
      title: 'Concordância Verbal',
      description: 'Aprende a fazer as palavras combinarem!',
      learning_objective: 'Aplicar concordância sujeito-verbo',
      story_context: 'O casamento das palavras vai ser perfeito!',
      lesson_index: 4,
      difficulty: 'hard',
    },
    {
      subject: 'Português',
      grade_level: 4,
      title: 'Texto de Opinião',
      description: 'Aprende a escrever o que pensas com argumentos!',
      learning_objective: 'Escrever textos de opinião com argumentos',
      story_context: 'A jornalista vai defender a sua opinião no jornal!',
      lesson_index: 5,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 4,
      title: 'Coordenação e Subordinação',
      description: 'Aprende a juntar frases com e, mas, ou, porque!',
      learning_objective: 'Usar coordenação e subordinação',
      story_context: 'O construtor de pontes vai ligar as frases!',
      lesson_index: 6,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 4,
      title: 'Palavras com -ssão, -ção e -são',
      description: 'Aprende a diferenciar estas terminações!',
      learning_objective: 'Aplicar regras de ortografia com -ssão, -ção, -são',
      story_context: 'O detetive Ortografia vai desvendar terminações!',
      lesson_index: 7,
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 4,
      title: 'Frase Simples e Composta',
      description: 'Aprende a diferença entre frases simples e compostas!',
      learning_objective: 'Distinguir frases simples de frases compostas',
      story_context: 'O construtor de frases vai montar frases de um ou mais blocos!',
      lesson_index: 8,
      difficulty: 'hard',
    },
    {
      subject: 'Português',
      grade_level: 4,
      title: 'Voz Ativa e Passiva',
      description: 'Descobre quem faz a ação e quem a sofre!',
      learning_objective: 'Distinguir voz ativa de voz passiva',
      story_context: 'O detetive Ativa e a Passive vão resolver o caso!',
      lesson_index: 9,
      difficulty: 'hard',
    },
    {
      subject: 'Português',
      grade_level: 4,
      title: 'Polissemia e Expressões',
      description: 'Descobre palavras com vários significados!',
      learning_objective: 'Identificar polissemia e expressões idiomáticas',
      story_context: 'O mágico Polissemia vai transformar palavras!',
      lesson_index: 10,
      difficulty: 'hard',
    },

    // ===== GRADE 4 - MATEMÁTICA =====
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Multiplicação Mágica',
      description: 'Domina as tabuadas com truques divertidos!',
      learning_objective: 'Aplicar tabuadas na multiplicação',
      story_context: 'O Mágico dos Números vai ensinar truques!',
      lesson_index: 1,
      difficulty: 'hard',
    },
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Divisão com Resto',
      description: 'Aprende a dividir e a lidar com restos!',
      learning_objective: 'Efetuar divisões com e sem resto',
      story_context: 'A Fada da Partilha!',
      lesson_index: 2,
      difficulty: 'hard',
    },
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Frações e Decimais',
      description: 'Descobre a relação entre frações e decimais!',
      learning_objective: 'Converter frações em decimais simples',
      story_context: 'O alquimista vai transformar frações!',
      lesson_index: 3,
      difficulty: 'hard',
    },
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Perímetro e Área',
      description: 'Aprende a medir o contorno e o espaço!',
      learning_objective: 'Calcular perímetros e áreas simples',
      story_context: 'O arquiteto vai desenhar uma casa!',
      lesson_index: 4,
      difficulty: 'hard',
    },
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Gráficos e Tabelas',
      description: 'Aprende a ler e criar gráficos!',
      learning_objective: 'Interpretar gráficos e tabelas simples',
      story_context: 'O cientista vai analisar dados!',
      lesson_index: 5,
      difficulty: 'hard',
    },
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Números até 10 000',
      description: 'Domina números enormes até dez mil!',
      learning_objective: 'Ler e escrever números até 10 000',
      story_context: 'O explorador vai contar as estrelas do céu!',
      lesson_index: 6,
      difficulty: 'hard',
    },
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Frações Equivalentes',
      description: 'Descobre frações diferentes que valem o mesmo!',
      learning_objective: 'Identificar frações equivalentes',
      story_context: 'O alquimista vai transformar frações iguais!',
      lesson_index: 7,
      difficulty: 'hard',
    },
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Percentagens',
      description: 'Aprende o que são 10%, 25%, 50% e 100%!',
      learning_objective: 'Calcular percentagens simples',
      story_context: 'O banqueiro vai dividir lucros com percentagens!',
      lesson_index: 8,
      difficulty: 'hard',
    },
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Triângulos e Quadriláteros',
      description: 'Classifica figuras pelos lados e ângulos!',
      learning_objective: 'Classificar triângulos e quadriláteros',
      story_context: 'O arquiteto vai construir formas geométricas!',
      lesson_index: 9,
      difficulty: 'hard',
    },
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Probabilidades',
      description: 'Descobre o que é provável e o que é impossível!',
      learning_objective: 'Calcular probabilidades simples',
      story_context: 'O mágico vai prever o futuro com probabilidades!',
      lesson_index: 10,
      difficulty: 'hard',
    },

    // ===== GRADE 4 - ESTUDO DO MEIO =====
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'O Corpo Humano',
      description: 'Descobre como funciona o nosso corpo!',
      learning_objective: 'Identificar principais órgãos e funções',
      story_context: 'O Dr. Miúdo vai explorar o corpo humano!',
      lesson_index: 1,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'Os Direitos das Crianças',
      description: 'Conhece os teus direitos!',
      learning_objective: 'Identificar direitos das crianças',
      story_context: 'A advogada vai defender os nossos direitos!',
      lesson_index: 2,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'Os Ecossistemas',
      description: 'Descobre como os seres vivos se relacionam!',
      learning_objective: 'Compreender relações nos ecossistemas',
      story_context: 'O explorador vai visitar diferentes ecossistemas!',
      lesson_index: 3,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'O Ciclo da Água',
      description: 'Aprende como a água viaja pelo planeta!',
      learning_objective: 'Descrever o ciclo da água',
      story_context: 'A gotinha de água vai fazer uma grande viagem!',
      lesson_index: 4,
      difficulty: 'hard',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'Energia e Sustentabilidade',
      description: 'Aprende sobre energia e proteger o planeta!',
      learning_objective: 'Identificar fontes de energia e sustentabilidade',
      story_context: 'O engenheiro vai construir um futuro verde!',
      lesson_index: 5,
      difficulty: 'hard',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'Portugal na Europa',
      description: 'Descobre onde fica Portugal e os países vizinhos!',
      learning_objective: 'Localizar Portugal na Europa',
      story_context: 'O piloto vai voar pela Europa e mostrar Portugal!',
      lesson_index: 6,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'Continentes e Oceanos',
      description: 'Conhece os continentes e oceanos do planeta!',
      learning_objective: 'Identificar continentes e oceanos',
      story_context: 'O astronauta vai ver a Terra do espaço!',
      lesson_index: 7,
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'Leitura de Mapas',
      description: 'Aprende a ler mapas e a orientar-te!',
      learning_objective: 'Interpretar mapas simples e pontos cardeais',
      story_context: 'O explorador vai usar a bússola para navegar!',
      lesson_index: 8,
      difficulty: 'hard',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'Segurança Online',
      description: 'Aprende a usar a internet com segurança!',
      learning_objective: 'Identificar regras de segurança na internet',
      story_context: 'O agente Ciberguarda vai proteger as crianças online!',
      lesson_index: 9,
      difficulty: 'hard',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'Democracia e Cidadania',
      description: 'Descobre como funciona a democracia e os teus direitos!',
      learning_objective: 'Compreender conceitos de democracia e cidadania',
      story_context: 'A presidenta vai explicar como votamos e decidimos juntos!',
      lesson_index: 10,
      difficulty: 'hard',
    },
  ];

  // Insert lessons (if they don't exist)
  for (const lesson of sampleLessons) {
    try {
      await supabase
        .from('lessons')
        .insert(lesson)
        .select();
    } catch (error) {
      console.error('Error inserting sample lesson:', error);
    }
  }
}
