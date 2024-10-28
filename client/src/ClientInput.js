
class ClientInput {
    static update() {
        const mouse = Camera.getMousePosition();
        const camera = Camera.position;
        const direction = mouse.subtract(camera);

        const boost = Input.mouseDownLeft;

        Packets.writeInputsPacket(direction, boost);
    }
}
