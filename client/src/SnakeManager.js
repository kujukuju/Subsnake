
class Snake {
    static TEXTURE = PIXI.Texture.from('assets/wormthing.png');

    id;
    position;
    velocity;

    sprite;
    maxSegmentLength;
    points;

    accurateHistory;

    interp;

    constructor(id) {
        this.id = id;
        this.position = new Vec2(1343, 729);
        this.velocity = new Vec2();

        this.maxSegmentLength = Snake.TEXTURE.width / 20;
        this.points = [];
        for (let i = 0; i <= 20; i++) {
            this.points.push(new PIXI.Point(0, 0));
        }

        this.sprite = new PIXI.SimpleRope(Snake.TEXTURE, this.points);

        this.accurateHistory = new MovementHistory();
        this.accurateHistory.storageLength = Snake.TEXTURE.width;

        this.interp = new Interp();

        Renderer.midground.addChild(this.sprite);
    }

    update() {
        this.accurateHistory.storageLength = Snake.TEXTURE.width;

        const position = this.interp.get(Date.now() - TICK_MS * 2);
        this.accurateHistory.add(Date.now(), position.x, position.y, 0, 0);

        const requiredDistances = [];
        for (let i = 0; i <= 20; i++) {
            const distance = Snake.TEXTURE.width - i * this.maxSegmentLength;
            requiredDistances.push(distance);
        }

        const distancePoints = this.accurateHistory.getDistances(requiredDistances);
        for (let i = 0; i < distancePoints.length; i++) {
            const position = distancePoints[i];
            this.points[i].x = position.x;
            this.points[i].y = position.y;
        }
    }

    getPosition() {
        return this.points[this.points.length - 1] || new Vec2(0, 0);
    }

    destroy() {
        this.sprite.destroy();

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
