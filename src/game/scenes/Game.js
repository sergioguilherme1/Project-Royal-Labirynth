import { Scene } from "phaser";
import { createPlayer, updatePlayer } from "../objects/player"; // Importa diretamente as funções
import Minion, { createMinionAnimations } from "../objects/minion";
import Boss, { createBossAnimations } from "../objects/boss";

// --- Configurações do Jogo ---

// Configurações dos mapas, incluindo pontos de spawn, moedas, corações e próxima fase
const MAP_CONFIG = {
  map: {
    spawn: { x: 65, y: 60 },
    coins: [
      { x: 45, y: 502 }, { x: 184, y: 715 }, { x: 440, y: 727 }, { x: 805, y: 487 },
      { x: 184, y: 255 }, { x: 451, y: 593 }, { x: 473, y: 214 }, { x: 855, y: 721 },
      { x: 978, y: 372 }, { x: 767, y: 132 },
    ],
    hearts: [
      { x: 40, y: 650 }, { x: 424, y: 87 }, { x: 758, y: 647 }, { x: 928, y: 115 },
    ],
    nextMap: "map2",
  },
  map2: {
    spawn: { x: 936, y: 89 },
    coins: [
      { x: 952, y: 504 }, { x: 791, y: 280 }, { x: 103, y: 103 }, { x: 103, y: 366 },
      { x: 503, y: 680 }, { x: 658, y: 519 },
    ],
    hearts: [
      { x: 216, y: 230 }, { x: 664, y: 422 }, { x: 512, y: 430 }, { x: 78, y: 678 },
    ],
    nextMap: "map3",
  },
  map3: {
    spawn: { x: 512, y: 537 },
    coins: [
      { x: 240, y: 112 }, { x: 784, y: 116 }, { x: 784, y: 400 }, { x: 239, y: 398 },
      { x: 110, y: 174 }, { x: 912, y: 176 }, { x: 110, y: 688 }, { x: 912, y: 689 },
    ],
    hearts: [
      { x: 512, y: 63 }, { x: 112, y: 295 }, { x: 104, y: 400 }, { x: 911, y: 551 },
      { x: 920, y: 400 }, { x: 913, y: 295 }, { x: 112, y: 552 },
    ],
    nextMap: null,
  },
};

// Configurações dos pontos de patrulha dos minions por mapa
const MINIONS_CONFIG = {
  map: [
    [{ x: 41, y: 504 }, { x: 200, y: 504 }],
    [{ x: 293, y: 486 }, { x: 536, y: 486 }],
    [{ x: 328, y: 58 }, { x: 328, y: 228 }],
    [{ x: 647, y: 104 }, { x: 520, y: 104 }, { x: 520, y: 215 }, { x: 520, y: 104 }],
    [{ x: 968, y: 375 }, { x: 743, y: 375 }],
    [{ x: 679, y: 728 }, { x: 936, y: 728 }],
  ],
  map2: [
    [{ x: 104, y: 70 }, { x: 104, y: 340 }],
    [{ x: 104, y: 350 }, { x: 104, y: 520 }],
    [{ x: 197, y: 521 }, { x: 650, y: 521 }],
    [{ x: 265, y: 359 }, { x: 328, y: 406 }, { x: 388, y: 360 }, { x: 327, y: 319 }],
    [{ x: 938, y: 282 }, { x: 680, y: 282 }],
    [{ x: 951, y: 438 }, { x: 951, y: 678 }],
    [{ x: 172, y: 680 }, { x: 543, y: 680 }],
  ],
  map3: [
    [{ x: 246, y: 179 }, { x: 76, y: 179 }],
    [{ x: 237, y: 544 }, { x: 237, y: 299 }],
    [{ x: 66, y: 688 }, { x: 374, y: 687 }],
    [{ x: 956, y: 686 }, { x: 642, y: 686 }],
    [{ x: 783, y: 545 }, { x: 783, y: 257 }],
    [{ x: 958, y: 174 }, { x: 783, y: 174 }],
  ],
};

