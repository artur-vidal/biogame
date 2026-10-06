# BioGame - Estufa de Marte

Jogo educativo sobre biotecnologia e clonagem, desenvolvido para alunos de séries iniciais.

## Como Jogar
1. Abra o arquivo `index.html` em qualquer navegador moderno.
2. O objetivo é proteger as plantas de Marte contra ameaças (frio, radiação, etc.) escolhendo o gene correto.
3. Acertos editam a planta e criam clones idênticos, multiplicando a estufa.

## Como Abrir e Publicar
- **Localmente:** Duplo clique em `index.html` (funciona via `file://`).
- **Servidor Local:** Execute `python -m http.server` na pasta raiz e acesse `http://localhost:8000`.
- **Publicação:** O projeto é um site estático. Basta copiar a pasta `biogame` para qualquer servidor de arquivos estáticos. Ele funciona em qualquer subcaminho.

## Estrutura do Projeto
A ordem de carregamento dos scripts no `index.html` é fundamental:
1. `assets/manifest.js` (Configurações de arte e áudio)
2. `js/data.js` (Textos e definições de genes/ameaças)
3. `js/config.js` (Valores numéricos de balanceamento)
4. `js/storage.js` (Persistência local do ranking)
5. `js/assets.js` (Carregamento de imagens)
6. `js/audio.js` (Sons e música)
7. `js/game.js` (Lógica de regras e estado)
8. `js/ui.js` (Interface e manipulação do DOM)
9. `js/main.js` (Inicialização e loop principal)

## Personalização
- **Arte e Som:** Veja o guia detalhado em [docs/ASSETS.md](docs/ASSETS.md). Basta editar o `assets/manifest.js`.
- **Balanceamento:** Altere os valores em `js/config.js` (tempos, pontos, vidas).
- **Textos:** Altere as strings em `js/data.js`.
- **Cores e Estilo:** Edite as variáveis CSS em `css/theme.css`.

## Parâmetros de Debug
Adicione estes parâmetros à URL para testar:
- `?debug=1`: Ativa o painel de debug e expõe `Biogame.debug` no console.
- `?seed=123`: Fixa a semente do RNG para testes determinísticos.
- `?time=30`: Altera a duração da partida para N segundos.

## Fluxo de Desenvolvimento
O projeto segue o padrão de branches por marco (Milestones):
- Branch `main`: Versão estável.
- Branches `feat/mX-...`: Implementação de cada marco.
- Commits: Padrão [Conventional Commits](https://www.conventionalcommits.org/) em inglês.
- PRs: Títulos e descrições em inglês.

## Limpeza do Ranking
Para apagar as pontuações salvas, abra o painel de **Ranking** no jogo e utilize o botão "Apagar ranking".

## Decisões de Implementação
*(Esta seção será preenchida conforme ambiguidades forem resolvidas)*

## Testes
O projeto inclui um teste de fumaça opcional em `tests/smoke.spec.js` utilizando Playwright.

## Créditos e Licença
- Artes padrão e sons sintetizados: Criados para este projeto.
- Sem dependências externas.
- Licença: MIT.
