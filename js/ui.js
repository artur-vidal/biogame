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
    muteBtn.appendChild(Biogame.Assets.createImg('shield')); // Placeholder para ícone de mute

    hud.appendChild(scoreCont);
    hud.appendChild(timerCont);
    hud.appendChild(hearts);
    hud.appendChild(muteBtn);

    this.elements.stage.appendChild(hud);
    this.elements.hud = hud;
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
      plant.innerHTML = ''; // Inicia vazio
      plot.appendChild(plant);

      garden.appendChild(plot);
    }

    this.elements.stage.appendChild(garden);
    this.elements.garden = garden;
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
    Biogame.STR.intro.step1: // Error here, just a placeholder

    // Corrigindo a lógica de passos
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

    // Overlays de Over e Ranking seriam criados aqui (simplificado para M1)
  },

  setupEvents() {
    const playBtn = document.getElementById('btn-play');
    if (playBtn) {
      playBtn.onclick = () => {
        this.elements.intro.classList.remove('active');
        Biogame.Game.start();
      };
    }
  }
};
