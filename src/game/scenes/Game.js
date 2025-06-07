import { Scene } from 'phaser';
import { createPlayer } from '../objects/player';
import { updatePlayer } from '../objects/player';
import Minion, { createMinionAnimations } from '../objects/minion';
import Boss, { createBossAnimations } from '../objects/boss';
import Princess, {createPrincess } from '../objects/princess'; 

const MAP_CONFIG = {
  map: {
    spawn: { x: 65, y: 60 },
    coins: [
      { x: 45, y: 502 },
      { x: 184, y: 715 },
      { x: 440, y: 727 },
      { x: 805, y: 487 },
      { x: 184, y: 255 },
      { x: 451, y: 593 },
      { x: 473, y: 214 },
      { x: 855, y: 721 },
      { x: 978, y: 372 },
      { x: 767, y: 132 }
    ],
    hearts: [
      { x: 40, y: 650 },
      { x: 424, y: 87 },
      { x: 758, y: 647 },
      { x: 928, y: 115 }
    ],
    nextMap: 'map2'
  },
  map2: {
    spawn: { x: 936, y: 89 },
    coins: [
      { x: 952, y: 504 },
      { x: 791, y: 280 },
      { x: 103, y: 103 },
      { x: 103, y: 366 },
      { x: 503, y: 680 },
      { x: 658, y: 519 }
    ],
    hearts: [
      { x: 216, y: 230 },
      { x: 664, y: 422 },
      { x: 512, y: 430 },
      { x: 78, y: 678 }
    ],
    nextMap: 'map3'
  },
  map3: {
    spawn: { x: 512, y: 537 },
    coins: [
      { x: 240, y: 112 },
      { x: 784, y: 116 },
      { x: 784, y: 400 },
      { x: 239, y: 398 },
      { x: 110, y: 174 },
      { x: 912, y: 176 },
      { x: 110, y: 688 },
      { x: 912, y: 689 }
    ],
    hearts: [
      { x: 512, y: 260 },
      { x: 112, y: 295 },
      { x: 104, y: 400 },
      { x: 911, y: 551 },
      { x: 920, y: 400 },
      { x: 913, y: 295 },
      { x: 112, y: 552 }
    ],
    nextMap: null
  }
};

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
  ]
};

export class Game extends Scene {
  player;
  hearts = [];
  coinCount = 0;
  coinText;
  attackCooldown = 0;
  pauseGameButton;
  menuMusic;
  gameMusic;
  isGameOver = false;
  fogOfWar;
  visionMask;
  Graphics;
  dragonSound;
  fireSound;
  coinSound;
  heartSound;
  gameOverText;
  restartText;
  cursors;
  keys;
  restartKey;

  constructor() {
    super('Game');
  }

