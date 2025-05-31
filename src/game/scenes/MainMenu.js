import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    // Fade-in inicial
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // Fundo e logo
    this.add.image(512, 384, "background");
    this.add.image(514, 282, "logo").setTint(0x000000).setAlpha(0.4);
    this.logo = this.add.image(512, 280, "logo").setTint(0xeeeeff);

    // Botão iniciar com animação e som
    const buttonBg = this.add.rectangle(0, 0, 200, 60, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(0, 0, "Iniciar", {
      fontFamily: "Arial Black",
      fontSize: "28px",
      color: "#FFD700",
      align: "center",
    }).setOrigin(0.5).setShadow(2, 2, "#000000", 3, false, true);
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

    const clickSound = this.sound.add("click");
    buttonBg.on("pointerover", () => {
      buttonBg.setFillStyle(0x294d77);
      buttonText.setColor("#ffffff");
      clickSound.play();
    });
    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0x1e1e2f);
      buttonText.setColor("#FFD700");
    });
    buttonBg.on("pointerdown", () => {
      clickSound.play();
      this.menuMusic.stop();
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => this.scene.start("Game"));
    });
    buttonText.on("pointerdown", () => buttonBg.emit("pointerdown"));

    // Texto de direitos autorais
    this.add.text(10, 740, "Royal Labyrinth © - 2025", {
      font: "14px Arial",
      fill: "#555",
    });

    // Música de fundo
    this.menuMusic = this.sound.add("menuMusic", { loop: true, volume: 0.5 });
    this.menuMusic.play();

    // Cria modal de ajuda antes dos botões
    this.createHelpModal();

    // Botões canto inferior direito
    this.createMusicToggleButton();
    this.createHelpButton();
    this.createSettingsButton();
    this.createSettingsPanel();
  }

  // Botão pause/play música
  createMusicToggleButton() {
    const xBase = 840;
    const yBase = 720;

    this.musicButton = this.add.container(xBase, yBase);

    const musicButtonBg = this.add.rectangle(0, 0, 50, 50, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.musicButton.add(musicButtonBg);

    this.pauseIcon = this.add.graphics();
    this.pauseIcon.fillStyle(0xFFD700, 1);
    this.pauseIcon.fillRect(-12, -15, 8, 30);
    this.pauseIcon.fillRect(5, -15, 8, 30);
    this.musicButton.add(this.pauseIcon);

    this.playIcon = this.add.graphics();
    this.playIcon.fillStyle(0xFFD700, 1);
    this.playIcon.beginPath();
    this.playIcon.moveTo(-10, -15);
    this.playIcon.lineTo(15, 0);
    this.playIcon.lineTo(-10, 15);
    this.playIcon.closePath();
    this.playIcon.fillPath();
    this.musicButton.add(this.playIcon);

    this.pauseIcon.setVisible(true);
    this.playIcon.setVisible(false);

    musicButtonBg.on("pointerdown", () => {
      if (this.menuMusic.isPlaying) {
        this.menuMusic.pause();
        this.pauseIcon.setVisible(false);
        this.playIcon.setVisible(true);
      } else if (this.menuMusic.isPaused) {
        this.menuMusic.resume();
        this.pauseIcon.setVisible(true);
        this.playIcon.setVisible(false);
      }
    });

    musicButtonBg.on("pointerover", () => {
      musicButtonBg.setFillStyle(0x294d77);
      this.pauseIcon.clear();
      this.pauseIcon.fillStyle(0xffffff, 1);
      this.pauseIcon.fillRect(-12, -15, 8, 30);
      this.pauseIcon.fillRect(5, -15, 8, 30);

      this.playIcon.clear();
      this.playIcon.fillStyle(0xffffff, 1);
      this.playIcon.beginPath();
      this.playIcon.moveTo(-10, -15);
      this.playIcon.lineTo(15, 0);
      this.playIcon.lineTo(-10, 15);
      this.playIcon.closePath();
      this.playIcon.fillPath();
    });

    musicButtonBg.on("pointerout", () => {
      musicButtonBg.setFillStyle(0x1e1e2f);
      this.pauseIcon.clear();
      this.pauseIcon.fillStyle(0xFFD700, 1);
      this.pauseIcon.fillRect(-12, -15, 8, 30);
      this.pauseIcon.fillRect(5, -15, 8, 30);

      this.playIcon.clear();
      this.playIcon.fillStyle(0xFFD700, 1);
      this.playIcon.beginPath();
      this.playIcon.moveTo(-10, -15);
      this.playIcon.lineTo(15, 0);
      this.playIcon.lineTo(-10, 15);
      this.playIcon.closePath();
      this.playIcon.fillPath();
    });
  }

  // Botão ajuda
  createHelpButton() {
    const xBase = 900;
    const yBase = 720;

    this.helpButton = this.add.container(xBase, yBase);

    const helpButtonBg = this.add.rectangle(0, 0, 50, 50, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.helpButton.add(helpButtonBg);

    const helpIcon = this.add.text(0, 0, "❓", {
      fontSize: "32px",
      color: "#FFD700",
    }).setOrigin(0.5);
    this.helpButton.add(helpIcon);

    helpButtonBg.on("pointerover", () => {
      helpButtonBg.setFillStyle(0x294d77);
      helpIcon.setColor("#ffffff");
    });

    helpButtonBg.on("pointerout", () => {
      helpButtonBg.setFillStyle(0x1e1e2f);
      helpIcon.setColor("#FFD700");
    });

    helpButtonBg.on("pointerdown", () => {
      this.sound.play("click");
      this.showHelpModal();
    });
  }

  // Botão configurações
  createSettingsButton() {
    const xBase = 960;
    const yBase = 720;

    this.settingsButton = this.add.container(xBase, yBase);

    const settingsButtonBg = this.add.rectangle(0, 0, 50, 50, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.settingsButton.add(settingsButtonBg);

    const settingsIcon = this.add.text(0, 0, "⚙️", {
      fontSize: "32px",
      color: "#FFD700",
    }).setOrigin(0.5);
    this.settingsButton.add(settingsIcon);

    settingsButtonBg.on("pointerover", () => {
      settingsButtonBg.setFillStyle(0x294d77);
      settingsIcon.setColor("#ffffff");
    });

    settingsButtonBg.on("pointerout", () => {
      settingsButtonBg.setFillStyle(0x1e1e2f);
      settingsIcon.setColor("#FFD700");
    });

    settingsButtonBg.on("pointerdown", () => {
      this.sound.play("click");
      this.toggleSettingsPanel();
    });
  }

  // Painel configurações com slider de volume
  createSettingsPanel() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.settingsPanelBg = this.add.rectangle(centerX, centerY, 320, 120, 0x1e1e2f, 0.95)
      .setStrokeStyle(3, 0xffd700)
      .setDepth(40)
      .setVisible(false)
      .setInteractive();

    this.settingsVolumeText = this.add.text(centerX - 140, centerY, "Volume Música", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#FFD700"
    }).setOrigin(0, 0.5).setDepth(41).setVisible(false);

    this.volumeTrack = this.add.rectangle(centerX + 10, centerY, 120, 10, 0x555555)
      .setOrigin(0, 0.5)
      .setDepth(41)
      .setVisible(false);

    this.volumeThumb = this.add.rectangle(centerX + 10 + (120 * this.menuMusic.volume), centerY, 16, 30, 0xffd700)
      .setOrigin(0.5)
      .setDepth(42)
      .setVisible(false)
      .setInteractive({ draggable: true, useHandCursor: true });

    this.input.setDraggable(this.volumeThumb);
    this.volumeThumb.on('drag', (pointer, dragX) => {
      const minX = centerX + 10;
      const maxX = centerX + 10 + 120;
      const newX = Phaser.Math.Clamp(dragX, minX, maxX);
      this.volumeThumb.x = newX;
      const volume = (newX - minX) / 120;
      this.menuMusic.setVolume(volume);
    });

    this.settingsPanelElements = [
      this.settingsPanelBg,
      this.settingsVolumeText,
      this.volumeTrack,
      this.volumeThumb,
    ];
  }

  toggleSettingsPanel(show = null) {
    if (show === null) show = !this.settingsPanelBg.visible;
    this.settingsPanelElements.forEach(el => el.setVisible(show));
  }

  // Modal de ajuda
  createHelpModal() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.helpModalOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.6)
      .setOrigin(0)
      .setDepth(30)
      .setInteractive();

    this.helpModalBg = this.add.rectangle(centerX, centerY, 600, 400, 0x1e1e2f, 0.95)
      .setStrokeStyle(4, 0xffd700)
      .setDepth(31);

    const instructions =
