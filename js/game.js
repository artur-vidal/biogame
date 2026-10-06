window.Biogame = window.Biogame || {};

Biogame.Game = {
  state: {
    phase: 'idle',
    timeLeft: 0,
    lives: 0,
    score: 0,
    combo: 0,
    correctCount: 0,
    plants: [],
    plots: [],
    threat: null,
    gapLeft: 0,
    lockLeft: 0,
    unlocked: [],
    pendingNew: [],
    answeredTypes: [],
    cloned: false,
    endReason: null
  },

  start() {
    console.log('Game starting...');
    this.state.phase = 'playing';
    // Regras completas no M2
  },

  update(dt) {
    if (this.state.phase !== 'playing') return;
    // Regras completas no M2
  },

  chooseGene(typeId) {
    console.log('Gene chosen:', typeId);
    // Regras completas no M2
  }
};
