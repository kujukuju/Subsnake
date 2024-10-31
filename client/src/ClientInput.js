
class ClientInput {
    static lastDirection = new Vec2();

    static update() {
        let direction = new Vec2();
        let boost = false;

        if (MOBILE) {
            const accel = MobileInputProcessorSystem.getAccelVector();
            direction.set(accel[0], accel[1]).mul(30);
            boost = Object.keys(MobileInputProcessorSystem._touches).length > 1;
        } else {
            const mouse = Camera.getMousePosition();
            const camera = Camera.position;
            direction.copy(mouse).subtract(camera);
            boost = InputManager.mouseDownLeft;
        }

        ClientInput.lastDirection.copy(direction).normalize();

        Packets.writeInputsPacket(direction, boost);
    }
}
