class Loop {
    static DELAY = 16;

    static loopTime = 0;
    static deltaTime = 0;

    static initialize() {
        Loop.loopTime = Date.now();
        Loop.loop();
    }

    static loop() {
        const start = Date.now();
        Loop.deltaTime = start - Loop.loopTime;
        Loop.loopTime = start;

        Renderer.cpuTracker.beginFrame(start);

        Logic.update();
        Renderer.render(start);

        const finish = Date.now();
        Renderer.cpuTracker.endFrame(finish);

        const duration = finish - start;

        window.requestAnimationFrame(Loop.loop);

        // setTimeout(() => {
        //     Loop.loop();
        // }, Math.max(1, Loop.DELAY - duration));
    }
}