  create(data) {

    if (this.gameMusic && this.gameMusic.isPlaying) {
      this.gameMusic.stop();
    };

    const mapKey = data?.mapKey || 'map';
    const config = MAP_CONFIG[mapKey] || {};

    const map = this.make.tilemap({ key: mapKey });
    const tiledset = map.addTilesetImage('assets', 'tiles');

    map.createLayer('fundo preto', tiledset, 0, 0);
    map.createLayer('chao', tiledset, 0, 0);
    const parede = map.createLayer('parede', tiledset, 0, 0);
    parede.setCollisionByProperty({ collides: true });
    map.createLayer('detalhe do chao', tiledset, 0, 0);
    map.createLayer('portao', tiledset, 0, 0);
    map.createLayer('agua', tiledset, 0, 0);
    map.createLayer('detalhes', tiledset, 0, 0);
    const objetos = map.createLayer('objetos', tiledset, 0, 0);
    objetos.setCollisionByProperty({ collides: true });


    const mainMenuScene = this.scene.get('MainMenu');
    if (mainMenuScene) {
      this.savedVolume = mainMenuScene.savedVolume; // Recupera o volume
    }
    const volume = (typeof this.savedVolume === 'number' && isFinite(this.savedVolume)) ? this.savedVolume : 0.5;
    this.gameMusic = this.sound.add("gameMusic", { loop: true, volume });
    this.gameMusic.play();

    // Player
    const spawn = config.spawn || { x: 0, y: 0 };
    this.player = createPlayer(this, spawn.x, spawn.y);
    this.player.health = data?.health ?? 3;
    this.player.maxHealth = 5;

    //Boss
    if (mapKey === 'map3') {
      this.gameMusic.setVolume(volume);
      this.dragonSound = this.sound.add("dragon-sound", { loop: true, volume: 0.8 });
      this.dragonSound.play();
      this.fireSound = this.sound.add("fire-sound", { loop: true, volume: 0.6 });
      this.fireSound.play();

      createBossAnimations(this);
      const bossPatrol = [
        { x: 511, y: 295 },
        { x: 424, y: 380 },
        { x: 511, y: 460 },
        { x: 603, y: 380 },
      ];
      this.boss = new Boss(this, bossPatrol[0].x, bossPatrol[0].y, 'boss', this.player);
      this.boss.patrolPoints = bossPatrol;
      this.boss.currentPatrolIndex = 1;

      this.physics.add.collider(this.boss, parede);
      this.physics.add.collider(this.boss, this.player);

      this.Princess = createPrincess(this, 511, 384); 
      this.physics.add.collider(this.Princess, this.boss, () => {
        this.Princess.setVelocity(0);
      });

      

      this.physics.add.collider(this.Princess, this.player, () => {
        this.Princess.setVelocity(0);
          if (this.bossIsDead) {
            // Se o Boss estiver morto, muda para a cena "end"
            this.scene.start('End');  // Nome da cena para transição
          }
      });
      
    }

    // --- Lógica do Fog of War ---Add commentMore actions
    // Cria a camada preta opaca que cobre o mapa
    this.fogOfWar = this.add.graphics()
      .fillStyle(0x000000, 0.98) // Cor preta com 95% de opacidade
      .fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)
      .setScrollFactor(0) // Fixa na câmera
      .setDepth(99);
    this.fogOfWar.alpha = 0; 

    // Cria o gráfico que define a área visível do jogador (a "janela" no fog)
    this.visionMaskGraphics = this.add.graphics()
      .fillCircle(this.player.x, this.player.y, 80) // Círculo de visão em torno do jogador
      .setScrollFactor(0); // Fixa na câmera
    this.visionMaskGraphics.alpha = 0;

    // Aplica a máscara invertida: a área do círculo será transparente, o resto opaco
    this.fogOfWar.mask = new Phaser.Display.Masks.GeometryMask(this, this.visionMaskGraphics);
    this.fogOfWar.mask.invertAlpha = true;

    this.tweens.add({
      targets: this.fogOfWar,
      alpha: 0.99,  // A neblina fica visível
      duration: 2000,  // Duração do efeito (3 segundos)
      ease: 'Linear'
    });

    //Criando lacaios
    createMinionAnimations(this);
    this.minions = this.physics.add.group();
    const patrolZones = MINIONS_CONFIG[mapKey] || [];

    patrolZones.forEach(zone => {
      const startPos = zone[0];
      const minion = new Minion(this, startPos.x, startPos.y, 'minion', this.player);
      minion.patrolPoints = zone;
      minion.currentPatrolIndex = 1;
      this.minions.add(minion);
    });

    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Layer de fim de fase
    const fim = map.createLayer('fim', tiledset, 0, 0);
    fim.setCollisionByProperty({ fim: true });

    this.physics.add.collider(this.player, fim, () => {
      if (config.nextMap) {
        this.scene.restart({ mapKey: config.nextMap, health: this.player.health });
      }
    });

