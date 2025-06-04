import Phaser from 'phaser';

// Criação do player com tamanho, escala e hitbox
export const createPlayer = (scene, x, y) => {
  const player = scene.physics.add.sprite(x, y, 'player');
  player.setScale(1.2);
  player.setSize(11, 10);
  player.setOffset(18, 22);
  player.lastDirection = 'down';
  player.setDepth(10);

  // Vida do jogador
  player.maxHealth = 5;
  player.currentHealth = 3;

  createAnimations(scene);
  return player;
};

// Carregamento do sprite do jogador
export const loadSprites = (scene) => {
  scene.load.spritesheet('player', 'characters/Cedric.png', {
    frameWidth: 48,
    frameHeight: 48,
    spacing: 0,
  });
};

// Criação de animações
export const createAnimations = (scene) => {
  // Andar
  scene.anims.create({ 
    key: 'walk_down', 
    frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 2 }), 
    frameRate: 7, 
    repeat: -1 
  });
  scene.anims.create({ 
    key: 'walk_left', 
    frames: scene.anims.generateFrameNumbers('player', { start: 12, end: 14 }), 
    frameRate: 7, 
    repeat: -1 
  });
  scene.anims.create({ 
    key: 'walk_right', 
    frames: scene.anims.generateFrameNumbers('player', { start: 24, end: 26 }), 
    frameRate: 7, 
    repeat: -1 
  });
  scene.anims.create({ 
    key: 'walk_up', 
    frames: scene.anims.generateFrameNumbers('player', { start: 36, end: 38 }), 
    frameRate: 7, 
    repeat: -1 });

  // Ataques
  scene.anims.create({ 
    key: 'attack_down', 
    frames: scene.anims.generateFrameNumbers('player', { start: 53, end: 56 }), 
    frameRate: 8, 
    repeat: 0 
  });
  scene.anims.create({ 
    key: 'attack_left', 
    frames: scene.anims.generateFrameNumbers('player', { start: 65, end: 68 }), 
    frameRate: 8, 
    repeat: 0 
  });
  scene.anims.create({ 
    key: 'attack_right', 
    frames: scene.anims.generateFrameNumbers('player', { start: 77, end: 80 }), 
    frameRate: 8, 
    repeat: 0 
  });
  scene.anims.create({ 
    key: 'attack_up', 
    frames: scene.anims.generateFrameNumbers('player', { start: 89, end: 92 }), 
    frameRate: 8, 
    repeat: 0 
  });

  // Morte
  scene.anims.create({
    key: 'die_down',
    frames: [ { key: 'player', frame: 58 } ],
    frameRate: 8,
    repeat: 0
  });

  scene.anims.create({
    key: 'die_left',
    frames: [ { key: 'player', frame: 70 } ],
    frameRate: 8,
    repeat: 0
  });

  scene.anims.create({
    key: 'die_right',
    frames: [ { key: 'player', frame: 82 } ],
    frameRate: 8,
    repeat: 0
  });

  scene.anims.create({
    key: 'die_up',
    frames: [ { key: 'player', frame: 94 } ],
    frameRate: 8,
    repeat: 0
  });

};

// Atualiza o jogador conforme teclas
export const updatePlayer = (player, cursors, keys) => {
  const speed = 80;

  if (player.anims.currentAnim?.key?.startsWith('attack') && player.anims.isPlaying) return;

  let moving = false;
  player.setVelocity(0);

  const left = cursors.left.isDown || keys.left.isDown;
  const right = cursors.right.isDown || keys.right.isDown;
  const up = cursors.up.isDown || keys.up.isDown;
  const down = cursors.down.isDown || keys.down.isDown;
  const keyf = Phaser.Input.Keyboard.JustDown(keys.F);

  if (left) {
    player.setVelocityX(-speed);
    player.anims.play('walk_left', true);
    player.lastDirection = 'left';
    moving = true;
  } else if (right) {
    player.setVelocityX(speed);
    player.anims.play('walk_right', true);
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
    const animKey = `attack_${player.lastDirection}`;
    player.setVelocity(0);
    player.anims.play(animKey, true);
    player.scene.sound.play('attack');
    return;
  }

  if (!moving) {
    player.anims.stop();
    switch (player.lastDirection) {
      case 'left': player.setFrame(13); break;
      case 'right': player.setFrame(25); break;
      case 'up': player.setFrame(37); break;
      default: player.setFrame(1); break; // down
    }
  }
};
