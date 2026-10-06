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
  }
};

Biogame.Storage.testKey = 'biogame_storage_test';
