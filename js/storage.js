window.Biogame = window.Biogame || {};

Biogame.Storage = {
  available: true,
  _mem: {},

  init() {
    try {
      localStorage.setItem(this.testKey, '1');
      localStorage.removeItem(this.testKey);
    } catch (e) {
      this.available = false;
      console.warn('LocalStorage não disponível, usando fallback em memória.');
    }
  },

  get(key, defaultValue) {
    const fullKey = Biogame.CONFIG.storagePrefix + key;
    if (!this.available) return this._mem[fullKey] !== undefined ? this._mem[fullKey] : defaultValue;
    try {
      const val = localStorage.getItem(fullKey);
      return val !== null ? JSON.parse(val) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  set(key, value) {
    const fullKey = Biogame.CONFIG.storagePrefix + key;
    if (!this.available) {
      this._mem[fullKey] = value;
      return;
    }
    try {
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch (e) {
      console.error('Erro ao salvar no LocalStorage', e);
    }
  },

  remove(key) {
    const fullKey = Biogame.CONFIG.storagePrefix + key;
    if (!this.available) {
      delete this._mem[fullKey];
      return;
    }
    localStorage.removeItem(fullKey);
  },

  // Lógica de Ranking para Marco 4
  saveScore(initials, score) {
    const ranking = this.get('ranking', []);

    ranking.push({
      initials: initials.toUpperCase(),
      score: score,
      date: Date.now()
    });

    // Ordena por score (decrescente)
    ranking.sort((a, b) => b.score - a.score);

    // Mantém apenas o Top N (definido no CONFIG)
    const topLimit = Biogame.CONFIG.rankingSize || 10;
    const result = ranking.slice(0, topLimit);

    this.set('ranking', result);
    return result;
  },

  getRanking() {
    return this.get('ranking', []);
  }
};

Biogame.Storage.testKey = 'biogame_storage_test';
