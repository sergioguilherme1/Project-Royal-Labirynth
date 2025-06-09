import Phaser from 'phaser';

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, target) {
    super(scene, x, y, texture);
    //Adicionando o Boss e sua física a cena
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
    this.target = target; //Referencia ao player
    //Ajustando tamanho, hitbox e colisão do Boss
    this.setScale(1.2);
    this.setSize(45, 20);
    this.setOffset(25, 42);
    this.setCollideWorldBounds(true);
    this.body.setImmovable(false);
    this.setDepth(15); // Define a profundidade para renderizar
    //Configurando a vida do Boss
    this.maxHealth = 18; //Maximo
    this.health = 18; //Inicial
    this.alive = true;
    //Configurando velocidade do Boss
    this.patrolSpeed = 20;
    this.attackingSpeed = 40;
    this.speed = this.attackingSpeed;
    // Posições de patrulha do Boss
    this.patrolPoints = [
      { x: x, y: y },
      { x: x + 150, y: y }
    ];
    this.currentPatrolIndex = 1;
    this.isAttacking = false;
    // Configuração de ataque
    this.attackCooldown = 0;
    this.attackRange = 40;
    this.attackRate = 2500;

    this.play('boss_walk_down'); // Boss começa com a  animação de andar para baixo
    // Barra de vida do Boss
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta); // Atualiza o estado do Boss antes de cada frame
    //Verifica se o Boss está ativo, vivo ou se o player está presente
    if (!this.active || !this.target?.active || !this.alive) return;

    this.updateHealthBar(); // Atualiza a barra de vida

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    const detectionRange = 120;
    //Configuração de ataque do boss
    if (distance <= detectionRange) {
      if (distance <= this.attackRange) {
        this.setVelocity(0); // Parar o movimento do Boss
        if (time > this.attackCooldown) {
          this.attackCooldown = time + this.attackRate;
          const direction = this.getDirection(dx, dy);
          this.play(`boss_attack_${direction}`, true); // Reproduz a animação de ataque

          this.scene.sound.play('dragonAttack'); // Toca o som de ataque

          this.once('animationcomplete', (anim) => {
            if (anim.key === `boss_attack_${direction}`) { // Apenas aplica o dano após a animação terminar
              if (this.target.health && this.target.health > 0) {
                this.target.health--; // Diminui a vida do player
                this.scene.updateHearts();// Atualiza os corações do player
                if (this.target.health <= 0) { //Verifica se o player está morto
                  this.target.setVelocity(0);
                  this.target.play('player_die');
                  this.target.once('animationcomplete', () => {
                    this.scene.handleGameOver();
                  });
                }
              }
            }
          });
        }
      } else {
        this.speed = this.attackingSpeed; // Quando não está atacando, aumenta a velocidade
        const angle = Math.atan2(dy, dx);
        this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed); // Move o Boss na direção do player
        const direction = this.getDirection(dx, dy);
        this.play(`boss_walk_${direction}`, true);
      }
    } else {
      // Quando o player não está mais no alcance, o Boss patrulha
      const targetPoint = this.patrolPoints[this.currentPatrolIndex];
      const dx = targetPoint.x - this.x;
      const dy = targetPoint.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 4) { // Se chegou ao ponto de patrulha
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;  // Muda para o próximo ponto de patrulha
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
  // Retorna a direção baseada nas diferenças de posição
  getDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }
  // Retorna a direção atual que o Boss está enfrentando
  getFacingDirection() {
    const anim = this.anims.getName();
    if (anim?.includes('up')) return 'up';
    if (anim?.includes('down')) return 'down';
    if (anim?.includes('left')) return 'left';
    if (anim?.includes('right')) return 'right';
    return 'down';
  }
  // Atualiza a barra de vida do Boss
  updateHealthBar() {
    const barWidth = 50;
    const barHeight = 4;
    const offsetY = -40;
    this.setDepth(20);

    this.healthBar.clear();
    this.healthBar.fillStyle(0x000000); 
    this.healthBar.fillRect(this.x - barWidth / 2 - 1, this.y + offsetY - 1, barWidth + 2, barHeight + 2);

    const healthRatio = this.health / this.maxHealth; // Calcula a porcentagem da vida
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(this.x - barWidth / 2, this.y + offsetY, barWidth * healthRatio, barHeight);
  }
  // Recebe dano
  takeDamage(amount) {
    if (this.alive) {
      this.health -= amount;

      this.scene.sound.play('dragonHit', { volume: 0.3 });

      this.updateHealthBar(); // Atualiza a barra de vida
      if (this.health <= 0) {
        this.die(); // Chama a função de morte caso a vida chegue a zero
      }
    }
  }
  // Função chamada quando o Boss morre
  die() {
    this.alive = false;
    this.setVelocity(0);
    this.play('boss_die');

    this.scene.bossIsDead = true;
    
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
// Funções de carregamento das sprites do Boss
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
export const loadBossDeathSprites = (scene) => {
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
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'boss_walk_left',
    frames: scene.anims.generateFrameNumbers('boss', { start: 12, end: 17 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'boss_walk_right',
    frames: scene.anims.generateFrameNumbers('boss', { start: 0, end: 5 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'boss_walk_up',
    frames: scene.anims.generateFrameNumbers('boss', { start: 6, end: 11 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'boss_attack_down',
    frames: scene.anims.generateFrameNumbers('boss_Atack', { start: 48, end: 63 }),
    frameRate: 12,
    repeat: 0
  });

  scene.anims.create({
    key: 'boss_attack_left',
    frames: scene.anims.generateFrameNumbers('boss_Atack', { start: 32, end: 47 }),
    frameRate: 12,
    repeat: 0
  });

  scene.anims.create({
    key: 'boss_attack_right',
    frames: scene.anims.generateFrameNumbers('boss_Atack', { start: 0, end: 15 }),
    frameRate: 12,
    repeat: 0
  });

  scene.anims.create({
    key: 'boss_attack_up',
    frames: scene.anims.generateFrameNumbers('boss_Atack', { start: 16, end: 31 }),
    frameRate: 12,
    repeat: 0
  });

 scene.anims.create({
    key: 'boss_die',
    frames: scene.anims.generateFrameNumbers('boss_death', { start: 0, end: 8 }),
    frameRate: 10,
    repeat: 0
  });
};


