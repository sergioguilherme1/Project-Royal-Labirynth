import { Scene } from 'phaser';
import { createPlayer } from '../objects/player';

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

        const tiledset = map.addTilesetImage('assets', 'tiles');
        const groundLayer = map.createLayer('ground', tiledset, 0, 0);  

        this.player = createPlayer(this);

        this.player.anims.play('player_idle', true);
    }
}
