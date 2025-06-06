import { Scene } from 'phaser';
import { loadSprites } from '../objects/player';
import { loadMinionSprites } from '../objects/minion';
import { loadBossSprites, loadBossAtackSprites, loadBossDeathSprites} from '../objects/boss';
import { loadPrincessSprites } from '../objects/princess';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Barra de progresso
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        this.load.on('progress', (progress) => {
            bar.width = 4 + (460 * progress);
        });
    }

    preload() {
        // Carregar os assets do jogo
        this.load.setPath('assets');

        this.load.image('background', 'backgrounds/dungeon-bg-1024x768.png');
        this.load.image('tiles', 'maps/assetsmap.png');
        this.load.tilemapTiledJSON('map', 'maps/map.json');
        this.load.tilemapTiledJSON('map2', 'maps/map2.json');
        this.load.tilemapTiledJSON('map3', 'maps/map3.json');

        // Áudios
        this.load.audio("click", "audio/click.mp3");
        this.load.audio("menuMusic", "audio/menu-theme.mp3");
        this.load.audio("attack", "audio/attack.mp3");
        this.load.audio('dragonAttack', 'audio/dragon_attack.mp3'); 
        this.load.audio('orcHit', 'audio/danolacaio.wav'); 
        this.load.audio('gameMusic', "audio/game-theme.mp3");
        this.load.audio('coinSound', 'audio/coins-sound.mp3');
        this.load.audio('heartSound', 'audio/heart-sound.mp3');
        this.load.audio('dragon-sound', 'audio/dragon-sound.mp3');
        this.load.audio('fire-sound', 'audio/fire-sound.mp3');
        
        // UI e itens
        this.load.image('heart_full', 'ui/heart_full.png');
        this.load.image('heart_empty', 'ui/heart_empty.png');
        this.load.image('coin', 'items/coin.png');
        this.load.image('coin_icon', 'ui/coin.png'); // moedas do mapa
        this.load.image('heart_item', 'items/heart_full.png'); // Corações do mapa

        //tela final
        this.load.image('fim', 'fim.png');

        // Lacaios (minions)
        loadMinionSprites(this);
        // Jogador
        loadSprites(this);
        // Boss
        loadBossSprites(this);
       // Boss Atack
       loadBossAtackSprites(this);
       //Boss morte
       loadBossDeathSprites(this);
        //Princesa
       loadPrincessSprites(this);
    }

    create() {
        this.scene.start('MainMenu');
    }
}
