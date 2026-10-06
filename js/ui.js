window.Biogame = window.Biogame || {};

Biogame.UI = {
  elements: {},

  init() {
    this.createStage();
    this.createHUD();
    this.createGarden();
    this.createFactBar();
    this.createGenesBar();
    this.createOverlays();
    this.setupEvents();
    this.setupGameListeners();
  },

  createStage() {
    const stage = document.createElement('div');
    stage.id = 'stage';
    stage.appendChild(Biogame.Assets.createImg('background', { cover: true }));
    document.body.appendChild(stage);
    this.elements.stage = stage;
  },

  createHUD() {
    const hud = document.createElement('div');
    hud.id = 'hud';

    const scoreCont = document.createElement('div');
    scoreCont.id = 'score-container';
    scoreCont.innerHTML = `<div id="score">${Biogame.STR.hud.score}: 0</div><div id="combo"></div>`;

    const timerCont = document.createElement('div');
    timerCont.id = 'timer-container';
    timerCont.innerHTML = `<div id="timer">01:30</div><div id="timer-bar"><div id="timer-bar-fill"></div></div>`;

    const hearts = document.createElement('div');
    hearts.id = 'hearts';
    for (let i = 0; i < 3; i++) {
      hearts.appendChild(Biogame.Assets.createImg('heart_full'));
    }

    const muteBtn = document.createElement('button');
    muteBtn.id = 'mute-btn';

    hud.appendChild(scoreCont);
    hud.appendChild(timerCont);
    hud.appendChild(hearts);
    hud.appendChild(muteBtn);

    this.elements.stage.appendChild(hud);
    this.elements.hud = hud;
    this.elements.score = document.getElementById('score');
    this.elements.combo = document.getElementById('combo');
    this.elements.timer = document.getElementById('timer');
    this.elements.timerFill = document.getElementById('timer-bar-fill');
    this.elements.hearts = hearts;
  },

  createGarden() {
    const garden = document.createElement('div');
    garden.id = 'garden';

    for (let i = 0; i < 8; i++) {
      const plot = document.createElement('div');
      plot.className = 'plot';
      plot.dataset.id = i;

      const plotImg = Biogame.Assets.createImg('plot');
      plotImg.className = 'plot-img';
      plot.appendChild(plotImg);

      const plant = document.createElement('div');
      plant.className = 'plant';
      plot.appendChild(plant);

      garden.appendChild(plot);
    }

    this.elements.stage.appendChild(garden);
    this.elements.garden = garden;
    this.elements.plots = document.querySelectorAll('.plot');
  },

  createFactBar() {
    const bar = document.createElement('div');
    bar.id = 'fact-bar';
    bar.appendChild(Biogame.Assets.createImg('lia'));
    const text = document.createElement('p');
    text.id = 'fact';
    text.textContent = Biogame.STR.game.idle;
    bar.appendChild(text);

    this.elements.stage.appendChild(bar);
    this.elements.factBar = bar;
    this.elements.factText = text;
  },

  createGenesBar() {
    const bar = document.createElement('div');
    bar.id = 'genes';

    Biogame.DATA.types.forEach(type => {
      const btn = document.createElement('button');
      btn.className = 'gene-btn blocked';
      btn.dataset.type = type.id;
      btn.dataset.key = type.key;

      btn.appendChild(Biogame.Assets.createImg('gene_' + type.id));

      const label = document.createElement('span');
      label.textContent = '???';
      btn.appendChild(label);

      const keyLabel = document.createElement('span');
      keyLabel.className = 'key-label';
      keyLabel.textContent = type.key;
      btn.appendChild(keyLabel);

      bar.appendChild(btn);
    });

    this.elements.stage.appendChild(bar);
    this.elements.genesBar = bar;
    this.elements.geneBtns = document.querySelectorAll('.gene-btn');
  },

  createOverlays() {
    const intro = document.createElement('div');
    intro.id = 'overlay-intro';
    intro.className = 'overlay active';

    const panel = document.createElement('div');
    panel.className = 'panel';

    const title = document.createElement('h1');
    title.textContent = Biogame.STR.title;
    panel.appendChild(title);

    const subtitle = document.createElement('h2');
    subtitle.textContent = Biogame.STR.subtitle;
    panel.appendChild(subtitle);

    const steps = document.createElement('div');
    steps.className = 'steps';

    const stepData = [
      { img: 'threat_cold', text: Biogame.STR.intro.step1 },
      { img: 'gene_cold', text: Biogame.STR.intro.step2 },
      { img: 'plant_alive', text: Biogame.STR.intro.step3 }
    ];

    stepData.forEach(s => {
      const div = document.createElement('div');
      div.className = 'step';
      div.appendChild(Biogame.Assets.createImg(s.img));
      const p = document.createElement('p');
      p.textContent = s.text;
      div.appendChild(p);
      steps.appendChild(div);
    });

    panel.appendChild(steps);

    const tip = document.createElement('p');
    tip.style.fontStyle = 'italic';
    tip.textContent = Biogame.STR.intro.tip;
    panel.appendChild(tip);

    const playBtn = document.createElement('button');
    playBtn.className = 'btn-primary';
    playBtn.textContent = Biogame.STR.intro.play;
    playBtn.id = 'btn-play';
    panel.appendChild(playBtn);

    intro.appendChild(panel);
    this.elements.stage.appendChild(intro);
    this.elements.intro = intro;
  },

  setupEvents() {
    const playBtn = document.getElementById('btn-play');
    if (playBtn) {
      playBtn.onclick = () => {
        this.elements.intro.classList.remove('active');
        Biogame.Game.start();
      };
    }

    this.elements.geneBtns.forEach(btn => {
      btn.onclick = () => {
        const typeId = btn.dataset.type;
        // Remove a badge "NOVO!" ao clicar no botão
        btn.classList.remove('new');
        Biogame.Game.chooseGene(typeId);
      };
    });

    window.addEventListener('keydown', (e) => {
      const key = e.key;
      if (key >= '1' && key <= '5') {
        const btn = Array.from(this.elements.geneBtns).find(b => b.dataset.key === key);
        if (btn) btn.click();
      }
    });
  },


  setupGameListeners() {
    window.addEventListener('biogame:game-started', () => this.onGameStarted());
    window.addEventListener('biogame:threat-spawned', (e) => this.onThreatSpawned(e.detail));
    window.addEventListener('biogame:gene-correct', (e) => this.onGeneCorrect(e.detail));
    window.addEventListener('biogame:gene-wrong', (e) => this.onGeneWrong(e.detail));
    window.addEventListener('biogame:auto-defense', () => this.onAutoDefense());
    window.addEventListener('biogame:life-lost', () => this.onLifeLost());
    window.addEventListener('biogame:plant-withered', (e) => this.onPlantWithered(e.detail));
    window.addEventListener('biogame:plot-freed', (e) => this.onPlotFreed(e.detail));
    window.addEventListener('biogame:clone-born', (e) => this.onCloneBorn(e.detail));
    window.addEventListener('biogame:type-unlocked', (e) => this.onTypeUnlocked(e.detail));
    window.addEventListener('biogame:first-clone', () => this.onFirstClone());
    window.addEventListener('biogame:game-over', (e) => this.onGameOver(e.detail));
  },

  onGameStarted() {
    this.updateHUD();
    this.updateGarden();
  },

  updateHUD() {
    const state = Biogame.Game.state;
    this.elements.score.textContent = `${Biogame.STR.hud.score}: ${state.score}`;
    this.elements.combo.textContent = state.combo > 1 ? Biogame.format(Biogame.STR.hud.combo, { n: state.combo }) : '';

    const mins = Math.floor(state.timeLeft / 60);
    const secs = Math.floor(state.timeLeft % 60);
    this.elements.timer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const totalTime = Biogame.CONFIG.totalTime;
    this.elements.timerFill.style.width = `${(state.timeLeft / totalTime) * 100}%`;

    this.elements.hearts.innerHTML = '';
    for (let i = 0; i < state.lives; i++) {
      this.elements.hearts.appendChild(Biogame.Assets.createImg('heart_full'));
    }
    for (let i = state.lives; i < Biogame.CONFIG.lives; i++) {
      this.elements.hearts.appendChild(Biogame.Assets.createImg('heart_empty'));
    }
  },

  updateGarden() {
    const state = Biogame.Game.state;
    this.elements.plots.forEach((plotElem, idx) => {
      const plantId = state.plots[idx];
      const plantElem = plotElem.querySelector('.plant');
      plantElem.innerHTML = '';

      if (plantId !== null) {
        const plant = state.plants.find(p => p.id === plantId);
        if (plant && plant.status === 'alive') {
          const imgKey = plant.variant.includes('assets/img/') ?
                         plant.variant.split('/').pop().replace('.svg', '') :
                         plant.variant;
          plantElem.appendChild(Biogame.Assets.createImg(imgKey));

          const badges = document.createElement('div');
          badges.className = 'badges';
          plant.genes.forEach(geneId => {
            badges.appendChild(Biogame.Assets.createImg('gene_' + geneId));
          });
          plantElem.appendChild(badges);
        } else if (plant && plant.status === 'withered') {
          plantElem.appendChild(Biogame.Assets.createImg('plant_withered'));
        }
      }
    });
  },

  onThreatSpawned({ typeId, plantId, auto }) {
    this.updateHUD();
    this.updateGarden();
    if (auto) return;

    const plant = Biogame.Game.state.plants.find(p => p.id === plantId);
    const plotIdx = plant.plot;
    const plotElem = this.elements.plots[plotIdx];

    const bubble = document.createElement('div');
    bubble.className = 'threat-bubble';
    bubble.dataset.type = typeId;

    const type = Biogame.DATA.types.find(t => t.id === typeId);
    bubble.style.borderColor = `var(--color-threat-${typeId})`;

    bubble.appendChild(Biogame.Assets.createImg('threat_' + typeId));
    const name = document.createElement('span');
    name.textContent = type.threatName;
    bubble.appendChild(name);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '64');
    svg.setAttribute('height', '64');
    svg.style.position = 'absolute';
    svg.style.left = '0';
    svg.style.top = '0';
    svg.style.pointerEvents = 'none';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '32');
    circle.setAttribute('cy', '32');
    circle.setAttribute('r', '28');
    circle.setAttribute('stroke', `var(--color-threat-${typeId})`);
    circle.setAttribute('stroke-width', '4');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke-dasharray', '176');
    circle.setAttribute('stroke-dashoffset', '0');
    circle.setAttribute('stroke-linecap', 'round');
    circle.setAttribute('transform', 'rotate(-90 32 32)');

    svg.appendChild(circle);
    bubble.appendChild(svg);

    plotElem.appendChild(bubble);
    this.elements.currentBubble = bubble;
  },

  onGeneCorrect({ plantId, typeId, points, multiplier }) {
    this.updateHUD();
    this.updateGarden();
    this.removeBubble(typeId);

    const type = Biogame.DATA.types.find(t => t.id === typeId);
    this.elements.factText.textContent = type.fact;
  },

  onGeneWrong({ chosen, expected }) {
    this.updateHUD();
    this.removeBubble();

    const type = Biogame.DATA.types.find(t => t.id === expected);
    this.elements.factText.textContent = type ? Biogame.STR.game.wrong.replace('{label}', type.label) : 'Gene incorreto!';
  },

  onAutoDefense() {
    this.updateHUD();
    this.removeBubble();
  },

  onLifeLost() {
    this.updateHUD();
  },

  onPlantWithered({ plantId }) {
    this.updateGarden();
    this.removeBubble();
  },

  onPlotFreed({ plot }) {
    this.updateGarden();
  },

  onCloneBorn({ sourceId, newId, plot }) {
    this.updateGarden();
  },

  onTypeUnlocked({ typeId }) {
    const btn = Array.from(this.elements.geneBtns).find(b => b.dataset.type === typeId);
    if (btn) {
      btn.classList.remove('blocked');
      const label = btn.querySelector('span');
      const type = Biogame.DATA.types.find(t => t.id === typeId);
      label.textContent = type.geneName;
      btn.classList.add('new');
    }
  },

  onFirstClone() {
    this.elements.factText.textContent = Biogame.DATA.cloneFact;
  },

  onGameOver({ score, alive, reason }) {
    this.elements.intro.classList.add('active');
    const panel = this.elements.intro.querySelector('.panel');
    panel.innerHTML = `<h1>${reason === 'time' ? Biogame.STR.over.timeUp : Biogame.STR.over.lost}</h1>
                       <p>${Biogame.STR.over.score}: ${score}</p>
                       <p>${Biogame.STR.over.alive}: ${alive}</p>
                       <button class="btn-primary" onclick="location.reload()">${Biogame.STR.over.again}</button>`;
  },

  removeBubble(typeId = null) {
    if (typeId) {
      // Remove apenas a bolha da ameaça resolvida
      const bubble = document.querySelector(`.threat-bubble[data-type="${typeId}"]`);
      if (bubble) bubble.remove();
    } else {
      // Remove todas as bolhas (usado em erros graves ou fim de jogo)
      const bubbles = document.querySelectorAll('.threat-bubble');
      bubbles.forEach(b => b.remove());
    }
    this.elements.currentBubble = null;
  },



  update() {
    const state = Biogame.Game.state;
    if (state.phase !== 'playing') return;

    this.updateHUD();

    // Atualiza todos os anéis de tempo para todas as ameaças ativas
    state.threats.forEach(threat => {
      const bubble = document.querySelector(`.threat-bubble[data-type="${threat.typeId}"]`);
      if (bubble) {
        const circle = bubble.querySelector('circle');
        if (circle) {
          const offset = 176 * (1 - threat.timeLeft / threat.timeTotal);
          circle.setAttribute('stroke-dashoffset', offset.toString());
        }
      }
    });
  }
};
