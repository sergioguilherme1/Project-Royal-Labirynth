import Phaser from 'phaser';

// Criação do player com tamanho, escala e hitbox
export const createPrincess = (scene, x, y) => {
  const princess = scene.physics.add.sprite(x, y, 'princess');
  princess.setScale(1.2);
  princess.setSize(11, 10);
  princess.setOffset(18, 22);
  princess.setDepth(5);
  princess.body.setImmovable(true); 

  princess.anims.play('arm_up', true);
  return princess;
};

// Carregamento do sprite do jogador
export const loadPrincessSprites = (scene) => {
  scene.load.spritesheet('princess', 'characters/Seraphina.png', {
    frameWidth: 48,
    frameHeight: 48,
    spacing: 0,
  });
};

// Criação de animações
export const createAnimations = (scene) => {
  scene.anims.create({ 
    key: 'arm_up', 
    frames: scene.anims.generateFrameNumbers('princess', { start: 3, end: 5 }), 
    frameRate: 7, 
    repeat: -1 
  });
}