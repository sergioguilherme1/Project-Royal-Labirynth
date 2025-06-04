import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { PauseMenu } from './scenes/PauseMenu';  // Importação adicionada
import { AUTO, Game, Physics } from 'phaser';

const config = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        PauseMenu,       // Cena PauseMenu adicionada aqui
        GameOver
    ],
    physics: {
        default: 'arcade',
        arcade: { 
            gravity: { y: 0 },
            debug: true,
        }
    }
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

export default StartGame;
