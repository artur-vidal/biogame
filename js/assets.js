window.Biogame = window.Biogame || {};

Biogame.Assets = {
  DEFAULT_IMAGES: {
    background: 'assets/img/background.svg',
    lia: 'assets/img/lia.svg',
    plot: 'assets/img/plot.svg',
    plant_alive: 'assets/img/plant_alive.svg',
    plant_withered: 'assets/img/plant_withered.svg',
    heart_full: 'assets/img/heart_full.svg',
    heart_empty: 'assets/img/heart_empty.svg',
    threat_cold: 'assets/img/threat_cold.svg',
    threat_radiation: 'assets/img/threat_radiation.svg',
    threat_toxic_soil: 'assets/img/threat_toxic_soil.svg',
    threat_dehydration: 'assets/img/threat_dehydration.svg',
    threat_nitrogen: 'assets/img/threat_nitrogen.svg',
    gene_cold: 'assets/img/gene_cold.svg',
    gene_radiation: 'assets/img/gene_radiation.svg',
    gene_toxic_soil: 'assets/img/gene_toxic_soil.svg',
    gene_dehydration: 'assets/img/gene_dehydration.svg',
    gene_nitrogen: 'assets/img/gene_nitrogen.svg',
    shield: 'assets/img/shield.svg',
    clone_fx: 'assets/img/clone_fx.svg',
    logo: null
  },

  async loadAll() {
    const images = window.BiogameAssets.images;
    const promises = [];

    for (const key in images) {
      const val = images[key];
      if (!val) continue;

      const srcs = Array.isArray(val) ? val : [val];
      srcs.forEach(src => {
        promises.push(this._loadImage(src));
      });
    }

    await Promise.all(promises);
  },

  _loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = () => resolve(); // Não trava o jogo se falhar
    });
  },

  createImg(key, options = {}) {
    const img = document.createElement('img');
    img.className = 'asset' + (options.cover ? ' asset-cover' : '');

    const src = this._resolveSrc(key);
    img.src = src;

    img.onerror = () => {
      if (img.src !== this.DEFAULT_IMAGES[key]) {
        console.warn(`Falha ao carregar asset [${key}] no caminho ${img.src}. Usando padrão.`);
        img.src = this.DEFAULT_IMAGES[key];
      }
    };

    return img;
  },

  _resolveSrc(key) {
    const val = window.BiogameAssets.images[key];
    if (!val) return this.DEFAULT_IMAGES[key];
    if (Array.isArray(val)) {
      return val[Math.floor(Math.random() * val.length)];
    }
    return val;
  }
};
