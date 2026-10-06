window.Biogame = window.Biogame || {};

Biogame.Audio = {
  ctx: null,
  muted: false,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API não suportada.');
    }
  },

  async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  },

  setMuted(val) {
    this.muted = val;
    // Implementar mute global no AudioContext ou nos elementos Audio
  },

  // Sons sintetizados serão implementados no M5
  playSfx(key) {
    if (this.muted) return;
    const path = window.BiogameAssets.audio.sfx[key];
    if (path) {
      const audio = new Audio(path);
      audio.volume = window.BiogameAssets.volumes.sfx;
      audio.play().catch(() => {});
    } else {
      // Fallback para síntese (implementar no M5)
    }
  }
};
