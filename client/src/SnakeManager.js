
class Snake {
    static TEXTURE = PIXI.Texture.from('assets/wormthing.png');
    static INTERP_PADDING = 200;

    id;
    position;
    velocity;

    sprite;
    undergroundSprite;
    points;

    history;

    interp;

    score;

    constructor(id) {
        this.id = id;
        this.position = new Vec2(1343, 729);
        this.velocity = new Vec2();

        this.points = [];
        for (let i = 0; i <= 20; i++) {
            this.points.push(new PIXI.Point(0, 0));
        }

        this.sprite = new PIXI.SimpleRope(Snake.TEXTURE, this.points);
        this.undergroundSprite = new PIXI.SimpleRope(Snake.TEXTURE, this.points);
        this.undergroundSprite.tint = 0x000000;

        this.history = new History();

        this.interp = new Interp();

        this.score = 0;

        Renderer.midground.addChild(this.sprite);
        Renderer.underground.addChild(this.undergroundSprite);
    }

    destroy() {
        this.sprite.destroy();
        this.undergroundSprite.destroy();
    }

    update() {
        const scale = this.getScale();

        const initialPointOffset = this.interp.getTickOffset(Date.now() - TICK_MS * 2);

        const points = [];
        this.history.getPoints(points, this.points.length, initialPointOffset, Snake.TEXTURE.width * scale);

        if (points.length > 0) {
            const startX = points[0].x;
            const startY = points[0].y;

            for (let i = 0; i < points.length; i++) {
                points[i].x -= startX;
                points[i].y -= startY;

                points[i].x /= scale;
                points[i].y /= scale;
            }

            this.sprite.position.x = startX;
            this.sprite.position.y = startY;
            this.undergroundSprite.position.x = startX;
            this.undergroundSprite.position.y = startY;
        }

        while (points.length > 0 && points.length < this.points.length) {
            points.push(points[points.length - 1]);
        }

        for (let i = 0; i < points.length; i++) {
            const position = points[points.length - i - 1];
            this.points[i].x = position.x;
            this.points[i].y = position.y;
        }

        this.sprite.scale.x = scale;
        this.sprite.scale.y = scale;
        this.undergroundSprite.scale.x = scale;
        this.undergroundSprite.scale.y = scale;
    }

    getRenderPosition() {
        return this.interp.get(Date.now() - TICK_MS * 2);
    }

    getScale() {
        // matches jai
        let scale = Math.pow(this.score / 10, 0.75);
        scale = scale / 2.0 + Math.floor(scale / 2.0);
        scale /= 100.0;

        return (1 - Math.exp(-scale * 2)) * 3.5 + 0.5;
    }

    destroy() {
        this.sprite.destroy();
        this.undergroundSprite.destroy();

        SnakeManager.removeSnake(this.id);
    }
}

class SnakeManager {
    static snakes = {};

    static addSnake(id) {
        this.snakes[id] = new Snake(id);
    }

    static removeSnake(id) {
        delete this.snakes[id];
    }

    static update() {
        for (const id in this.snakes) {
            this.snakes[id].update();
        }
    }
}
