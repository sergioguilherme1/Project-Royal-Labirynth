import { Scene } from 'phaser';

//criando a cena
export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        // Cena Boot, usada para carregar assets usadas na cena preloader

        this.load.image('logo', 'logo.png');
        this.load.image('background', 'backgrounds/dungeon-bg-1024x768.png');
    }

    create ()
    {
        //Mover para a cena preloader
        this.scene.start('Preloader');
    }
}