export class Game extends Scene {
  // --- Propriedades da Cena ---
  player;
  hearts = [];
  coinCount = 0;
  coinText;
  attackCooldown = 0;
  isGameOver = false;

  pauseGameButton;
  fogOfWar; // Camada escura que simula a névoa de guerra
  visionMaskGraphics; // Gráfico que define a área visível para o jogador

  // Sons
  bgMusic;
  dragonSound;
  fireSound;
  coinSound;
  heartSound;

  // Textos de UI
  gameOverText;
  restartText;

  // Teclas
  cursors;
  keys;
  restartKey;

  constructor() {
    super("Game");
  }

  // --- Método Create: Inicializa a Cena ---
  create(data) {
    const mapKey = data?.mapKey || "map";
    const config = MAP_CONFIG[mapKey] || {};
    const spawn = config.spawn || { x: 0, y: 0 };

    // Carrega o mapa e suas camadas
    const map = this.make.tilemap({ key: mapKey });
    const tiledset = map.addTilesetImage("assets", "tiles");

    map.createLayer("fundo preto", tiledset, 0, 0);
    map.createLayer("chao", tiledset, 0, 0);
    const parede = map.createLayer("parede", tiledset, 0, 0);
    parede.setCollisionByProperty({ collides: true });
    map.createLayer("detalhe do chao", tiledset, 0, 0);
    map.createLayer("portao", tiledset, 0, 0);
    map.createLayer("agua", tiledset, 0, 0);
    map.createLayer("detalhes", tiledset, 0, 0);
    const objetos = map.createLayer("objetos", tiledset, 0, 0);
    objetos.setCollisionByProperty({ collides: true });
    this.physics.world.createDebugGraphic().visible = false; // Desativa debug da física

    // --- Configuração do Player ---
    this.bgMusic = this.sound.add("gameMusic", { loop: true, volume: 0.5 });
    this.bgMusic.play();
    this.player = createPlayer(this, spawn.x, spawn.y);
    this.player.health = data?.health ?? 3;
    this.player.maxHealth = 3;

    // --- Sons específicos do Mapa 3 (Boss) ---
    if (mapKey === "map3") {
      this.bgMusic.setVolume(0.1); // Diminui música de fundo
      this.dragonSound = this.sound.add("dragon-sound", { loop: true, volume: 0.8 });
      this.dragonSound.play();
      this.fireSound = this.sound.add("fire-sound", { loop: true, volume: 0.6 });
      this.fireSound.play();
    }

    // --- Lógica do Fog of War ---
    // Cria a camada preta opaca que cobre o mapa
    this.fogOfWar = this.add.graphics()
      .fillStyle(0x000000, 0.95) // Cor preta com 95% de opacidade
      .fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)
      .setScrollFactor(0) // Fixa na câmera
      .setDepth(99); // Garante que fique acima da maioria dos elementos

    // Cria o gráfico que define a área visível do jogador (a "janela" no fog)
    this.visionMaskGraphics = this.add.graphics()
      .fillCircle(this.player.x, this.player.y, 80) // Círculo de visão em torno do jogador
      .setScrollFactor(0); // Fixa na câmera

    // Aplica a máscara invertida: a área do círculo será transparente, o resto opaco
    this.fogOfWar.mask = new Phaser.Display.Masks.GeometryMask(this, this.visionMaskGraphics);
    this.fogOfWar.mask.invertAlpha = true;

    // --- Inicialização de Inimigos (Boss e Minions) ---
    if (mapKey === "map3") {
      createBossAnimations(this);
      const bossPatrol = [
        { x: 511, y: 295 }, { x: 424, y: 380 }, { x: 511, y: 460 }, { x: 603, y: 380 },
      ];
      this.boss = new Boss(this, bossPatrol[0].x, bossPatrol[0].y, "boss", this.player);
      this.boss.patrolPoints = bossPatrol;
      this.boss.currentPatrolIndex = 1;

      this.physics.add.collider(this.boss, parede);
      this.physics.add.collider(this.boss, this.player, () => { /* Lógica de dano ao jogador */ });
    }

