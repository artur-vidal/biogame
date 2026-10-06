# Estufa de Marte — Especificação de Implementação (v2)

*Instruções para o agente de código (Claude Code). Versão 2.0, 05/10/2026. Esta especificação substitui por completo a anterior (Raízes de Marte, baseada em Phaser), descartada por ser grande demais. O título do jogo é provisório e fica na constante GAME\_TITLE.*

## 0. Instruções ao agente

- Você implementará o jogo completo descrito aqui. Este documento é a fonte de verdade: leia-o inteiro antes de programar e volte a ele a cada marco.
- Entregável: projeto web estático, jogável no navegador, versionado com git e publicado no repositório https://github.com/artur-vidal/biogame (ver seção 4), com README e documentação de assets.
- Idiomas: textos visíveis ao jogador em português do Brasil, exatamente como na seção 8. Identificadores de código em inglês. Comentários de código, README e docs em português (BR). Mensagens de commit, títulos e descrições de PR e issues em inglês.
- Autonomia: não faça perguntas ao usuário a menos que esteja bloqueado. Diante de ambiguidade, escolha a opção mais simples que respeite a seção 1 e registre a decisão no README, na seção Decisões de implementação.
- Escopo: implemente tudo o que está aqui e nada além (ver seção 16). O jogo é pequeno de propósito: resista à tentativa de adicionar telas, modos ou mecânicas extras.
- Prioridades, nesta ordem: (1) intuitividade e pouca leitura, porque os jogadores são alunos que nunca viram o jogo e não conhecem biologia; (2) simplicidade do código, pois a equipe vai manter e personalizar o projeto; (3) acabamento visual.
- Valores numéricos de jogo (tempos, pontos, limites) ficam todos em um único objeto de configuração (CONFIG, seção 9.1), para ajuste fácil depois dos testes com os alunos.
- Verificação obrigatória: rode o jogo de verdade (Playwright com Chromium ou outro navegador), jogue partidas completas e capture screenshots (seção 14). Não declare o trabalho concluído sem isso.
- Trabalhe por marcos (seção 15). Ao fim de cada marco o jogo abre sem erros no console e o trabalho está commitado e enviado ao GitHub.

## 1. Visão geral

### 1.1 Resumo

- Gênero: jogo casual de reação e associação, de uma tela só, com partidas de 90 segundos.
- Mecânica única: uma ameaça de Marte aparece sobre uma planta; o jogador clica no gene certo antes que o tempo acabe. Acertar edita a planta e faz nascer um clone dela.
- Plataforma: navegador desktop em computadores de escola (mouse e teclado; toque também funciona). Sem backend.
- Público: alunos de séries anteriores, sem conhecimento de clonagem. O jogo ensina noções básicas, sem aprofundar e sem exigir muita leitura.
- Rejogabilidade: pontuação com combo e ranking Top 10 local.

### 1.2 Premissa

O solo da Terra está perdendo fertilidade. A cientista Dra. Lia vai a Marte estudar se vegetais podem crescer lá. O solo e o ar marcianos são hostis, então ela edita os genes das plantas para torná-las resistentes e depois as clona para multiplicar a estufa. O jogador ajuda a Dra. Lia.

### 1.3 Mensagens educativas

1. Editar muda o DNA da planta; clonar faz uma cópia dela. Clones são cópias idênticas, com os mesmos genes.
2. Cada resistência depende de um gene específico.
3. Ameaças de Marte: frio, radiação, solo tóxico (perclorato), ar fino com desidratação, falta de nitrogênio. Há seres vivos reais que inspiram soluções (peixes polares, tardígrado, bactérias).

O jogo é ficção científica educativa: nunca afirme que já é possível plantar em Marte.

### 1.4 Princípios de design

- Tudo cabe numa tela, sem rolagem, e o jogador entende o que fazer olhando.
- Pouca leitura: bolhas de ameaça têm ícone e uma palavra; botões de gene têm ícone e um nome curto. Frases longas aparecem só na barra de curiosidades, depois de um acerto, e nunca bloqueiam o jogo.
- Feedback sempre triplo: cor, ícone ou forma, e texto curto ou som. Nunca só cor.
- Erros custam pouco e explicam o motivo em poucas palavras.
- Nenhuma tela de explicação entre momentos de jogo. As telas de início, fim e ranking são painéis sobrepostos na mesma página.

### 1.5 Resumo de uma partida

1. Painel inicial com 3 passos ilustrados e o botão Jogar.
2. A estufa tem 8 vasos; 2 começam com mudas. Contagem de 90 s e 3 vidas.
3. Uma ameaça por vez aparece sobre uma planta com um anel de tempo. O jogador clica no gene certo (botão ou teclas 1 a 5).
4. Acerto: gene aplicado (selinho na planta), pontos e combo, frase de curiosidade e um clone num vaso vazio. Erro ou tempo esgotado: perde uma vida (e, no tempo esgotado, a planta murcha).
5. Plantas que já têm o gene se defendem sozinhas das ameaças correspondentes.
6. Novas ameaças são liberadas aos poucos e o tempo por ameaça encurta.
7. A partida acaba aos 90 s ou sem vidas (ou se não restar nenhuma planta). Painel final com pontuação, iniciais para o ranking e o que a Dra. Lia aprendeu.

## 2. Tecnologia e restrições

