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
