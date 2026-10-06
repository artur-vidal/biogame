window.Biogame = window.Biogame || {};

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
  blockedNames: ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG', 'HHH', 'III', 'JJJ', 'KKK', 'LLL', 'MMM', 'NNN', 'OOO', 'PPP', 'QQQ', 'RRR', 'SSS', 'TTT', 'UUU', 'VVV', 'WWW', 'XXX', 'YYY', 'ZZZ', 'SEX', 'FUCK', 'SHIT', 'BUM']
};

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

Biogame.format = function(text, data) {
  return text.replace(/{(\w+)}/g, (match, key) => data[key] !== undefined ? data[key] : match);
};