    // Moedas
    this.coins = this.physics.add.group();
    (config.coins || []).forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setScale(0.03);
      coin.setBounce(0.5);
    });
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // Corações
    this.hearts = [];
    this.heartsGroup = this.physics.add.group();
    (config.hearts || []).forEach(pos => {
      const heart = this.heartsGroup.create(pos.x, pos.y, 'heart_item');
      heart.setScale(0.03);

      if (pos.x === 512 && pos.y === 260) {
        heart.setSize(2000);  // Aumenta o tamanho da hitbox
      }
    });
    this.physics.add.overlap(this.player, this.heartsGroup, this.collectHeart, null, this);

    const cameraWidth = this.cameras.main.width;
    const topY = 5;
    const hudWidth = 250;
    // Canto superior direito
    const baseX = cameraWidth - hudWidth - 70;

    this.add.graphics()
      .fillStyle(0x000000, 0.5)
      .fillRoundedRect(baseX, topY, hudWidth, 32, 8)
      .setScrollFactor(0)
      .setDepth(100); 

    // Fundo da HUD
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.5);
    hudBg.fillRoundedRect(baseX, topY, hudWidth, 32, 8);
    hudBg.setScrollFactor(0);

    // Corações
    for (let i = 0; i < this.player.maxHealth; i++) {
      const heartX = baseX + 16 + i * 32;
      const heart = this.add.image(heartX, topY + 16, i < this.player.health ? 'heart_full' : 'heart_empty')
        .setScrollFactor(0)
        .setScale(0.05)
        .setDepth(100);
      this.hearts.push(heart);
    }

    this.updateHearts();

    // Ícone da moeda e texto
    const coinIconX = baseX + hudWidth - 70;
    this.add.image(coinIconX, topY + 16, 'coin_icon')
      .setScrollFactor(0)
      .setScale(0.05)
      .setDepth(100);
    this.coinText = this.add.text(coinIconX + 20, topY + 8, '', {
      fontSize: '16px',
      fill: '#fff',
      fontFamily: 'monospace'
    })
      .setScrollFactor(0)
      .setDepth(100);

    this.coinText.setText(this.coinCount.toString());

    // Colisões
    parede.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, parede);
    this.physics.add.collider(this.minions, parede);
    this.physics.add.collider(this.minions, this.player);
    this.physics.add.collider(this.minions, this.player, () => {
      if (!this.player.isDying) {  // Verifica se o jogador não está morrendo
        this.player.health--;  // Diminui a vida do jogador
        this.updateHearts();    // Atualiza os corações na tela

        if (this.player.health <= 0) {
          this.checkPlayerDeath();  // Lógica de morte do jogador
        }

        if (this.player.isDying) {
          this.minions.getChildren().forEach(minion => {
            if (minion.anims && minion.anims.isPlaying) {
              minion.anims.stop();  // Para a animação do minion
            }
          });
        }
      }
    });

    objetos.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, objetos);
    this.physics.add.collider(this.minions, objetos);

    fim.setCollisionByExclusion([-1]);

    // Teclado
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      F: Phaser.Input.Keyboard.KeyCodes.F,
    });

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    this.gameOverText = this.add.text(centerX, centerY - 20, "GAME OVER", {
      fontSize: "48px",
      fill: "#ff0000",
      fontFamily: "PixelFont",
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100) 
      .setVisible(false);
    this.restartText = this.add.text(centerX, centerY + 30, "Pressione R para reiniciar", {
      fontSize: "20px",
      fill: "#ffffff",
      fontFamily: "PixelFont",
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100) 
      .setVisible(false);

    this.isGameOver = false;

    this.createPauseGameButton();
  }

  createPauseGameButton() {
    const xBase = this.cameras.main.width - 40;
    const yBase = 24;
    

    this.pauseGameButton = this.add.container(xBase, yBase).setDepth(200);

    const pauseBtnWidth = 22;
    const pauseBtnHeight = 22;
    const pauseBtnBg = this.add.rectangle(0, 0, 40, 40, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.pauseGameButton.add(pauseBtnBg);

    const pauseText = this.add.text(0, 0, "≡", {
      fontSize: "24px",
      color: "#FFD700",
      fontFamily: "Arial Black"
    })
      .setOrigin(0.5)
    this.pauseGameButton.add(pauseText);

    pauseBtnBg.on("pointerover", () => {
      pauseBtnBg.setFillStyle(0x294d77);
      pauseText.setColor("#ffffff");
    });

    pauseBtnBg.on("pointerout", () => {
      pauseBtnBg.setFillStyle(0x1e1e2f);
      pauseText.setColor("#FFD700");
    });

    pauseBtnBg.on("pointerdown", () => {
      this.scene.launch('PauseMenu');
      this.scene.pause();
    });
  }

  update() {
    if (this.isGameOver && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart({ mapKey: 'map' });
      return;
    }

    // Impede update se o jogo já acabou
    if (this.isGameOver || !this.player || !this.player.active) {
      return;
    }

    updatePlayer(this.player, this.cursors, this.keys);
    this.visionMaskGraphics.clear();
    this.visionMaskGraphics.fillCircle(this.player.x, this.player.y, 70);

    // Checar morte — redundante, mas seguro
    if (this.player.health <= 0 && !this.player.isDying) {
      this.checkPlayerDeath();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
      this.attackEnemy();
    }
  }

  updateHearts() {
    // Verificar se `this.hearts` foi inicializado corretamente
    if (!this.hearts) {
      return;
    }

    // Atualizar a exibição de corações com base na vida do jogador
    for (let i = 0; i < this.player.maxHealth; i++) {
      const heart = this.hearts[i];
      if (heart) {
        const texture = i < this.player.health ? 'heart_full' : 'heart_empty';
        // Alterando a textura dos corações conforme a vida
        if (heart.texture.key !== texture) {
          heart.setTexture(texture);
        }
      }
    }

    console.log("Vida do jogador:", this.player.health);

    // Verifica se a vida do jogador chegou a 0
    if (this.player.health <= 0 && !this.isGameOver) {
      console.log("Jogador morreu!");
      this.checkPlayerDeath();  // Chama a função de morte
    }
  }


  checkPlayerDeath() {
    console.log("Verificando a morte do jogador...");

    // Se o jogo já estiver terminado ou o jogador estiver morrendo, não faz nada
    if (this.isGameOver || !this.player || this.player.isDying) {
      console.log("O jogo já terminou ou o jogador está em animação de morte.");
      return;
    }

    // Imediatamente pausa o jogo e chama o game over
    this.isGameOver = true;
    this.player.setVelocity(0);  // Para o movimento do jogador
    this.physics.pause();  // Pausa a física do jogo

    if (this.gameMusic) {
      this.gameMusic.stop();
    }

    this.player.isDying = true;  // Marca que o jogador está morrendo
    this.player.anims.stop();    // Para qualquer animação do jogador
    this.player.play('die_down'); // Inicia a animação de morte

    // O game over é tratado assim que a animação terminar
    this.player.once('animationcomplete', () => {
      console.log("Animação de morte completa, game over.");
      this.handleGameOver();  // Chama a função para finalizar o jogo
    });

    this.coins.clear(true, true);  // Remove todas as moedas da tela
    this.coinCount = 0;  // Reseta a contagem de moedas
    this.coinText.setText(this.coinCount.toString()); 
  }

  handleGameOver() {

    // Exibe o texto de Game Over imediatamente
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true); 
    
    // Exibe o texto para reiniciar
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.coinCount++;
    this.coinText.setText(this.coinCount);
    this.coinSound = this.sound.add('coinSound');
    this.coinSound.play();
    this.coinSound.setVolume(0.4);
  }

  collectHeart(player, heart) {
    heart.disableBody(true, true);

    if (heart.x === 512 && heart.y === 260) {
      this.removeFog(); // Remove o fog quando pega esse coração específico
    }

    // Remove o coração do array para não tentar atualizar depois
    const index = this.hearts.indexOf(heart);
    if (index > -1) {
      this.hearts.splice(index, 1);
    }

    if (this.player.health < this.player.maxHealth) {
      this.player.health++;
      this.updateHearts();
    }

    this.heartSound = this.sound.add('heartSound');
    this.heartSound.play();
    this.heartSound.setVolume(0.4);
  }

  attackEnemy() {
    const now = this.time.now;
    if (now < this.attackCooldown) return;

    console.log("Atacando inimigos...");  // Logando quando o ataque é feito
    this.attackCooldown = now + 500;

    const range = 60;
    this.minions.getChildren().forEach(minion => {
      const dx = minion.x - this.player.x;
      const dy = minion.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= range) {
        minion.health--;
        this.sound.play('orcHit');
        if (minion.health <= 0) {
          minion.die();
        } else {
          minion.play('minion_hit', true);
        }
      }
    });

    if (this.boss) {
      const dx = this.boss.x - this.player.x;
      const dy = this.boss.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= range) {
        this.boss.takeDamage(1); // Aplica dano ao boss
        //this.sound.play('dragonHit');
        console.log("Dano no Boss!");
      }
    }
  }

  removeFog() {
    this.tweens.add({
      targets: this.fogOfWar,
      alpha: 0, 
      duration: 1500,  
      ease: 'Linear'
    });
  }
}