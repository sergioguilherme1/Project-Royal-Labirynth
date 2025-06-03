import { Scene } from 'phaser';
import { createPlayer } from '../objects/player';
import { updatePlayer } from '../objects/player';
import Minion from '../objects/minion';

export class Game extends Scene {
  player;
  hearts = [];
  coinCount = 0;
  coinText;
  attackCooldown = 0;
  isPaused = false;

  // Guarda referências do menu modal
  optionsModalBackground = null;
  optionsModalGroup = null;

  constructor() {
    super('Game');
  }

  create() {
    // === Seu código padrão para mapa, player, HUD, etc ===
    const map = this.make.tilemap({ key: 'map' });
    const tiledset = map.addTilesetImage('assests', 'tiles');
    map.createLayer('fundo', tiledset, 0, 0);
    map.createLayer('chao', tiledset, 0, 0);
    const parede = map.createLayer('parede', tiledset, 0, 0);
    parede.setCollisionByProperty({ collides: true });
    map.createLayer('detalhes', tiledset, 0, 0);
    map.createLayer('itens', tiledset, 0, 0);
    map.createLayer('pilar', tiledset, 0, 0);
    map.createLayer('cachoeira', tiledset, 0, 0);
    map.createLayer('detalhes / agua', tiledset, 0, 0);
    map.createLayer('agua', tiledset, 0, 0);

    this.player = createPlayer(this);
    this.player.health = 3;
    this.player.maxHealth = 3;

    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.heartsGroup = this.physics.add.group();
    [{ x: 400, y: 200 }, { x: 800, y: 300 }].forEach(pos => {
      const heart = this.heartsGroup.create(pos.x, pos.y, 'heart_item');
      heart.setScale(0.03);
    });
    this.physics.add.overlap(this.player, this.heartsGroup, this.collectHeart, null, this);

    this.coins = this.physics.add.group();
    [{ x: 300, y: 100 }, { x: 500, y: 200 }, { x: 700, y: 400 }].forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setScale(0.03);
      coin.setBounce(0.5);
    });
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    this.minions = this.physics.add.group();
    [
      { x: 300, y: 400 },
      { x: 500, y: 250 },
      { x: 700, y: 350 },
      { x: 800, y: 450 }
    ].forEach(pos => {
      const minion = new Minion(this, pos.x, pos.y, 'minion', this.player);
      this.minions.add(minion);
    });

    for (let i = 0; i < this.player.maxHealth; i++) {
      const heart = this.add.image(16 + i * 32, 16, 'heart_full')
        .setScrollFactor(0)
        .setScale(0.05);
      this.hearts.push(heart);
    }

    this.add.image(160, 16, 'coin_icon').setScrollFactor(0).setScale(0.05);
    this.coinText = this.add.text(180, 8, '0', {
      fontSize: '16px', fill: '#fff', fontFamily: 'monospace'
    }).setScrollFactor(0);

    // === BOTÃO HAMBURGUER ===
    const btnX = this.cameras.main.width - 50;
    const btnY = 20;

    const btnBg = this.add.rectangle(btnX, btnY, 40, 32, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(btnX, btnY, '☰', {
      fontSize: '28px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x294d77));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x1e1e2f));
    btnBg.on('pointerdown', () => this.openOptionsMenu());

    btnText.setInteractive({ useHandCursor: true });
    btnText.on('pointerdown', () => this.openOptionsMenu());

    parede.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, parede);
    this.physics.add.collider(this.minions, parede);
    this.physics.add.collider(this.minions, this.player);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      F: Phaser.Input.Keyboard.KeyCodes.F
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

  openOptionsMenu() {
    if (this.optionsModalGroup) return;

    this.isPaused = true;
    this.scene.pause();

    const cam = this.cameras.main;
    const width = cam.width;
    const height = cam.height;

    // Fundo modal bloqueador com depth alto
    this.optionsModalBackground = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
     .setOrigin(0, 0)
     .setDepth(1000)
     .setInteractive()
     .on('pointerdown', e => e.stopPropagation());

    // Grupo para modal
    this.optionsModalGroup = this.add.group([], {
      key: 'modal',
      active: true,
      visible: true,
      maxSize: -1
    });

    this.optionsModalGroup.add(this.optionsModalBackground);

    // Fundo do painel
    const panelWidth = 320;
    const panelHeight = 160;
    const panelX = width / 2;
    const panelY = height / 2;

    const graphics = this.add.graphics()
      .fillStyle(0x1e1e2f, 0.95)
      .lineStyle(3, 0xffd700)
      .fillRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 16)
      .strokeRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 16)
      .setDepth(1001);

    this.optionsModalGroup.add(graphics);

    // Botão "Voltar ao Menu"
    const btnReturn = this.add.text(panelX, panelY - 30, 'Voltar ao Menu', {
      fontSize: '24px',
      fill: '#FFD700',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(1002).setInteractive({ useHandCursor: true });

    btnReturn.on('pointerdown', e => {
      e.stopPropagation();
      this.sound.play('click');
      this.closeOptionsMenu();
      this.scene.start('MainMenu');
    });

    this.optionsModalGroup.add(btnReturn);

    // Botão "Continuar"
    const btnContinue = this.add.text(panelX, panelY + 30, 'Continuar', {
      fontSize: '24px',
      fill: '#FFD700',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(1002).setInteractive({ useHandCursor: true });

    btnContinue.on('pointerdown', e => {
      e.stopPropagation();
      this.sound.play('click');
      this.closeOptionsMenu();
    });

    this.optionsModalGroup.add(btnContinue);
  }

  closeOptionsMenu() {
    if (!this.optionsModalGroup) return;

    this.optionsModalGroup.clear(true, true);
    if (this.optionsModalBackground) {
      this.optionsModalBackground.destroy();
      this.optionsModalBackground = null;
    }

    this.optionsModalGroup = null;
    this.isPaused = false;
    this.scene.resume();
  }

  update() {
    if (this.isPaused) return;

    updatePlayer(this.player, this.cursors, this.keys);

    if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
      this.attackEnemy();
    }

    Phaser.Actions.Call(this.minions.getChildren(), minion => {
      if (minion.preUpdate) minion.preUpdate();
    });
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
    if (this.player.health < this.player.maxHealth) {
      this.player.health++;
      this.updateHearts();
    }
  }

  updateHearts() {
    for (let i = 0; i < this.hearts.length; i++) {
      const heart = this.hearts[i];
      if (heart && heart.setTexture) {
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

      if (distance <= range && minion.active) {
        minion.health--;
        if (minion.health <= 0) {
          minion.disableBody(true, true);
        }
      }
    });
  }
}
