window.Biogame = window.Biogame || {};

Biogame.CONFIG = {
  totalTime: 90, lives: 3, plots: 8, startPlants: 2, startPlots: [1, 2],
  threat: { startTime: 5.0, step: 0.12, minTime: 2.5, gapStart: 1.2, gapStep: 0.03, gapMin: 0.5, preferLackingChance: 0.75 },
  unlockAtCorrect: [0, 0, 3, 6, 9],
  autoDefenseTime: 0.9, witherTime: 1.5, cloneDelay: 0.6, wrongRecoveryTime: 0.6,
  score: { correct: 100, speedBonusMax: 50, autoDefense: 20, fullGarden: 25, endPlant: 50, comboEvery: 3, comboMax: 5 },
  rankingSize: 10,
  storagePrefix: 'biogame.v1.'
};
