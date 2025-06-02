// ... (importações)
import { Scene } from 'phaser';
import { createPlayer } from '../objects/player';
import { updatePlayer } from '../objects/player';
import Minion, { createMinionAnimations } from '../objects/minion';


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
        const tiledset = map.addTilesetImage('assets', 'tiles');
        map.createLayer('fundo preto', tiledset, 0, 0);
        map.createLayer('chao', tiledset, 0, 0);
        const parede = map.createLayer('parede', tiledset, 0, 0);
        parede.setCollisionByProperty({ collides: true }); 
        map.createLayer('detalhe do chao', tiledset, 0, 0);
        map.createLayer('portao', tiledset, 0, 0);
        map.createLayer('agua', tiledset, 0, 0);
        map.createLayer('detalhes', tiledset, 0, 0);
        map.createLayer('fim', tiledset, 0, 0);
        const objetos = map.createLayer('objetos', tiledset, 0, 0);
        objetos.setCollisionByProperty({ collides: true });

        // Criando o player
        this.player = createPlayer(this);
        this.player.health = 3;
        this.player.maxHealth = 3;

        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // Corações no mapa
        this.heartsGroup = this.physics.add.group();
        [
            { x: 40, y: 650 },
            { x: 424, y: 87 },
            { x: 758, y: 647 },
            { x: 928, y: 115 }
        ].forEach(pos => {
            const heart = this.heartsGroup.create(pos.x, pos.y, 'heart_item');
            heart.setScale(0.03);
        });
        this.physics.add.overlap(this.player, this.heartsGroup, this.collectHeart, null, this);

        // Moedas
        this.coins = this.physics.add.group();
        [
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

        ].forEach(pos => {
            const coin = this.coins.create(pos.x, pos.y, 'coin');
            coin.setScale(0.03);
            coin.setBounce(0.5);
        });
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

        // Lacaios
        this.minions = this.physics.add.group();
        [
            { x: 300, y: 400 },
            { x: 500, y: 250 },
            { x: 700, y: 350 },
            { x: 800, y: 450 } // mantida a versão com mais lacaios
        ].forEach(pos => {
            const minion = new Minion(this, pos.x, pos.y, 'minion', this.player);
            this.minions.add(minion);
        });

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

        this.coinText = this.add.text(coinIconX + 20, topY + 8, '0', {
            fontSize: '16px',
            fill: '#fff',
            fontFamily: 'monospace'
        }).setScrollFactor(0);




        // Colisões
        parede.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, parede);
        this.physics.add.collider(this.minions, parede);
        this.physics.add.collider(this.minions, this.player);

        objetos.setCollisionByExclusion([-1]); 
        this.physics.add.collider(this.player, objetos);
        this.physics.add.collider(this.minions, objetos);

        // Teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            F: Phaser.Input.Keyboard.KeyCodes.F
        });

        // HUD de Game Over
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
