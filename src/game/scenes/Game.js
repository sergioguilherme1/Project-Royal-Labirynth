import { Scene } from 'phaser';
import { createPlayer } from '../objects/player';
import { updatePlayer } from '../objects/player';


export class Game extends Scene
{
    player;
    constructor ()
    {
        super('Game');
    }

    create ()
    {  
        const map = this.make.tilemap({ key: 'map' });

        const tiledset = map.addTilesetImage('assests', 'tiles');
        const fundo = map.createLayer('fundo', tiledset, 0, 0);  
        const chao = map.createLayer('chao', tiledset, 0, 0);  
        const parede = map.createLayer('parede', tiledset, 0, 0);
        const detalhes = map.createLayer('detalhes', tiledset, 0, 0);
        const itens = map.createLayer('itens', tiledset, 0, 0);
        const pilar = map.createLayer('pilar', tiledset, 0, 0);
        const cachoeira = map.createLayer('cachoeira', tiledset, 0, 0);
        const detalhes2 = map.createLayer('detalhes / agua', tiledset, 0, 0);
        const agua = map.createLayer('agua', tiledset, 0, 0);

        this.player = createPlayer(this);

        parede.setCollisionByExclusion([-1]);

        this.physics.add.collider(this.player, parede);

        this.cursors = this.input.keyboard.createCursorKeys();

    }

    update() {
        updatePlayer(this.player, this.cursors);
    }
}