    createMinionAnimations(this);
    this.minions = this.physics.add.group();
    const patrolZones = MINIONS_CONFIG[mapKey] || [];
    patrolZones.forEach((zone) => {
      const startPos = zone[0];
      const minion = new Minion(this, startPos.x, startPos.y, "minion", this.player);
      minion.patrolPoints = zone;
      minion.currentPatrolIndex = 1;
      this.minions.add(minion);
    });

    // --- Transição de Fases ---
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    const fim = map.createLayer("fim", tiledset, 0, 0); // Camada de fim de fase
    fim.setCollisionByProperty({ fim: true });
    this.physics.add.collider(this.player, fim, () => {
      if (config.nextMap) {
        this.scene.restart({ mapKey: config.nextMap, health: this.player.health });
      }
    });

    // --- Coletáveis (Moedas e Corações) ---
    this.coins = this.physics.add.group();
    (config.coins || []).forEach((pos) => {
      const coin = this.coins.create(pos.x, pos.y, "coin");
      coin.setScale(0.03).setBounce(0.5);
    });
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    this.heartsGroup = this.physics.add.group();
    (config.hearts || []).forEach((pos) => {
      const heart = this.heartsGroup.create(pos.x, pos.y, "heart_item");
      heart.setScale(0.03);
    });
    this.physics.add.overlap(this.player, this.heartsGroup, this.collectHeart, null, this);

    // --- Configuração da HUD (Heads-Up Display) ---
    const cameraWidth = this.cameras.main.width;
    const topY = 5;
    const hudWidth = 200;
    const baseX = cameraWidth - hudWidth; // Posição X para canto superior direito

    // Fundo semitransparente da HUD
    this.add.graphics()
      .fillStyle(0x000000, 0.5)
      .fillRoundedRect(baseX, topY, hudWidth, 32, 8)
      .setScrollFactor(0)
      .setDepth(100); // Acima do fog of war

    // Corações da HUD
    for (let i = 0; i < this.player.maxHealth; i++) {
      const heartX = baseX + 16 + i * 32;
      const heart = this.add.image(heartX, topY + 16, "heart_full")
        .setScrollFactor(0)
        .setScale(0.05)
        .setDepth(101);
      this.hearts.push(heart);
    }

    // Ícone e contador de moedas na HUD
    const coinIconX = baseX + hudWidth - 70;
    this.add.image(coinIconX, topY + 16, "coin_icon")
      .setScrollFactor(0)
      .setScale(0.05)
      .setDepth(102);
    this.coinText = this.add.text(coinIconX + 20, topY + 8, this.coinCount.toString(), {
      fontSize: "16px",
      fill: "#fff",
      fontFamily: "monospace",
    })
      .setScrollFactor(0)
      .setDepth(103);

