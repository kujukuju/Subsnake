class Environment {
    static FOREGROUND = PIXI.Texture.from('assets/physics.png');
    static BACKGROUND = PIXI.Texture.from('assets/background.png');

    static foregroundSprite;
    static backgroundSprite;

    static foregroundMaskSprite;

    static maskFilter;
    static maskRenderTexture;

    static PARALLAX_TEXTURES = [
        PIXI.Texture.from('assets/11.png'),
        PIXI.Texture.from('assets/10.png'),
        PIXI.Texture.from('assets/9.png'),
        PIXI.Texture.from('assets/8.png'),
        PIXI.Texture.from('assets/7.png'),
        PIXI.Texture.from('assets/6.png'),
        PIXI.Texture.from('assets/5.png'),
        PIXI.Texture.from('assets/4.png'),
        PIXI.Texture.from('assets/3.png'),
        PIXI.Texture.from('assets/2.png'),
        PIXI.Texture.from('assets/1.png'),
    ];

    static PARALLAX_SPEEDS = [
        new Vec2(0.15625, 0.3333333333333333),
        new Vec2(0.1875, 0.3888888888888889),
        new Vec2(0.234375, 0.4722222222222222),
        new Vec2(0.30625, 0.6111111111111112),
        new Vec2(0.375, 0.6388888888888888),
        new Vec2(0.4234375, 0.6861111111111111),
        new Vec2(3.140625, 4.258333333333334),
        new Vec2(3.2046875, 4.555555555555555),
        new Vec2(3.35, 4.833333333333333),
        new Vec2(3.5296875, 5.111111111111111),
        new Vec2(4.1046875, 5.375),
    ];

    static parallaxSprites = [];

    static initialize() {
        Environment.foregroundSprite = new PIXI.Sprite(Environment.FOREGROUND);
        Environment.backgroundSprite = new PIXI.Sprite(Environment.BACKGROUND);

        const FOREGROUND_EDGES = [
            // top left
            new PIXI.Texture(Environment.FOREGROUND, new PIXI.Rectangle(0, 0, 1, 1)),
            // top
            new PIXI.Texture(Environment.FOREGROUND, new PIXI.Rectangle(0, 0, Environment.FOREGROUND.width, 1)),
            // top right
            new PIXI.Texture(Environment.FOREGROUND, new PIXI.Rectangle(Environment.FOREGROUND.width - 1, 0, 1, 1)),
            // right
            new PIXI.Texture(Environment.FOREGROUND, new PIXI.Rectangle(Environment.FOREGROUND.width - 1, 0, 1, Environment.FOREGROUND.height)),
            // bottom right
            new PIXI.Texture(Environment.FOREGROUND, new PIXI.Rectangle(Environment.FOREGROUND.width - 1, Environment.FOREGROUND.height - 1, 1, 1)),
            // bottom
            new PIXI.Texture(Environment.FOREGROUND, new PIXI.Rectangle(0, Environment.FOREGROUND.height - 1, Environment.FOREGROUND.width, 1)),
            // bottom left
            new PIXI.Texture(Environment.FOREGROUND, new PIXI.Rectangle(0, Environment.FOREGROUND.height - 1, 1, 1)),
            // left
            new PIXI.Texture(Environment.FOREGROUND, new PIXI.Rectangle(0, 0, 1, Environment.FOREGROUND.height)),
        ];
        const PADDING = 2000;

        const OFFSETS = [
            new Vec2(-PADDING, -PADDING),
            new Vec2(0, -PADDING),
            new Vec2(Environment.FOREGROUND.width, -PADDING),
            new Vec2(Environment.FOREGROUND.width, 0),
            new Vec2(Environment.FOREGROUND.width, Environment.FOREGROUND.height),
            new Vec2(0, Environment.FOREGROUND.height),
            new Vec2(-PADDING, Environment.FOREGROUND.height),
            new Vec2(-PADDING, 0),
        ];

        const SIZES = [
            new Vec2(PADDING, PADDING),
            new Vec2(Environment.FOREGROUND.width, PADDING),
            new Vec2(PADDING, PADDING),
            new Vec2(PADDING, Environment.FOREGROUND.height),
            new Vec2(PADDING, PADDING),
            new Vec2(Environment.FOREGROUND.width, PADDING),
            new Vec2(PADDING, PADDING),
            new Vec2(PADDING, Environment.FOREGROUND.height),
        ];

        for (let i = 0; i < FOREGROUND_EDGES.length; i++) {
            const edge = new PIXI.Sprite(FOREGROUND_EDGES[i]);
            edge.position.x += OFFSETS[i].x;
            edge.position.y += OFFSETS[i].y;
            edge.width = SIZES[i].x;
            edge.height = SIZES[i].y;
            Renderer.foreground.addChild(edge);
        }

        Environment.maskRenderTexture = PIXI.RenderTexture.create({width: 0, height: 0});

        Environment.foregroundMaskSprite = new PIXI.Sprite(Environment.FOREGROUND);
        Camera.addContainer(Environment.foregroundMaskSprite);

        Environment.maskFilter = new OverlayShader(Environment.maskRenderTexture);
        Renderer.underground.filters = [Environment.maskFilter];
        Renderer.underground.filterArea = new PIXI.Rectangle(0, 0, 0, 0);

        Renderer.foreground.addChild(Environment.foregroundSprite);
        Renderer.background.addChild(Environment.backgroundSprite);

        const aabb = new AABB(0, 0, Environment.FOREGROUND.width, Environment.FOREGROUND.height);

        for (let i = 0; i < Environment.PARALLAX_TEXTURES.length; i++) {
            const sprite = new ParallaxSprite(Environment.PARALLAX_TEXTURES[i], aabb, Environment.PARALLAX_SPEEDS[i]);
            Environment.parallaxSprites.push(sprite);
            Renderer.parallax.addChild(sprite);
            
            sprite.index = i;
        }
    }

    static update() {
        for (let i = 0; i < Environment.parallaxSprites.length; i++) {
            Environment.parallaxSprites[i].update(Camera.aabb);
        }

        const width = window.innerWidth;
        const height = window.innerHeight;

        const desiredWidth = Math.round(width);
        const desiredHeight = Math.round(height);

        if (Environment.maskRenderTexture.width !== desiredWidth || Environment.maskRenderTexture.height !== desiredHeight) {
            Environment.maskRenderTexture.resize(desiredWidth, desiredHeight);
            Renderer.underground.filterArea = new PIXI.Rectangle(0, 0, desiredWidth, desiredHeight);
        }

        Renderer.application.renderer.render(Environment.foregroundMaskSprite, Environment.maskRenderTexture);
    }
}