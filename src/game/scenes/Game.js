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

    constructor() {
        super('Game');
    }

    create() {
        // Criando o mapa
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

        // Criando o player
        this.player = createPlayer(this);
        this.player.health = 3;
        this.player.maxHealth = 3;

        // Reiniciar
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // Criar grupo de corações coletáveis
        this.heartsGroup = this.physics.add.group();
        const heartPositions = [
            { x: 400, y: 200 },
            { x: 800, y: 300 }
        ];
        heartPositions.forEach(pos => {
            const heart = this.heartsGroup.create(pos.x, pos.y, 'heart_item');
            heart.setScale(0.03);
        });
        this.physics.add.overlap(this.player, this.heartsGroup, this.collectHeart, null, this);

        // Criar grupo de moedas
        this.coins = this.physics.add.group();
        const coinPositions = [
            { x: 300, y: 100 },
            { x: 500, y: 200 },
            { x: 700, y: 400 }
        ];
        coinPositions.forEach(pos => {
            const coin = this.coins.create(pos.x, pos.y, 'coin');
            coin.setScale(0.03);
            coin.setBounce(0.5);
        });
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

        // Criar grupo de lacaios
        this.minions = this.physics.add.group();
        const spawnPoints = [
            { x: 300, y: 400 },
            { x: 500, y: 250 },
            { x: 700, y: 350 },
            { x: 800, y: 450 }
        ];
        spawnPoints.forEach(pos => {
            const minion = new Minion(this, pos.x, pos.y, 'minion', this.player);
            this.minions.add(minion);
        });

        // Animações dos lacaios
        this.anims.create({ key: 'orc_idle', frames: this.anims.generateFrameNumbers('minion', { start: 0, end: 7 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'orc_walk', frames: this.anims.generateFrameNumbers('minion', { start: 8, end: 15 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'orc_attack', frames: this.anims.generateFrameNumbers('minion', { start: 16, end: 23 }), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'orc_hit', frames: this.anims.generateFrameNumbers('minion', { start: 24, end: 31 }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'orc_die', frames: this.anims.generateFrameNumbers('minion', { start: 32, end: 39 }), frameRate: 8, repeat: 0 });

        // Animação do jogador morrendo
        this.anims.create({ key: 'player_die', frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }), frameRate: 8, repeat: 0 });

        // HUD de corações (vida)
        for (let i = 0; i < this.player.maxHealth; i++) {
            const heart = this.add.image(16 + i * 32, 16, 'heart_full')
                .setScrollFactor(0)
                .setScale(0.05);
            this.hearts.push(heart);
        }

        // HUD de moedas
        this.add.image(160, 16, 'coin_icon').setScrollFactor(0).setScale(0.05);
        this.coinText = this.add.text(180, 8, '0', {
            fontSize: '16px',
            fill: '#fff',
            fontFamily: 'monospace'
        }).setScrollFactor(0);

        // Colisões
        parede.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, parede);
        this.physics.add.collider(this.minions, parede);
        this.physics.add.collider(this.minions, this.player);

        // Teclas
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            F: Phaser.Input.Keyboard.KeyCodes.F
        });

        // HUD Game Over
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

    update() {
        if (this.isGameOver && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
            this.scene.restart();
        }

        updatePlayer(this.player, this.cursors, this.keys);

        if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
            this.attackEnemy();
        }

        Phaser.Actions.Call(this.minions.getChildren(), (minion) => {
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
  this.hearts.forEach(heart => heart.destroy());
  this.hearts = [];

  for (let i = 0; i < this.player.maxHealth; i++) {
    const texture = i < this.player.currentHealth ? 'heart_full' : 'heart_empty';
    const heart = this.add.image(16 + i * 32, 16, texture).setScrollFactor(0).setScale(0.05);
    this.hearts.push(heart);
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
