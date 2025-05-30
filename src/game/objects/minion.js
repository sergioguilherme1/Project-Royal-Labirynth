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
    key: 'orc_idle',
    frames: scene.anims.generateFrameNumbers('minion', { start: 0, end: 7 }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'orc_walk',
    frames: scene.anims.generateFrameNumbers('minion', { start: 8, end: 15 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'orc_attack',
    frames: scene.anims.generateFrameNumbers('minion', { start: 16, end: 23 }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: 'orc_hit',
    frames: scene.anims.generateFrameNumbers('minion', { start: 24, end: 31 }),
    frameRate: 12,
    repeat: 0
  });

  scene.anims.create({
    key: 'orc_die',
    frames: scene.anims.generateFrameNumbers('minion', { start: 32, end: 39 }),
    frameRate: 8,
    repeat: 0
  });
};
