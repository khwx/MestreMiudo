export { updateStudentStreak, getStudentStreak } from './streaks';
export {
  getPerformanceData,
  generateQuiz,
  generateTopicQuiz,
  saveQuizResults,
  getFullQuizHistory,
} from './quiz';
export {
  generateStoryAction,
  getStudentStories,
  deleteStory,
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
  getNextLessonAction,
  saveLessonCompletionAction,
} from './lessons';
export {
  getDailyGoalAction,
  setDailyGoalAction,
} from './daily-goals';