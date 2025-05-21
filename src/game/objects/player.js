import Phaser from 'phaser';

export const createPlayer = (scene) => {
    const player = scene.physics.add.sprite(80,685, 'player_idle');
    player.setScale(1.5,1.5);
    createAnimations(scene);
    return player;
};

export const loadSprites = (scene) => {
    scene.load.spritesheet('player_idle', 'Soldier-Idle.png', {
        frameWidth: 100,
        frameHeight: 100,
        spacing: 0,
    });

    scene.load.spritesheet('player_walk', 'Soldier-Walk.png', {
        frameWidth: 100,
        frameHeight: 100,
        spacing: 0,
    });

    scene.load.spritesheet('player_attack', 'Soldier-Attack01.png', {
        frameWidth: 100,
        frameHeight: 100,
        spacing: 0,
    });
};

export const createAnimations = (scene) => {
  scene.anims.create({
    key: 'player_idle',
    frames: scene.anims.generateFrameNumbers('player_idle', {
      start: 0,
      end: 6
    }),
    frameRate: 7,
    repeat: -1,
    yoyo: true
  });

  scene.anims.create({
    key: 'player_walk',
    frames: scene.anims.generateFrameNumbers('player_walk', {
      start: 0,
      end: 8
    }),
    frameRate: 9,
    repeat: -1
  });

  scene.anims.create({
    key: 'player_attack',
    frames: scene.anims.generateFrameNumbers('player_attack', {
      start: 0,
      end: 6
    }),
    frameRate: 10,
    repeat: 0
  });
};