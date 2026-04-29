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
      title: 'Genero do Nome',
      description: 'Descobre se os nomes são masculinos ou femininos!',
      learning_objective: 'Identificar género dos nomes',
      story_context: 'Vamos organizar o baú de brinquedos!',
      lesson_index: 2,
      difficulty: 'easy',
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

    // ===== GRADE 3 - PORTUGUÊS =====
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Texto Narrativo',
      description: 'Aprende a escrever histórias com início, meio e fim!',
      learning_objective: 'Criar textos narrativos',
      story_context: 'Vamos escrever a nossa própria aventura!',
      lesson_index: 1,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Sinónimos e Antónimos',
      description: 'Descobre palavras com significados iguais ou opostos!',
      learning_objective: 'Distinguir sinónimos de antónimos',
      story_context: 'O detetive das palavras vai investigar!',
      lesson_index: 2,
      difficulty: 'easy',
    },
    {
      subject: 'Português',
      grade_level: 3,
      title: 'Acentuação e Ortografia',
      description: 'Aprende a usar acentos corretamente!',
      learning_objective: 'Aplicar regras de acentuação',
      story_context: 'O Chapéu Mágico dos Acentos!',
      lesson_index: 3,
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
      difficulty: 'easy',
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
      description: 'Descobre as partes de um todo!',
      learning_objective: 'Identificar frações simples',
      story_context: 'A Pizza Mágica das Frações!',
      lesson_index: 3,
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
      difficulty: 'easy',
    },
    {
      subject: 'Estudo do Meio',
      grade_level: 3,
      title: 'Os Oceanos e Rios',
      description: 'Descobre a importância da água no planeta!',
      learning_objective: 'Conhecer oceanos e rios de Portugal',
      story_context: 'O Mergulhador vai explorar o fundo do mar!',
      lesson_index: 2,
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
      description: 'Descobre nomes, adjetivos, verbos e mais!',
      learning_objective: 'Classificar palavras por categoria gramatical',
      story_context: 'O Classificador de Palavras!',
      lesson_index: 2,
      difficulty: 'normal',
    },

    // ===== GRADE 4 - MATEMÁTICA =====
    {
      subject: 'Matemática',
      grade_level: 4,
      title: 'Multiplicação Mágica',
      description: 'Domina as tabuadas de multiplicar!',
      learning_objective: 'Aprender a multiplicação',
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
      description: 'Aprende sobre os teus direitos!',
      learning_objective: 'Conhecer a Convenção dos Direitos da Criança',
      story_context: 'O Guardião dos Direitos!',
      lesson_index: 2,
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
