class Renderer {
    static application;

    static backContainer = new PIXI.Container();

    static parallax = new PIXI.Container();
    static container = new PIXI.Container();
    static fixed = new PIXI.Container();

    static background = new PIXI.Container();
    static backgroundish = new PIXI.Container();
    static midcanvas = new DebugCanvas();
    static midground = new PIXI.Container();
    static underground = new PIXI.Container();
    static names = new PIXI.Container();
    static food = new PIXI.ParticleContainer(FOOD_POSITIONS.length, {uvs: true});
    static killFood = new PIXI.ParticleContainer(1000, {uvs: true});
    static boost = new PIXI.ParticleContainer(BOOST_POSITIONS.length, {uvs: true});
    static foodExits = new PIXI.Container();
    static boostExits = new PIXI.Container();
    static snakeExits = new PIXI.Container();
    static foreground = new PIXI.Container();
    static top = new PIXI.Container();

    static canvas = new DebugCanvas();

    static fpsTracker = new FPSTracker(0xffffff);
    static cpuTracker = new CPUTracker(0xffffff);

    static glEnabled = false;

    static initialize() {
        Renderer.application = new PIXI.Application({width: window.innerWidth, height: window.innerHeight, autoStart: false});

        Renderer.application.stage.addChild(Renderer.parallax);
        Renderer.application.stage.addChild(Renderer.container);
        Renderer.application.stage.addChild(Renderer.fixed);

        Renderer.container.addChild(Renderer.background);
        Renderer.container.addChild(Renderer.backgroundish);
        Renderer.container.addChild(Renderer.midcanvas);
        Renderer.container.addChild(Renderer.midground);
        Renderer.container.addChild(Renderer.names);
        Renderer.container.addChild(Renderer.food);
        Renderer.container.addChild(Renderer.killFood);
        Renderer.container.addChild(Renderer.boost);
        Renderer.container.addChild(Renderer.foodExits);
        Renderer.container.addChild(Renderer.boostExits);
        Renderer.container.addChild(Renderer.snakeExits);
        Renderer.container.addChild(Renderer.foreground);
        Renderer.container.addChild(Renderer.underground);
        Renderer.container.addChild(Renderer.top);
        Renderer.container.addChild(Renderer.canvas);

        Camera.addContainer(Renderer.container);
        Camera.setScaleImmediate(new Vec2(1.5, 1.5));
s
        const canvas = Renderer.application.view;
        document.getElementById('canvas-container').appendChild(canvas);
        try {
            Renderer.glEnabled = !!(canvas.getContext('webgl') || canvas.getContext('webgl2') || canvas.getContext('experimental-webgl'));
        } catch (e) {}

        window.addEventListener('resize', () => {
            Renderer.resize();
        });
    }

    static render(time) {
        Renderer.fpsTracker.tick(time);
        Renderer.application.render();
    }

    static resize() {
        Renderer.application.renderer.resize(window.innerWidth, window.innerHeight);
    }
}