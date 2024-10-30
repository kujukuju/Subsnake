
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

    spawnTime;
    name;

    nameText;

    constructor(id, name) {
        this.id = id;
        this.position = new Vec2(1343, 729);
        this.velocity = new Vec2();

        const scale = this.getScale();

        this.name = name;
        if (id !== clientID) {
            this.nameText = new PIXI.Text(name, {fontFamily: 'Pixel', fontSize: 48, fill: 0x0f0f19, align: 'center'});
            this.nameText.anchor.x = 0.5;
            this.nameText.anchor.y = 1;
            this.nameText.scale.x = scale / 3.0;
            this.nameText.scale.y = scale / 3.0;
            Renderer.names.addChild(this.nameText);
        }

        this.points = [];
        for (let i = 0; i <= 20; i++) {
            this.points.push(new PIXI.Point(0, 0));
        }

        this.sprite = new PIXI.SimpleRope(Snake.TEXTURE, this.points);
        this.sprite.filters = [new HueShiftFilter(Math.random())];
        this.undergroundSprite = new PIXI.SimpleRope(Snake.TEXTURE, this.points);
        this.undergroundSprite.tint = 0x000000;

        this.history = new History();

        this.interp = new Interp();

        this.score = 0;

        this.spawnTime = Loop.loopTime;

        Renderer.midground.addChild(this.sprite);
        Renderer.underground.addChild(this.undergroundSprite);
    }

    update() {
        const scale = this.getScale();

        const initialPointOffset = this.interp.getTickOffset(Date.now() - TICK_MS * 2);

        let alpha = 1;
        if (Loop.loopTime - this.spawnTime < 4000) {
            alpha = (Loop.loopTime - this.spawnTime) % 400 > 200 ? 0.25 : 0.5;
        }
        this.sprite.alpha = alpha;
        this.undergroundSprite.alpha = alpha;

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

            if (this.nameText) {
                const namePointIndex = Math.min(2, points.length - 1);
                const namePosition = points[namePointIndex];

                this.nameText.position.x = startX + namePosition.x * scale;
                this.nameText.position.y = startY + namePosition.y * scale - 18;
                this.nameText.scale.x = scale / 3.0;
                this.nameText.scale.y = scale / 3.0;
            }
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

    getLevel() {
        let scale = Math.pow(this.score / 10, 0.75);
        return Math.floor(scale / 2.0);
    }

    getScale() {
        // matches jai
        let scale = Math.pow(this.score / 10, 0.75);
        scale = scale / 2.0 + Math.floor(scale / 2.0);
        scale /= 100.0;

        return (1 - Math.exp(-scale * 2)) * 2.5 + 0.25;
    }

    destroy() {
        this.sprite.destroy();
        this.undergroundSprite.destroy();
        if (this.nameText) {
            this.nameText.destroy();
        }
    }
}

class SnakeManager {
    static snakes = {};

    static addSnake(id, name) {
        this.snakes[id] = new Snake(id, name);
    }

    static update() {
        for (const id in this.snakes) {
            this.snakes[id].update();
        }
    }
}
