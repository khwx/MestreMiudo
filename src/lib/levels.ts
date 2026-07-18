const levelThresholds = [
  { level: 1, points: 0 },
  { level: 2, points: 100 },
  { level: 3, points: 300 },
  { level: 4, points: 600 },
  { level: 5, points: 1000 },
  { level: 6, points: 1500 },
];

export function calculateLevel(totalPoints: number) {
  let currentLevel = 1;
  let pointsForNextLevel = 100;
  let pointsAtCurrentLevel = 0;

  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= levelThresholds[i].points) {
      currentLevel = levelThresholds[i].level;
      pointsAtCurrentLevel = levelThresholds[i].points;
      if (i < levelThresholds.length - 1) {
        pointsForNextLevel = levelThresholds[i + 1].points;
      } else {
        pointsForNextLevel = Infinity;
      }
      break;
    }
  }

  const pointsToNext = pointsForNextLevel - pointsAtCurrentLevel;
  const progressInLevel = totalPoints - pointsAtCurrentLevel;
  const progressPercentage = pointsToNext > 0 && pointsToNext !== Infinity ? (progressInLevel / pointsToNext) * 100 : 100;

  return {
    level: currentLevel,
    nextLevel: currentLevel + 1,
    progressPercentage,
    pointsNeeded: pointsToNext === Infinity ? 0 : pointsToNext - progressInLevel,
  };
}
