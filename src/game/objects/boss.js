import Phaser from 'phaser';

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, target) {
    super(scene, x, y, texture);

    this.scene = scene;
    this.target = target;
    this.speed = 40;
    this.detectionRadius = 150;
    this.currentDirection = 'down';

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(1.5);
    this.setOrigin(0.5, 0.92);
    this.setSize(48, 48); // ajuste para hitbox
    this.setOffset(10, 10);

    this.play('boss_idle_down');
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.active || !this.target?.active) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

    let direction = this.currentDirection;

    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }

    // Salva direção para idle
    this.currentDirection = direction;

    if (distance < this.detectionRadius) {
      this.scene.physics.moveToObject(this, this.target, this.speed);

      const animWalk = `boss_walk_${direction}`;
      if (this.anims.currentAnim?.key !== animWalk) {
        this.play(animWalk);
      }
    } else {
      this.setVelocity(0);

      const animIdle = `boss_idle_${direction}`;
      if (this.anims.currentAnim?.key !== animIdle) {
        this.play(animIdle);
      }
    }
    console.log('Direção:', direction);

  }
}
