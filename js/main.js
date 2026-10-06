window.Biogame = window.Biogame || {};

Biogame.Main = {
  lastTime: 0,

  async init() {
    console.log('Biogame initializing...');

    // Ordem de inicialização
    Biogame.Storage.init();
    await Biogame.Assets.loadAll();
    Biogame.UI.init();
    Biogame.Audio.init();

    window.addEventListener('resize', () => this.resize());
    this.resize();

    this.loop();
  },

  resize() {
    const stage = document.getElementById('stage');
    if (!stage) return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const stageW = 1280;
    const stageH = 720;

    const scale = Math.min(winW / stageW, winH / stageH);

    stage.style.width = `${stageW}px`;
    stage.style.height = `${stageH}px`;
    stage.style.transform = `scale(${scale})`;
    stage.style.position = 'absolute';

    // Centralização robusta
    stage.style.left = '50%';
    stage.style.top = '50%';
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  },



  loop() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    Biogame.Game.update(dt);
    Biogame.UI.update();

    requestAnimationFrame(() => this.loop());
  }
};

window.addEventListener('load', () => Biogame.Main.init());
