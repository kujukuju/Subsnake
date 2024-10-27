
const TICK_MS = 33.3333333333;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

let clientID = 0;

function subsnake() {
    Renderer.initialize();
    Environment.initialize();
    Physics.initialize();

    Camera.setPositionImmediate(new Vec2(1343, 729));

    Loop.initialize();

    join();
}

function join() {
    Connection.connect();
}

function clamp(v, a, b) {
    return Math.max(Math.min(v, b), a);
}

window.onload = () => {
    subsnake();
};