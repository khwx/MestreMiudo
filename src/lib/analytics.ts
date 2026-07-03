import { supabase, isSupabaseConfigured } from './supabase';
import { logger } from './logger';

interface DailyScore {
  date: string;
  score: number;
  totalQuestions: number;
}

interface SubjectPerformance {
  subject: string;
  averageScore: number;
  totalQuizzes: number;
}

interface TopicPerformance {
  topic: string;
  averageScore: number;
  totalAttempts: number;
  status: 'strong' | 'weak';
}

interface LearningTrend {
  trend: 'improving' | 'declining' | 'stable';
  recentAverage: number;
  olderAverage: number;
  changePercent: number;
}

interface StudyRecommendation {
  topic: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
}

export async function getWeeklyProgress(studentId: string): Promise<DailyScore[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('quiz_history')
      .select('created_at, score, total_questions')
      .eq('student_id', studentId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const dailyMap = new Map<string, { score: number; total: number }>();
    data?.forEach((entry) => {
      const date = new Date(entry.created_at).toLocaleDateString('pt-PT');
      const existing = dailyMap.get(date) || { score: 0, total: 0 };
      existing.score += entry.score;
      existing.total += entry.total_questions;
      dailyMap.set(date, existing);
    });

    const result: DailyScore[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('pt-PT');
      const dayData = dailyMap.get(dateStr);
      result.push({
        date: dateStr,
        score: dayData ? Math.round((dayData.score / dayData.total) * 100) : 0,
        totalQuestions: dayData?.total || 0,
      });
    }

    return result;
  } catch (error) {
    logger.error('Erro ao buscar progresso semanal:', error);
    return [];
  }
}

export async function getSubjectPerformance(studentId: string): Promise<SubjectPerformance[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('quiz_history')
      .select('subject, score, total_questions')
      .eq('student_id', studentId);

    if (error) throw error;

    const subjectMap = new Map<string, { totalScore: number; totalQuestions: number; count: number }>();
    data?.forEach((entry) => {
      const subject = entry.subject || 'Geral';
      const existing = subjectMap.get(subject) || { totalScore: 0, totalQuestions: 0, count: 0 };
      existing.totalScore += entry.score;
      existing.totalQuestions += entry.total_questions;
      existing.count += 1;
      subjectMap.set(subject, existing);
    });

    return Array.from(subjectMap.entries()).map(([subject, stats]) => ({
      subject,
      averageScore: stats.totalQuestions > 0 ? Math.round((stats.totalScore / stats.totalQuestions) * 100) : 0,
      totalQuizzes: stats.count,
    }));
  } catch (error) {
    logger.error('Erro ao buscar desempenho por matéria:', error);
    return [];
  }
}

export async function getTopicAnalysis(studentId: string): Promise<TopicPerformance[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('quiz_history')
      .select('topic, score, total_questions')
      .eq('student_id', studentId);

    if (error) throw error;

    const topicMap = new Map<string, { totalScore: number; totalQuestions: number }>();
    data?.forEach((entry) => {
      if (!entry.topic) return;
      const existing = topicMap.get(entry.topic) || { totalScore: 0, totalQuestions: 0 };
      existing.totalScore += entry.score;
      existing.totalQuestions += entry.total_questions;
      topicMap.set(entry.topic, existing);
    });

    return Array.from(topicMap.entries()).map(([topic, stats]) => {
      const avg = stats.totalQuestions > 0 ? Math.round((stats.totalScore / stats.totalQuestions) * 100) : 0;
      return {
        topic,
        averageScore: avg,
        totalAttempts: stats.totalQuestions,
        status: avg >= 70 ? 'strong' : 'weak',
      };
    });
  } catch (error) {
    logger.error('Erro ao análise por tópico:', error);
    return [];
  }
}

export async function getLearningTrend(studentId: string): Promise<LearningTrend> {
  if (!isSupabaseConfigured() || !supabase) {
    return { trend: 'stable', recentAverage: 0, olderAverage: 0, changePercent: 0 };
  }

  try {
    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const { data: recentData } = await supabase
      .from('quiz_history')
      .select('score, total_questions')
      .eq('student_id', studentId)
      .gte('created_at', twoWeeksAgo.toISOString());

    const { data: olderData } = await supabase
      .from('quiz_history')
      .select('score, total_questions')
      .eq('student_id', studentId)
      .gte('created_at', fourWeeksAgo.toISOString())
      .lt('created_at', twoWeeksAgo.toISOString());

    const calcAvg = (rows: { score: number; total_questions: number }[] | null) => {
      if (!rows?.length) return 0;
      const totalS = rows.reduce((s, r) => s + r.score, 0);
      const totalQ = rows.reduce((s, r) => s + r.total_questions, 0);
      return totalQ > 0 ? Math.round((totalS / totalQ) * 100) : 0;
    };

    const recentAvg = calcAvg(recentData);
    const olderAvg = calcAvg(olderData);
    const change = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (change > 5) trend = 'improving';
    else if (change < -5) trend = 'declining';

    return { trend, recentAverage: recentAvg, olderAverage: olderAvg, changePercent: change };
  } catch (error) {
    logger.error('Erro ao calcular tendência:', error);
    return { trend: 'stable', recentAverage: 0, olderAverage: 0, changePercent: 0 };
  }
}

export async function generateStudyRecommendations(studentId: string): Promise<StudyRecommendation[]> {
  const topics = await getTopicAnalysis(studentId);
  const weakTopics = topics.filter(t => t.status === 'weak');

  const suggestions: Record<string, string> = {
    default: 'Pratica mais exercícios sobre este tópico.',
    matematica: 'Revisa as operações básicas e resolve problemas passo a passo.',
    portugues: ' Lê mais textos e pratica a conjugação de verbes.',
    ciencias: 'Explora experiências simples e lê sobre os temas.',
    historia: 'Cria linha do tempo dos acontecimentos principais.',
    geografia: 'Estuda mapas e memoriza capitais e continentes.',
  };

  return weakTopics
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 5)
    .map((topic, i) => ({
      topic: topic.topic,
      priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
      suggestion: suggestions[topic.topic.toLowerCase()] || suggestions.default,
    }));
}
