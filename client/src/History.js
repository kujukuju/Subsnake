
class History {
    positions;
    velocities;

    constructor() {
        this.positions = [];
        this.velocities = [];
    }

    // TODO add something to prune extremely nearby points?

    addHistory(position, velocity, maxLength) {
        this.positions.unshift(Vec2.copy(position));
        this.velocities.unshift(Vec2.copy(velocity));

        let currentLength = 0;
        let lastValidIndex = 0;

        for (let i = 0; i < this.positions.length - 1; i++) {
            let currPoint = this.positions[i];
            let nextPoint = this.positions[i + 1];

            let dx = nextPoint.x - currPoint.x;
            let dy = nextPoint.y - currPoint.y;

            currentLength += Math.sqrt(dx * dx + dy * dy);
            if (currentLength <= maxLength) {
                lastValidIndex = i + 2;
            }
        }

        if (lastValidIndex < this.positions.length - 1) {
            this.positions.length = lastValidIndex + 1;
            this.velocities.length = lastValidIndex + 1;
        }
    }

    getPoints(points, count, initialPointOffset, maxLength) {
        points.length = count;

        if (this.positions.length === 0) {
            return;
        }

        let distanceInc = maxLength / (count - 1);

        let nextDistance = 0;
        let nextIndex = 0;

        let accDistance = 0;

        // offset starting next requested distance for fake interpolation
        for (let i = 0; i < initialPointOffset && i < this.positions.length - 1; i++) {
            let progress = clamp(initialPointOffset - i, 0, 1);

            let currPoint = this.positions[i];
            let nextPoint = this.positions[i + 1];

            let dx = nextPoint.x - currPoint.x;
            let dy = nextPoint.y - currPoint.y;
            nextDistance += Math.sqrt(dx * dx + dy * dy) * progress;
        }

        for (let i = 0; i < this.positions.length - 1; i++) {
            let currPoint = this.positions[i];
            let nextPoint = this.positions[i + 1];
            let currVelocity = this.velocities[i];
            let nextVelocity = this.velocities[i + 1];

            let dx = nextPoint.x - currPoint.x;
            let dy = nextPoint.y - currPoint.y;

            let segmentDistance = Math.sqrt(dx * dx + dy * dy);

            while (nextDistance >= accDistance && nextDistance < accDistance + segmentDistance) {
                let progress = clamp((nextDistance - accDistance) / segmentDistance, 0, 1);

                const interpPoint = new Vec2();
                Utilities.hermite(progress, currPoint, nextPoint, currVelocity, nextVelocity, interpPoint);

                // const pointX = (nextPoint.x - currPoint.x) * progress + currPoint.x;
                // const pointY = (nextPoint.y - currPoint.y) * progress + currPoint.y;
                points[nextIndex] = interpPoint;

                nextDistance += distanceInc;
                nextIndex += 1;

                if (nextIndex >= count) {
                    return;
                }
            }

            accDistance += segmentDistance;
        }

        points.length = nextIndex;
    }
}
