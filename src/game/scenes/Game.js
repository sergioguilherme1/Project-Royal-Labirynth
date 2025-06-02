import { Scene } from 'phaser';
import { createPlayer } from '../objects/player';
import { updatePlayer } from '../objects/player';
import Minion, { createMinionAnimations } from '../objects/minion';
import Boss from '../objects/boss';



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
        parede.setCollisionByProperty({ collides: true }); // mantido esse como versão mais completa
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

        //Criando lacaios
        createMinionAnimations(this);
        this.minions = this.physics.add.group();
        const patrolZones = [
            [ { x: 150, y: 470}, { x: 300, y: 470 } ],  // minion 1
            [ { x: 50, y: 350 }, { x: 50, y: 500 } ],  // minion 2  
        ];

        //boss
    
        this.boss = new Boss(this, 890, 680, 'boss', this.player);
        this.physics.add.collider(this.boss, parede);
        this.physics.add.collider(this.boss, this.player, () => {
        // lógica de dano ou efeito
        });



        patrolZones.forEach(zone => {
        const startPos = zone[0];
        const minion = new Minion(this, startPos.x, startPos.y, 'minion', this.player);
        minion.patrolPoints = zone;
        minion.currentPatrolIndex = 1;
        this.minions.add(minion);
        });

        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // Corações no mapa
        this.heartsGroup = this.physics.add.group();
        [
            { x: 400, y: 200 },
            { x: 800, y: 300 }
        ].forEach(pos => {
            const heart = this.heartsGroup.create(pos.x, pos.y, 'heart_item');
            heart.setScale(0.03);
        });
        this.physics.add.overlap(this.player, this.heartsGroup, this.collectHeart, null, this);

        // Moedas
        this.coins = this.physics.add.group();
        [
            { x: 300, y: 100 },
            { x: 500, y: 200 },
            { x: 700, y: 400 }
        ].forEach(pos => {
            const coin = this.coins.create(pos.x, pos.y, 'coin');
            coin.setScale(0.03);
            coin.setBounce(0.5);
        });
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

        // HUD de vida
        for (let i = 0; i < this.player.maxHealth; i++) {
            const heart = this.add.image(16 + i * 32, 16, 'heart_full')
                .setScrollFactor(0)
                .setScale(0.05);
            this.hearts.push(heart);
        }

        // HUD de moedas
        this.add.image(160, 16, 'coin_icon').setScrollFactor(0).setScale(0.05);
        this.coinText = this.add.text(180, 8, '0', {
            fontSize: '16px', fill: '#fff', fontFamily: 'monospace'
        }).setScrollFactor(0);

        // Colisões
        parede.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, parede);
        this.physics.add.collider(this.minions, parede);
        this.physics.add.collider(this.minions, this.player);

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
                if (minion.health <= 0) {
                    minion.die();
                } else {
                    // opcional: tocar animação de "hit"
                    minion.play('minion_hit', true);
                }
            }
        });
    }
}
