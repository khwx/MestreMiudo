import { describe, it, expect } from 'vitest';
import { getDailyMotivation, getMilestoneMessage, generateFeedback } from '@/lib/feedback-system';

describe('getDailyMotivation', () => {
  it('returns a non-empty string', () => {
    const message = getDailyMotivation();
    expect(typeof message).toBe('string');
    expect(message.length).toBeGreaterThan(0);
  });
});

describe('getMilestoneMessage', () => {
  it('returns null for 0 quizzes', () => {
    expect(getMilestoneMessage(0)).toBeNull();
  });

  it('returns message for 1 quiz', () => {
    const message = getMilestoneMessage(1);
    expect(message).not.toBeNull();
    expect(typeof message).toBe('string');
  });

  it('returns message for 10 quizzes', () => {
    const message = getMilestoneMessage(10);
    expect(message).not.toBeNull();
  });

  it('returns message for 50 quizzes', () => {
    const message = getMilestoneMessage(50);
    expect(message).not.toBeNull();
  });
});

describe('generateFeedback', () => {
  it('returns feedback for correct answer', () => {
    const feedback = generateFeedback({
      question: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      studentAnswer: '4',
      topic: 'matematica',
      isCorrect: true,
      streak: 3,
    });
    expect(typeof feedback).toBe('string');
    expect(feedback.length).toBeGreaterThan(0);
  });

  it('returns feedback for incorrect answer', () => {
    const feedback = generateFeedback({
      question: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      studentAnswer: '3',
      topic: 'matematica',
      isCorrect: false,
      streak: 0,
    });
    expect(typeof feedback).toBe('string');
    expect(feedback.length).toBeGreaterThan(0);
  });
});
