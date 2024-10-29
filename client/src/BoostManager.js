
class BoostManager {
    static BOOST_BAR_TEXTURE = PIXI.Texture.from('assets/boost-bar.png');
    static BOOST_BAR_OUTLINE_TEXTURE = PIXI.Texture.from('assets/boost-bar-outline.png');

    static barSprite;
    static barOutlineSprite;

    static remainingBoost = 1;

    static initialize() {
        BoostManager.barSprite = new PIXI.Sprite(BoostManager.BOOST_BAR_TEXTURE);
        BoostManager.barSprite.alpha = 0;
        BoostManager.barOutlineSprite = new PIXI.Sprite(BoostManager.BOOST_BAR_OUTLINE_TEXTURE);
        BoostManager.barOutlineSprite.alpha = 0;

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

        BoostManager.barSprite.width = Math.round(BoostManager.barSprite.texture.width * 3 * BoostManager.remainingBoost);
    }
}