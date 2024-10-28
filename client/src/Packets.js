
class Packets {
    static bytes = [];

    static INPUTS = 0;

    static writeInputsPacket(direction, boost) {
        BinaryHelper.writeByte(Packets.INPUTS, this.bytes, this.bytes.length);
        BinaryHelper.writeFloat(direction.x, this.bytes, this.bytes.length);
        BinaryHelper.writeFloat(direction.y, this.bytes, this.bytes.length);
        BinaryHelper.writeByte(boost ? 1 : 0, this.bytes, this.bytes.length);
    }

    static sendPackets() {
        Connection.send(this.bytes);
        this.bytes.length = 0;
    }
}