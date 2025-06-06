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

    this.health = 2;
    this.maxHealth = 2;
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();
    this.alive = true;

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
  
    // Ataque
    this.attackCooldown = 0;
    this.attackRange = 30;
    this.attackRate = 1500;
    this.initialAttackDelay = 750;
  }
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    this.updateHealthBar();
    if (!this.active || !this.target?.active || !this.alive) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const detectionRange = 60;

    if (distance <= detectionRange) {
      this.isAttacking = true;
    }

    if (this.isAttacking){
      if (distance <= this.attackRange) {
        this.setVelocity(0);

        if (this.attackCooldown === 0) {
          this.attackCooldown = time + this.initialAttackDelay;
        } else if (time > this.attackCooldown) {
          this.attackCooldown = time + this.attackRate;

          const direction = this.getDirection(dx, dy);
          this.play(`minion_attack_${direction}`, true);

          if (!this.target.isDying) {
            this.target.health = Math.max(0, this.target.health - 1);
            this.scene.updateHearts();

            if (this.target.health <= 0 && !this.target.isDying) {
              this.scene.checkPlayerDeath();
            }
          }
        }
      } else {
        this.speed = this.attackingSpeed;
        const angle = Math.atan2(dy, dx);
        this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);

        const direction = this.getDirection(dx, dy);
        this.play(`minion_walk_${direction}`, true);
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

        const currentAnim = this.anims.getName();
        let desiredAnim;
        if (Math.abs(dx) > Math.abs(dy)) {
          desiredAnim = dx > 0 ? 'minion_walk_right' : 'minion_walk_left';
        } else {
          desiredAnim = dy > 0 ? 'minion_walk_down' : 'minion_walk_up';
        }
        if (!currentAnim || currentAnim !== desiredAnim) {
          this.play(desiredAnim, true);
        }
      }
    }
  } 
  die() {
    this.alive = false;
    this.setVelocity(0);
    this.play(`minion_die_${this.getFacingDirection()}`, false);
    this.once('animationcomplete', () => {
      const anim = this.anims.currentAnim;
      if (anim) {
        const lastFrame = anim.frames[anim.frames.length - 1];
        this.setFrame(lastFrame.frame.name || lastFrame.frame);
        this.body.checkCollision.none = true;
        this.setDepth(5);
        this.disableBody(true, true);
      }
      this.healthBar.destroy();
    });
  }

  getDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }      
  }
  getFacingDirection() {
    // Método para determinar a direção que o minion está olhando
    // Retorna 'up', 'down', 'left', ou 'right' baseado na animação atual
    const anim = this.anims.getName();
    if (anim.includes('up')) return 'up';
    if (anim.includes('down')) return 'down';
    if (anim.includes('left')) return 'left';
    if (anim.includes('right')) return 'right';
    return 'down';
  }

  updateHealthBar() {
    const barWidth = 25;
    const barHeight = 4;
    const offsetY = -30;

    this.healthBar.clear();
    this.healthBar.fillStyle(0x000000); 
    this.healthBar.fillRect(this.x - barWidth / 2 - 1, this.y + offsetY - 1, barWidth + 2, barHeight + 2);

    const healthRatio = this.health / this.maxHealth;
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(this.x - barWidth / 2, this.y + offsetY, barWidth * healthRatio, barHeight);
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
  