- Somente tecnologias nativas do navegador: HTML5, CSS3 e JavaScript (ES2017 ou superior). Nenhuma biblioteca, nenhum framework, nenhum bundler, sem npm e sem etapa de build. Não use engine de jogos.
- Sem módulos ES (import e export): eles falham em file://. Use scripts clássicos carregados na ordem da seção 3, todos sob o namespace window.Biogame.
- O jogo deve abrir com duplo clique em index.html (file://) e também servido por servidor estático em qualquer subcaminho (por exemplo /biogame/). Todos os caminhos são relativos, sem barra inicial.
- Nenhuma requisição de rede em tempo de execução: sem CDN, fontes web ou analytics. Nada de fetch ou XMLHttpRequest (falham em file://); dados em arquivos .js, não .json.
- Renderização: DOM, CSS e imagens (elementos img, SVG). Não use canvas. Botões são elementos button reais.
- Loop do jogo: requestAnimationFrame com delta de tempo limitado a 100 ms por quadro (evita saltos ao voltar de outra aba). A lógica de tempo é feita em JavaScript, não por animações CSS; o CSS cuida só de efeitos visuais.
- Navegadores alvo: Chrome, Edge e Firefox recentes e Chromebooks, a 60 FPS em hardware modesto.
- Entrada: mouse e toque (eventos pointer), teclado (1 a 5 para os genes, Enter ou Espaço no botão principal, M para mudo).

## 3. Estrutura de arquivos e ordem dos scripts

```
biogame/
├─ index.html
├─ README.md
├─ .gitignore
├─ docs/ASSETS.md                guia para a equipe trocar imagens e sons
├─ css/
│  ├─ theme.css                  variáveis de cor, fonte e tamanho (fácil de editar)
│  └─ style.css                  layout e animações
├─ assets/
│  ├─ manifest.js                único arquivo que a equipe edita para trocar arte e áudio
│  ├─ img/                       arte padrão em SVG (criada por você)
│  └─ audio/.gitkeep             pasta vazia para sons e músicas da equipe
├─ js/
│  ├─ data.js                    tipos de ameaça e gene, frases, textos de interface
│  ├─ config.js                  CONFIG: todos os números de jogo
│  ├─ storage.js                 localStorage com fallback em memória
│  ├─ assets.js                  carga e fallback de imagens (ler manifest.js)
│  ├─ audio.js                   sons sintetizados padrão, arquivos e música
│  ├─ game.js                    estado e regras do jogo (sem tocar no DOM)
│  ├─ ui.js                      renderização no DOM, painéis, eventos de entrada
│  └─ main.js                    inicialização, loop e escala do palco
└─ tests/smoke.spec.js           opcional (Playwright)
```

Ordem das tags script no index.html: assets/manifest.js, js/data.js, js/config.js, js/storage.js, js/assets.js, js/audio.js, js/game.js, js/ui.js, js/main.js.

Separação de responsabilidades: game.js contém as regras e emite eventos (por exemplo threat-spawned, gene-correct, gene-wrong, life-lost, plant-withered, clone-born, game-over); ui.js assina esses eventos e atualiza o DOM e o áudio. game.js não conhece o DOM, o que permite testar as regras isoladamente.

## 4. Versionamento (git e GitHub)

O projeto deve ser versionado desde o primeiro minuto e publicado em https://github.com/artur-vidal/biogame.

1. Ponto de partida: verifique se o diretório já é um repositório (git status). Se não for, rode git init, defina a branch main e adicione o remoto origin com https://github.com/artur-vidal/biogame.git. Rode git fetch: se o remoto já tiver commits, parta deles (git pull) e preserve o conteúdo existente; nunca sobrescreva o histórico remoto.
2. Primeiro commit: .gitignore (node\_modules, test-results, playwright-report, arquivos de sistema como .DS\_Store e Thumbs.db, editores), README inicial e a estrutura de pastas. Envie para origin main.
3. Fluxo: uma branch por marco (por exemplo feat/m2-game-rules), criada a partir de main. Ao concluir o marco, abra um Pull Request para main com título e descrição em inglês, se o GitHub CLI (gh) estiver instalado e autenticado. Se não estiver, faça o merge localmente com git merge --no-ff e envie main.
4. Commits pequenos e atômicos, um assunto por commit, em inglês, no padrão Conventional Commits: feat, fix, docs, style, refactor, test, chore. Exemplos: feat: add threat scheduler with countdown ring; fix: clamp frame delta after tab switch; docs: add asset replacement guide. Faça commit a cada passo funcional, não só ao final do marco.
5. Envie (git push) ao final de cada marco e ao fim do trabalho. Ao concluir, crie a tag v1.0.0 e envie-a.
6. Nunca use force push, nunca reescreva histórico já publicado, nunca commite segredos, tokens, node\_modules, screenshots pesados ou áudios grandes (limite de 1 MB por arquivo; se precisar de mais, avise no README).
7. Se o push falhar por autenticação ou permissão, não tente contornar (não grave tokens em arquivos, não altere configuração global de credenciais). Mantenha os commits locais, relate ao usuário o erro exato e o que ele precisa fazer, e siga trabalhando.
8. O README deve explicar o fluxo de branches e commits usado, para a equipe seguir o mesmo padrão.

## 5. Sistema de assets personalizaveis

A equipe vai querer trocar a arte padrão por desenhos próprios, e talvez adicionar sons e música. O código nunca deve referenciar um arquivo de imagem ou áudio diretamente: tudo passa pelo manifesto.

### 5.1 Princípios

- Trocar a arte exige editar apenas assets/manifest.js (e colocar os arquivos em assets/img ou assets/audio). Nenhuma alteração de código.
- Qualquer formato de imagem que o navegador exiba funciona: svg, png, jpg, webp, gif (inclusive animado), apng, avif. Isso é garantido por usar elementos img genéricos com ajuste de caixa (object-fit), e não dimensões fixas.
- Cada slot visual tem uma caixa de tamanho fixo no layout; a imagem se encaixa nela mantendo a proporção, então imagens de tamanhos e proporções diferentes não quebram a interface.
- Se uma imagem do manifesto não carregar (caminho errado, arquivo ausente), o jogo usa automaticamente a arte padrão daquele slot e mostra um aviso no console (console.warn) com a chave e o caminho. O jogo nunca pode travar por causa de um asset.

### 5.2 Formato do manifesto (assets/manifest.js)

```js
window.BiogameAssets = {
  images: {
    background:     'assets/img/background.svg',
    lia:            'assets/img/lia.svg',
    plot:           'assets/img/plot.svg',
    plant_alive:    ['assets/img/plant_alive.svg'],   // lista: uma variação é sorteada por planta
    plant_withered: 'assets/img/plant_withered.svg',
    heart_full:     'assets/img/heart_full.svg',
    heart_empty:    'assets/img/heart_empty.svg',
    threat_cold:        'assets/img/threat_cold.svg',
    threat_radiation:   'assets/img/threat_radiation.svg',
    threat_toxic_soil:  'assets/img/threat_toxic_soil.svg',
    threat_dehydration: 'assets/img/threat_dehydration.svg',
    threat_nitrogen:    'assets/img/threat_nitrogen.svg',
    gene_cold:        'assets/img/gene_cold.svg',
    gene_radiation:   'assets/img/gene_radiation.svg',
    gene_toxic_soil:  'assets/img/gene_toxic_soil.svg',
    gene_dehydration: 'assets/img/gene_dehydration.svg',
    gene_nitrogen:    'assets/img/gene_nitrogen.svg',
    shield:   'assets/img/shield.svg',
    clone_fx: 'assets/img/clone_fx.svg',
    logo:     null                                   // opcional: se nulo, mostra o título em texto
  },
  // Cada valor de imagem pode ser: texto (caminho), lista de textos (variações sorteadas),
  // ou objeto { src: caminho ou lista, fit: 'contain' ou 'cover', position: 'center bottom' }.
  audio: {
    sfx: { click: null, correct: null, wrong: null, auto_defense: null, clone: null,
           life_lost: null, new_gene: null, time_warning: null, game_over: null, record: null },
    music: { menu: null, game: null }                  // caminhos para mp3, ogg ou wav; nulo = sem música
  },
  volumes: { sfx: 0.6, music: 0.35 }
};
```

### 5.3 Chaves de imagem, usos e tamanhos sugeridos

| Chave | Uso | Tamanho e proporção sugeridos |
| --- | --- | --- |
| background | Fundo do palco inteiro (fit cover) | 1280x720 (16:9) |
| lia | Retrato da Dra. Lia na barra de curiosidades | 256x256, fundo transparente |
| plot | Vaso ou canteiro (base de cada espaço) | 400x240, fundo transparente |
| plant\_alive | Planta saudável (aceita lista de variações) | 400x400, transparente, base alinhada embaixo |
| plant\_withered | Planta murcha | 400x400, transparente |
| heart\_full e heart\_empty | Vidas | 64x64, transparente |
| threat\_\* (5) | Ícone da ameaça dentro da bolha | 128x128, transparente |
| gene\_\* (5) | Ícone do gene no botão e no selinho da planta | 128x128, transparente |
| shield | Efeito de escudo sobre a planta protegida | 400x400, transparente |
| clone\_fx | Efeito de brotar do clone (opcional) | 400x400, transparente |
| logo | Logotipo do painel inicial (opcional) | 800x240, transparente |

### 5.4 Regras de renderização das imagens

- RM de referência: ui.js cria todo slot de imagem por uma função única (por exemplo Biogame.Assets.createImg(chave, opcoes)) que devolve um elemento img já configurado com a classe asset, o caminho resolvido e o tratamento de erro.
- CSS base do slot: display block; width e height 100 por cento da caixa; object-fit contain (cover para background); object-position center bottom para plantas e center para ícones; pointer-events none nas imagens (o clique vai para o elemento pai).
- Listas de variações (por exemplo plant\_alive): sorteie uma variação ao criar cada planta e mantenha-a durante toda a vida da planta e de seus clones (clone usa a mesma imagem da planta original, o que reforça a ideia de cópia idêntica).
- Animações de efeito (brotar, tremer, escudo) são CSS aplicado ao elemento que contém a imagem, com transform-origin center bottom, para funcionarem com qualquer arte.
- Pré-carregamento: antes de mostrar o painel inicial, carregue todas as imagens do manifesto com new Image(). Se algum carregamento passar de 300 ms, mostre um texto Carregando.... Imagens que falharem são substituídas pela padrão (DEFAULT\_IMAGES em assets.js, com os caminhos assets/img/\*.svg).
- GIF, APNG e WebP animados funcionam sem código extra pelo uso do elemento img.

### 5.5 Áudio personalizável

- Efeitos (sfx): para cada chave do manifesto, se houver caminho (ou lista de caminhos, sorteados), toque o arquivo com um objeto Audio novo a cada disparo, no volume volumes.sfx. Se o valor for nulo, toque o som sintetizado padrão (seção 11). Formatos aceitos: mp3, ogg e wav. Use HTMLAudioElement, que funciona em file://; não use fetch nem decodeAudioData para arquivos.
- Música: chaves menu (painel inicial, final e ranking) e game (durante a partida). Se nulo, sem música. Se houver arquivo: loop, volume volumes.music, troca com fade de 400 ms entre menu e game, e só começa depois do primeiro gesto do usuário (política de autoplay: capture a promise de play() e ignore a rejeição em ssilêncio; tente de novo no primeiro clique).
- Um único botão de mudo (canto superior direito, tecla M) silencia sfx e música. O estado fica em localStorage.
- Erro ao carregar ou tocar um áudio nunca lança exceção: caia para o som sintetizado (sfx) ou para o silêncio (música) e avise no console.

### 5.6 Tema

css/theme.css define em :root as variáveis de cor, fonte, raios e tamanhos que o style.css usa (por exemplo --color-bg, --color-panel, --color-accent, --color-text, --color-danger, --color-threat-cold, --color-threat-radiation, --color-threat-toxic-soil, --color-threat-dehydration, --color-threat-nitrogen, --font-body, --font-title, --radius). style.css não contém cores fixas. Fontes: pilha do sistema por padrão; a equipe pode adicionar uma fonte própria com @font-face apontando para assets/fonts/ (a pasta não precisa existir até lá).

### 5.7 docs/ASSETS.md (obrigatório, em português)

Guia para pessoas que não programam: como trocar uma imagem (copiar o arquivo para assets/img e editar uma linha do manifest.js); tabela das chaves (seção 5.3) com tamanho e proporção; formatos aceitos; dica de usar fundo transparente e deixar a base da planta encostada na borda inferior da imagem; como criar variações de planta (lista); como adicionar sons e música e quais formatos usar; como testar (abrir index.html) e o que significa o aviso no console; como voltar à arte padrão.

## 6. Arte padrão (SVG, feita por você)

Crie um arquivo SVG por chave do manifesto em assets/img/, em estilo flat vetorial, com contornos grossos e cantos arredondados, legível de longe. Use viewBox e nenhuma dimensão fixa em pixels. Paleta base (a mesma do tema): fundo escuro 0x14090F, céu de Marte 0x3A1C12 a 0xE27B58, chão 0x8A3B1E, destaque neon 0x3DF28A, texto 0xF4F1EA, frio 0x7FD6FF, radiação 0xFFD23F, solo tóxico 0xB565F2, desidratação 0x4DA3FF, nitrogênio 0xFF9F43, erro 0xFF5A5F.

| Arquivo | Receita |
| --- | --- |
| background.svg | Céu em gradiente vertical de 3A1C12 a E27B58 até o horizonte, sol pálido pequeno, colinas distantes 6B2D17 e chão 8A3B1E na metade inferior, com algumas rochas. |
| lia.svg | Retrato da Dra. Lia: cabeça com pele 0xD9A066, cabelo escuro com coque, óculos de contorno verde neon, sorriso, jaleco branco com gola em V. |
| plot.svg | Vaso de terracota 0xC1593A com aro e topo de terra escura, visto de frente. |
| plant\_alive.svg | Muda verde com caule e 3 folhas grandes, base no centro inferior. |
| plant\_withered.svg | A mesma muda, marrom e tombada, com folhas caídas. |
| heart\_full.svg e heart\_empty.svg | Coração vermelho cheio e só contorno cinza. |
| threat\_\*.svg | Floco de neve (frio); trifólio de radiação; frasco com líquido roxo e bolhas (solo tóxico); gota com rachadura e setas para cima (desidratação); hexágono com a letra N (nitrogênio). Cada ícone na cor da ameaça. |
| gene\_\*.svg | Peça de DNA (dupla hélice curta) com o símbolo da ameaça correspondente sobreposto, na cor da ameaça, para o jogador associar gene e ameaça pela cor e pelo símbolo. |
| shield.svg | Escudo verde neon semitransparente com brilho. |
| clone\_fx.svg | Anéis e faiscas verdes concêntricos. |

## 7. Layout e interface

### 7.1 Palco

O jogo vive num elemento div com id stage, de tamanho de projeto fixo 1280x720, centralizado e escalado para caber na janela mantendo a proporção 16:9 (transform scale calculado em main.js no carregamento e no redimensionamento; barras laterais ou superiores na cor do fundo). Todas as medidas abaixo são neste espaço de 1280x720 e são aproximadas: ajuste se houver sobreposição, preservando a hierarquia visual. Nenhuma interface pode ficar cortada em janelas de 1280x720, 1024x576, 800x450 e 600x900.

### 7.2 Estrutura (ids e classes sugeridos)

```
#stage
  img.asset#bg                       fundo
  #hud                               barra superior
    #score  #combo  #timer(+#timer-bar)  #hearts  #mute-btn
  #garden                            grade 4x2
    .plot (x8)  >  img.plot-img, .plant (img + .badges), .threat-bubble, .fx
  #fact-bar                          img.lia + p#fact (aria-live polite)
  #genes                             5 x button.gene-btn
  #overlay-intro  #overlay-over  #overlay-ranking     painéis sobrepostos
```

### 7.3 Medidas

- HUD (y 0 a 110): Pontos à esquerda (rótulo pequeno e número de 40 px) em x 40; chip de combo logo abaixo (Combo x3, 24 px). Cronômetro no centro (mm:ss, 40 px) com barra fina de 360 px abaixo que esvazia; vira vermelha e pulsa suavemente nos últimos 10 s. Corações à direita (3 imagens de 48 px) em x 1000 a 1170. Botão de mudo 48x48 no canto superior direito (x 1224, y 8).
- Jardim (y 130 a 560): grade de 4 colunas por 2 linhas; cada célula 260x200, com 30 px de espaço horizontal e 10 px vertical, centralizada (x 75 a 1205). Dentro da célula: vaso (img plot) na base e planta (img) em pé sobre ele, ocupando cerca de 70 por cento da altura.
- Bolha de ameaça: 170x64, centralizada sobre a planta alvo e ligeiramente acima, com fundo escuro, borda de 3 px na cor da ameaça, ícone da ameaça de 48 px à esquerda e o nome (20 px negrito) à direita; um anel de tempo (SVG circle, stroke da cor da ameaça) contorna a bolha ou envolve o ícone e se esvazia. Fica acima das outras plantas (z-index alto).
- Selinhos de genes da planta: miniaturas (24 px) dos ícones gene\_\* em uma fileira sob o vaso, uma por gene aplicado.
- Barra de curiosidades (y 570 a 630): painel de 1130 de largura, retrato lia de 56 px à esquerda e o texto (22 px) à direita.
- Barra de genes (y 640 a 712): 5 botões 210x72 com espaço de 16 px (centralizados). Cada botão: ícone gene\_\* de 48 px, nome (20 px negrito), selo pequeno com o número da tecla (1 a 5) no canto. Estados: bloqueado (apagado, com ponto de interrogação no lugar do ícone e do nome, sem clique), novo (etiqueta NOVO! pulsando até o primeiro uso correto), normal, hover (borda destacada), pressionado (escala 0,96), desabilitado quando não há ameaça ativa (não apagar demais: o jogador deve ver os botões sempre).

### 7.4 Painéis sobrepostos

Fundo escurecido (alpha 0,7) cobrindo o palco e painel central de 760x520 com borda na cor de destaque. Só um painel aparece por vez; durante qualquer painel, o jogo está parado (ou ainda não iniciado).

- Inicial (#overlay-intro): logo (se houver) ou título, subtítulo, três passos em fileira (cada um com uma imagem e uma frase curta, textos na seção 8.3), a frase Editar muda o DNA. Clonar copia a planta., o melhor placar, botão Jogar (primário, 320x72; Enter ou Espaço) e botão Ranking.
- Final (#overlay-over): título conforme o motivo do fim, pontuação grande, plantas vivas, caixa de iniciais se entrou no Top 10, quadro O que a Dra. Lia aprendeu, botões Jogar de novo e Ranking.
- Ranking (#overlay-ranking): lista Top 10, botão Voltar e botão discreto Apagar ranking com confirmação na própria linha (Tem certeza? Sim, apagar ou Cancelar).

## 8. Dados do jogo (js/data.js)

Os textos abaixo são definitivos: copie-os sem alterar. Cada tipo de ameaça tem exatamente um gene correspondente (relação um para um). Não há genes isca.

### 8.1 Tipos de ameaça e gene

```js
Biogame.DATA = {
  types: [
    { id: 'cold', key: '1', threatName: 'Frio', geneName: 'Anticongelante', label: 'o frio',
      fact: 'Peixes polares têm proteínas anticongelantes que impedem o gelo de crescer nas células.' },
    { id: 'radiation', key: '2', threatName: 'Radiação', geneName: 'Escudo Dsup', label: 'a radiação',
      fact: 'O tardígrado resiste à radiação graças à proteína Dsup, que protege o DNA.' },
    { id: 'toxic_soil', key: '3', threatName: 'Solo tóxico', geneName: 'Degradador de Perclorato', label: 'o solo tóxico',
      fact: 'O solo de Marte tem perclorato, que é tóxico. Algumas bactérias conseguem quebrá-lo.' },
    { id: 'dehydration', key: '4', threatName: 'Desidratação', geneName: 'Retenção de Água', label: 'a desidratação',
      fact: 'Com o ar de Marte tão fino, a água evapora rápido. Plantas precisam economizar água.' },
    { id: 'nitrogen', key: '5', threatName: 'Sem nitrogênio', geneName: 'Fixador de Nitrogênio', label: 'a falta de nitrogênio',
      fact: 'Certas bactérias transformam o nitrogênio do ar em adubo. Cientistas querem dar isso às plantas.' }
  ],
  cloneFact: 'Clones são cópias idênticas: têm exatamente os mesmos genes!',
  blockedNames: [ /* pelo menos 30 iniciais de 3 letras maiúsculas impróprias para ambiente escolar */ ]
};
```

A ordem do array types define a ordem dos botões (teclas 1 a 5), a ordem de liberação das ameaças e as chaves de imagem (threat\_ mais id, gene\_ mais id). O texto de dica no atributo title de cada botão de gene é o fact do tipo.

### 8.2 Textos de interface (Biogame.STR)

```js
Biogame.STR = {
  title: 'Estufa de Marte',
  subtitle: 'Biotecnologia verde em Marte',
  intro: { step1: 'Uma ameaça atinge uma planta', step2: 'Clique no gene certo!', step3: 'A planta ganha o gene e um clone!',
           tip: 'Editar muda o DNA. Clonar copia a planta.', play: 'Jogar', ranking: 'Ranking', best: 'Melhor pontuação: {n}' },
  hud: { score: 'Pontos', combo: 'Combo x{n}' },
  game: { idle: 'Proteja as plantas de Marte!', newThreat: 'Nova ameaça: {name}!', wrong: 'Esse gene protege contra {label}.',
          timeout: 'Tempo esgotado! A planta murchou.', full: 'Estufa cheia! +{n}', newTag: 'NOVO!' },
  over: { timeUp: 'Tempo esgotado!', lost: 'A estufa se perdeu!', score: 'Pontuação', alive: 'Plantas vivas: {n}',
          record: 'Novo recorde! Digite suas iniciais', save: 'Salvar', learned: 'O que a Dra. Lia aprendeu',
          again: 'Jogar de novo', badName: 'Escolha outras iniciais.' },
  ranking: { title: 'Top 10', empty: 'Ainda não há pontuações. Seja o primeiro!', back: 'Voltar', clear: 'Apagar ranking',
             sure: 'Tem certeza?', yes: 'Sim, apagar', cancel: 'Cancelar', noStorage: 'Seu navegador não permite salvar o ranking.' },
  common: { soundOn: 'Som ligado', soundOff: 'Som desligado', loading: 'Carregando...' }
};
```

Placeholders entre chaves, como {n}, são substituídos por uma pequena função format(texto, objeto). Nenhum texto visível pode ficar escrito direto em ui.js ou index.html, exceto o conteúdo inicial do painel que é preenchido por JavaScript a partir destes objetos.

## 9. Regras do jogo

### 9.1 Configuração (js/config.js)

```js
Biogame.CONFIG = {
  totalTime: 90, lives: 3, plots: 8, startPlants: 2, startPlots: [1, 2],
  threat: { startTime: 5.0, step: 0.12, minTime: 2.5, gapStart: 1.2, gapStep: 0.03, gapMin: 0.5, preferLackingChance: 0.75 },
  unlockAtCorrect: [0, 0, 3, 6, 9],   // por tipo, na ordem de DATA.types
  autoDefenseTime: 0.9, witherTime: 1.5, cloneDelay: 0.6, wrongRecoveryTime: 0.6,
  score: { correct: 100, speedBonusMax: 50, autoDefense: 20, fullGarden: 25, endPlant: 50, comboEvery: 3, comboMax: 5 },
  rankingSize: 10,
  storagePrefix: 'biogame.v1.'
};
```

### 9.2 Estado (game.js)

```js
state = {
  phase: 'idle',            // 'idle', 'playing' ou 'over'
  timeLeft, lives, score, combo, correctCount,
  plants: [],               // { id, plot, genes: [typeId], status: 'alive' ou 'withered', variant }
  plots: [],                // 8 posições: id da planta ou null
  threat: null,             // { typeId, plantId, timeTotal, timeLeft } ou null
  gapLeft, lockLeft,        // intervalo até a próxima ameaça; trava curta durante animações de resolução
  unlocked: [],             // um booleano por tipo
  pendingNew: [],           // fila de tipos recém-liberados que ainda precisam aparecer
  answeredTypes: [],        // tipos acertados ao menos uma vez (para o resumo final)
  cloned: false, endReason: null
};
```

O RNG da partida é um gerador pseudoaleatório com seed (por exemplo mulberry32), inicializado com Date.now() ou com o parâmetro de URL seed.

### 9.3 Início da partida

start(): zera o estado; timeLeft = totalTime; lives = 3; coloca startPlants plantas vivas nos vasos de startPlots (cada uma com uma variação de imagem sorteada e sem genes); unlocked = verdadeiro para os tipos cujo unlockAtCorrect é 0 (os dois primeiros); gapLeft = gapStart; phase = playing; emite game-started.

### 9.4 Atualização por quadro (update(dt))

1. Se phase não for playing, não faça nada.
2. timeLeft -= dt. Se chegar a 0, end('time'). Nos últimos 10 s, emita time-warning uma vez por segundo.
3. lockLeft -= dt (mínimo 0).
4. Se há ameaça ativa: threat.timeLeft -= dt; se chegar a 0, resolva por timeout (9.7).
5. Se não há ameaça ativa e lockLeft é 0: gapLeft -= dt; se chegar a 0, spawnThreat().

### 9.5 Ameaças (spawnThreat)

- Número de acertos manuais até agora: correctCount. Tempo da ameaça: timeTotal = max(minTime, startTime menos step vezes correctCount). Intervalo seguinte: gap = max(gapMin, gapStart menos gapStep vezes correctCount).
- Escolha do tipo: se pendingNew não está vazio, use o primeiro (retire da fila) e emita new-type; senão escolha ao acaso entre os tipos liberados, evitando repetir o tipo da ameaça anterior quando houver dois ou mais liberados.
- Escolha da planta alvo: entre as plantas vivas. Com probabilidade preferLackingChance (0,75), escolha entre as que ainda não têm o gene do tipo (se houver alguma); caso contrário, qualquer planta viva.
- Se o alvo já tem o gene: defesa automática. Emita threat-spawned com auto verdadeiro e logo em seguida auto-defense; some score.autoDefense (sem multiplicador, sem alterar combo, sem contar em correctCount); lockLeft = autoDefenseTime; gapLeft = gap. Nenhum clique é necessário.
- Caso contrário: threat = { typeId, plantId, timeTotal, timeLeft: timeTotal }; emita threat-spawned.

### 9.6 Resposta do jogador (chooseGene(typeId))

Ignore (sem penalidade) se phase não é playing, se não há ameaça ativa ou se o tipo está bloqueado.

**Acerto (typeId igual ao da ameaça):**

1. combo += 1; multiplicador = min(comboMax, 1 mais piso de (combo menos 1) dividido por comboEvery). Pontos = (correct mais round(speedBonusMax vezes timeLeft dividido por timeTotal)) vezes multiplicador. score += pontos.
2. correctCount += 1; adicione o gene à planta alvo; marque o tipo em answeredTypes.
3. Emita gene-correct com { plantId, typeId, points, multiplier }.
4. Clone: após cloneDelay, se houver vaso livre, crie o clone (9.8). Se não houver, some fullGarden pontos (sem multiplicador) e emita garden-full.
5. threat = null; gapLeft = gap; lockLeft = 0,3.
6. Liberação: para cada tipo ainda bloqueado cujo unlockAtCorrect seja menor ou igual a correctCount, marque unlocked e coloque na fila pendingNew (emita type-unlocked para a interface mostrar o botão com a etiqueta NOVO!).

**Erro (outro tipo):** lives -= 1; combo = 0; emita gene-wrong com { chosen, expected }; a ameaça some e a planta sobrevive; lockLeft = wrongRecoveryTime; gapLeft = gap. Se lives chegar a 0, end('lives').

### 9.7 Tempo esgotado numa ameaça

lives -= 1; combo = 0; a planta alvo vira withered (não conta mais como viva); emita life-lost e plant-withered; após witherTime o vaso é liberado (emita plot-freed) e só então pode receber um clone; threat = null; gapLeft = gap. Se lives chegar a 0, end('lives'); se não restar nenhuma planta viva, end('extinct').

### 9.8 Clonagem

clonePlant(origem): escolha ao acaso um vaso livre (sem planta e não ocupado por planta murchando). Crie uma planta viva com a mesma variante de imagem da origem e uma cópia exata da lista de genes. Emita clone-born com { sourceId, newId, plot } (a interface anima o brotar e mostra os mesmos selinhos). Na primeira vez da partida (cloned falso), defina cloned verdadeiro e emita first-clone para a barra de curiosidades mostrar DATA.cloneFact.

### 9.9 Fim da partida (end(reason))

reason pode ser time, lives ou extinct. Some endPlant vezes o número de plantas vivas ao score. phase = over. Emita game-over com { score, alive, reason, learned }, em que learned são até 3 frases para o quadro O que a Dra. Lia aprendeu: se houve clone, DATA.cloneFact mais até 2 fatos sorteados dos tipos em answeredTypes; se não houve clone, até 3 fatos desses tipos; se não houve nada, a dica intro.tip. Título do painel: over.timeUp se reason for time; over.lost nos demais casos.

### 9.10 Resumo da dificuldade

| Aspecto | Comportamento |
| --- | --- |
| Tempo por ameaça | 5,0 s no início, menos 0,12 s por acerto, mínimo de 2,5 s |
| Intervalo entre ameaças | 1,2 s, menos 0,03 s por acerto, mínimo de 0,5 s |
| Tipos de ameaça | 2 no início; a terceira aos 3 acertos, a quarta aos 6 e a quinta aos 9 |
| Defesa automática | Cresce com o jardim: plantas editadas se defendem, mas alvos sem o gene continuam sendo sorteados com preferência |

## 10. Pontuação

| Evento | Pontos |
| --- | --- |
| Acerto | (100 mais bônus de rapidez de 0 a 50) vezes o multiplicador de combo |
| Multiplicador de combo | x1 nos acertos 1 a 3 seguidos, x2 do 4 ao 6, x3 do 7 ao 9, x4 do 10 ao 12, x5 a partir do 13 |
| Defesa automática | 20 (sem multiplicador) |
| Estufa cheia (acerto sem vaso livre) | 25 (sem multiplicador) |
| Fim da partida | 50 por planta viva |

Erro ou tempo esgotado zera o combo. O bônus de rapidez é round(50 vezes timeLeft dividido por timeTotal) no momento do acerto. Valores em CONFIG para ajuste.

## 11. Sons sintetizados padrão (js/audio.js)

- Crie o AudioContext no primeiro gesto do usuário (e chame resume() se estiver suspenso). Ganho mestre multiplicado por volumes.sfx. Se Web Audio não existir, o áudio vira no-op sem erro.
- Helpers internos: tone(freq, dur, tipo, ganho, freqFinal) com envelope curto (ataque 5 ms e queda exponencial) e arpeggio(notas, durCadaNota, tipo, ganho).

| Chave | Receita padrão |
| --- | --- |
| click | tone 660 Hz, 0,05 s, square, 0,15 |
| correct | arpeggio \[523, 659, 784\], 0,08 s cada, triangle, 0,3 |
| wrong | tone 160 para 90 Hz, 0,22 s, sawtooth, 0,22 |
| auto\_defense | tone 880 Hz, 0,12 s, sine, 0,2 |
| clone | tone 300 para 900 Hz, 0,12 s, sine, 0,25 |
| life\_lost | tone 300 para 120 Hz, 0,3 s, square, 0,22 |
| new\_gene | arpeggio \[784, 988, 1319\], 0,1 s cada, sine, 0,25 |
| time\_warning | tone 1000 Hz, 0,03 s, square, 0,1 (um por segundo nos últimos 10 s) |
| game\_over | arpeggio \[392, 330, 262\], 0,18 s cada, triangle, 0,3 |
| record | arpeggio \[523, 659, 784, 1047, 1319\], 0,1 s cada, triangle, 0,3 |

A música só existe se a equipe definir arquivos no manifesto (seção 5.5).

## 12. Persistência e ranking (js/storage.js)

- API: Biogame.Storage.get(chave, padrão), set(chave, valor), remove(chave) e a flag available. Prefixo CONFIG.storagePrefix. Tudo com try/catch e fallback em memória; se o armazenamento estiver bloqueado, o jogo funciona normalmente e o painel de ranking mostra STR.ranking.noStorage.
- Chaves: ranking (array de até 10 itens { name, score, alive, date } com date em ISO 8601), settings ({ muted: false }) e lastName (últimas iniciais).
- Entrada no Top 10: score maior que 0 e (menos de 10 itens ou score maior que o do último). Ordena por pontuação decrescente; em empate, o mais antigo fica à frente.
- Iniciais: um único campo de texto (input, maxlength 3, autocomplete off) que aceita só letras de A a Z (filtre e converta para maiúsculas enquanto digita), preenchido com lastName ou AAA; o botão Salvar só habilita com 3 letras; Enter salva. Se o nome estiver em blockedNames, mostre STR.over.badName e não salve.
- O painel de ranking lista posição, iniciais, pontuação e data (dd/mm); destaque a linha do item recém-salvo; as três primeiras posições em dourado, prata e bronze.

## 13. Acessibilidade e robustez

- Fotossensibilidade: nada pisca mais de 2 vezes por segundo e nenhum efeito cobre a tela inteira com flashes. Respeite prefers-reduced-motion (CSS e leitura em JavaScript): sem tremor, sem pulsos e sem saltos; mantenha só fades suaves.
- Teclado e leitores de tela: botões reais, foco visível, aria-label nos botões de gene com nome e número da tecla, aria-live polite em #fact, painéis com role dialog e aria-modal, foco inicial no botão principal e foco preso dentro do painel enquanto aberto.
- Contraste alto, texto mínimo de 18 px nos elementos de interface (16 px apenas em rótulos secundários). Nunca só cor: toda ameaça e todo estado tem ícone, forma e texto.
- Cliques repetidos: respostas ignoradas quando não há ameaça ativa; botões de painel protegidos contra disparo duplo.
- Troca de aba: com document.hidden, o rAF para sozinho e o limite de 100 ms por quadro evita saltos ao voltar; não crie lógica extra de pausa.
- Falhas de asset, áudio e armazenamento nunca lançam exceção para o jogador (seções 5 e 12).
- Sem console.log no código final, exceto sob debug=1; console.warn apenas para problemas de assets.

## 14. Debug, testes e critérios de aceite

### 14.1 Parâmetros de URL

| Parâmetro | Efeito |
| --- | --- |
| debug=1 | Mostra um painel pequeno com o estado do jogo e expõe Biogame.debug |
| seed=N | Fixa a seed do RNG (sorteios determinísticos) |
| time=N | Substitui a duração da partida em segundos (para testes) |

### 14.2 Biogame.debug (somente com debug=1)

state() (retorna o estado), forceThreat(typeId, plantId), setTime(s), setLives(n), unlockAll() e end().

### 14.3 Critérios de aceite

1. Uma partida completa funciona sem erros no console, aberta por duplo clique (file://) e por servidor estático em subcaminho.
2. A partida começa com 2 plantas, 3 vidas e 90 s; só os dois primeiros genes estão ativos; os outros mostram o estado bloqueado.
3. Acerto: gene aplicado e visível como selinho, pontos conforme a seção 10, frase de curiosidade, clone com os mesmos selinhos e a mesma imagem. Erro: perde vida, zera combo, mostra a mensagem de erro e a planta sobrevive. Tempo esgotado: perde vida e a planta murcha.
4. Planta que já tem o gene se defende sozinha (efeito de escudo, 20 pontos, sem clique).
5. Os tipos 3, 4 e 5 são liberados aos 3, 6 e 9 acertos, o botão aparece com NOVO! e a primeira ameaça do tipo novo é sempre ele.
6. A partida termina aos 90 s, ao perder as 3 vidas ou quando não restar planta viva, com o título correto do painel final e o bônus de 50 por planta viva.
7. Ranking e iniciais persistem após recarregar; blocklist e confirmação ao apagar funcionam; tudo funciona com localStorage indisponível e sem áudio.
8. Troca de arte: ao trocar imagens no manifesto por PNG, JPG, GIF e WebP de proporções variadas, o layout não quebra; um caminho inválido cai na arte padrão com aviso no console; uma lista em plant\_alive gera plantas diferentes e os clones herdam a imagem da origem.
9. Troca de áudio: um arquivo wav ou mp3 de teste no manifesto toca no evento certo; música em loop começa após o primeiro clique e respeita o mudo (teste e reverta; não commite arquivos de teste).
10. Teclado (1 a 5, Enter, Espaço, M), mouse e toque (emulação) funcionam. Nada fica cortado em 1280x720, 1024x576, 800x450 e 600x900.
11. Desempenho de pelo menos 55 FPS no Chromium com CPU limitada a 4x, com o jardim cheio.
12. Nenhum texto mostra undefined, NaN ou placeholder sem substituição.

### 14.4 Evidências

Capture screenshots em 1280x720 (guarde em tests/screenshots/, leves, ou descreva no README): painel inicial, jogo no começo (2 plantas e uma ameaça), jogo no meio (clones com selinhos), jogo com os 5 genes liberados, painel final com campo de iniciais, ranking e um teste com arte trocada. Inspecione cada imagem em busca de sobreposição, texto cortado e elementos fora do lugar, e corrija antes de concluir.

### 14.5 Teste de fumaça (opcional, recomendado)

tests/smoke.spec.js com Playwright: abre index.html com ?debug=1&seed=1&time=20, joga com forceThreat e cliques nos botões, confirma que o score aumenta, que o clone aparece e que o painel final e o ranking funcionam e persistem após recarregar.

## 15. Marcos (cada um em sua branch, com PR em inglês)

| Marco | Branch | Conteúdo | Pronto quando |
| --- | --- | --- | --- |
| M1 Esqueleto | feat/m1-skeleton | Repositório, estrutura, theme.css, palco escalado, manifesto, arte SVG padrão, pré-carregamento com fallback, layout estático completo | A página mostra o layout inteiro com a arte padrão e troca de imagem pelo manifesto funciona |
| M2 Regras | feat/m2-game-rules | game.js completo (seções 9.2 a 9.9) e renderização do jardim, ameaça com anel de tempo e botões | Dá para jogar uma partida mínima com ameaças, acertos, erros e fim |
| M3 Pontos e clones | feat/m3-scoring-clones | Pontuação, combo, clones, selinhos, liberação de genes, barra de curiosidades, HUD completo | Os critérios 2 a 6 passam |
| M4 Painéis e ranking | feat/m4-panels-ranking | Painéis inicial, final e ranking, storage, iniciais, blocklist | Os critérios 6 e 7 passam |
| M5 Áudio | feat/m5-audio | Sons sintéticos, arquivos e música do manifesto, mudo | O critério 9 passa |
| M6 Acabamento | feat/m6-polish-a11y | Animações (brotar, escudo, tremer, murchar), reduced motion, acessibilidade, responsividade | Os critérios 10 a 12 passam |
| M7 Qualidade | chore/m7-docs-qa | docs/ASSETS.md, README, teste de fumaça, testes de troca de arte e áudio, tag v1.0.0 | Todos os critérios da seção 14.3 verificados e tudo enviado ao GitHub |

Antes de abrir cada PR, rode o jogo, corrija erros e atualize o README se algo mudou.

## 16. Fora de escopo e README

### 16.1 Fora de escopo (não implementar)

- Outras telas ou modos, rodadas, pausas explicativas, diário, menu de pausa, tela de configurações (além do botão de mudo).
- Genes isca, eventos especiais (por exemplo para ilustrar clones iguais), outros cultivos, outras ameaças ou outros genes.
- Backend, ranking online, contas, analytics, outros idiomas, editor de fases, layouts específicos para celular.

### 16.2 Conteúdo do README.md (em português)

1. O que é o jogo e como jogar (3 linhas).
2. Como abrir: duplo clique em index.html, ou python3 -m http.server na pasta e abrir pelo navegador. Como publicar em subcaminho de um servidor estático (copiar a pasta).
3. Estrutura de pastas e ordem dos scripts.
4. Como personalizar: link para docs/ASSETS.md; onde ficam os números de jogo (config.js), os textos (data.js) e o tema (theme.css).
5. Parâmetros de debug.
6. Fluxo de git usado (branches por marco, Conventional Commits em inglês, PRs em inglês) para a equipe seguir o mesmo padrão.
7. Como limpar o ranking (botão no painel de Ranking).
8. Decisões de implementação (toda ambiguidade resolvida durante o trabalho).
9. Como rodar os testes.
10. Créditos e licença (as artes padrão e os sons sintetizados são do projeto; nenhuma dependência de terceiros).
