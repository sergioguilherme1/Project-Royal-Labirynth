import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    // Fade-in ao entrar
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // Fundo
    this.add.image(512, 384, "background");

    // Logo com sombra
    const logoShadow = this.add
      .image(514, 282, "logo")
      .setTint(0x000000)
      .setAlpha(0.4);
    this.logo = this.add.image(512, 280, "logo");
    this.logo.setTint(0xeeeeff); // tom levemente azulado

    // Fundo do botão Iniciar
    const buttonBg = this.add
      .rectangle(0, 0, 200, 60, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });

    const buttonText = this.add
      .text(0, 0, "Iniciar", {
        fontFamily: "Arial Black",
        fontSize: "28px",
        color: "#FFD700",
        align: "center",
      })
      .setOrigin(0.5)
      .setShadow(2, 2, "#000000", 3, false, true);

    const startButton = this.add.container(512, 460, [buttonBg, buttonText]);

    this.tweens.add({
      targets: startButton,
      scaleX: 1.06,
      scaleY: 1.06,
      ease: "Sine.easeInOut",
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    buttonBg.on("pointerover", () => {
      buttonBg.setFillStyle(0x294d77);
      buttonText.setColor("#ffffff");
    });

    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0x1e1e2f);
      buttonText.setColor("#FFD700");
    });

    const startGame = () => {
      this.sound.play("click");
      this.menuMusic.stop();
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => this.scene.start("Game"));
    };

    buttonBg.on("pointerdown", startGame);
    buttonText.on("pointerdown", startGame);

    // Direitos autorais
    this.add.text(10, 740, "Royal Labyrinth © - 2025", {
      font: "14px Arial",
      fill: "#555",
    });

    // Música de fundo
    this.menuMusic = this.sound.add("menuMusic", { loop: true, volume: 0.5 });
    this.menuMusic.play();

    // Botão pause/play

    // Posição do botão
    const musicButton = this.add.container(940, 720);

    // Fundo do botão
    const musicButtonBg = this.add
      .rectangle(0, 0, 100, 50, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    musicButton.add(musicButtonBg);

    // Ícone pausa
    const pauseIcon = this.add.graphics();
    pauseIcon.fillStyle(0xFFD700, 1);
    pauseIcon.fillRect(-15, -15, 10, 30);
    pauseIcon.fillRect(5, -15, 10, 30);   
    musicButton.add(pauseIcon);

    // Ícone retomar
    const playIcon = this.add.graphics();
    playIcon.fillStyle(0xFFD700, 1);
    playIcon.beginPath();
    playIcon.moveTo(-10, -15);
    playIcon.lineTo(15, 0);
    playIcon.lineTo(-10, 15);
    playIcon.closePath();
    playIcon.fillPath();
    musicButton.add(playIcon);

    // Mostrar pause e esconder play
    pauseIcon.setVisible(true);
    playIcon.setVisible(false);

    // Alternar pausa/retomar música e ícones
    musicButtonBg.on("pointerdown", () => {
      if (this.menuMusic.isPlaying) {
        this.menuMusic.pause();
        pauseIcon.setVisible(false);
        playIcon.setVisible(true);
      } else if (this.menuMusic.isPaused) {
        this.menuMusic.resume();
        pauseIcon.setVisible(true);
        playIcon.setVisible(false);
      }
    });

    // Hover: muda cor do fundo e dos ícones
    musicButtonBg.on("pointerover", () => {
      musicButtonBg.setFillStyle(0x294d77);
      pauseIcon.clear();
      pauseIcon.fillStyle(0xffffff, 1);
      pauseIcon.fillRect(-15, -15, 10, 30);
      pauseIcon.fillRect(5, -15, 10, 30);

      playIcon.clear();
      playIcon.fillStyle(0xffffff, 1);
      playIcon.beginPath();
      playIcon.moveTo(-10, -15);
      playIcon.lineTo(15, 0);
      playIcon.lineTo(-10, 15);
      playIcon.closePath();
      playIcon.fillPath();
    });

    // Hover out: volta cor original dourada
    musicButtonBg.on("pointerout", () => {
      musicButtonBg.setFillStyle(0x1e1e2f);

      pauseIcon.clear();
      pauseIcon.fillStyle(0xFFD700, 1);
      pauseIcon.fillRect(-15, -15, 10, 30);
      pauseIcon.fillRect(5, -15, 10, 30);

      playIcon.clear();
      playIcon.fillStyle(0xFFD700, 1);
      playIcon.beginPath();
      playIcon.moveTo(-10, -15);
      playIcon.lineTo(15, 0);
      playIcon.lineTo(-10, 15);
      playIcon.closePath();
      playIcon.fillPath();
    });
  }
}
