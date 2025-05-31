import Phaser from 'phaser';

export default class Minion extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, target) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.target = target;
    this.setScale(1.3);
    this.setCollideWorldBounds(true);
    this.body.setImmovable(false);

    this.speed = 50;
    this.health = 2;

    // Ataque
    this.attackCooldown = 0;
    this.attackRange = 40;
    this.attackRate = 1000;

    this.play('orc_walk');
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.active || !this.target?.active) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.attackRange) {
      this.setVelocity(0); // Para de andar

      if (time > this.attackCooldown) {
        this.attackCooldown = time + this.attackRate;
        this.play('orc_attack', true); // Animação de ataque do lacaio

        if (this.target.health > 0) {
          this.target.health--;
          this.scene.updateHearts();

          if (this.target.health <= 0) {
            this.target.setVelocity(0);
            this.target.play('player_die');

            this.target.once('animationcomplete', () => {
              this.scene.handleGameOver();
            });
          }
        }
      }
    } else {
      // Persegue o jogador
      const angle = Math.atan2(dy, dx);
      this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);

      // Toca animação de andar, se necessário
      if (!this.anims.isPlaying || this.anims.getName() !== 'orc_walk') {
        this.play('orc_walk');
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
    frames: scene.anims.generateFrameNumbers('minion', { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'minion_walk_left',
    frames: scene.anims.generateFrameNumbers('minion', { start: 23, end: 25 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'minion_walk_right',
    frames: scene.anims.generateFrameNumbers('minion', { start: 46, end: 48 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'minion_walk_up',
    frames: scene.anims.generateFrameNumbers('minion', { start: 69, end: 71 }),
    frameRate: 8,
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
  