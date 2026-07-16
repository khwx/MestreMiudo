import { describe, it, expect } from 'vitest';
import {
  QuizInputSchema,
  QuizResultSchema,
  AnswerSchema,
  LessonChallengeSchema,
  LessonSchema,
  LessonCompletionSchema,
  PersonalizedLearningPathInputSchema,
} from '@/app/shared-schemas';

describe('QuizInputSchema', () => {
  it('validates correct input', () => {
    const result = QuizInputSchema.safeParse({
      studentId: 'student1',
      gradeLevel: 2,
      subject: 'Matemática',
      numberOfQuestions: 5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid grade level', () => {
    const result = QuizInputSchema.safeParse({
      studentId: 'student1',
      gradeLevel: 5,
      subject: 'Matemática',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid subject', () => {
    const result = QuizInputSchema.safeParse({
      studentId: 'student1',
      gradeLevel: 2,
      subject: 'Ciências',
    });
    expect(result.success).toBe(false);
  });
});

describe('QuizResultSchema', () => {
  it('validates correct quiz result', () => {
    const result = QuizResultSchema.safeParse({
      studentId: 'student1',
      gradeLevel: 2,
      subject: 'Matemática',
      numberOfQuestions: 5,
      timestamp: new Date().toISOString(),
      quiz: {},
      answers: [],
      score: 4,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = QuizResultSchema.safeParse({
      studentId: 'student1',
    });
    expect(result.success).toBe(false);
  });
});

describe('AnswerSchema', () => {
  it('validates correct answer', () => {
    const result = AnswerSchema.safeParse({
      question: 'What is 2+2?',
      selectedAnswer: '4',
      correctAnswer: '4',
      isCorrect: true,
      topic: 'Matemática',
    });
    expect(result.success).toBe(true);
  });

  it('rejects answer with wrong types', () => {
    const result = AnswerSchema.safeParse({
      question: 'What is 2+2?',
      selectedAnswer: 4,
      correctAnswer: '4',
      isCorrect: 'true',
      topic: 'Matemática',
    });
    expect(result.success).toBe(false);
  });
});

describe('LessonChallengeSchema', () => {
  it('validates multiple choice challenge', () => {
    const result = LessonChallengeSchema.safeParse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      challenge_type: 'multiple_choice',
      question: 'What is 2+2?',
      content: { correct_answer: '4', options: ['3', '4', '5'] },
      hint: 'Think about addition',
    });
    expect(result.success).toBe(true);
  });

  it('validates fill_blank challenge', () => {
    const result = LessonChallengeSchema.safeParse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      challenge_type: 'fill_blank',
      question: 'O gato ____ no telhado.',
      content: { correct_answers: ['mia', 'miava'] },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid challenge type', () => {
    const result = LessonChallengeSchema.safeParse({
      challenge_type: 'invalid_type',
      question: 'Test',
      content: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('LessonSchema', () => {
  it('validates correct lesson', () => {
    const result = LessonSchema.safeParse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      subject: 'Português',
      grade_level: 1,
      title: 'Aprendendo a ler',
      lesson_index: 1,
      difficulty: 'easy',
      challenges: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid grade level', () => {
    const result = LessonSchema.safeParse({
      subject: 'Português',
      grade_level: 5,
      title: 'Test',
      lesson_index: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe('LessonCompletionSchema', () => {
  it('validates correct completion', () => {
    const result = LessonCompletionSchema.safeParse({
      student_id: 'student1',
      lesson_id: '123e4567-e89b-12d3-a456-426614174000',
      completed: true,
      stars: 3,
      coins_earned: 50,
      score: 100,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid stars', () => {
    const result = LessonCompletionSchema.safeParse({
      student_id: 'student1',
      lesson_id: '123e4567-e89b-12d3-a456-426614174000',
      completed: true,
      stars: 5,
    });
    expect(result.success).toBe(false);
  });
});

describe('PersonalizedLearningPathInputSchema', () => {
  it('validates correct input', () => {
    const result = PersonalizedLearningPathInputSchema.safeParse({
      studentId: 'student1',
      gradeLevel: 2,
      subject: 'Matemática',
      numberOfQuestions: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rejects number of questions below minimum', () => {
    const result = PersonalizedLearningPathInputSchema.safeParse({
      studentId: 'student1',
      gradeLevel: 2,
      numberOfQuestions: 3,
    });
    expect(result.success).toBe(false);
  });

  it('rejects number of questions above maximum', () => {
    const result = PersonalizedLearningPathInputSchema.safeParse({
      studentId: 'student1',
      gradeLevel: 2,
      numberOfQuestions: 25,
    });
    expect(result.success).toBe(false);
  });
});
