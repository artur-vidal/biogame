# Histórico de Desenvolvimento - Estufa de Marte

Este arquivo contém o registro do processo de desenvolvimento do jogo "Estufa de Marte", desde a concepção do esqueleto até a finalização dos sistemas de gameplay, UI e gamificação.

## Marcos de Implementação

### Marco 1: Esqueleto (Concluído)
- Implementação da estrutura básica de pastas e arquivos.
- Criação do sistema de assets via manifesto.
- Renderização inicial do palco (stage) e HUD.

### Marco 2: Regras do Jogo (Concluído)
- Núcleo lógico em `game.js` com loop de tempo e spawn de ameaças.
- Sistema de resolução de ameaças (Acerto, Erro, Timeout).
- Renderização de bolhas de ameaça com timers SVG circulares.

### Marco 3: Pontos e Clones (Concluído)
- Implementação de pontuação com bônus de velocidade e multiplicadores de combo.
- Mecânica de clonagem: plantas corretas geram clones em vasos vazios.
- Progressão de genes: liberação de novos tipos conforme a pontuação.
- HUD completo e Barra de Curiosidades da Dra. Lia.

### Marco 4: Painéis e Ranking (Concluído)
- Fluxo de navegação: Intro -> Jogo -> Game Over -> Ranking.
- Sistema de persistência de recordes usando `localStorage`.
- Validação de iniciais com blocklist para evitar nomes impróprios.
- Ranking Top 10 com distinção visual para ouro, prata e bronze.

### Fase de Gamificação & Juice (Concluído)
- **Fever Mode**: Ativado com 10 combos, dobrando a pontuação e adicionando um efeito visual dourado pulsante na tela.
- **Perfect Timing**: Bônus massivo de pontos ao responder nos últimos 10% do tempo da ameaça.
- **Impacto Visual**: Adição de flash vermelho na perda de vida e animações de "brotar" para clones.
- **Balanceamento**: Ajustes na frequência de spawn e tempo de resposta para manter o estado de 'Flow'.

## Principais Correções e Desafios
- **Posicionamento do Stage**: Corrigido para centralização perfeita usando `translate(-50%, -50%)` e escala dinâmica.
- **Ameaças Invisíveis**: Resolvido o problema de plantas imunes que ainda disparavam timers internos, causando perda de vida sem feedback visual.
- **Race Conditions em Timeouts**: Implementado o uso de cópias de arrays e `findIndex` para evitar que múltiplos timeouts no mesmo frame causassem a perda de vidas extras.
- **Navegação de Overlays**: Ajustado o botão "Voltar" do ranking para retornar à tela de Game Over.

## Tecnologias Utilizadas
- HTML5 / CSS3 (Custom Properties, Animations)
- Vanilla JavaScript (ES6+)
- LocalStorage API
- SVG (Dynamic Stroke-dashoffset)
