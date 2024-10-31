
class BoostManager {
    static BOOST_BAR_TEXTURE = PIXI.Texture.from('assets/boost-bar.png');
    static BOOST_BAR_OUTLINE_TEXTURE = PIXI.Texture.from('assets/boost-bar-outline.png');
    static ARROW_TEXTURE = PIXI.Texture.from('assets/arrow.png');

    static barSprite;
    static barOutlineSprite;

    static arrowSprite;

    static remainingBoost = 1;

    static initialize() {
        BoostManager.barSprite = new PIXI.Sprite(BoostManager.BOOST_BAR_TEXTURE);
        BoostManager.barSprite.alpha = 0;
        BoostManager.barOutlineSprite = new PIXI.Sprite(BoostManager.BOOST_BAR_OUTLINE_TEXTURE);
        BoostManager.barOutlineSprite.alpha = 0;

        BoostManager.arrowSprite = new PIXI.Sprite(BoostManager.ARROW_TEXTURE);
        BoostManager.arrowSprite.anchor.x = 0.5;
        BoostManager.arrowSprite.anchor.y = 0;
        Renderer.top.addChild(BoostManager.arrowSprite);

        BoostManager.barSprite.scale.x = 3;
        BoostManager.barSprite.scale.y = 3;
        BoostManager.barOutlineSprite.scale.x = 3;
        BoostManager.barOutlineSprite.scale.y = 3;

        BoostManager.barSprite.anchor.x = 0.5;
        BoostManager.barSprite.anchor.y = 0.5;
        BoostManager.barOutlineSprite.anchor.x = 0.5;
        BoostManager.barOutlineSprite.anchor.y = 0.5;

        BoostManager.barSprite.position.x = Math.round(window.innerWidth / 2);
        BoostManager.barSprite.position.y = Math.round(window.innerHeight * 0.65);
        BoostManager.barOutlineSprite.position.x = Math.round(window.innerWidth / 2);
        BoostManager.barOutlineSprite.position.y = Math.round(window.innerHeight * 0.65);

        Renderer.fixed.addChild(BoostManager.barSprite);
        Renderer.fixed.addChild(BoostManager.barOutlineSprite);
    }

    static update() {
        if (BoostManager.remainingBoost === 1) {
            BoostManager.barSprite.alpha = Math.max(BoostManager.barSprite.alpha - Loop.deltaTime / 400, 0);
        } else {
            BoostManager.barSprite.alpha = Math.min(BoostManager.barSprite.alpha + Loop.deltaTime / 100, 1);
        }
        BoostManager.barOutlineSprite.alpha = BoostManager.barSprite.alpha;

        const scale = Math.min(3, window.innerWidth * 0.8 / BoostManager.barSprite.texture.width);

        BoostManager.barSprite.position.x = Math.round(window.innerWidth / 2);
        BoostManager.barOutlineSprite.position.x = Math.round(window.innerWidth / 2);

        BoostManager.barSprite.width = Math.round(BoostManager.barSprite.texture.width * scale * BoostManager.remainingBoost);
        BoostManager.barSprite.height = BoostManager.barSprite.texture.height * scale;
        BoostManager.barOutlineSprite.width = BoostManager.barOutlineSprite.texture.width * scale;
        BoostManager.barOutlineSprite.height = BoostManager.barOutlineSprite.texture.height * scale;

        let arrowScale = 1;
        if (SnakeManager.snakes[clientID]) {
            BoostManager.arrowSprite.alpha = 0.5;
            arrowScale = SnakeManager.snakes[clientID].getScale() * 4;
        } else {
            BoostManager.arrowSprite.alpha = 0;
        }

        const cameraCenter = new Vec2(Camera.aabb.x + Camera.aabb.width / 2, Camera.aabb.y + Camera.aabb.height / 2);
        BoostManager.arrowSprite.scale.x = arrowScale;
        BoostManager.arrowSprite.scale.y = arrowScale;
        BoostManager.arrowSprite.position.x = cameraCenter.x + ClientInput.lastDirection.x * 20 * arrowScale;
        BoostManager.arrowSprite.position.y = cameraCenter.y + ClientInput.lastDirection.y * 20 * arrowScale;
        BoostManager.arrowSprite.rotation = Math.atan2(ClientInput.lastDirection.y, ClientInput.lastDirection.x) + Math.PI / 2;
    }
}