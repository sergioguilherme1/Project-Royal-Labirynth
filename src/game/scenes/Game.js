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

  pauseGameButton;

  constructor() {
    super('Game');
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('assests', 'tiles');
    map.createLayer('fundo', tileset, 0, 0);
    map.createLayer('chao', tileset, 0, 0);
    const parede = map.createLayer('parede', tileset, 0, 0);
    parede.setCollisionByProperty({ collides: true });
    map.createLayer('detalhes', tileset, 0, 0);
    map.createLayer('itens', tileset, 0, 0);
    map.createLayer('pilar', tileset, 0, 0);
    map.createLayer('cachoeira', tileset, 0, 0);
    map.createLayer('detalhes / agua', tileset, 0, 0);
    map.createLayer('agua', tileset, 0, 0);

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

    // Música principal do jogo
    this.menuMusic = this.sound.add("menuMusic", { loop: true, volume: 0.5 });
    this.menuMusic.play();

    // Botão de menu menor, no canto superior direito, um pouco mais para cima
    this.createPauseGameButton();

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
