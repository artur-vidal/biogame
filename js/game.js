window.Biogame = window.Biogame || {};

// Gerador de números pseudo-aleatórios com seed (Mulberry32)
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

Biogame.Game = {
  rng: null,
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

  // Eventos simples via CustomEvent para a UI assinar
  emit(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(`biogame:${name}`, { detail }));
  },

  start() {
    const seedParam = new URLSearchParams(window.location.search).get('seed');
    const seed = seedParam ? parseInt(seedParam) : Date.now();
    this.rng = mulberry32(seed);

    const config = Biogame.CONFIG;

    this.state.phase = 'playing';
    this.state.timeLeft = config.totalTime;
    this.state.lives = config.lives;
    this.state.score = 0;
    this.state.combo = 0;
    this.state.correctCount = 0;
    this.state.cloned = false;
    this.state.endReason = null;
    this.state.answeredTypes = [];
    this.state.pendingNew = [];

    // Inicializa plots (8 posições)
    this.state.plots = new Array(config.plots).fill(null);
    this.state.plants = [];

    // Coloca as plantas iniciais
    config.startPlots.forEach(plotIdx => {
      this.addPlant(plotIdx);
    });

    // Libera genes iniciais
    this.state.unlocked = Biogame.DATA.types.map((type, idx) => {
      const isUnlocked = config.unlockAtCorrect[idx] === 0;
      if (isUnlocked) this.state.pendingNew.push(type.id);
      return isUnlocked;
    });

    this.state.gapLeft = config.threat.gapStart;
    this.state.lockLeft = 0;
    this.state.threat = null;

    this.emit('game-started');
  },

  addPlant(plotIdx, genes = [], variant = null) {
    const id = this.state.plants.length;
    const plantVariant = variant !== null ? variant :
      (window.BiogameAssets.images.plant_alive.length > 1 ?
       window.BiogameAssets.images.plant_alive[Math.floor(this.rng() * window.BiogameAssets.images.plant_alive.length)] :
       window.BiogameAssets.images.plant_alive[0]);

    const plant = {
      id,
      plot: plotIdx,
      genes: [...genes],
      status: 'alive',
      variant: plantVariant
    };

    this.state.plants.push(plant);
    this.state.plots[plotIdx] = id;
    return plant;
  },

  update(dt) {
    if (this.state.phase !== 'playing') return;

    // 1. Cronômetro Geral
    this.state.timeLeft -= dt;
    if (this.state.timeLeft <= 0) {
      this.end('time');
      return;
    }

    // Aviso de tempo final
    if (this.state.timeLeft <= 10 && Math.floor(this.state.timeLeft * 10) % 10 === 0) {
      this.emit('time-warning');
    }

    // 2. Trava de animação
    if (this.state.lockLeft > 0) {
      this.state.lockLeft -= dt;
      if (this.state.lockLeft < 0) this.state.lockLeft = 0;
    }

    // 3. Gestão de Ameaças
    if (this.state.threat) {
      this.state.threat.timeLeft -= dt;
      if (this.state.threat.timeLeft <= 0) {
        this.resolveThreat('timeout');
      }
    } else if (this.state.lockLeft === 0) {
      this.state.gapLeft -= dt;
      if (this.state.gapLeft <= 0) {
        this.spawnThreat();
      }
    }
  },

  spawnThreat() {
    const config = Biogame.CONFIG;
    const types = Biogame.DATA.types;

    // Tempo da ameaça e intervalo seguinte
    const timeTotal = Math.max(config.threat.minTime, config.threat.startTime - config.threat.step * this.state.correctCount);
    const gap = Math.max(config.threat.gapMin, config.threat.gapStart - config.threat.gapStep * this.state.correctCount);

    // Escolha do Tipo
    let typeId;
    if (this.state.pendingNew.length > 0) {
      typeId = this.state.pendingNew.shift();
      this.emit('new-type', { typeId });
    } else {
      const unlockedTypes = types.filter((t, idx) => this.state.unlocked[idx]);
      // Evita repetir o anterior se houver mais de um
      let possibleTypes = unlockedTypes;
      if (unlockedTypes.length > 1 && this.state.threat) {
        possibleTypes = unlockedTypes.filter(t => t.id !== this.state.threat.typeId);
      }
      const chosen = possibleTypes[Math.floor(this.rng() * possibleTypes.length)];
      typeId = chosen.id;
    }

    // Escolha da Planta Alvo
    const alivePlants = this.state.plants.filter(p => p.status === 'alive');
    if (alivePlants.length === 0) {
      this.end('extinct');
      return;
    }

    const plantsLackingGene = alivePlants.filter(p => !p.genes.includes(typeId));
    let targetPlant;
    if (plantsLackingGene.length > 0 && this.rng() < config.threat.preferLackingChance) {
      targetPlant = plantsLackingGene[Math.floor(this.rng() * plantsLackingGene.length)];
    } else {
      targetPlant = alivePlants[Math.floor(this.rng() * alivePlants.length)];
    }

    // Defesa Automática
    if (targetPlant.genes.includes(typeId)) {
      this.emit('threat-spawned', { typeId, plantId: targetPlant.id, auto: true });
      this.resolveAutoDefense();
      this.state.gapLeft = gap;
      this.state.lockLeft = config.autoDefenseTime;
    } else {
      this.state.threat = {
        typeId,
        plantId: targetPlant.id,
        timeTotal: timeTotal,
        timeLeft: timeTotal
      };
      this.emit('threat-spawned', { typeId, plantId: targetPlant.id, auto: false });
      this.state.gapLeft = gap;
    }
  },

  resolveAutoDefense() {
    this.state.score += Biogame.CONFIG.score.autoDefense;
    this.emit('auto-defense');
  },

  chooseGene(typeId) {
    if (this.state.phase !== 'playing' || !this.state.threat) return;
    if (!this.state.unlocked[Biogame.DATA.types.findIndex(t => t.id === typeId)]) return;

    if (typeId === this.state.threat.typeId) {
      this.resolveThreat('correct');
    } else {
      this.resolveThreat('wrong', typeId);
    }
  },

  resolveThreat(result, chosenId = null) {
    const config = Biogame.CONFIG;
    const threat = this.state.threat;

    if (result === 'correct') {
      // Pontos e Combo
      this.state.combo += 1;
      const multiplier = Math.min(config.score.comboMax, 1 + Math.floor((this.state.combo - 1) / config.score.comboEvery));
      const speedBonus = Math.round(config.score.speedBonusMax * (threat.timeLeft / threat.timeTotal));
      const points = (config.score.correct + speedBonus) * multiplier;

      this.state.score += points;
      this.state.correctCount += 1;

      // Gene
      const plant = this.state.plants.find(p => p.id === threat.plantId);
      plant.genes.push(threat.typeId);

      const type = Biogame.DATA.types.find(t => t.id === threat.typeId);
      if (!this.state.answeredTypes.includes(threat.typeId)) {
        this.state.answeredTypes.push(threat.typeId);
      }

      this.emit('gene-correct', { plantId: plant.id, typeId: threat.typeId, points, multiplier });

      // Clone
      setTimeout(() => {
        if (this.state.phase === 'playing') this.handleCloning(plant);
      }, config.cloneDelay * 1000);

      // Liberação de novos genes
      Biogame.DATA.types.forEach((type, idx) => {
        if (!this.state.unlocked[idx] && this.state.correctCount >= config.unlockAtCorrect[idx]) {
          this.state.unlocked[idx] = true;
          this.state.pendingNew.push(type.id);
          this.emit('type-unlocked', { typeId: type.id });
        }
      });

      this.state.threat = null;
      this.state.lockLeft = 0.3;
      this.state.gapLeft = Math.max(config.threat.gapMin, config.threat.gapStart - config.threat.gapStep * this.state.correctCount);

    } else if (result === 'wrong') {
      this.state.lives -= 1;
      this.state.combo = 0;
      this.emit('gene-wrong', { chosen: chosenId, expected: threat.typeId });

      this.state.threat = null;
      this.state.lockLeft = config.wrongRecoveryTime;
      this.state.gapLeft = Math.max(config.threat.gapMin, config.threat.gapStart - config.threat.gapStep * this.state.correctCount);

      if (this.state.lives <= 0) this.end('lives');

    } else if (result === 'timeout') {
      this.state.lives -= 1;
      this.state.combo = 0;

      const plant = this.state.plants.find(p => p.id === threat.plantId);
      plant.status = 'withered';

      this.emit('life-lost');
      this.emit('plant-withered', { plantId: plant.id });

      setTimeout(() => {
        if (this.state.phase === 'playing') {
          this.state.plots[plant.plot] = null;
          this.emit('plot-freed', { plot: plant.plot });
        }
      }, config.witherTime * 1000);

      this.state.threat = null;
      this.state.lockLeft = 0;
      this.state.gapLeft = Math.max(config.threat.gapMin, config.threat.gapStart - config.threat.gapStep * this.state.correctCount);

      if (this.state.lives <= 0) this.end('lives');
      if (this.state.plants.filter(p => p.status === 'alive').length === 0) this.end('extinct');
    }
  },

  handleCloning(sourcePlant) {
    const freePlots = this.state.plots.map((p, i) => p === null ? i : null).filter(p => p !== null);
    if (freePlots.length === 0) {
      this.state.score += Biogame.CONFIG.score.fullGarden;
      this.emit('garden-full');
      return;
    }

    const plotIdx = freePlots[Math.floor(this.rng() * freePlots.length)];
    const newPlant = this.addPlant(plotIdx, sourcePlant.genes, sourcePlant.variant);

    if (!this.state.cloned) {
      this.state.cloned = true;
      this.emit('first-clone');
    }

    this.emit('clone-born', { sourceId: sourcePlant.id, newId: newPlant.id, plot: plotIdx });
  },

  end(reason) {
    this.state.phase = 'over';
    this.state.endReason = reason;

    const aliveCount = this.state.plants.filter(p => p.status === 'alive').length;
    this.state.score += aliveCount * Biogame.CONFIG.score.endPlant;

    this.emit('game-over', {
      score: this.state.score,
      alive: aliveCount,
      reason: reason
    });
  }
};
