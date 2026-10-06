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
    threats: [],
    gapLeft: 0,
    lockLeft: 0,
    unlocked: [],
    pendingNew: [],
    answeredTypes: [],
    cloned: false,
    endReason: null,
    lastTargetId: null,
    feverMode: false,
    feverTimer: 0
  },

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
    this.state.lastTargetId = null;

    this.state.plots = new Array(config.plots).fill(null);
    this.state.plants = [];

    config.startPlots.forEach(plotIdx => {
      this.addPlant(plotIdx);
    });

    this.state.unlocked = Biogame.DATA.types.map((type, idx) => {
      const isUnlocked = config.unlockAtCorrect[idx] === 0;
      if (isUnlocked) {
        this.state.pendingNew.push(type.id);
        this.emit('type-unlocked', { typeId: type.id });
      }
      return isUnlocked;
    });

    this.state.gapLeft = config.threat.gapStart;
    this.state.lockLeft = 0;
    this.state.threats = [];

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
      genes: [], // Toda planta inicia zerada
      status: 'alive',
      variant: plantVariant
    };

    this.state.plants.push(plant);
    this.state.plots[plotIdx] = id;
    return plant;
  },

  update(dt) {
    if (this.state.phase !== 'playing') return;

    this.state.timeLeft -= dt;
    if (this.state.timeLeft <= 0) {
      this.end('time');
      return;
    }

    // Gestão do Fever Mode
    if (this.state.feverMode) {
      this.state.feverTimer -= dt;
      if (this.state.feverTimer <= 0) {
        this.state.feverMode = false;
        this.emit('fever-ended');
      }
    }

    if (this.state.timeLeft <= 10 && Math.floor(this.state.timeLeft * 10) % 10 === 0) {
      this.emit('time-warning');
    }

    if (this.state.lockLeft > 0) {
      this.state.lockLeft -= dt;
      if (this.state.lockLeft < 0) this.state.lockLeft = 0;
    }

    if (this.state.threats.length > 0) {
      // Copiamos o array para evitar problemas de mutação durante o loop
      const currentThreats = [...this.state.threats];
      currentThreats.forEach((threat) => {
        // Encontramos o índice atual da ameaça, pois o array original muda com splice
        const idx = this.state.threats.findIndex(t => t === threat);
        if (idx === -1) return;

        threat.timeLeft -= dt;
        if (threat.timeLeft <= 0) {
          this.resolveThreat('timeout', idx);
        }
      });
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

    const timeTotal = Math.max(config.threat.minTime, config.threat.startTime - config.threat.step * this.state.correctCount);
    const gap = Math.max(config.threat.gapMin, config.threat.gapStart - config.threat.gapStep * this.state.correctCount);

    // Lógica para múltiplas ameaças simultâneas
    // Aumentamos a chance de spawnar ameaças extras para aumentar a dificuldade
    if (this.state.threats.length < 3 && this.rng() < 0.6) {
       this.createSingleThreat(timeTotal, gap);
    }

    // Spawna a ameaça principal do ciclo
    this.createSingleThreat(timeTotal, gap);
  },

  createSingleThreat(timeTotal, gap) {
    const config = Biogame.CONFIG;
    const types = Biogame.DATA.types;

    let typeId;
    if (this.state.pendingNew.length > 0) {
      typeId = this.state.pendingNew.shift();
      this.emit('new-type', { typeId });
    } else {
      const unlockedTypes = types.filter((t, idx) => this.state.unlocked[idx]);
      let possibleTypes = unlockedTypes;
      if (unlockedTypes.length > 1) {
        const activeTypes = this.state.threats.map(t => t.typeId);
        possibleTypes = unlockedTypes.filter(t => !activeTypes.includes(t.id));
        if (possibleTypes.length === 0) possibleTypes = unlockedTypes;
      }
      const chosen = possibleTypes[Math.floor(this.rng() * possibleTypes.length)];
      typeId = chosen.id;
    }

    const alivePlants = this.state.plants.filter(p => p.status === 'alive');
    if (alivePlants.length === 0) return;

    const availableTargets = alivePlants.filter(p => p.id !== this.state.lastTargetId);
    const targets = availableTargets.length > 0 ? availableTargets : alivePlants;

    // Restrição: Uma planta não pode ter mais de uma ameaça ativa ao mesmo tempo
    const plantsWithoutThreats = targets.filter(p =>
      !this.state.threats.some(t => t.plantId === p.id)
    );

    const finalTargets = plantsWithoutThreats.length > 0 ? plantsWithoutThreats : targets;

    const plantsLackingGene = finalTargets.filter(p => !p.genes.includes(typeId));
    let targetPlant;
    if (plantsLackingGene.length > 0 && this.rng() < config.threat.preferLackingChance) {
      targetPlant = plantsLackingGene[Math.floor(this.rng() * plantsLackingGene.length)];
    } else {
      targetPlant = finalTargets[Math.floor(this.rng() * finalTargets.length)];
    }

    this.state.lastTargetId = targetPlant.id;

    if (targetPlant.genes.includes(typeId)) {
      // A planta já possui o gene, ignoramos completamente para evitar ameaças invisíveis
      return;
    } else {
      // IMPORTANTE: Validamos se a planta já tem outra ameaça ativa
      // Se tiver, não criamos esta para evitar sobrecarga e "deaths" invisíveis
      if (this.state.threats.some(t => t.plantId === targetPlant.id)) {
        return;
      }

      this.state.threats.push({
        typeId,
        plantId: targetPlant.id,
        timeTotal: timeTotal,
        timeLeft: timeTotal
      });
      this.emit('threat-spawned', { typeId, plantId: targetPlant.id, auto: false });
    }
  },

  resolveAutoDefense() {
    this.state.score += Biogame.CONFIG.score.autoDefense;
    this.emit('auto-defense');
  },

  chooseGene(typeId) {
    if (this.state.phase !== 'playing' || this.state.threats.length === 0) return;
    if (!this.state.unlocked[Biogame.DATA.types.findIndex(t => t.id === typeId)]) return;

    const targetIndex = this.state.threats.findIndex(t => t.typeId === typeId);

    if (targetIndex !== -1) {
      this.resolveThreat('correct', targetIndex);
    } else {
      this.resolveThreat('wrong', -1, typeId);
    }
  },

  resolveThreat(result, index, chosenId = null) {
    const config = Biogame.CONFIG;

    if (result === 'correct') {
      const threat = this.state.threats[index];
      this.state.combo += 1;
      const multiplier = Math.min(config.score.comboMax, 1 + Math.floor((this.state.combo - 1) / config.score.comboEvery));

      // Gamificação: Perfect Timing (últimos 10% do tempo)
      const isPerfect = threat.timeLeft / threat.timeTotal < 0.1;
      const speedBonus = Math.round(config.score.speedBonusMax * (threat.timeLeft / threat.timeTotal));

      let points = (config.score.correct + speedBonus) * multiplier;
      if (isPerfect) points *= 2; // Bônus massivo para Perfect

      // UTILIDADE DO FEVER MODE: Pontos em dobro durante a Febre
      if (this.state.feverMode) {
        points *= 2;
      }

      this.state.score += points;
      this.state.correctCount += 1;

      const plant = this.state.plants.find(p => p.id === threat.plantId);
      plant.genes.push(threat.typeId);

      if (!this.state.answeredTypes.includes(threat.typeId)) {
        this.state.answeredTypes.push(threat.typeId);
      }

      this.emit('gene-correct', {
        plantId: plant.id,
        typeId: threat.typeId,
        points,
        multiplier,
        isPerfect
      });

      // Gamificação: Combo Fever Mode (ativa com 10 combos)
      if (this.state.combo >= 10 && !this.state.feverMode) {
        this.state.feverMode = true;
        this.state.feverTimer = 10.0; // Aumentado para 10 segundos para melhor aproveitamento
        this.emit('fever-started');
      }

      setTimeout(() => {
        if (this.state.phase === 'playing') this.handleCloning(plant);
      }, config.cloneDelay * 1000);

      Biogame.DATA.types.forEach((type, idx) => {
        if (!this.state.unlocked[idx] && this.state.correctCount >= config.unlockAtCorrect[idx]) {
          this.state.unlocked[idx] = true;
          this.state.pendingNew.push(type.id);
          this.emit('type-unlocked', { typeId: type.id });
        }
      });

      this.state.threats.splice(index, 1);
      this.state.lockLeft = 0.3;
      this.state.gapLeft = Math.max(config.threat.gapMin, config.threat.gapStart - config.threat.gapStep * this.state.correctCount);

    } else if (result === 'wrong') {
      this.state.lives -= 1;
      this.state.combo = 0;
      this.emit('gene-wrong', { chosen: chosenId, expected: 'Qualquer um dos genes pedidos' });

      this.state.threats = [];
      this.state.lockLeft = config.wrongRecoveryTime;
      this.state.gapLeft = Math.max(config.threat.gapMin, config.threat.gapStart - config.threat.gapStep * this.state.correctCount);

      if (this.state.lives <= 0) {
        this.end('lives');
      }

    } else if (result === 'timeout') {
      // Importante: Verificar se a ameaça ainda existe (evita double-dip se houver timeouts simultâneos)
      if (index < 0 || index >= this.state.threats.length) return;

      const threat = this.state.threats[index];
      this.state.lives -= 1;
      this.state.combo = 0;

      const plant = this.state.plants.find(p => p.id === threat.plantId);
      if (plant) {
        plant.status = 'withered';
      }

      this.emit('life-lost');
      this.emit('plant-withered', { plantId: threat.plantId });

      setTimeout(() => {
        if (this.state.phase === 'playing') {
          const p = this.state.plants.find(pl => pl.id === threat.plantId);
          if (p) {
            this.state.plots[p.plot] = null;
            this.emit('plot-freed', { plot: p.plot });
          }
        }
      }, config.witherTime * 1000);

      this.state.threats.splice(index, 1);
      this.state.lockLeft = 0;
      this.state.gapLeft = Math.max(config.threat.gapMin, config.threat.gapStart - config.threat.gapStep * this.state.correctCount);

      if (this.state.lives <= 0) {
        this.end('lives');
      } else if (this.state.plants.filter(p => p.status === 'alive').length === 0) {
        this.end('extinct');
      }
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
