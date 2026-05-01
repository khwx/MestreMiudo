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
  answers: Record<string, any>,
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
      difficulty: 'normal',
    },
    {
      subject: 'Português',
      grade_level: 4,
      title: 'Textos Informativos',
      description: 'Aprende a ler e escrever textos informativos!',
      learning_objective: 'Identificar características de textos informativos',
      story_context: 'O jornalista vai escrever uma notícia!',
      lesson_index: 5,
      difficulty: 'normal',
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
      difficulty: 'normal',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 4,
      title: 'Energia e Sustentabilidade',
      description: 'Aprende sobre energia e proteger o planeta!',
      learning_objective: 'Identificar fontes de energia e sustentabilidade',
      story_context: 'O engenheiro vai construir um futuro verde!',
      lesson_index: 5,
      difficulty: 'normal',
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
