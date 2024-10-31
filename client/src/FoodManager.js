
class FoodManager {
    static FOOD_TEXTURE = PIXI.Texture.from('assets/soul.png');
    static BOOST_TEXTURE = PIXI.Texture.from('assets/teleport-recall.png');

    static food = [];
    static boost = [];

    static foodVisible = [];
    static boostVisible = [];

    static foodTree = new DynamicTree();
    static boostTree = new DynamicTree();

    static recycledFood = [];
    static recycledBoost = [];

    static initialize() {
        FoodManager.food.length = FOOD_POSITIONS.length;
        FoodManager.foodVisible.length = FOOD_POSITIONS.length;
        for (let i = 0; i < FoodManager.food.length; i++) {
            FoodManager.food[i] = false;
            FoodManager.foodVisible[i] = false;
        }

        FoodManager.boost.length = BOOST_POSITIONS.length;
        FoodManager.boostVisible.length = BOOST_POSITIONS.length;
        for (let i = 0; i < FoodManager.boost.length; i++) {
            FoodManager.boost[i] = false;
            FoodManager.boostVisible[i] = false;
        }

        for (let i = 0; i < FOOD_POSITIONS.length; i++) {
            const aabb = new DynamicTree.AABB();
            aabb.lowerBound.x = FOOD_POSITIONS[i].x;
            aabb.lowerBound.y = FOOD_POSITIONS[i].y;
            aabb.upperBound.x = FOOD_POSITIONS[i].x;
            aabb.upperBound.y = FOOD_POSITIONS[i].y;
            FoodManager.foodTree.CreateProxy(aabb, i);
        }

        for (let i = 0; i < BOOST_POSITIONS.length; i++) {
            const aabb = new DynamicTree.AABB();
            aabb.lowerBound.x = BOOST_POSITIONS[i].x;
            aabb.lowerBound.y = BOOST_POSITIONS[i].y;
            aabb.upperBound.x = BOOST_POSITIONS[i].x;
            aabb.upperBound.y = BOOST_POSITIONS[i].y;
            FoodManager.boostTree.CreateProxy(aabb, i);
        }
    }

    static update() {
        FoodManager.updateResource(
            FoodManager.FOOD_TEXTURE,
            FoodManager.food,
            FoodManager.foodTree,
            Renderer.food,
            FoodManager.recycledFood,
            FoodManager.foodVisible,
            16, 16, 4, 4, 4,
            FOOD_POSITIONS);

        FoodManager.updateResource(
            FoodManager.BOOST_TEXTURE,
            FoodManager.boost,
            FoodManager.boostTree,
            Renderer.boost,
            FoodManager.recycledBoost,
            FoodManager.boostVisible,
            50, 46, 2, 4, 4,
            BOOST_POSITIONS);
    }

    static updateResource(texture, exists, tree, container, recycled, visibility, spriteWidth, spriteHeight, spriteColumns, spriteCount, spriteFrameCount, positions) {
        const PADDING = 8;

        const aabb = new DynamicTree.AABB();
        aabb.lowerBound.x = Camera.aabb.x - PADDING;
        aabb.lowerBound.y = Camera.aabb.y - PADDING;
        aabb.upperBound.x = Camera.aabb.x + Camera.aabb.width + PADDING;
        aabb.upperBound.y = Camera.aabb.y + Camera.aabb.height + PADDING;

        for (let i = 0; i < container.children.length; i++) {
            const foodSprite = container.children[i];
            let contains = foodSprite.position.x >= aabb.lowerBound.x;
            contains = contains && foodSprite.position.x < aabb.upperBound.x;
            contains = contains && foodSprite.position.y >= aabb.lowerBound.y;
            contains = contains && foodSprite.position.y < aabb.upperBound.y;

            const shouldRemove = !contains || !exists[foodSprite.spriteIndex];

            if (shouldRemove) {
                recycled.push(foodSprite);
                container.removeChildAt(i);

                visibility[foodSprite.spriteIndex] = false;

                i--;
            }
        }

        tree.Query((node) => {
            const index = node.userData;

            if (visibility[index]) {
                return true;
            }

            const shouldAdd = exists[index];
            if (!shouldAdd) {
                return true;
            }

            let sprite;
            if (recycled.length > 0) {
                sprite = recycled[recycled.length - 1];
                recycled.length -= 1;
            } else {
                sprite = new FramedSprite(texture, spriteWidth, spriteHeight, spriteColumns, spriteCount);
                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;
                sprite.addAnimation(null, 0, spriteFrameCount);
                sprite.gotoAnimation(null, Math.random() * spriteFrameCount);
            }

            sprite.position.x = positions[index].x;
            sprite.position.y = positions[index].y;
            sprite.spriteIndex = index;

            visibility[index] = true;

            container.addChild(sprite);

            return true;
        }, aabb);

        for (let i = 0; i < container.children.length; i++) {
            const foodSprite = container.children[i];
            foodSprite.stepAnimation(null, Loop.deltaTime / 150, true);
        }
    }

    static addFood(id) {
        FoodManager.food[id] = true;
    }

    static removeFood(id) {
        FoodManager.food[id] = false;

        ExitAnimations.addFoodExit(FOOD_POSITIONS[id]);
        AudioManager.playHitNoise(FOOD_POSITIONS[id].x, FOOD_POSITIONS[id].y);
    }

    static addBoost(id) {
        FoodManager.boost[id] = true;
    }

    static removeBoost(id) {
        FoodManager.boost[id] = false;

        ExitAnimations.addBoostExit(BOOST_POSITIONS[id]);
        AudioManager.playBoostNoise(BOOST_POSITIONS[id].x, BOOST_POSITIONS[id].y);
    }
}
