
class Packets {
    static bytes = [];

    static INPUTS = 0;
    static PLAY = 1;
    static MESSAGE = 2;

    static writeInputsPacket(direction, boost) {
        BinaryHelper.writeByte(Packets.INPUTS, this.bytes, this.bytes.length);
        BinaryHelper.writeFloat(direction.x, this.bytes, this.bytes.length);
        BinaryHelper.writeFloat(direction.y, this.bytes, this.bytes.length);
        BinaryHelper.writeByte(boost ? 1 : 0, this.bytes, this.bytes.length);
    }

    static writePlayPacket(name) {
        while (name.length < 24) {
            name += '\0';
        }
        if (name.length > 24) {
            name = name.substring(0, 24);
        }

        BinaryHelper.writeByte(Packets.PLAY, this.bytes, this.bytes.length);
        for (let i = 0; i < 24; i++) {
            BinaryHelper.writeInt(name.charCodeAt(i), this.bytes, this.bytes.length);
        }
    }

    static writeMessagePacket(message) {
        while (message.length < 240) {
            message += '\0';
        }
        if (message.length > 240) {
            message = message.substring(0, 240);
        }

        BinaryHelper.writeByte(Packets.MESSAGE, this.bytes, this.bytes.length);
        for (let i = 0; i < 240; i++) {
            BinaryHelper.writeInt(message.charCodeAt(i), this.bytes, this.bytes.length);
        }
    }

    static sendPackets() {
        Connection.send(this.bytes);
        this.bytes.length = 0;
    }
}