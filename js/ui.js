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

    // Fever Bar Indicator
    const feverCont = document.createElement('div');
    feverCont.id = 'fever-container';
    feverCont.style.display = 'none';
    feverCont.innerHTML = `<div id="fever-label">FEVER 2x!</div><div id="fever-bar"><div id="fever-bar-fill"></div></div>`;

    hud.appendChild(scoreCont);
    hud.appendChild(timerCont);
    hud.appendChild(feverCont);
    hud.appendChild(hearts);
    hud.appendChild(muteBtn);

    this.elements.stage.appendChild(hud);
    this.elements.hud = hud;
    this.elements.score = document.getElementById('score');
    this.elements.combo = document.getElementById('combo');
    this.elements.timer = document.getElementById('timer');
    this.elements.timerFill = document.getElementById('timer-bar-fill');
    this.elements.hearts = hearts;
    this.elements.feverCont = feverCont;
    this.elements.feverFill = document.getElementById('fever-bar-fill');
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

    const panelIntro = document.createElement('div');
    panelIntro.className = 'panel';

    const title = document.createElement('h1');
    title.textContent = Biogame.STR.title;
    panelIntro.appendChild(title);

    const subtitle = document.createElement('h2');
    subtitle.textContent = Biogame.STR.subtitle;
    panelIntro.appendChild(subtitle);

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

    panelIntro.appendChild(steps);

    const tip = document.createElement('p');
    tip.style.fontStyle = 'italic';
    tip.textContent = Biogame.STR.intro.tip;
    panelIntro.appendChild(tip);

    const playBtn = document.createElement('button');
    playBtn.className = 'btn-primary';
    playBtn.textContent = Biogame.STR.intro.play;
    playBtn.id = 'btn-play';
    panelIntro.appendChild(playBtn);

    intro.appendChild(panelIntro);
    this.elements.stage.appendChild(intro);
    this.elements.intro = intro;

    // Overlay de Game Over
    const over = document.createElement('div');
    over.id = 'overlay-over';
    over.className = 'overlay';

    const panelOver = document.createElement('div');
    panelOver.className = 'panel';
    panelOver.id = 'panel-over';

    over.appendChild(panelOver);
    this.elements.stage.appendChild(over);
    this.elements.over = over;

    // Overlay de Ranking
    const ranking = document.createElement('div');
    ranking.id = 'overlay-ranking';
    ranking.className = 'overlay';

    const panelRanking = document.createElement('div');
    panelRanking.className = 'panel';

    const rankingTitle = document.createElement('h1');
    rankingTitle.textContent = Biogame.STR.ranking.title;
    panelRanking.appendChild(rankingTitle);

    const rankingList = document.createElement('div');
    rankingList.id = 'ranking-list';
    rankingList.className = 'ranking-list';
    panelRanking.appendChild(rankingList);

    const rankingFooter = document.createElement('div');
    rankingFooter.className = 'ranking-footer';
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-secondary';
    backBtn.textContent = Biogame.STR.ranking.back;
    backBtn.id = 'btn-back-intro';
    rankingFooter.appendChild(backBtn);
    panelRanking.appendChild(rankingFooter);

    ranking.appendChild(panelRanking);
    this.elements.stage.appendChild(ranking);
    this.elements.ranking = ranking;
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
    window.addEventListener('biogame:fever-started', () => this.onFeverStarted());
    window.addEventListener('biogame:fever-ended', () => this.onFeverEnded());
  },

  onGameStarted() {
    this.updateHUD();
    this.updateGarden();
    this.removeBubble();
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

    // Fever Bar Update
    if (state.feverMode) {
      this.elements.feverCont.style.display = 'flex';
      const feverPercent = (state.feverTimer / 5.0) * 100;
      this.elements.feverFill.style.width = `${feverPercent}%`;
    } else {
      this.elements.feverCont.style.display = 'none';
    }

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
    const borderColor = typeId === 'toxic_soil' ? '#A020F0' : `var(--color-threat-${typeId})`;
    bubble.style.borderColor = borderColor;

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
    svg.style.zIndex = '100';
    svg.style.display = 'block';
    svg.style.overflow = 'visible';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '32');
    circle.setAttribute('cy', '32');
    circle.setAttribute('r', '28');

    // Fix: Use a hardcoded color if the variable is failing for this specific type
    const strokeColor = typeId === 'toxic_soil' ? '#A020F0' : `var(--color-threat-${typeId})`;
    circle.setAttribute('stroke', strokeColor);

    circle.setAttribute('stroke-width', '4');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke-dasharray', '176');
    circle.setAttribute('stroke-dashoffset', '0');
    circle.setAttribute('stroke-linecap', 'round');
    circle.setAttribute('transform', 'rotate(-90 32 32)');
    circle.style.zIndex = '110';
    circle.style.display = 'block';
    circle.style.visibility = 'visible';
    circle.style.position = 'relative';

    svg.appendChild(circle);
    bubble.appendChild(svg);

    plotElem.appendChild(bubble);
    this.elements.currentBubble = bubble;
  },

  onGeneCorrect({ plantId, typeId, points, multiplier, isPerfect }) {
    this.updateHUD();
    this.updateGarden();
    this.removeBubble(typeId);

    const type = Biogame.DATA.types.find(t => t.id === typeId);
    this.elements.factText.textContent = type.fact;

    // Efeito visual de acerto
    const plant = Biogame.Game.state.plants.find(p => p.id === plantId);
    if (plant) {
      const plotElem = this.elements.plots[plant.plot];
      if (plotElem) {
        const text = isPerfect ? 'PERFECT!' : `+${points}`;
        const className = isPerfect ? 'text-perfect' : 'text-correct';
        this.showFloatingText(plotElem, text, className);
      }
    }
  },

  onGeneWrong({ chosen, expected }) {
    this.updateHUD();
    this.removeBubble();

    const type = Biogame.DATA.types.find(t => t.id === expected);
    this.elements.factText.textContent = type ? Biogame.STR.game.wrong.replace('{label}', type.label) : 'Gene incorreto!';

    // Efeito visual de erro
    const threats = Biogame.Game.state.threats;
    let targetPlantId = null;
    if (threats.length > 0) {
      targetPlantId = threats[0].plantId;
    } else {
      const anyAlive = Biogame.Game.state.plants.find(p => p.status === 'alive');
      if (anyAlive) targetPlantId = anyAlive.id;
    }

    if (targetPlantId !== null) {
      const plant = Biogame.Game.state.plants.find(p => p.id === targetPlantId);
      if (plant) {
        const plotElem = this.elements.plots[plant.plot];
        const plantElem = plotElem.querySelector('.plant');
        if (plantElem) {
          plantElem.classList.remove('shake');
          void plantElem.offsetWidth; // Trigger reflow
          plantElem.classList.add('shake');
          setTimeout(() => plantElem.classList.remove('shake'), 400);
        }
        if (plotElem) {
          this.showFloatingText(plotElem, 'ERRO!', 'text-wrong');
        }
      }
    }
  },

  onLifeLost() {
    this.updateHUD();
    // Efeito de flash vermelho na tela para indicar perda de vida
    const stage = this.elements.stage;
    stage.style.transition = 'none';
    stage.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';

    // Impact Juice: Screen Shake
    stage.classList.add('stage-shake');
    setTimeout(() => stage.classList.remove('stage-shake'), 400);

    setTimeout(() => {
      stage.style.transition = 'background-color 0.5s ease';
      stage.style.backgroundColor = 'transparent';
    }, 100);
  },

  onFeverStarted() {
    // Criamos um elemento de overlay para a febre para garantir que o efeito dourado
    // cubra a tela inteira sem interferir nos cliques do jogo
    const feverOverlay = document.createElement('div');
    feverOverlay.id = 'fever-overlay';
    feverOverlay.className = 'fever-active';
    this.elements.stage.appendChild(feverOverlay);

    this.showFloatingText(this.elements.stage, 'FEVER MODE!', 'text-fever');
  },

  onFeverEnded() {
    const overlay = document.getElementById('fever-overlay');
    if (overlay) overlay.remove();
  },

  showFloatingText(parent, text, className) {
    const el = document.createElement('div');
    el.className = `floating-text ${className}`;
    el.textContent = text;

    // Posiciona o texto aleatoriamente acima da planta ou centralizado se for o palco
    if (parent === this.elements.stage) {
      el.style.left = '50%';
      el.style.top = '40%';
      el.style.transform = 'translateX(-50%)';
    } else {
      el.style.left = `${Math.random() * 100 + 25}%`;
      el.style.top = `20%`;
    }

    parent.appendChild(el);
    setTimeout(() => el.remove(), 1500);
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
    const plotElem = this.elements.plots[plot];
    const plantElem = plotElem.querySelector('.plant');
    if (plantElem) {
      plantElem.classList.add('sprouting');
      // Remove a classe após a animação para permitir reuso se necessário
      setTimeout(() => plantElem.classList.remove('sprouting'), 500);
    }
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
    this.elements.intro.classList.remove('active');
    this.elements.over.classList.add('active');

    const panel = document.getElementById('panel-over');
    panel.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = reason === 'time' ? Biogame.STR.over.timeUp : Biogame.STR.over.lost;
    panel.appendChild(title);

    const scoreP = document.createElement('p');
    scoreP.className = 'score-display';
    scoreP.textContent = `${Biogame.STR.over.score}: ${score}`;
    panel.appendChild(scoreP);

    const aliveP = document.createElement('p');
    aliveP.className = 'alive-display';
    aliveP.textContent = `${Biogame.STR.over.alive}: ${alive}`;
    panel.appendChild(aliveP);

    // Verificar se entra no ranking
    const ranking = Biogame.Storage.getRanking();
    const isRecord = ranking.length < Biogame.CONFIG.rankingSize || score > ranking[ranking.length - 1].score;

    if (isRecord) {
      const inputSection = document.createElement('div');
      inputSection.id = 'ranking-input-section';

      const recP = document.createElement('p');
      recP.textContent = Biogame.STR.over.record;
      inputSection.appendChild(recP);

      const group = document.createElement('div');
      group.className = 'input-group';

      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'initials-input';
      input.maxLength = 3;
      input.placeholder = 'AAA';
      group.appendChild(input);

      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn-primary';
      saveBtn.id = 'btn-save-score';
      saveBtn.textContent = Biogame.STR.over.save;
      group.appendChild(saveBtn);

      inputSection.appendChild(group);

      const errP = document.createElement('p');
      errP.id = 'name-error';
      errP.className = 'error-text';
      errP.style.display = 'none';
      errP.textContent = Biogame.STR.over.badName;
      inputSection.appendChild(errP);

      panel.appendChild(inputSection);

      saveBtn.onclick = () => {
        const initials = input.value.trim().toUpperCase();
        if (initials.length === 0) return;

        if (Biogame.DATA.blockedNames.includes(initials)) {
          errP.style.display = 'block';
          return;
        }

        Biogame.Storage.saveScore(initials, score);
        inputSection.style.display = 'none';

        const goRankingBtn = document.createElement('button');
        goRankingBtn.className = 'btn-secondary';
        goRankingBtn.id = 'btn-go-ranking';
        goRankingBtn.textContent = Biogame.STR.ranking.title;
        goRankingBtn.onclick = () => this.showRanking();
        panel.appendChild(goRankingBtn);

        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn-primary';
        restartBtn.id = 'btn-restart';
        restartBtn.textContent = Biogame.STR.over.again;
        restartBtn.onclick = () => location.reload();
        panel.appendChild(restartBtn);
      };
    } else {
      const goRankingBtn = document.createElement('button');
      goRankingBtn.className = 'btn-secondary';
      goRankingBtn.id = 'btn-go-ranking';
      goRankingBtn.textContent = Biogame.STR.ranking.title;
      goRankingBtn.onclick = () => this.showRanking();
      panel.appendChild(goRankingBtn);

      const restartBtn = document.createElement('button');
      restartBtn.className = 'btn-primary';
      restartBtn.id = 'btn-restart';
      restartBtn.textContent = Biogame.STR.over.again;
      restartBtn.onclick = () => location.reload();
      panel.appendChild(restartBtn);
    }
  },

  showRanking() {
    this.elements.over.classList.remove('active');
    this.elements.ranking.classList.add('active');

    const listElem = document.getElementById('ranking-list');
    listElem.innerHTML = '';

    const ranking = Biogame.Storage.getRanking();
    if (ranking.length === 0) {
      listElem.innerHTML = `<p>${Biogame.STR.ranking.empty}</p>`;
    } else {
      ranking.forEach((entry, idx) => {
        const row = document.createElement('div');
        row.className = `ranking-row ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'normal'}`;
        row.innerHTML = `<span>${idx + 1}</span><span>${entry.initials}</span><span>${entry.score}</span>`;
        listElem.appendChild(row);
      });
    }

    document.getElementById('btn-back-intro').onclick = () => {
      this.elements.ranking.classList.remove('active');
      this.elements.over.classList.add('active');
    };
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
