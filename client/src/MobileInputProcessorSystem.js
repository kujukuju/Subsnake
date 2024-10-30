class MobileInputProcessorSystem {
    static TAP_TIMEOUT = 300;
    static DOUBLE_TAP_DELAY = 500;
    static DOUBLE_TAP_RADIUS = 24;
    static TOUCH_RADIUS = 50;
    static DEAD_ZONE_RADIUS = 10;

    static _touches = {};
    static _oldTaps = {};

    static _movementID = null;

    static _movementCircleElement = null;
    static _movementCircleInsideElement = null;

    static _accelVector = [0, 0];

    static update() {
        const time = Loop.loopTime;

        for (const id in MobileInputProcessorSystem._oldTaps) {
            const tap = MobileInputProcessorSystem._oldTaps[id];

            if (!tap[0]) {
                tap[0] = time;
            }

            if (time - tap[0] > MobileInputProcessorSystem.DOUBLE_TAP_DELAY) {
                delete MobileInputProcessorSystem._oldTaps[id];
            }
        }

        // remove the elements
        if (!MobileInputProcessorSystem._touches[MobileInputProcessorSystem._movementID]) {
            MobileInputProcessorSystem._movementID = null;

            if (MobileInputProcessorSystem._movementCircleElement) {
                MobileInputProcessorSystem._movementCircleElement.remove();
                MobileInputProcessorSystem._movementCircleElement = null;
                MobileInputProcessorSystem._movementCircleInsideElement.remove();
                MobileInputProcessorSystem._movementCircleInsideElement = null;
            }
        }

        // process new ids
        for (const id in MobileInputProcessorSystem._touches) {
            const tap = MobileInputProcessorSystem._touches[id];
            const startX = tap[4];

            if (MobileInputProcessorSystem._movementID === null) {
                MobileInputProcessorSystem._movementID = id;
            }
        }

        // set up new elements and update elements
        const movementTouch = MobileInputProcessorSystem._touches[MobileInputProcessorSystem._movementID];
        if (movementTouch) {
            const x = movementTouch[1];
            const y = movementTouch[2];
            const startX = movementTouch[4];
            const startY = movementTouch[5];

            const joystickWidth = MobileInputProcessorSystem.TOUCH_RADIUS * 2;
            const insideWidth = MobileInputProcessorSystem.TOUCH_RADIUS * 0.8;

            if (!MobileInputProcessorSystem._movementCircleElement) {
                const root = document.getElementById('mobile-controls');

                const joystick = document.createElement('div');
                joystick.className = 'joystick';
                joystick.style.width = joystickWidth + 'px';
                joystick.style.height = joystickWidth + 'px';
                joystick.style.left = startX + 'px';
                joystick.style.top = startY + 'px';
                MobileInputProcessorSystem._movementCircleElement = joystick;
                root.appendChild(joystick);

                const inside = document.createElement('div');
                inside.className = 'inside';
                inside.style.width = insideWidth + 'px';
                inside.style.height = insideWidth + 'px';
                MobileInputProcessorSystem._movementCircleInsideElement = inside;
                joystick.appendChild(inside);
            }

            if (MobileInputProcessorSystem._movementCircleInsideElement) {
                let dx = x - startX;
                let dy = y - startY;
                const d2 = dx * dx + dy * dy;
                if (d2 > MobileInputProcessorSystem.TOUCH_RADIUS *  MobileInputProcessorSystem.TOUCH_RADIUS) {
                    const d = Math.sqrt(d2);
                    dx = dx / d * MobileInputProcessorSystem.TOUCH_RADIUS;
                    dy = dy / d * MobileInputProcessorSystem.TOUCH_RADIUS;
                }

                MobileInputProcessorSystem._movementCircleInsideElement.style.left = (dx + joystickWidth / 2) + 'px';
                MobileInputProcessorSystem._movementCircleInsideElement.style.top = (dy + joystickWidth / 2) + 'px';
            }
        }
    }

    static getAccelVector() {
        if (!MOBILE) {
            return null;
        }

        const movementTouch = MobileInputProcessorSystem._touches[MobileInputProcessorSystem._movementID];
        MobileInputProcessorSystem._accelVector[0] = 0;
        MobileInputProcessorSystem._accelVector[1] = 0;
        return MobileInputProcessorSystem._getVector(movementTouch, MobileInputProcessorSystem._accelVector);
    }

    static addTouch(id, timestamp, x, y) {
        console.log('add touch');
        const tapCount = MobileInputProcessorSystem._getTapCount(x, y);
        // time, x, y, tapCount, startX, startY
        MobileInputProcessorSystem._touches[id] = [timestamp, x, y, tapCount, x, y];
    }

    static moveTouch(id, timestamp, x, y) {
        if (!MobileInputProcessorSystem._touches[id]) {
            return;
        }

        MobileInputProcessorSystem._touches[id][1] = x;
        MobileInputProcessorSystem._touches[id][2] = y;
    }

    static endTouch(id, timestamp, x, y) {
        if (!MobileInputProcessorSystem._touches[id]) {
            return;
        }

        if (timestamp - MobileInputProcessorSystem._touches[id][0] <= MobileInputProcessorSystem.TAP_TIMEOUT) {
            // reset the time so we can set it to the game time later
            MobileInputProcessorSystem._touches[id][0] = null;
            MobileInputProcessorSystem._touches[id][1] = x;
            MobileInputProcessorSystem._touches[id][2] = y;

            MobileInputProcessorSystem._oldTaps[id] = MobileInputProcessorSystem._touches[id];
        }

        delete MobileInputProcessorSystem._touches[id];
    }

    static _getVector(touch, output) {
        if (!touch) {
            return output;
        }

        const x = touch[1];
        const y = touch[2];
        const startX = touch[4];
        const startY = touch[5];

        const dx = x - startX;
        const dy = y - startY;
        const d2 = dx * dx + dy * dy;
        if (d2 > MobileInputProcessorSystem.TOUCH_RADIUS *  MobileInputProcessorSystem.TOUCH_RADIUS) {
            const d = Math.sqrt(d2);
            output[0] = dx / d;
            output[1] = dy / d;
            return output;
        }

        if (d2 < MobileInputProcessorSystem.DEAD_ZONE_RADIUS * MobileInputProcessorSystem.DEAD_ZONE_RADIUS) {
            return output;
        }

        output[0] = dx / MobileInputProcessorSystem.TOUCH_RADIUS;
        output[1] = dy / MobileInputProcessorSystem.TOUCH_RADIUS;
        return output;
    }

    // returns the count that this given new tap is at this location, meaning if you double tapped it'll be 2, if you
    // triple tapped it'll be 3
    static _getTapCount(x, y) {
        const tapRadius2 = MobileInputProcessorSystem.DOUBLE_TAP_RADIUS * MobileInputProcessorSystem.DOUBLE_TAP_RADIUS;

        let highestCountID = null;
        let highestCount = 0;
        for (const id in MobileInputProcessorSystem._oldTaps) {
            const tap = MobileInputProcessorSystem._oldTaps[id];
            const tapX = tap[1];
            const tapY = tap[2];

            const dx = tapX - x;
            const dy = tapY - y;

            if (dx * dx + dy * dy > tapRadius2) {
                continue;
            }

            const tapCount = tap[3];
            if (tapCount >= highestCount) {
                highestCountID = id;
                highestCount = tapCount;
            }
        }

        // default tap count is 1
        if (!highestCount) {
            return 1;
        }

        // consume the found tap
        delete MobileInputProcessorSystem._oldTaps[highestCountID];

        return highestCount + 1;
    }
}
