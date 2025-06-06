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

    // Música de fundo original
    this.menuMusic = this.sound.add("menuMusic", { loop: true, volume: 0.3 });
    this.menuMusic.play();

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
      if (this.menuMusic && this.menuMusic.isPlaying) {
        this.menuMusic.stop(); // Parar a música do menu
    }
      // FADE OUT PARA A TRANSIÇÃO
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start("Game", { mapKey: 'map', health: 3 });
      });
    });

    buttonText.on("pointerdown", () => buttonBg.emit("pointerdown"));


    // Texto de direitos autorais no canto superior esquerdo
    this.add.text(10, 10, "Royal Labyrinth © - 2025", {
      font: "14px Arial",
      fill: "#555",
    });

    // Texto do email no canto superior direito
    this.add.text(this.cameras.main.width - 10, 10, "contato@royallabyrinth.com.br", {
      font: "14px Arial",
      fill: "#555",
    }).setOrigin(1, 0);  // alinhado à direita e topo

    // Cria modal de ajuda antes dos botões
    this.createHelpModal();

    // Botões canto inferior direito
    this.createMusicToggleButton();
    this.createHelpButton();
    this.createSettingsButton();
    this.createSettingsPanel();

    // Botão Instagram no canto inferior esquerdo com ícone vetorial
    this.createInstagramButton();
  }

  createInstagramButton() {
    const xBase = 40;  // canto inferior esquerdo, margem da esquerda
    const yBase = 720; // mesma altura dos outros botões

    this.instagramButton = this.add.container(xBase, yBase);

    const instagramButtonBg = this.add.rectangle(0, 0, 50, 50, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.instagramButton.add(instagramButtonBg);

    // Ícone Instagram desenhado vetorialmente
    const icon = this.add.graphics();
    icon.lineStyle(3, 0xFFD700);
    icon.fillStyle(0xFFD700);

    // Quadrado externo com bordas arredondadas (ícone base)
    const size = 24;
    const radius = 6;
    icon.strokeRoundedRect(-size/2, -size/2, size, size, radius);

    // Círculo grande central (representando a lente da câmera)
    icon.strokeCircle(0, 0, size / 3);

    // Círculo interno preenchido (pupila)
    icon.fillCircle(0, 0, size / 10);

    // Círculo menor superior direito (flash)
    icon.strokeCircle(size / 4, -size / 4, size / 10);

    icon.setDepth(1);
    icon.setPosition(0, 0);
    this.instagramButton.add(icon);

    instagramButtonBg.on("pointerover", () => {
      instagramButtonBg.setFillStyle(0x294d77);
      icon.clear();
      icon.lineStyle(3, 0xffffff);
      icon.fillStyle(0xffffff);

      icon.strokeRoundedRect(-size/2, -size/2, size, size, radius);
      icon.strokeCircle(0, 0, size / 3);
      icon.fillCircle(0, 0, size / 10);
      icon.strokeCircle(size / 4, -size / 4, size / 10);
    });

    instagramButtonBg.on("pointerout", () => {
      instagramButtonBg.setFillStyle(0x1e1e2f);
      icon.clear();
      icon.lineStyle(3, 0xFFD700);
      icon.fillStyle(0xFFD700);

      icon.strokeRoundedRect(-size/2, -size/2, size, size, radius);
      icon.strokeCircle(0, 0, size / 3);
      icon.fillCircle(0, 0, size / 10);
      icon.strokeCircle(size / 4, -size / 4, size / 10);
    });

    instagramButtonBg.on("pointerdown", () => {
      window.open("https://www.instagram.com/royallabyrinth", "_blank");
    });
  }

  // Botão pause/play música com ícones estilo mute do PauseMenu
  createMusicToggleButton() {
    const xBase = 840;
    const yBase = 720;

    this.musicButton = this.add.container(xBase, yBase);

    const musicButtonBg = this.add.rectangle(0, 0, 50, 50, 0x1e1e2f)
      .setStrokeStyle(3, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.musicButton.add(musicButtonBg);

    // Ícone som ligado (alto-falante)
    this.soundOnIcon = this.add.text(0, 0, "🔉", {
      fontSize: "36px",
      color: "#FFD700",
      fontFamily: "Arial Black",
      stroke: "#000000",
      strokeThickness: 4,
      shadow: { offsetX: 3, offsetY: 3, color: "#000", blur: 6, fill: true },
    }).setOrigin(0.5);
    this.musicButton.add(this.soundOnIcon);

    // Ícone som mudo
    this.soundOffIcon = this.add.text(0, 0, "🔇", {
      fontSize: "36px",
      color: "#FFD700",
      fontFamily: "Arial Black",
      stroke: "#000000",
      strokeThickness: 4,
      shadow: { offsetX: 3, offsetY: 3, color: "#000", blur: 6, fill: true },
    }).setOrigin(0.5);
    this.musicButton.add(this.soundOffIcon);

    this.soundOffIcon.setVisible(false);

    musicButtonBg.on("pointerdown", () => {
      if (this.menuMusic.isPlaying) {
        this.menuMusic.pause();
        this.soundOnIcon.setVisible(false);
        this.soundOffIcon.setVisible(true);
      } else if (this.menuMusic.isPaused) {
        this.menuMusic.resume();
        this.soundOnIcon.setVisible(true);
        this.soundOffIcon.setVisible(false);
      }
    });

    musicButtonBg.on("pointerover", () => {
      musicButtonBg.setFillStyle(0x294d77);
      this.soundOnIcon.setColor("#ffffff");
      this.soundOffIcon.setColor("#ffffff");
    });

    musicButtonBg.on("pointerout", () => {
      musicButtonBg.setFillStyle(0x1e1e2f);
      this.soundOnIcon.setColor("#FFD700");
      this.soundOffIcon.setColor("#FFD700");
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

    const settingsIcon = this.add.text(0, 0, "⚙", {
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
      this.savedVolume = volume;
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
- Atacar: Aperte F
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