`Objetivo:
- Encontre a saída do labirinto e escape!

Controles:
- Movimentar: Setas ou WASD
- Atacar: Barra de espaço
- Pausar música: Botão canto inferior direito

Dicas:
- Colete moedas para aumentar sua pontuação
- Evite ou derrote inimigos com ataques
- Explore bem o labirinto para encontrar itens secretos

Clique no X ou pressione ESC para fechar esta janela.`;

    this.helpModalText = this.add.text(centerX, centerY, instructions, {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#FFD700",
      align: "left",
      wordWrap: { width: 560 },
    }).setOrigin(0.5)
      .setDepth(31);

    this.helpModalCloseBtnBg = this.add.rectangle(centerX + 280, centerY - 180, 40, 40, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setDepth(32)
      .setInteractive({ useHandCursor: true });

    this.helpModalCloseBtnText = this.add.text(centerX + 280, centerY - 180, "X", {
      fontFamily: "Arial Black",
      fontSize: "28px",
      color: "#FFD700",
    }).setOrigin(0.5).setDepth(33);

    this.helpModalObjects = [
      this.helpModalOverlay,
      this.helpModalBg,
      this.helpModalText,
      this.helpModalCloseBtnBg,
      this.helpModalCloseBtnText,
    ];

    this.helpModalObjects.forEach(obj => obj.setVisible(false));

    this.helpModalOverlay.on('pointerdown', () => this.hideHelpModal());
    this.helpModalCloseBtnBg.on('pointerdown', () => this.hideHelpModal());
    this.helpModalCloseBtnText.on('pointerdown', () => this.hideHelpModal());

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.helpModalObjects && this.helpModalObjects[0].visible) {
        this.hideHelpModal();
      }
    });
  }

  showHelpModal() {
    if (!this.helpModalObjects) return;
    this.helpModalObjects.forEach(obj => obj.setVisible(true));
  }

  hideHelpModal() {
    if (!this.helpModalObjects) return;
    this.helpModalObjects.forEach(obj => obj.setVisible(false));
  }
}
