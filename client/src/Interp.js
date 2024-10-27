
class Interp {
    position;
    positionOld;
    positionOlder;
    velocity;
    velocityOld;
    velocityOlder;
    time;
    timeOld;
    timeOlder;

    constructor() {
        this.position = new Vec2();
        this.positionOld = new Vec2();
        this.positionOlder = new Vec2();
        this.velocity = new Vec2();
        this.velocityOld  = new Vec2();
        this.velocityOlder = new Vec2();
        this.time = 0;
        this.timeOld = 0;
        this.timeOlder = 0;
    }

    set(time, position, velocity) {
        if (time > this.time) {
            this.timeOlder = this.timeOld;
            this.timeOld = this.time;
            this.time = time;
            this.positionOlder.copy(this.positionOld);
            this.positionOld.copy(this.position);
            this.position.copy(position);
            this.velocityOlder.copy(this.velocityOld);
            this.velocityOld.copy(this.velocity);
            this.velocity.copy(velocity);
        } else if (time === this.time) {
            this.position.copy(position);
            this.velocity.copy(velocity);
        } else if (time > this.timeOld) {
            this.timeOlder = this.timeOld;
            this.timeOld = time;
            this.positionOlder.copy(this.positionOld);
            this.positionOld.copy(position);
            this.velocityOlder.copy(this.velocityOld);
            this.velocityOld.copy(velocity);
        } else if (time === this.timeOld) {
            this.positionOld.copy(position);
            this.velocityOld.copy(velocity);
        } else {
            this.timeOlder = time;
            this.positionOlder.copy(position);
            this.velocityOlder.copy(velocity);
        }
    }

    get(time) {
        if (time >= this.time) {
            const nextPosition = Vec2.copy(this.velocity).mul((time - this.time) / TICK_MS).add(this.position);
            return nextPosition;
        } else if (time >= this.timeOld) {
            const progress = clamp((time - this.timeOld) / TICK_MS, 0, 1);

            const interpPosition = new Vec2();
            Utilities.hermite(progress, [this.positionOld, this.position], [this.velocityOld, this.velocity], interpPosition);
            return interpPosition;
        } else {
            const progress = clamp((time - this.timeOlder) / TICK_MS, 0, 1);

            const interpPosition = new Vec2();
            Utilities.hermite(progress, [this.positionOlder, this.positionOld], [this.velocityOlder, this.velocityOld], interpPosition);
            return interpPosition;
        }
    }
}
