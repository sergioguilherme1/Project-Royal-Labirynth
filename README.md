# 🌀 Royal Labyrinth 👑

Royal Labyrinth é um jogo 2D em pixel art onde o jogador controla um príncipe corajoso em busca de sua princesa perdida. Enfrentando labirintos perigosos, inimigos desafiadores e obstáculos traiçoeiros, o jogador deve explorar, coletar moedas e chegar até o fim.

## 🎮 Tecnologias Utilizadas

- [Phaser 3](https://phaser.io/) – motor de jogo 2D
- [Tiled Map Editor](https://www.mapeditor.org/) – criação de mapas e camadas
- Webpack – empacotamento e build do projeto
- JavaScript

## 🗂️ Estrutura de Pastas

```
├── public/
│   └── assets/              # Imagens, mapas e spritesheets
├── src/
│   ├── game/
│   │   ├── scenes/          # Cenas (Boot, Preloader, Game, etc.)
│   │   └── objects/         # Player e entidades
│   └── main.js              # Ponto de entrada
├── index.html
├── package.json
├── webpack.config.js
└── README.md
```

## 🚀 Como Rodar o Projeto

1. Instale as dependências:

```bash
npm install
```

2. Rode o projeto em modo desenvolvimento:

```bash
npm run start
```

3. Acesse no navegador:

```
http://localhost:8080
```

4. Para gerar a versão de produção:

```bash
npm run build
```

## 🎮 Controles do Jogo

- Setas do teclado (↑ ↓ ← →): movimentar o personagem
- Espaço (ou outro): ações futuras (como ataque)

## 📦 Funcionalidades Atuais

- Mapa carregado via Tiled (.json)
- Animação de idle para 4 direções (frente, costas, esquerda e direita)
- Colisões com camadas do mapa
- Sistema de cenas: Boot → Preloader → Menu → Game

## 📌 Créditos

Sprites e tiles utilizados são de uso livre ou autoria do grupo de desenvolvimento.  
Desenvolvido como projeto de estudo com Phaser 3.
