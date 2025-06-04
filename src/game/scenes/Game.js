import { Scene } from 'phaser';
import { createPlayer } from '../objects/player';
import { updatePlayer } from '../objects/player';
import Minion, { createMinionAnimations } from '../objects/minion';
import Boss, { loadBossSprites, loadBossAtackSprites, loadBossMortSprites, createBossAnimations } from '../objects/boss';

const MAP_CONFIG = {
    map: {
        spawn: { x: 65, y: 60},
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
            { x: 100, y: 200 },
            { x: 300, y: 400 }
        ],
        hearts: [
            { x: 150, y: 250 }
        ],
        nextMap: 'map3'
    },
    map3: {
        spawn: { x: 512, y: 537 },
        coins: [],
        hearts: [],
        nextMap: null 
    }
};

const MINIONS_CONFIG = {
  map: [
    [ { x: 41, y: 504 }, { x: 200, y: 504 } ], 
    [ { x: 293, y: 486 }, { x: 536, y: 486 } ],
    [ { x: 328, y: 58 }, { x: 328, y: 228 } ],
    [ { x: 647, y: 104 }, { x: 520, y: 104 }, { x: 520, y: 215 }, { x: 520, y: 104 } ], 
    [ { x: 968, y: 375 }, { x: 743, y: 375 } ], 
    [ { x: 679, y: 728 }, { x: 936, y: 728 } ], 
    
  ],
  map2: [
    [ { x: 104, y: 70 }, { x: 104, y: 340 } ], 
    [ { x: 104, y:350 }, { x: 104, y: 520 } ], 
    [ { x: 197, y: 521 }, { x: 650, y: 521 } ],
    [ { x: 265, y: 359 }, { x: 328, y: 406 }, { x: 388, y: 360 }, { x: 327, y: 319 } ], 
    [ { x: 938, y: 282 }, { x: 680, y: 282 } ],
    [ { x: 951, y: 438 }, { x: 951, y: 678 } ],
    [ { x: 172, y: 680 }, { x: 543, y: 680 } ],
  ],
  map3: [
    [ { x: 246, y: 179 }, { x: 76, y: 179 } ],
    [ { x: 237, y: 544 }, { x: 237, y: 299 } ], 
    [ { x: 66, y: 688 }, { x: 374, y: 687 } ], 
    [ { x: 956, y: 686 }, { x: 642, y: 686 } ], 
    [ { x: 783, y: 545 }, { x: 783, y: 257 } ], 
    [ { x: 958, y: 174 }, { x: 783, y: 174 } ], 
  ]
};

const LAST_MAP_WITH_BOSS = 'map3';

export class Game extends Scene {
  player;
  hearts = [];
  coinCount = 0;
  coinText;
  attackCooldown = 0;

  pauseGameButton;

    constructor() {
        super('Game');
    }
         preload() {
    this.load.audio('dragonAttack', 'assets/audio/dragon_attack.wav');
    }

    create(data) {
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

        // Player
        const spawn = config.spawn || { x: 0, y: 0 };
        this.player = createPlayer(this, spawn.x, spawn.y);
        this.player.maxHealth = 3;

        //Boss
        if(mapKey === LAST_MAP_WITH_BOSS){
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
            this.physics.add.collider(this.boss, this.player, () => {
            // lógica de dano ou efeito
            });
        }

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
        this.player.health = data?.health ?? 3;

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
        this.heartsGroup = this.physics.add.group();
        (config.hearts || []).forEach(pos => {
            const heart = this.heartsGroup.create(pos.x, pos.y, 'heart_item');
            heart.setScale(0.03);
        });
        this.physics.add.overlap(this.player, this.heartsGroup, this.collectHeart, null, this);

        const cameraWidth = this.cameras.main.width;
        const topY = 5;
        const hudWidth = 200;

        // Canto superior direito
        const baseX = cameraWidth - hudWidth;

        // Fundo da HUD
        const hudBg = this.add.graphics();
        hudBg.fillStyle(0x000000, 0.5);
        hudBg.fillRoundedRect(baseX, topY, hudWidth, 32, 8);
        hudBg.setScrollFactor(0);

        // Corações
        for (let i = 0; i < this.player.maxHealth; i++) {
            const heartX = baseX + 16 + i * 32;
            const heart = this.add.image(heartX, topY + 16, 'heart_full')
                .setScrollFactor(0)
                .setScale(0.05);
            this.hearts.push(heart);
        }

        // Ícone da moeda e texto
        const coinIconX = baseX + hudWidth - 70;
        this.add.image(coinIconX, topY + 16, 'coin_icon')
            .setScrollFactor(0)
            .setScale(0.05);
        this.coinText = this.add.text(coinIconX + 20, topY + 8, '', {
        fontSize: '16px',
        fill: '#fff',
        fontFamily: 'monospace'
        }).setScrollFactor(0);

        this.coinText.setText(this.coinCount.toString());

        // Colisões
        parede.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, parede);
        this.physics.add.collider(this.minions, parede);
        this.physics.add.collider(this.minions, this.player);

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
    this.gameOverText = this.add.text(centerX, centerY - 20, 'GAME OVER', {
      fontSize: '48px', fill: '#ff0000', fontFamily: 'monospace'
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);
    this.restartText = this.add.text(centerX, centerY + 30, 'Pressione R para reiniciar', {
      fontSize: '20px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    this.isGameOver = false;
  }

  createPauseGameButton() {
    const xBase = this.cameras.main.width - 40;
    const yBase = 24; // subido para alinhar melhor

    this.pauseGameButton = this.add.container(xBase, yBase);

    const pauseBtnBg = this.add.rectangle(0, 0, 40, 40, 0x1e1e2f) // tamanho menor
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.pauseGameButton.add(pauseBtnBg);

    const pauseText = this.add.text(0, 0, "≡", {
      fontSize: "24px", // tamanho da fonte menor
      color: "#FFD700",
      fontFamily: "Arial Black"
    }).setOrigin(0.5);
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
    updatePlayer(this.player, this.cursors, this.keys);

        if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
            this.attackEnemy();
        }
    }

  handleGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.setVelocity(0);
    this.physics.pause();
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.coinCount++;
    this.coinText.setText(this.coinCount);
  }

    collectHeart(player, heart) {
        heart.disableBody(true, true);

        // Remove o coração do array para não tentar atualizar depois
        const index = this.hearts.indexOf(heart);
        if (index > -1) {
            this.hearts.splice(index, 1);
        }

        if (this.player.health < this.player.maxHealth) {
            this.player.health++;
            this.updateHearts();
        }
    }

    updateHearts() {
        for (let i = 0; i < this.hearts.length; i++) {
            const heart = this.hearts[i];
            // Verifica se o heart existe e está ativo na cena
            if (heart && heart.setTexture && heart.scene) {
                const texture = i < this.player.health ? 'heart_full' : 'heart_empty';
                heart.setTexture(texture);
            }
        }
    }

  attackEnemy() {
    const now = this.time.now;
    if (now < this.attackCooldown) return;
    this.attackCooldown = now + 500;

    const range = 50;
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
    }
}
