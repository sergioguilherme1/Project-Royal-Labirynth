import Phaser from 'phaser';

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, target) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.target = target;

    this.setScale(1.2);
    this.setOrigin(0.5, 0.92);
    this.setSize(48, 48);
    this.setOffset(10, 10);
    this.setCollideWorldBounds(true);
    this.body.setImmovable(false);

    this.health = 10;
    this.alive = true;

    this.patrolSpeed = 20;
    this.attackingSpeed = 40;
    this.speed = this.attackingSpeed;

    this.patrolPoints = [
      { x: x, y: y },
      { x: x + 150, y: y }
    ];
    this.currentPatrolIndex = 1;
    this.isAttacking = false;

    this.attackCooldown = 0;
    this.attackRange = 50;
    this.attackRate = 2500;

    this.play('boss_walk_down');
    
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.active || !this.target?.active || !this.alive) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    const detectionRange = 120;

    if (distance <= detectionRange) {
      this.isAttacking = true;
    }

    if (this.isAttacking) {
      if (distance <= this.attackRange) {
        this.setVelocity(0);
        if (time > this.attackCooldown) {
          this.attackCooldown = time + this.attackRate;
          const direction = this.getDirection(dx, dy);
          this.play(`boss_attack_${direction}`, true);

          this.scene.sound.play('dragonAttack');


          if (this.target.health && this.target.health > 0) {
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
        this.speed = this.attackingSpeed;
        const angle = Math.atan2(dy, dx);
        this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
        const direction = this.getDirection(dx, dy);
        this.play(`boss_walk_${direction}`, true);
      }
    } else {
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
        const direction = this.getDirection(dx, dy);
        this.play(`boss_walk_${direction}`, true);
      }
    }
  }

  getDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }

  getFacingDirection() {
    const anim = this.anims.getName();
    if (anim?.includes('up')) return 'up';
    if (anim?.includes('down')) return 'down';
    if (anim?.includes('left')) return 'left';
    if (anim?.includes('right')) return 'right';
    return 'down';
  }

  die() {
    this.alive = false;
    this.setVelocity(0);
    this.play('boss_death');
    this.once('animationcomplete', () => {
      const anim = this.anims.currentAnim;
      if (anim) {
        const lastFrame = anim.frames[anim.frames.length - 1];
        this.setFrame(lastFrame.frame.name || lastFrame.frame);
        this.body.checkCollision.none = true;
        this.setDepth(5);
      }
    });
  }
}

export const loadBossSprites = (scene) => {
  scene.load.spritesheet('boss', 'characters/Boss_Walk.png', {
    frameWidth: 96,
    frameHeight: 96,
    spacing: 0
  });
};
export const loadBossAtackSprites = (scene) => {
  scene.load.spritesheet('boss_Atack', 'characters/Boss_atack.png', {
    frameWidth: 96,
    frameHeight: 96,
    spacing: 0
  });
};
export const loadBossMortSprites = (scene) => {
  scene.load.spritesheet('boss_death', 'characters/Boss_death.png', {
    frameWidth: 96,
    frameHeight: 96,
    spacing: 0
  });
};
  
// Cria animações dos Boss
export const createBossAnimations = (scene) => {

  scene.anims.create({
    key: 'boss_walk_down',
    frames: scene.anims.generateFrameNumbers('boss', { start: 18, end: 23 }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'boss_walk_left',
    frames: scene.anims.generateFrameNumbers('boss', { start: 12, end: 17 }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'boss_walk_right',
    frames: scene.anims.generateFrameNumbers('boss', { start: 0, end: 5 }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'boss_walk_up',
    frames: scene.anims.generateFrameNumbers('boss', { start: 6, end: 11 }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'boss_attack_down',
    frames: scene.anims.generateFrameNumbers('boss_Atack', { start: 48, end: 63 }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: 'boss_attack_left',
    frames: scene.anims.generateFrameNumbers('boss_Atack', { start: 32, end: 47 }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: 'boss_attack_right',
    frames: scene.anims.generateFrameNumbers('boss_Atack', { start: 0, end: 15 }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: 'boss_attack_up',
    frames: scene.anims.generateFrameNumbers('boss_Atack', { start: 16, end: 31 }),
    frameRate: 10,
    repeat: 0
  });

 scene.anims.create({
    key: 'boss_death',
    frames: scene.anims.generateFrameNumbers('boss_death', { start: 0, end: 8 }),
    frameRate: 10,
    repeat: 0
  });
};