    // --- Configuração de Colisões ---
    parede.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, parede);
    this.physics.add.collider(this.minions, parede);
    this.physics.add.collider(this.minions, this.player);

    objetos.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, objetos);
    this.physics.add.collider(this.minions, objetos);

    fim.setCollisionByExclusion([-1]); // Ajuste para a camada de fim de fase

    // --- Controles de Teclado ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      F: Phaser.Input.Keyboard.KeyCodes.F,
    });

    // --- Textos de Game Over ---
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    this.gameOverText = this.add.text(centerX, centerY - 20, "GAME OVER", {
      fontSize: "48px",
      fill: "#ff0000",
      fontFamily: "monospace",
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100) // Acima do fogOfWar
      .setVisible(false);
    this.restartText = this.add.text(centerX, centerY + 30, "Pressione R para reiniciar", {
      fontSize: "20px",
      fill: "#ffffff",
      fontFamily: "monospace",
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100) // Acima do fogOfWar
      .setVisible(false);
  }

  // --- Método para Criar o Botão de Pausar Jogo ---
  createPauseGameButton() {
    const xBase = this.cameras.main.width - 40;
    const yBase = 24;

    this.pauseGameButton = this.add.container(xBase, yBase);

    const pauseBtnBg = this.add
      .rectangle(0, 0, 40, 40, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.pauseGameButton.add(pauseBtnBg);

    const pauseText = this.add
      .text(0, 0, "≡", {
        fontSize: "24px",
        color: "#FFD700",
        fontFamily: "Arial Black",
      })
      .setOrigin(0.5);
    this.pauseGameButton.add(pauseText);

    // Eventos de interação do botão
    pauseBtnBg.on("pointerover", () => pauseBtnBg.setFillStyle(0x294d77));
    pauseBtnBg.on("pointerout", () => pauseBtnBg.setFillStyle(0x1e1e2f));
    pauseBtnBg.on("pointerdown", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause();
    });
  }

  // --- Método Update: Lógica do Jogo por Quadro ---
  update() {
    // Lógica de reinício após Game Over
    if (this.isGameOver && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart({ mapKey: "map" });
      return;
    }

    // Impede atualizações se o jogo estiver em Game Over ou player inativo
    if (this.isGameOver || !this.player || !this.player.active) {
      return;
    }

    // Atualiza o player
    updatePlayer(this.player, this.cursors, this.keys);

    // Atualiza a posição do círculo de visão do fog of war para seguir o player
    this.visionMaskGraphics.clear();
    this.visionMaskGraphics.fillCircle(this.player.x, this.player.y, 70);

    // Verifica a saúde do player para Game Over
    if (this.player.health <= 0 && !this.player.isDying) {
      this.checkPlayerDeath();
      return;
    }

    // Lógica de ataque do player
    if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
      this.attackEnemy();
    }
  }

  // --- Funções de Lógica do Jogo ---

  // Gerencia o estado de Game Over
  handleGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.setVelocity(0);
    this.physics.pause(); // Pausa a física do jogo
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
  }

  // Verifica a morte do player e inicia a animação de morte
  checkPlayerDeath() {
    if (this.isGameOver || !this.player || this.player.isDying) return;

    this.player.isDying = true;
    this.player.setVelocity(0);
    this.player.anims.stop();
    this.player.play("die_down");

    this.player.once("animationcomplete", () => this.handleGameOver());
  }

  // Coleta uma moeda e atualiza o contador
  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.coinCount++;
    this.coinText.setText(this.coinCount);
    this.coinSound = this.sound.add("coinSound", { volume: 0.4 });
    this.coinSound.play();
  }

  // Coleta um coração e restaura a vida do player
  collectHeart(player, heart) {
    heart.disableBody(true, true);

    const index = this.hearts.indexOf(heart);
    if (index > -1) {
      this.hearts.splice(index, 1);
    }

    if (this.player.health < this.player.maxHealth) {
      this.player.health++;
      this.updateHearts();
    }

    this.heartSound = this.sound.add("heartSound", { volume: 0.4 });
    this.heartSound.play();
  }

  // Atualiza a representação visual dos corações na HUD
  updateHearts() {
    for (let i = 0; i < this.hearts.length; i++) {
      const heart = this.hearts[i];
      if (heart && heart.setTexture && heart.scene) {
        const texture = i < this.player.health ? "heart_full" : "heart_empty";
        heart.setTexture(texture);
      }
    }
  }

  // Gerencia o ataque do player aos inimigos próximos
  attackEnemy() {
    const now = this.time.now;
    if (now < this.attackCooldown) return;
    this.attackCooldown = now + 500; 

    const attackRange = 50; // Raio de ataque
    this.minions.getChildren().forEach((minion) => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, minion.x, minion.y);

      if (distance <= attackRange) {
        minion.health--;
        this.sound.play("orcHit");

        if (minion.health <= 0) {
          minion.die();
        } else {
          minion.play("minion_hit", true);
        }
      }
    });
  }
}