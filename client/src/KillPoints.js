
class KillPoints {
    static killPoints = [];

    static update() {
        let insertIndex = 0;
        for (let i = 0; i < KillPoints.killPoints.length; i++) {
            const point = KillPoints.killPoints[i];

            const killerSnake = SnakeManager.snakes[point.endSnakeID];

            const dt = Loop.loopTime - point.start;
            if (dt > point.duration || !killerSnake) {
                point.sprite.destroy();
            } else {
                const killerScale = killerSnake.getScale();
                const startIndex = Math.min(Math.floor(point.endIndex), killerSnake.points.length - 2);
                const endIndex = startIndex + 1;
                const pointStart = killerSnake.points[startIndex];
                const pointEnd = killerSnake.points[endIndex];
                const pointProgress = point.endIndex - startIndex;

                const endPoint = Vec2.copy(pointEnd).sub(pointStart).mul(pointProgress).add(pointStart).mul(killerScale).add(killerSnake.sprite.position);

                const position = new Vec2();
                Utilities.hermite(dt / point.duration, point.sourcePoint, endPoint, point.sourceVelocity, new Vec2(0, 0), position);
                point.sprite.position.x = position.x;
                point.sprite.position.y = position.y;

                KillPoints.killPoints[insertIndex] = point;
                insertIndex += 1;
            }
        }
        KillPoints.killPoints.length = insertIndex;
    }

    static addKill(deadSnake, killerSnake) {
        if (deadSnake.points.length < 2 || killerSnake.points.length < 2) {
            return;
        }

        const pointCount = Math.sqrt(deadSnake.score || 0);
        for (let i = 0; i < pointCount; i++) {
            const deadPointIndex = Math.random() * (deadSnake.points.length - 1);
            const killerPointIndex = Math.random() * (killerSnake.points.length - 1);

            const deadPointStartIndex = Math.min(Math.floor(deadPointIndex), deadSnake.points.length - 2);
            const deadPointEndIndex = deadPointStartIndex + 1;

            const deadPointStart = deadSnake.points[deadPointStartIndex];
            const deadPointEnd = deadSnake.points[deadPointEndIndex];

            const deadPointProgress = deadPointIndex - deadPointStartIndex;
            const deadScale = deadSnake.getScale();

            const sourceX = ((deadPointEnd.x - deadPointStart.x) * deadPointProgress + deadPointStart.x) * deadScale + deadSnake.sprite.position.x;
            const sourceY = ((deadPointEnd.y - deadPointStart.y) * deadPointProgress + deadPointStart.y) * deadScale + deadSnake.sprite.position.y;

            const orthoMul = i % 2 == 0 ? 1 : -1;
            const sourceOrtho = Vec2.from(deadPointEnd.x - deadPointStart.x, deadPointEnd.y - deadPointStart.y).ortho().mul(orthoMul).normalize();

            KillPoints.addKillPoint(new Vec2(sourceX, sourceY), sourceOrtho, killerPointIndex, killerSnake.id);
        }
    }

    static addKillPoint(sourcePoint, sourceVelocity, endIndex, endSnakeID) {
        const sprite = new FramedSprite(FoodManager.FOOD_TEXTURE, 16, 16, 4, 4);
        sprite.position.x = sourcePoint.x;
        sprite.position.y = sourcePoint.y;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.addAnimation(null, 0, 4);
        sprite.gotoAnimation(null, Math.random() * 4);

        Renderer.killFood.addChild(sprite);

        KillPoints.killPoints.push({
            start: Loop.loopTime,
            duration: Math.random() * 1000 + 1000,
            sourcePoint: sourcePoint,
            sourceVelocity: sourceVelocity,
            endSnakeID: endSnakeID,
            endIndex: endIndex,
            sprite: sprite,
        });
    }
}
