import { Scene } from 'phaser';

export class End extends Scene {
  constructor() {
    super('End');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x000000);

    // Centro da tela
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // 1. Adiciona imagem central visível
    const fadeImage = this.add.image(centerX, centerY, 'fim')
        .setScale(0.5)
        .setAlpha(0)
        .setDepth(10);

    // 2. Animação de fade-out da imagem
    this.tweens.add({
        targets: fadeImage,
        alpha: 1,
        duration: 1000,
        ease: 'Linear',
        onComplete: () => {
            this.tweens.add({
                targets: fadeImage,
                alpha: 0,
                duration: 2000,
                ease: 'Linear',
                delay: 1000, 
                onComplete: () => {
                    this.showCredits();
                }
            });
        }
    });
  }

    showCredits() {
        const centerX = this.cameras.main.centerX;

        const logo = this.add.image(0, 60, 'logo')
          .setScale(0.5)
          .setAlpha(1)
          .setOrigin(0.5);

        const credits = this.add.text(0, 160,  
        'Produzido por:\n' +
        'Cayque, André, Felipe, Luiz Guilherme,\nSergio e Rodrigo\n\n' +

        '🖌️ Arte:\n' +
        'Cayque\n' +
        'Felipe\n\n' +

        '🎨 Visual e Interface:\n' +
        'André\n' +
        'Luiz Guilherme\n\n' +

        '🧠 Backend e Mecânicas:\n' +
        'Sergio\n' +
        'Rodrigo\n\n' +

        '🤖 Agradecimento Especial:\n' +
        'ChatGPT — Por salvar o projeto\n' + 
        'mais vezes do que podemos contar\n\n' +

        '💜 Obrigado por jogar!\n\n\n' +
        'Clique na tela para retornar ao Menu Principal!',
        {
            fontFamily: 'PixelFont',
            fontSize: 20,
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5, 0);

        const creditsContainer = this.add.container(this.scale.width / 2, this.scale.height + 100, [
            fim,
            logo,
            credits
        ]);

        const containerHeight = credits.height + logo.height * 0.5 + 160;

        this.tweens.add({
            targets: creditsContainer,
              y: -containerHeight, 
            duration: 20000,
            ease: 'Linear'
        });

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
