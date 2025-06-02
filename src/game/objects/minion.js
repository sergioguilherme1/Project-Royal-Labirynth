import Phaser from 'phaser';

export default class Minion extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, target) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.target = target;
    this.setScale(1.3);
    this.setSize(11, 10);
    this.setOffset(18, 22); 
    this.setCollideWorldBounds(true);
    this.body.setImmovable(false);

    //this.health = 2;
    this.patrolSpeed = 30;  
    this.attackingSpeed = 50;
    this.speed = this.attackingSpeed;

    this.patrolPoints = [
      { x: x, y: y },
      { x: x + 100, y: y }
    ];
    this.currentPatrolIndex = 1;
    this.isAttacking = false;
    this.play('minion_walk_down'); // animação inicial
  }
    // Ataque
    // this.attackCooldown = 0;
    // this.attackRange = 40;
    // this.attackRate = 1000;

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.active || !this.target?.active) return;

    // Cálculo da distância entre o minion e o jogador
    const dx = this.target.x - this.x; 
    const dy = this.target.y - this.y; 
    const distance = Math.sqrt(dx * dx + dy * dy);
    const detectionRange = 80;

    //Parar patrulha e ir em direçaõ ao jogador
    if (distance <= detectionRange && !this.isAttacking) {
      this.isAttacking = true;
    }
    if(this.isAttacking){
      this.setVelocity(0);
      this.speed = this.attackingSpeed;

      const angle = Math.atan2(dy, dx); 
      this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);

      // animação de perseguição 
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          this.play('minion_walk_right', true); 
        } else {
          this.play('minion_walk_left', true); 
        }
      } else {
        if (dy > 0) {
          this.play('minion_walk_down', true); 
        } else {
          this.play('minion_walk_up', true); 
        }
      }
    } else {
      // Patrulha do minion
      const targetPoint = this.patrolPoints[this.currentPatrolIndex];
      const dx = targetPoint.x - this.x;
      const dy = targetPoint.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 4) {
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        this.setVelocity(0);
      } else {
        this.speed = this.patrolSpeed;
        const angle = Math.atan2(dy, dx);
        this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);

        const currentAnim = this.anims.getName();
        let desiredAnim;
        // animação de caminhada conforme direção
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) {
            desiredAnim = 'minion_walk_right';
          } else {
            desiredAnim = 'minion_walk_left';
          }
        } else {
          if (dy > 0) {
            desiredAnim = 'minion_walk_down';
          } else {
            desiredAnim = 'minion_walk_up';
          }
        }
        if (!currentAnim || currentAnim !== desiredAnim) {
        this.play(desiredAnim, true);
        }
      }
    }
  }  
}

export const loadMinionSprites = (scene) => {
  scene.load.spritesheet('minion', 'characters/Lacaios.png', {
    frameWidth: 48,
    frameHeight: 48,
    spacing: 0
  });
};

// Cria animações dos lacaios
export const createMinionAnimations = (scene) => {

  scene.anims.create({
    key: 'minion_walk_down',
    frames: scene.anims.generateFrameNumbers('minion', { start: 0, end: 2 }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'minion_walk_left',
    frames: scene.anims.generateFrameNumbers('minion', { start: 23, end: 25 }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'minion_walk_right',
    frames: scene.anims.generateFrameNumbers('minion', { start: 46, end: 48 }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'minion_walk_up',
    frames: scene.anims.generateFrameNumbers('minion', { start: 69, end: 71 }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'minion_attack_down',
    frames: scene.anims.generateFrameNumbers('minion', { start: 10, end: 13 }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: 'minion_attack_left',
    frames: scene.anims.generateFrameNumbers('minion', { start: 33, end: 36 }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: 'minion_attack_right',
    frames: scene.anims.generateFrameNumbers('minion', { start: 56, end: 59 }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: 'minion_attack_up',
    frames: scene.anims.generateFrameNumbers('minion', { start: 79, end: 82 }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: 'minion_die_down',
    frames: [ { key: 'minion', frame: 22 } ],
    frameRate: 8,
    repeat: 0
  });

  scene.anims.create({
    key: 'minion_die_left',
    frames: [ { key: 'minion', frame: 45 } ],
    frameRate: 8,
    repeat: 0
  });

  scene.anims.create({
    key: 'minion_die_right',
    frames: [ { key: 'minion', frame: 68 } ],
    frameRate: 8,
    repeat: 0
  });

  scene.anims.create({
    key: 'minion_die_up',
    frames: [ { key: 'minion', frame: 91 } ],
    frameRate: 8,
    repeat: 0
  });
};
  