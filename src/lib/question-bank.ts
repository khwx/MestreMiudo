/**
 * @fileOverview Comprehensive question bank for MestreMiudo
 * Re-export from modular question files
 */

export { questionBank, getAllQuestions, getFilteredQuestions, getRandomQuestions, getQuestionsBySubjectAndGrade, getTopicsForSubjectAndGrade, getQuestionStats, validateAnswer } from './questions';
export type { Question, Subject, GradeLevel, Difficulty, QuestionType } from './questions';
