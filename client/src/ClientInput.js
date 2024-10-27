
class ClientInput {
    static update() {
        const mouse = Camera.getMousePosition();
        const camera = Camera.position;
        const direction = mouse.subtract(camera).normalize();
        Packets.writeInputsPacket(direction);
    }
}
