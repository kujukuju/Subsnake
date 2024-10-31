
const TICK_MS = 33.3333333333;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const DynamicTree = PixelScan.DynamicTree;

let clientID = 0;

function subsnake() {
    Renderer.initialize();
    Environment.initialize();
    FoodManager.initialize();
    BoostManager.initialize();
    ChatManager.initialize();
    InputManager.initialize();
    TitleManager.initialize();
    AudioManager.initialize();

    Camera.setPositionImmediate(new Vec2(1343, 729));

    Loop.initialize();

    join();

    document.getElementById('play').onclick = () => {
        TitleManager.requestPlay();
    };
}

function join() {
    Connection.connect();

    Camera.scaleSpeedStrength = 0.005;
    Camera.setScale(new Vec2(3, 3));
}

function clamp(v, a, b) {
    return Math.max(Math.min(v, b), a);
}

window.onload = () => {
    subsnake();
};