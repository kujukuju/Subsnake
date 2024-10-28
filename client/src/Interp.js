
class Interp {
    position;
    positionOld;
    positionOlder;
    positionOldest;
    velocity;
    velocityOld;
    velocityOlder;
    velocityOldest;
    time;
    timeOld;
    timeOlder;
    timeOldest;

    constructor() {
        this.position = new Vec2();
        this.positionOld = new Vec2();
        this.positionOlder = new Vec2();
        this.positionOldest = new Vec2();
        this.velocity = new Vec2();
        this.velocityOld  = new Vec2();
        this.velocityOlder = new Vec2();
        this.velocityOldest = new Vec2();
        this.time = 0;
        this.timeOld = 0;
        this.timeOlder = 0;
        this.timeOldest = 0;
    }

    set(time, position, velocity) {
        if (time > this.time) {
            this.timeOldest = this.timeOlder;
            this.timeOlder = this.timeOld;
            this.timeOld = this.time;
            this.time = time;
            this.positionOldest.copy(this.positionOlder);
            this.positionOlder.copy(this.positionOld);
            this.positionOld.copy(this.position);
            this.position.copy(position);
            this.velocityOldest.copy(this.velocityOlder);
            this.velocityOlder.copy(this.velocityOld);
            this.velocityOld.copy(this.velocity);
            this.velocity.copy(velocity);
        } else if (time === this.time) {
            this.position.copy(position);
            this.velocity.copy(velocity);
        } else if (time > this.timeOld) {
            this.timeOldest = this.timeOlder;
            this.timeOlder = this.timeOld;
            this.timeOld = time;
            this.positionOldest.copy(this.positionOlder);
            this.positionOlder.copy(this.positionOld);
            this.positionOld.copy(position);
            this.velocityOldest.copy(this.velocityOlder);
            this.velocityOlder.copy(this.velocityOld);
            this.velocityOld.copy(velocity);
        } else if (time === this.timeOld) {
            this.positionOld.copy(position);
            this.velocityOld.copy(velocity);
        } else if (time > this.timeOlder) {
            this.timeOldest = this.timeOlder;
            this.timeOlder = time;
            this.positionOldest.copy(this.positionOlder);
            this.positionOlder.copy(position);
            this.velocityOldest.copy(this.velocityOlder);
            this.velocityOlder.copy(velocity);
        } else if (time === this.timeOlder) {
            this.positionOlder.copy(position);
            this.velocityOlder.copy(velocity);
        } else {
            this.timeOldest = time;
            this.positionOldest.copy(position);
            this.velocityOldest.copy(velocity);
        }
    }

    get(time) {
        if (time >= this.time) {
            const nextPosition = Vec2.copy(this.velocity).mul((time - this.time) / TICK_MS).add(this.position);
            return nextPosition;
        } else if (time >= this.timeOld) {
            const progress = clamp((time - this.timeOld) / (this.time - this.timeOld), 0, 1);

            return Vec2.copy(this.position).sub(this.positionOld).mul(progress).add(this.positionOld);

            // const interpPosition = new Vec2();
            // Utilities.hermite(progress, this.positionOld, this.position, this.velocityOld, this.velocity, interpPosition);
            // return interpPosition;
        } else if (time >= this.timeOlder) {
            const progress = clamp((time - this.timeOlder) / (this.timeOld - this.timeOlder), 0, 1);

            return Vec2.copy(this.positionOld).sub(this.positionOlder).mul(progress).add(this.positionOlder);

            // const interpPosition = new Vec2();
            // Utilities.hermite(progress, this.positionOlder, this.positionOld, this.velocityOlder, this.velocityOld, interpPosition);
            // return interpPosition;
        } else {
            const progress = clamp((time - this.timeOldest) / (this.timeOlder - this.timeOldest), 0, 1);

            return Vec2.copy(this.positionOlder).sub(this.positionOldest).mul(progress).add(this.positionOldest);

            // const interpPosition = new Vec2();
            // Utilities.hermite(progress, this.positionOldest, this.positionOlder, this.velocityOldest, this.velocityOlder, interpPosition);
            // return interpPosition;
        }
    }

    getTickOffset(time) {
        if (time >= this.time) {
            return 0;
        } else if (time >= this.timeOld) {
            return 1 - clamp((time - this.timeOld) / (this.time - this.timeOld), 0, 1);
        } else if (time >= this.timeOlder) {
            return 1 - clamp((time - this.timeOlder) / (this.timeOld - this.timeOlder), 0, 1) + 1;
        } else {
            return 1 - clamp((time - this.timeOldest) / (this.timeOlder - this.timeOldest), 0, 1) + 2;
        }
    }
}
