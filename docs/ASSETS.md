# Guia de Assets - Estufa de Marte

Este guia explica como trocar a arte e os sons do jogo sem alterar o código-fonte.

## Como Trocar Imagens
Toda a arte do jogo é controlada pelo arquivo `assets/manifest.js`.

1. Coloque sua imagem na pasta `assets/img/`.
2. Abra o `assets/manifest.js`.
3. Localize a chave da imagem que deseja trocar e altere o caminho.

**Exemplo:**
Para trocar o fundo, mude:
`background: 'assets/img/background.svg',`  $\rightarrow$  `background: 'assets/img/meu_fundo_novo.png',`

## Formatos e Proporções
O jogo suporta SVG, PNG, JPG, WebP e GIF (inclusive animados). 
As imagens são ajustadas automaticamente usando `object-fit: contain`, mas para melhores resultados, use as proporções sugeridas:

| Chave | Uso | Tamanho Sugerido | Proporção |
| --- | --- | --- | --- |
| `background` | Fundo do palco | 1280x720 | 16:9 (Fill Cover) |
| `lia` | Retrato da Dra. Lia | 256x256 | 1:1 (Fundo Transparente) |
| `plot` | Vaso / Canteiro | 400x240 | 5:3 (Fundo Transparente) |
| `plant_alive` | Planta saudável | 400x400 | 1:1 (Base alinhada embaixo) |
| `plant_withered`| Planta murcha | 400x400 | 1:1 (Fundo Transparente) |
| `heart_full` | Vida cheia | 64x64 | 1:1 (Fundo Transparente) |
| `threat_*` | Ícones de Ameaça | 128x128 | 1:1 (Fundo Transparente) |
| `gene_*` | Ícones de Gene | 128x128 | 1:1 (Fundo Transparente) |

## Variações de Plantas
Você pode criar várias versões de plantas saudáveis para que o jogo as sorteie. No `manifest.js`, transforme o valor em uma lista:
`plant_alive: ['assets/img/plant1.svg', 'assets/img/plant2.svg', 'assets/img/plant3.svg'],`

## Como Trocar Sons
Edite a seção `audio` do `assets/manifest.js`. 
- Para efeitos (sfx), coloque o caminho do arquivo (`mp3`, `ogg` ou `wav`).
- Se deixar como `null`, o jogo usará sons sintetizados padrão.

## Dicas Gerais
- Use fundos transparentes (PNG ou SVG) para que a arte não fique com "bordas quadradas".
- Certifique-se de que a base da planta encoste na borda inferior da imagem para que ela fique corretamente apoiada no vaso.
- Para testar, basta abrir o `index.html` no navegador. Se uma imagem não carregar, o jogo usará a arte padrão e avisará no console.
