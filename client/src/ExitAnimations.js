
class ExitAnimations {
    static FOOD_EXIT_TEXTURE = PIXI.Texture.from('assets/light-explosion.png');
    static BOOST_EXIT_TEXTURE = PIXI.Texture.from('assets/teleport-effect.png');
    static SNAKE_EXIT_TEXTURE = PIXI.Texture.from('assets/worm-death.png');
    static SNAKE_EXIT_TEXTURES = [
        new PIXI.Texture(ExitAnimations.SNAKE_EXIT_TEXTURE, new PIXI.Rectangle(0, 0, 199, 32)),
        new PIXI.Texture(ExitAnimations.SNAKE_EXIT_TEXTURE, new PIXI.Rectangle(0, 0, 199, 32)),
        new PIXI.Texture(ExitAnimations.SNAKE_EXIT_TEXTURE, new PIXI.Rectangle(0, 32, 199, 32)),
        new PIXI.Texture(ExitAnimations.SNAKE_EXIT_TEXTURE, new PIXI.Rectangle(0, 32, 199, 32)),
        new PIXI.Texture(ExitAnimations.SNAKE_EXIT_TEXTURE, new PIXI.Rectangle(0, 64, 199, 32)),
        new PIXI.Texture(ExitAnimations.SNAKE_EXIT_TEXTURE, new PIXI.Rectangle(0, 64, 199, 32)),
        new PIXI.Texture(ExitAnimations.SNAKE_EXIT_TEXTURE, new PIXI.Rectangle(0, 96, 199, 32)),
        new PIXI.Texture(ExitAnimations.SNAKE_EXIT_TEXTURE, new PIXI.Rectangle(0, 96, 199, 32)),
    ];

    static update() {
        const containers = [
            Renderer.foodExits,
            Renderer.boostExits,
            Renderer.snakeExits,
        ];

        for (let containerIndex = 0; containerIndex < containers.length; containerIndex++) {
            const container = containers[containerIndex];

            for (let i = 0; i < container.children.length; i++) {
                const sprite = container.children[i];
    
                const lastFrame = sprite.getFrame();
                sprite.stepAnimation(null, Loop.deltaTime / 75, true);
                if (sprite.getFrame() < lastFrame) {
                    // remove sprite after looping
                    sprite.destroy();
                    i--;
                }
            }
        }
    }

    static addFoodExit(position) {
        const sprite = new FramedSprite(ExitAnimations.FOOD_EXIT_TEXTURE, 84, 81, 8, 8);
        sprite.addAnimation(null, 0, 8);
        sprite.position.x = position.x;
        sprite.position.y = position.y;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        Renderer.foodExits.addChild(sprite);
    }

    static addBoostExit(position) {
        const sprite = new FramedSprite(ExitAnimations.BOOST_EXIT_TEXTURE, 50, 46, 5, 12);
        sprite.addAnimation(null, 0, 12);
        sprite.position.x = position.x;
        sprite.position.y = position.y;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        Renderer.boostExits.addChild(sprite);
    }

    static addSnakeExit(position, points, scale) {
        const sprite = new FramedSnake(ExitAnimations.SNAKE_EXIT_TEXTURES, points);
        sprite.position.x = position.x;
        sprite.position.y = position.y;
        sprite.scale.x = scale.x;
        sprite.scale.y = scale.y;

        Renderer.snakeExits.addChild(sprite);
    }
}

class FramedSnake extends PIXI.SimpleRope {
    textures;
    currentFrame;

    constructor(textures, points) {
        super(textures[0], points);

        this.textures = textures;
        this.currentFrame = 0;
    }

    stepAnimation(name, frames, loop) {
        this.currentFrame = (this.currentFrame + frames) % this.textures.length;
        this.texture = this.textures[Math.floor(this.currentFrame)];
    }

    getFrame() {
        return this.currentFrame;
    }
}
