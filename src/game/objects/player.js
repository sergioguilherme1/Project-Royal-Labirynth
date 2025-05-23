import Phaser from 'phaser';

export const createPlayer = (scene) => {
  const player = scene.physics.add.sprite(82, 80, 'player_idle');
  player.setScale(1.2, 1.2);
  // Ajuste hitbox (tamanho da colisão) e offset (deslocamento do hitbox)
  player.setSize(20, 28);
  player.setOffset(10, 12);
  createAnimations(scene);
  return player;
};

export const loadSprites = (scene) => {
  scene.load.spritesheet('player_idle', 'Cedric.png', {
    frameWidth: 40,
    frameHeight: 40,
    spacing: 10,
  });

  scene.load.spritesheet('player_walk', 'Cedric.png', {
    frameWidth: 40,
    frameHeight: 40,
    spacing: 10,
  });

  scene.load.spritesheet('player_attack', 'Cedric.png', {
    frameWidth: 40,
    frameHeight: 40,
    spacing: 0,
  });
};

export const createAnimations = (scene) => {
  scene.anims.create({
    key: 'idle_down',
    frames: [ { key: 'player_idle', frame: 1 } ],
    frameRate: 1,
    repeat: 0
  });

  scene.anims.create({
    key: 'idle_left',
    frames: [ { key: 'player_idle', frame: 12 } ],
    frameRate: 1,
    repeat: 0
  });

  scene.anims.create({
    key: 'idle_right',
    frames: [ { key: 'player_idle', frame: 22 } ],
    frameRate: 1,
    repeat: 0
  });

  scene.anims.create({
    key: 'idle_up',
    frames: [ { key: 'player_idle', frame: 34 } ],
    frameRate: 1,
    repeat: 0
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

export const updatePlayer = (player, cursors) => {
  const speed = 100;
  player.setVelocity(0);
  if (cursors.left.isDown) {
    player.anims.play('idle_left', true);
  } else if (cursors.right.isDown) {
    player.anims.play('idle_right', true);
  } else if (cursors.up.isDown) {
    player.anims.play('idle_up', true);
  } else if (cursors.down.isDown) {
    player.anims.play('idle_down', true);
  } 

};