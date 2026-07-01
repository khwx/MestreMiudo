export { updateStudentStreak, getStudentStreak } from './streaks';
export {
  getPerformanceData,
  generateQuiz,
  saveQuizResults,
  getFullQuizHistory,
} from './quiz';
export {
  generateStoryAction,
  getStudentStories,
} from './stories';
export {
  generateDiagnostic,
  saveDiagnosticResults,
  checkDiagnosticNeeded,
} from './diagnostic';
export {
  awardQuizPoints,
  getStudentRewards,
  updateStudentRewardsWithCoinsAction,
  getStudentLessonHistoryAction,
  initializeStudent,
} from './rewards';
export {
  buyShopItem,
  getUserInventory,
  equipInventoryItem,
  getShopItems,
  generateLessonChallengesAction,
  getStudentAchievements,
  unlockAchievement,
} from './shop';
export {
  getLessonDataAction,
  getLessonsForSubjectAction,
  getStudentLessonProgressAction,
  saveLessonCompletionAction,
} from './lessons';