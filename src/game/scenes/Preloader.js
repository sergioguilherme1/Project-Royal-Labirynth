    import { Scene } from 'phaser';
    import { loadSprites } from '../objects/player';


    export class Preloader extends Scene
    {
        constructor ()
        {
            super('Preloader');
        }

        init ()
        {

            //  A simple progress bar. This is the outline of the bar.
            this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

            //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
            const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

            //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
            this.load.on('progress', (progress) => {

                //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
                bar.width = 4 + (460 * progress);

            });
        }

        preload () {
    // Carregar os assets do jogo
    this.load.setPath('assets');

    this.load.image('background', 'backgrounds/dungeon-bg-1024x768.png');
    this.load.image('tiles', 'maps/assetsmap.png');
    this.load.tilemapTiledJSON('map', 'maps/map.json');
    this.load.audio("click", "audio/click.mp3");
    this.load.audio("menuMusic", "audio/menu-theme.mp3");
    this.load.image('heart_full', 'ui/heart_full.png');
    this.load.image('heart_empty', 'ui/heart_empty.png');
    this.load.audio('attack', 'audio/attack.mp3');
    this.load.image('coin', '/items/coin.png');
    this.load.image('coin_icon', '/ui/coin.png'); // caminho do ícone da moeda
    this.load.image('heart_item', '/items/heart_full.png');




    // ✅ Lacaio (minion)
   this.load.spritesheet('minion', '/characters/Orc.png', {
    frameWidth: 32,
    frameHeight: 32
});


    loadSprites(this);
}

        create ()
        {
            //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
            //  For example, you can define global animations here, so we can use them in other scenes.

            //  Alterar para a cena MainMenu
            this.scene.start('MainMenu');
        }
    }
