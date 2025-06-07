import { Scene } from "phaser";

export class PauseMenu extends Scene {
  constructor() {
    super("PauseMenu");
  }

  create() {
    const { width, height } = this.cameras.main;

    this.overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0)
      .setInteractive();

    const panelWidth = 340;
    const panelHeight = 300;
    const panelX = width / 2;
    const panelY = height / 2;

    const graphics = this.add.graphics();
    graphics.fillStyle(0x1e1e2f, 0.95);
    graphics.lineStyle(3, 0xffd700);
    graphics.fillRoundedRect(
      panelX - panelWidth / 2,
      panelY - panelHeight / 2,
      panelWidth,
      panelHeight,
      20
    );
    graphics.strokeRoundedRect(
      panelX - panelWidth / 2,
      panelY - panelHeight / 2,
      panelWidth,
      panelHeight,
      20
    );
    graphics.setDepth(1);

    this.continueBtn = this.add
      .text(panelX, panelY - 100, "Continuar", {
        fontSize: "28px",
        fill: "#FFD700",
        fontFamily: "monospace",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 4, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    this.continueBtn.on("pointerdown", () => {
      this.scene.stop();
      this.scene.resume("Game");
    });

    this.returnBtn = this.add
      .text(panelX, panelY - 50, "Voltar ao Menu", {
        fontSize: "28px",
        fill: "#FFD700",
        fontFamily: "monospace",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 4, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
      this.returnBtn.on("pointerdown", () => {
      const gameScene = this.scene.get("Game");
       if (gameScene && gameScene.gameMusic) {
        gameScene.gameMusic.stop(); // Parando a música do jogo antes de ir ao menu
      }
      this.scene.stop("Game");
      this.scene.start("MainMenu");  // Volta para o menu principal
      });

    // Ícone de Volume (🔉) com texto "Volume" abaixo
    const volumeX = panelX - 70;
    const volumeY = panelY + 40;

    this.volumeIcon = this.add
      .text(volumeX, volumeY, "🔉", {
        fontSize: "36px",
        color: "#FFD700",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 4,
        shadow: { offsetX: 3, offsetY: 3, color: "#000", blur: 6, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    this.volumeIcon.on("pointerdown", () => {
      this.toggleVolumePanel();
    });

    this.volumeLabel = this.add
      .text(volumeX, volumeY + 40, "Volume", {
        fontSize: "16px",
        color: "#FFD700",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 2,
        shadow: { offsetX: 1, offsetY: 1, color: "#000", blur: 4, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(2);

    // Ícones de Mudo (🔇) e Som (🔈) com texto "Mute" abaixo
    const muteX = panelX + 70;
    const muteY = panelY + 40;

    this.soundOnIcon = this.add
      .text(muteX, muteY, "🔈", {
        fontSize: "36px",
        color: "#FFD700",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 4,
        shadow: { offsetX: 3, offsetY: 3, color: "#000", blur: 6, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    this.soundOffIcon = this.add
      .text(muteX, muteY, "🔇", {
        fontSize: "36px",
        color: "#FFD700",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 4,
        shadow: { offsetX: 3, offsetY: 3, color: "#000", blur: 6, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    this.soundOffIcon.setVisible(false);

    this.muteLabel = this.add
      .text(muteX, muteY + 40, "Mute", {
        fontSize: "16px",
        color: "#FFD700",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 2,
        shadow: { offsetX: 1, offsetY: 1, color: "#000", blur: 4, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(2);

    this.soundOnIcon.on("pointerdown", () => {
      const gameScene = this.scene.get("Game");
      gameScene.gameMusic.setMute(true);
      this.soundOnIcon.setVisible(false);
      this.soundOffIcon.setVisible(true);
    });

    this.soundOffIcon.on("pointerdown", () => {
      const gameScene = this.scene.get("Game");
      gameScene.gameMusic.setMute(false);
      this.soundOnIcon.setVisible(true);
      this.soundOffIcon.setVisible(false);
    });

    this.createVolumePanel(panelX, panelY + 110);
  }

  createVolumePanel(x, y) {
    this.volumePanelBg = this.add
      .rectangle(x - 70, y, 160, 50, 0x1e1e2f, 0.95)
      .setStrokeStyle(3, 0xffd700)
      .setOrigin(0, 0.5)
      .setDepth(100)
      .setVisible(false)
      .setInteractive();

    this.volumeTrack = this.add
      .rectangle(x - 55, y, 120, 10, 0x555555)
      .setOrigin(0, 0.5)
      .setDepth(101)
      .setVisible(false);

    const gameScene = this.scene.get("Game");
    const initialVolume = gameScene.gameMusic ? gameScene.gameMusic.volume : 0.5;

    this.volumeThumb = this.add
      .rectangle(x - 55 + 120 * initialVolume, y, 16, 30, 0xffd700)
      .setOrigin(0.5)
      .setDepth(102)
      .setVisible(false)
      .setInteractive({ draggable: true, useHandCursor: true });

    this.input.setDraggable(this.volumeThumb);

    this.volumeThumb.on("drag", (pointer, dragX) => {
      const minX = this.volumeTrack.x;
      const maxX = this.volumeTrack.x + this.volumeTrack.width;
      const newX = Phaser.Math.Clamp(dragX, minX, maxX);
      this.volumeThumb.x = newX;
      const volume = (newX - minX) / this.volumeTrack.width;

      gameScene.gameMusic.setVolume(volume);
    });

    this.volumePanelElements = [
      this.volumePanelBg,
      this.volumeTrack,
      this.volumeThumb,
    ];
  }

  toggleVolumePanel() {
    if (!this.volumePanelElements) return;
    const visible = !this.volumePanelBg.visible;
    this.volumePanelElements.forEach((el) => el.setVisible(visible));
  }
}