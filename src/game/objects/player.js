import Phaser from 'phaser';

// Criação do player com tamanho, escala e hitbox
export const createPlayer = (scene) => {
  const player = scene.physics.add.sprite(82, 80, 'player');
  player.setScale(1.2);
  player.setSize(18, 10);
  player.setOffset(14, 24);
  player.lastDirection = 'down';

  // Vida do jogador
  player.maxHealth = 3;
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
  scene.anims.create({ key: 'walk_down', frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 2 }), frameRate: 8, repeat: -1 });
  scene.anims.create({ key: 'walk_left', frames: scene.anims.generateFrameNumbers('player', { start: 12, end: 14 }), frameRate: 8, repeat: -1 });
  scene.anims.create({ key: 'walk_right', frames: scene.anims.generateFrameNumbers('player', { start: 24, end: 26 }), frameRate: 8, repeat: -1 });
  scene.anims.create({ key: 'walk_up', frames: scene.anims.generateFrameNumbers('player', { start: 36, end: 38 }), frameRate: 8, repeat: -1 });

  // Ataques
  scene.anims.create({ key: 'attack_down', frames: scene.anims.generateFrameNumbers('player', { start: 53, end: 56 }), frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'attack_left', frames: scene.anims.generateFrameNumbers('player', { start: 65, end: 68 }), frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'attack_right', frames: scene.anims.generateFrameNumbers('player', { start: 77, end: 80 }), frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'attack_up', frames: scene.anims.generateFrameNumbers('player', { start: 89, end: 92 }), frameRate: 8, repeat: 0 });

};

// Atualiza o jogador conforme teclas
export const updatePlayer = (player, cursors, keys) => {
  const speed = 100;

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
