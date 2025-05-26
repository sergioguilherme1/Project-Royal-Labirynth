import Phaser from 'phaser';

// Criação do player com tamanho, escala e hitbox
export const createPlayer = (scene) => {
  const player = scene.physics.add.sprite(82, 80, 'player');
  player.setScale(1.2);
  player.setSize(20, 24);
  player.setOffset(14, 14);
  player.lastDirection = 'down';
  createAnimations(scene);
  return player;
};

//Carregando sprites
export const loadSprites = (scene) => {
  scene.load.spritesheet('player', 'characters/Cedric.png', {
    frameWidth: 48,
    frameHeight: 48,
    spacing: 0,
  });

  scene.load.spritesheet('player_attack', 'characters/Cedric.png', {
    frameWidth: 48,
    frameHeight: 48,
    spacing: 0,
  });
};

//Criando Aniamções
export const createAnimations = (scene) => {
  //Animações personagem andando
  scene.anims.create({
    key: 'walk_down',
    frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'walk_left',
    frames: scene.anims.generateFrameNumbers('player', { start: 12, end: 14 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'walk_right',
    frames: scene.anims.generateFrameNumbers('player', { start: 24, end: 26 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'walk_up',
    frames: scene.anims.generateFrameNumbers('player', { start: 36, end: 38 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'attack_down',
    frames: scene.anims.generateFrameNumbers('player_attack', { start: 50, end: 54 }),
    frameRate: 8,
    repeat: 0
  });

  scene.anims.create({
    key: 'attack_left',
    frames: scene.anims.generateFrameNumbers('player_attack', { start: 21, end: 25 }),
    frameRate: 8,
    repeat: 0
  });

  scene.anims.create({
    key: 'attack_right',
    frames: scene.anims.generateFrameNumbers('player_attack', { start: 22, end: 24 }),
    frameRate: 8,
    repeat: 0
  });

  scene.anims.create({
    key: 'attack_up',
    frames: scene.anims.generateFrameNumbers('player_attack', { start: 33, end: 35 }),
    frameRate: 8,
    repeat: 0
  });

};

//Atualizando sprites de  acordo com comandos executados
export const updatePlayer = (player, cursors, keys) => {
  const speed = 100;

  if (player.anims.currentAnim?.key?.startsWith('attack') && player.anims.isPlaying) {
    return;
  }

  let moving = false;

  const left = cursors.left.isDown || keys.left.isDown;
  const right = cursors.right.isDown || keys.right.isDown;
  const up = cursors.up.isDown || keys.up.isDown;
  const down = cursors.down.isDown || keys.down.isDown;
  const keyf = Phaser.Input.Keyboard.JustDown(keys.F);

  player.setVelocity(0);

  if (left) {
    player.setVelocityX(-speed);
    player.anims.play('walk_left', true);
    player.flipX = false;
    player.lastDirection = 'left';
    moving = true;
  } else if (right) {
    player.setVelocityX(speed);
    player.anims.play('walk_right', true);
    player.flipX = false;
    player.lastDirection = 'right';
    moving = true;
  } else if (up) {
    player.setVelocityY(-speed);
    player.anims.play('walk_up', true);
    player.lastDirection = 'up';
    moving = true;
  } else if (down) {
    player.setVelocityY(speed);
    player.anims.play('walk_down', true);
    player.lastDirection = 'down';
    moving = true;
  }

  if (keyf) {
    const dir = player.lastDirection;
    const animKey = `attack_${dir}`;
    player.setVelocity(0);
    player.anims.play(animKey, true);
    return;
  }

  if (!moving) {
    player.anims.stop();

    // Ao parar, exibe o primeiro frame da última direção
    switch (player.lastDirection) {
      case 'left': player.setFrame(13); break;
      case 'right': player.setFrame(25); break;
      case 'up': player.setFrame(37); break;
      default: player.setFrame(1); break; // down
    }
  }
};